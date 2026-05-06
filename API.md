# API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Connect Bot
**POST** `/bots/connect`

Подключает новый Telegram бот к платформе.

**Request Body:**
```json
{
  "token": "YOUR_TELEGRAM_BOT_TOKEN",
  "template": "template1",
  "config": {
    "greetingMessage": "Hello!"
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Telegram bot token from @BotFather |
| template | string | Yes | One of: "template1", "template2", "template3" |
| config | object | No | Template-specific configuration |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "template": "template1",
  "botUsername": "my_test_bot",
  "webhookUrl": "https://your-domain.com/webhook/YOUR_TELEGRAM_BOT_TOKEN"
}
```

**Errors:**
- `400 Bad Request` - Invalid token or template
- `401 Unauthorized` - Invalid bot token

---

### 2. Get Bot
**GET** `/bots/:id`

Получает информацию о боте.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "template": "template1",
  "config": {
    "greetingMessage": "Hello!"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `404 Not Found` - Bot not found

---

### 3. Update Bot Config
**PATCH** `/bots/:id/config`

Обновляет конфигурацию бота.

**Request Body:**
```json
{
  "config": {
    "greetingMessage": "New greeting message"
  }
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "template": "template1",
  "config": {
    "greetingMessage": "New greeting message"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:01.000Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid config
- `404 Not Found` - Bot not found

---

### 4. Delete Bot
**DELETE** `/bots/:id`

Удаляет бота и все связанные данные.

**Response (204):**
No content

**Errors:**
- `404 Not Found` - Bot not found

---

### 5. Get All Bots
**GET** `/bots`

Получает список всех ботов.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "template": "template1",
    "config": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "template": "template2",
    "config": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 6. Webhook (Telegram)
**POST** `/webhook/:botId/:secret`

Входящий webhook от Telegram (автоматически вызывается Telegram).

**URL Format:** `https://your-domain.com/webhook/{botId}/{webhookSecret}`

- `botId` — UUID бота из системы
- `secret` — криптографически безопасный секрет, сгенерированный при подключении
- **Bot token НИКОГДА не появляется в URL**

**Request Body (from Telegram):**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John",
      "username": "john_doe",
      "language_code": "en"
    },
    "chat": {
      "id": 123456789,
      "first_name": "John",
      "username": "john_doe",
      "type": "private"
    },
    "date": 1704067200,
    "text": "/start"
  }
}
```

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- `400 Bad Request` - Invalid update payload

---

## Example Workflow

### 1. Create a Bot

```bash
# Get token from @BotFather in Telegram
# Then connect the bot

curl -X POST http://localhost:3000/bots/connect \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
    "template": "template1",
    "config": {
      "greetingMessage": "Привет! Я бот на шаблоне 1."
    }
  }'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "template": "template1",
  "botUsername": "my_awesome_bot",
  "webhookUrl": "https://your-domain.com/webhook/550e8400-e29b-41d4-a716-446655440000/a3f8c2d9e1b4..."
}
```

**Note:** Webhook URL contains `botId` + `secret`. The bot token is NEVER in the URL.

### 2. Update Bot Config

```bash
curl -X PATCH http://localhost:3000/bots/550e8400-e29b-41d4-a716-446655440000/config \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "greetingMessage": "Привет! Теперь я говорю по-другому."
    }
  }'
```

### 3. User Interacts with Bot

1. User sends `/start` to their Telegram bot
2. Telegram sends webhook to your server
3. Your server processes update and responds
4. User receives "Привет! Теперь я говорю по-другому."

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
