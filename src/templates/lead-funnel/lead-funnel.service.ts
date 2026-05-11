import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramService } from '../../telegram/telegram.service';
import { TemplateContext, TemplateService } from '../template.interface';
import { UserState } from '../../bot/entities/user-state.entity';
import { Lead } from '../../bot/entities/lead.entity';
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { FunnelQuestion, FunnelFinalAction, LeadFunnelConfig } from './lead-funnel.types';

/**
 * Lead Funnel Service — all business logic for the lead-funnel template.
 * Linear flow: /start → questions → contact → lead creation → notification → final action
 */
@Injectable()
export class LeadFunnelService implements TemplateService {
  private readonly logger = new Logger(LeadFunnelService.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
    @InjectRepository(UserState)
    private readonly userStateRepository: Repository<UserState>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  // ─── Entry Points ─────────────────────────────────────────────

  async handleStart(context: TemplateContext): Promise<void> {
    // Ensure universal customer exists for this user
    await this.customerService.ensureCustomer(context.botId, context.userId, {
      username: context.username,
      firstName: context.firstName,
      lastName: context.lastName,
    });

    // Track funnel start analytics
    await this.analyticsService.trackEvent(context.botId, 'funnel:started', {
      template: 'lead-funnel',
      userId: context.userId,
    });

    const state = await this.getUserState(context);

    // If user already has active funnel, warn instead of silently resetting
    if (state.currentStep !== 'idle') {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'You already have an active session. Continue answering questions or send /restart to start over.',
      );
      return;
    }

    const config = context.botConfig as LeadFunnelConfig;
    const firstQuestion = config.questions[0];

    // Reset user state and start funnel
    await this.setUserState(context, 'answering_questions', {
      currentQuestionIndex: 0,
      answers: {},
    });

    // Send welcome + first question
    const text = `${config.welcomeMessage}\n\n${firstQuestion.question}`;
    const keyboard = this.buildQuestionKeyboard(firstQuestion);
    await this.telegramService.sendMessage(context.botToken, context.chatId, text, keyboard);
  }

  async handleDefault(context: TemplateContext): Promise<void> {
    const text = context.messageText ?? '';

    // Handle restart command explicitly
    if (text === '/restart') {
      await this.clearUserState(context);
      await this.handleStart(context);
      return;
    }

    const state = await this.getUserState(context);

    if (state.currentStep === 'answering_questions') {
      await this.handleTextAnswer(context, state);
      return;
    }

    if (state.currentStep === 'waiting_contact') {
      await this.handleContact(context, state);
      return;
    }

    // Unknown state — restart funnel
    await this.handleStart(context);
  }

  /**
   * Handle inline button callback.
   * Called by handler when callback_data starts with "leadfunnel:answer:"
   */
  async handleCallback(context: TemplateContext, callbackData: string): Promise<void> {
    const state = await this.getUserState(context);

    if (state.currentStep !== 'answering_questions') {
      this.logger.warn(`Stale callback ignored: bot=${context.botId} user=${context.userId} step=${state.currentStep}`);
      return;
    }

    // Parse callback: leadfunnel:answer:<questionId>:<optionIndex>
    const parts = callbackData.split(':');
    if (parts.length !== 4 || parts[0] !== 'leadfunnel' || parts[1] !== 'answer') {
      this.logger.warn(`Invalid callback format ignored: bot=${context.botId} user=${context.userId}`);
      return;
    }

    const questionId = parts[2];
    const optionIndex = parseInt(parts[3], 10);

    const config = context.botConfig as LeadFunnelConfig;
    const currentIndex = state.payload?.currentQuestionIndex ?? 0;
    const currentQuestion = config.questions[currentIndex];

    // Security: validate question ID matches current question
    if (!currentQuestion || currentQuestion.id !== questionId) {
      this.logger.warn(`Stale callback ignored: question mismatch bot=${context.botId} user=${context.userId} expected=${currentQuestion?.id} got=${questionId}`);
      return;
    }

    // Security: validate option exists
    if (!currentQuestion.options || optionIndex < 0 || optionIndex >= currentQuestion.options.length) {
      this.logger.warn(`Invalid callback option ignored: bot=${context.botId} user=${context.userId} question=${questionId} index=${optionIndex}`);
      return;
    }

    const answer = currentQuestion.options[optionIndex];
    await this.saveAnswerAndProceed(context, state, currentQuestion.id, answer);
  }

  // ─── Question Flow ────────────────────────────────────────────

  /**
   * Handle text answer from user.
   */
  private async handleTextAnswer(context: TemplateContext, state: UserState): Promise<void> {
    const config = context.botConfig as LeadFunnelConfig;
    const currentIndex = state.payload?.currentQuestionIndex ?? 0;
    const currentQuestion = config.questions[currentIndex];

    if (!currentQuestion) {
      // All questions answered — should not happen here, but handle gracefully
      await this.askForContact(context, state);
      return;
    }

    // For text questions, accept any non-empty text
    const answer = (context.messageText ?? '').trim();
    if (!answer) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Please provide a valid answer.',
      );
      return;
    }

    await this.saveAnswerAndProceed(context, state, currentQuestion.id, answer);
  }

  /**
   * Save answer and move to next question or contact step.
   */
  private async saveAnswerAndProceed(
    context: TemplateContext,
    state: UserState,
    questionId: string,
    answer: string,
  ): Promise<void> {
    const config = context.botConfig as LeadFunnelConfig;
    const currentIndex = state.payload?.currentQuestionIndex ?? 0;

    // Save answer
    const answers = { ...(state.payload?.answers ?? {}), [questionId]: answer };

    const nextIndex = currentIndex + 1;
    const nextQuestion = config.questions[nextIndex];

    if (nextQuestion) {
      // Move to next question
      await this.setUserState(context, 'answering_questions', {
        currentQuestionIndex: nextIndex,
        answers,
      });

      const text = nextQuestion.question;
      const keyboard = this.buildQuestionKeyboard(nextQuestion);
      await this.telegramService.sendMessage(context.botToken, context.chatId, text, keyboard);
      return;
    }

    // All questions answered — move to contact step
    await this.setUserState(context, 'answering_questions', {
      currentQuestionIndex: nextIndex,
      answers,
    });

    await this.askForContact(context, state);
  }

  /**
   * Ask user for contact information.
   */
  private async askForContact(context: TemplateContext, state: UserState): Promise<void> {
    await this.setUserState(context, 'waiting_contact', state.payload);
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      'Please share your contact information (phone, email, or Telegram username):',
    );
  }

  // ─── Contact & Completion ─────────────────────────────────────

  /**
   * Handle contact submission and complete funnel.
   */
  private async handleContact(context: TemplateContext, state: UserState): Promise<void> {
    const contact = (context.messageText ?? '').trim();
    if (!contact) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Please provide your contact information.',
      );
      return;
    }

    const config = context.botConfig as LeadFunnelConfig;
    const answers = state.payload?.answers ?? {};

    // Create lead with user metadata from context
    await this.createLead(context, answers, contact);

    // Update universal customer status to converted
    await this.customerService.updateStatus(context.botId, context.userId, 'converted');

    // Track funnel completion analytics
    await this.analyticsService.trackEvent(context.botId, 'funnel:completed', {
      template: 'lead-funnel',
      userId: context.userId,
    });

    // Track lead creation analytics
    await this.analyticsService.trackEvent(context.botId, 'lead:created', {
      template: 'lead-funnel',
      userId: context.userId,
    });

    // Send completion message
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      config.completionMessage,
    );

    // Notify owner
    await this.notifyOwner(context, answers, contact);

    // Execute final action
    await this.executeFinalAction(context);

    // Clear user state
    await this.clearUserState(context);

    this.logger.log(`Funnel completed: bot=${context.botId} user=${context.userId}`);
  }

  // ─── Lead Storage ─────────────────────────────────────────────

  /**
   * Create Lead entity in database.
   */
  private async createLead(
    context: TemplateContext,
    answers: Record<string, string>,
    contact: string,
  ): Promise<void> {
    const lead = this.leadRepository.create({
      botId: context.botId,
      userId: BigInt(context.userId),
      username: context.username || null,
      answers,
      contact,
    });
    await this.leadRepository.save(lead);
    this.logger.log(`Lead created: bot=${context.botId} user=${context.userId}`);
  }

  // ─── Owner Notification ───────────────────────────────────────

  /**
   * Send lead notification to business owner via Telegram.
   */
  private async notifyOwner(
    context: TemplateContext,
    answers: Record<string, string>,
    contact: string,
  ): Promise<void> {
    const config = context.botConfig as LeadFunnelConfig;
    const ownerChatId = config.ownerChatId;

    if (!ownerChatId) {
      this.logger.warn(`Owner notification skipped: no ownerChatId configured for bot=${context.botId}`);
      return;
    }

    const chatId = parseInt(ownerChatId, 10);
    if (isNaN(chatId)) {
      this.logger.warn(`Owner notification skipped: invalid ownerChatId=${ownerChatId}`);
      return;
    }

    // Build notification message
    const lines: string[] = ['🔥 New Lead'];
    lines.push('');

    for (const [key, value] of Object.entries(answers)) {
      const label = this.formatLabel(key);
      lines.push(`${label}: ${value}`);
    }

    lines.push(`Contact: ${contact}`);

    if (context.username) {
      lines.push(`User: @${context.username}`);
    } else if (context.firstName) {
      lines.push(`User: ${context.firstName}${context.lastName ? ' ' + context.lastName : ''}`);
    }

    const text = lines.join('\n');

    await this.telegramService.sendMessage(context.botToken, chatId, text);
  }

  // ─── Final Action ─────────────────────────────────────────────

  /**
   * Execute final action after funnel completion.
   */
  private async executeFinalAction(context: TemplateContext): Promise<void> {
    const config = context.botConfig as LeadFunnelConfig;
    const action = config.finalAction;

    if (!action) return;

    switch (action.type) {
      case 'message':
        if (action.text) {
          await this.telegramService.sendMessage(
            context.botToken,
            context.chatId,
            action.text,
          );
        }
        break;

      case 'invite_link':
        if (action.inviteLink) {
          await this.telegramService.sendMessage(
            context.botToken,
            context.chatId,
            `Join our private channel: ${action.inviteLink}`,
          );
        }
        break;

      default:
        this.logger.warn(`Unknown final action type: ${(action as FunnelFinalAction).type}`);
    }
  }

  // ─── User State Helpers ───────────────────────────────────────

  private async getUserState(context: TemplateContext): Promise<UserState> {
    let state = await this.userStateRepository.findOne({
      where: { botId: context.botId, userId: BigInt(context.userId) },
    });

    if (!state) {
      state = this.userStateRepository.create({
        botId: context.botId,
        userId: BigInt(context.userId),
        currentStep: 'idle',
        payload: {},
      });
      await this.userStateRepository.save(state);
    }

    return state;
  }

  private async setUserState(
    context: TemplateContext,
    step: string,
    payload: Record<string, any>,
  ): Promise<void> {
    await this.userStateRepository.update(
      { botId: context.botId, userId: BigInt(context.userId) },
      { currentStep: step, payload },
    );
  }

  private async clearUserState(context: TemplateContext): Promise<void> {
    await this.setUserState(context, 'idle', {});
  }

  // ─── UI Helpers ───────────────────────────────────────────────

  /**
   * Build inline keyboard for a button question.
   */
  private buildQuestionKeyboard(question: FunnelQuestion): any | undefined {
    if (question.type !== 'buttons' || !question.options?.length) {
      return undefined;
    }

    const buttons = question.options.map((option, index) => ({
      text: option,
      callback_data: `leadfunnel:answer:${question.id}:${index}`,
    }));

    return {
      inline_keyboard: [buttons],
    };
  }

  /**
   * Format a question ID into a human-readable label.
   */
  private formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  }
}
