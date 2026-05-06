# Telegram Bot Platform - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions:
   - Choose a name (e.g., "My Test Bot")
   - Choose a username (e.g., "my_test_bot_123")
4. **Save the token** that BotFather gives you

### Step 2: Setup Database

```bash
# Using Docker (recommended)
docker-compose up -d

# Or manually start PostgreSQL and create database
```

### Step 3: Install and Configure

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your webhook URL (if deploying)
# For local testing, use ngrok or similar
```

### Step 4: Generate Prisma Client & Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (skip if database URL uses Prisma Postgres)
# npm run db:migrate
```

### Step 5: Start the Server

```bash
npm run start:dev
```

Server should be running at `http://localhost:3000`

### Step 6: Connect Your Bot

**Option A: Using curl**

```bash
curl -X POST http://localhost:3000/bots/connect \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_BOT_TOKEN_FROM_BOTFATHER",
    "template": "template1",
    "config": {
      "greetingMessage": "Hello! My bot is working!"
    }
  }'
```

**Option B: Using Postman**

1. Create new POST request to `http://localhost:3000/bots/connect`
2. Set Headers: `Content-Type: application/json`
3. Set Body (raw JSON):
```json
{
  "token": "YOUR_BOT_TOKEN_FROM_BOTFATHER",
  "template": "template1",
  "config": {
    "greetingMessage": "Hello! My bot is working!"
  }
}
```
4. Send request

Response will include your `bot.id` and `webhookUrl` (format: `/webhook/{botId}/{secret}`).

### Step 7: Test Your Bot

1. Open Telegram
2. Search for your bot by username
3. Click "Start" or send `/start`
4. You should receive your greeting message!

---

## 📝 Notes

### Local Development with Webhooks

Telegram requires HTTPS for webhooks. For local development, use **ngrok**:

```bash
# Install ngrok
# https://ngrok.com/download

# Start ngrok
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
# Update .env:
# WEBHOOK_HOST=https://abc123.ngrok.io
```

Then reconnect your bot with the new webhook URL.

### Template Options

- `template1` - Basic greeting bot
- `template2` - Alternative greeting bot  
- `template3` - Another greeting bot variant

Each template responds differently to `/start` command.

---

## 🔧 Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env

### "Invalid token"
- Double-check your bot token from BotFather
- Make sure there are no extra spaces

### "Webhook not working"
- Ensure your server is publicly accessible
- Use ngrok for local testing
- Check that webhook URL is HTTPS

### Bot doesn't respond
- Check server logs for errors
- Verify webhook is set correctly
- Make sure template is valid

---

## 📚 Next Steps

- Read [API.md](./API.md) for full API documentation
- Read [README.md](./README.md) for detailed setup instructions
- Customize templates in `src/templates/`
- Add new templates following the guide in README.md

---

## 🎉 Success!

If you've completed all steps and your bot responds to `/start`, you're ready to go!

For production deployment, see the Production section in README.md.
