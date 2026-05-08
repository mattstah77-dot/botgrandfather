/**
 * Question type for lead funnel config.
 */
export interface FunnelQuestion {
  id: string;
  type: 'text' | 'buttons';
  question: string;
  options?: string[];
}

/**
 * Final action after funnel completion.
 */
export interface FunnelFinalAction {
  type: 'message' | 'invite_link';
  text?: string;
  inviteLink?: string;
}

/**
 * Lead funnel configuration shape.
 */
export interface LeadFunnelConfig {
  businessName: string;
  welcomeMessage: string;
  completionMessage: string;
  ownerChatId: string;
  questions: FunnelQuestion[];
  finalAction?: FunnelFinalAction;
}

/**
 * Stored in UserState.payload during funnel execution.
 */
export interface FunnelProgress {
  currentQuestionIndex: number;
  answers: Record<string, string>;
}
