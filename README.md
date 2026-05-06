# Telegram Bot Platform

Production-ready MVP backend для платформы Telegram ботов на NestJS + TypeScript + PostgreSQL.

## 🎯 Описание

Платформа позволяет подключать Telegram ботов через токен и запускать их с предопределёнными шаблонами логики.

**Ключевые особенности:**
- Мульти-тенантная архитектура (несколько ботов на одном бэкенде)
- Webhook-based обработка обновлений
- 3 встроенных шаблона ботов
- Простая конфигурация через JSON
- Идентификация ботов через bot_id

## 🏗️ Архитектура

```
src/
├── bot/                    # Управление ботами (CRUD API)
│   ├── entities/
│   │   ├── bot.entity.ts           # Bot (+ webhookSecret)
│   │   ├── user-state.entity.ts    # UserState (+ currentStep, payload)
│   │   └── processed-update.entity.ts
│   ├── dto/
│   ├── bot.controller.ts
│   ├── bot.service.ts
│   └── bot.module.ts
├── webhook/                # Обработка входящих webhook
│   ├── webhook.controller.ts       # POST /webhook/:botId/:secret
│   ├── webhook.service.ts
│   └── webhook.module.ts
├── templates/              # Шаблоны ботов
│   ├── common/
│   │   ├── config-schema.interface.ts   # Config validation system
│   │   └── template.registry.ts         # Centralized registry
│   ├── template1/
│   │   ├── template1.config.schema.ts   # Template config schema
│   │   ├── template1.service.ts         # Business logic
│   │   └── template1.handler.ts         # Thin handler (parses + delegates)
│   ├── template2/
│   │   ├── template2.config.schema.ts
│   │   ├── template2.service.ts
│   │   └── template2.handler.ts
│   ├── template3/
│   │   ├── template3.config.schema.ts
│   │   ├── template3.service.ts
│   │   └── template3.handler.ts
│   ├── template.interface.ts
│   ├── template.factory.ts
│   └── template.module.ts
├── telegram/               # Telegram API сервис
│   ├── telegram.service.ts         # ALL Telegram calls + retry logic
│   └── telegram.module.ts
├── config/
│   └── env.config.ts
└── common/                 # Общие утилиты
```

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd telegram-bot-platform

# Установить зависимости
npm install

# Скопировать .env.example в .env
cp .env.example .env

# Запустить PostgreSQL (локально или через Docker)
# См. раздел "Запуск PostgreSQL"

# Запустить в режиме разработки
npm run start:dev
```

## 🐳 Запуск PostgreSQL

### Вариант 1: Docker (рекомендуется)

```bash
docker-compose up -d
```

Или вручную:

```bash
docker run --name telegram-bot-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=telegram-bot-platform \
  -p 5432:5432 \
  -d postgres:15
```

### Вариант 2: Локальная установка

Установите PostgreSQL 14+ и создайте базу данных:

```sql
CREATE DATABASE "telegram-bot-platform";
```

## 📡 API Endpoints

### Подключить бота

```http
POST /bots/connect
Content-Type: application/json

{
  "token": "YOUR_TELEGRAM_BOT_TOKEN",
  "template": "template1",
  "config": {
    "greetingMessage": "Hello from my bot!"
  }
}
```

**Возвращает:**
```json
{
  "id": "uuid",
  "template": "template1",
  "botUsername": "my_bot",
  "webhookUrl": "https://your-domain.com/webhook/YOUR_TELEGRAM_BOT_TOKEN"
}
```

### Получить информацию о боте

```http
GET /bots/:id
```

### Обновить конфигурацию бота

```http
PATCH /bots/:id/config
Content-Type: application/json

{
  "config": {
    "greetingMessage": "New greeting message"
  }
}
```

### Удалить бота

```http
DELETE /bots/:id
```

### Получить все боты

```http
GET /bots
```

### Webhook (Telegram)

```http
POST /webhook/:botId/:secret
Content-Type: application/json

{
  "update_id": 123456,
  "message": {
    "message_id": 789,
    "from": {
      "id": 123456789,
      "first_name": "User",
      "username": "username"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1234567890,
    "text": "/start"
  }
}
```

**Security:** Webhook URL contains `botId` + `webhookSecret`, NEVER the bot token.

## 🧩 Шаблоны ботов

### Template1
- На `/start` → отвечает "Template 1 works" (или кастомное сообщение из config)
- На другие сообщения → "Template 1: Hello! I received your message."

### Template2
- На `/start` → отвечает "Template 2 works"
- На другие сообщения → "Template 2: Hello! I received your message."

### Template3
- На `/start` → отвечает "Template 3 works"
- На другие сообщения → "Template 3: Hello! I received your message."

## 📊 База данных

TypeORM с `synchronize: true` в development (миграции в production).

### Schema & Indexes

**Bot**
- `id` (uuid, PK)
- `token` (string, `select: false` — never exposed by default)
- `template` (string)
- `config` (JSONB)
- `webhookSecret` (string, unique) — cryptographically secure random
- `createdAt`, `updatedAt`
- **Indexes:** `template`

**UserState**
- `id` (uuid, PK)
- `botId` (uuid, FK)
- `userId` (BigInt, Telegram user ID)
- `currentStep` (string, default: "idle")
- `payload` (JSONB, default: {})
- `createdAt`, `updatedAt`
- **Indexes:** `botId`, composite unique `(botId, userId)`

**ProcessedUpdate** (идемпотентность)
- `id` (uuid, PK)
- `updateId` (BigInt)
- `botId` (uuid, FK)
- `createdAt`
- **Indexes:** composite unique `(botId, updateId)`

## 🔧 Конфигурация

Переменные окружения в `.env`:

```env
# Telegram Bot API
TELEGRAM_BOT_API_URL=https://api.telegram.org

# Webhook Configuration
WEBHOOK_HOST=https://your-domain.com
WEBHOOK_PATH=/webhook

# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram-bot-platform
```

## 🔐 Безопасность

- **Bot tokens NEVER appear in webhook URLs** — используется `botId + webhookSecret`
- **Bot tokens NEVER logged** — `TelegramService` редатирует токены в логах
- **Bot tokens excluded by default** — TypeORM `select: false` на колонке `token`
- **HTTPS обязателен** для webhook в production
- **Config validated per template** — невалидный config отклоняется на уровне API

## 📝 Добавление нового шаблона

1. Создайте директорию `src/templates/templateX/`
2. Создайте config schema:

```typescript
// src/templates/templateX/templateX.config.schema.ts
import { ConfigSchema } from '../common/config-schema.interface';

export const templateXConfigSchema: ConfigSchema = {
  greetingMessage: {
    type: 'string',
    required: true,
    default: 'Hello from Template X',
  },
};
```

3. Создайте service (business logic):

```typescript
// src/templates/templateX/templateX.service.ts
import { Injectable } from '@nestjs/common';
import { TemplateService, TemplateContext } from '../template.interface';
import { TelegramService } from '../../telegram/telegram.service';

@Injectable()
export class TemplateXService implements TemplateService {
  constructor(private readonly telegramService: TelegramService) {}

  async handleStart(context: TemplateContext): Promise<void> {
    const msg = context.botConfig.greetingMessage || 'Hello!';
    await this.telegramService.sendMessage(context.botToken, context.chatId, msg);
  }

  async handleDefault(context: TemplateContext): Promise<void> {
    await this.telegramService.sendMessage(context.botToken, context.chatId, 'Default reply');
  }
}
```

4. Создайте thin handler:

```typescript
// src/templates/templateX/templateX.handler.ts
import { TemplateContext, TemplateHandler, TemplateService } from '../template.interface';

export class TemplateXHandler implements TemplateHandler {
  constructor(private readonly service: TemplateService) {}

  async handle(context: TemplateContext): Promise<void> {
    if (context.messageText === '/start') {
      await this.service.handleStart(context);
      return;
    }
    await this.service.handleDefault(context);
  }
}
```

5. Зарегистрируйте в `src/templates/common/template.registry.ts`:

```typescript
import { TemplateXHandler } from '../templateX/templateX.handler';
import { TemplateXService } from '../templateX/templateX.service';
import { templateXConfigSchema } from '../templateX/templateX.config.schema';

export const TEMPLATE_REGISTRY = {
  // ...existing templates...
  templateX: {
    name: 'templateX',
    handlerClass: TemplateXHandler,
    serviceClass: TemplateXService,
    configSchema: templateXConfigSchema,
    defaultConfig: { greetingMessage: 'Hello from Template X' },
  },
};
```

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Построение для production

```bash
npm run build
npm run start:prod
```

## 🔍 Debugging

```bash
# Запуск с debug логики
npm run start:debug
```

## 📈 Production Deployment

### Требования
- HTTPS (обязательно для Telegram webhooks)
- Стабильный публичный URL
- PostgreSQL production instance

### Пример nginx конфигурации

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ Стек технологий

- **Node.js** + **TypeScript**
- **NestJS** — фреймворк (monolith, singleton services)
- **PostgreSQL** — база данных
- **TypeORM** — ORM + автоматическая синхронизация сущностей
- **class-validator** — валидация DTO
- **Telegram Bot API** — webhook (с retry logic)

## 📄 License

MIT

## 👥 Команда

NLP-Core-Team

## 🚀 Deployment

### Render

Полная инструкция по деплою на Render: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Быстрый старт:**
1. Создайте репозиторий на GitHub
2. Подключите к Render
3. Создайте PostgreSQL базу данных
4. Установите переменные окружения
5. Деплойте автоматически при каждом пуше

