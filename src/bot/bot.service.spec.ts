import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BotService } from './bot.service';
import { Bot } from './entities/bot.entity';
import { ProcessedUpdate } from './entities/processed-update.entity';
import { Lead } from './entities/lead.entity';
import { Booking } from '../templates/booking/entities/booking.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { TelegramService } from '../telegram/telegram.service';

describe('BotService', () => {
  let service: BotService;
  let botRepository: Repository<Bot>;
  let processedUpdateRepository: Repository<ProcessedUpdate>;
  let leadRepository: Repository<Lead>;
  let bookingRepository: Repository<Booking>;
  let analyticsEventRepository: Repository<AnalyticsEvent>;
  let telegramService: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        {
          provide: getRepositoryToken(Bot),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProcessedUpdate),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Lead),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AnalyticsEvent),
          useClass: Repository,
        },
        {
          provide: TelegramService,
          useValue: {
            validateToken: jest.fn(),
            setWebhook: jest.fn(),
            sendMessage: jest.fn(),
            getWebhookInfo: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                save: jest.fn(),
                update: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BotService>(BotService);
    botRepository = module.get<Repository<Bot>>(getRepositoryToken(Bot));
    processedUpdateRepository = module.get<Repository<ProcessedUpdate>>(getRepositoryToken(ProcessedUpdate));
    leadRepository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    analyticsEventRepository = module.get<Repository<AnalyticsEvent>>(getRepositoryToken(AnalyticsEvent));
    telegramService = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
