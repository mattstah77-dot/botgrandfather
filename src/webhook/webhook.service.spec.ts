import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { TemplateFactory } from '../templates/template.factory';
import { BotService } from '../bot/bot.service';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: TemplateFactory,
          useValue: {
            handleUpdate: jest.fn(),
            getHandler: jest.fn(),
          },
        },
        {
          provide: BotService,
          useValue: {
            getBotByToken: jest.fn(),
            markUpdateAsProcessed: jest.fn(),
            isUpdateProcessed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
