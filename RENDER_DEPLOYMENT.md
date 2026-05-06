# Deployment to Render

## Quick Start

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Render account**
   - Go to https://render.com
   - Sign up (free tier available)

3. **Connect GitHub repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select `mattstah77-dot/botgrandfather` repository

4. **Configure Web Service**

   | Setting | Value |
   |---------|-------|
   | Name | `botgrandfather-api` |
   | Region | Choose closest to you |
   | Branch | `main` |
   | Root Directory | `telegram-bot-platform` |
   | Runtime | `Node` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm run start:prod` |
   | Plan | `Free` or `Starter` ($7/month) |

5. **Configure Environment Variables**

   Go to "Environment" tab and add:

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<auto-populated from database>
   TELEGRAM_BOT_API_URL=https://api.telegram.org
   WEBHOOK_HOST=https://your-app-name.onrender.com
   WEBHOOK_PATH=/webhook
   ```

6. **Create PostgreSQL Database**

   - Click "New +" → "Database"
   - Name: `botgrandfather-db`
   - Plan: `Free` (expires after 90 days) or `Starter` ($7/month)
   - Copy the `DATABASE_URL` and add it to your Web Service environment variables

7. **Deploy**

   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)
   - Your app will be available at `https://your-app-name.onrender.com`

## Post-Deployment Setup

### 1. Set Webhook Host

After deployment, update the `WEBHOOK_HOST` environment variable with your Render URL:

```
WEBHOOK_HOST=https://botgrandfather-api.onrender.com
```

### 2. Connect Your First Bot

Use the API to connect a Telegram bot:

```bash
curl -X POST https://your-app-name.onrender.com/bots/connect \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TELEGRAM_BOT_TOKEN",
    "template": "template1",
    "config": {
      "greetingMessage": "Hello from Render!"
    }
  }'
```

### 3. Test Your Bot

1. Open Telegram
2. Search for your bot
3. Send `/start`
4. You should receive the greeting message

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify `npm run build` works locally

### Database Connection Error
- Ensure `DATABASE_URL` is correctly set
- Check database is running in Render dashboard
- Verify SSL is enabled (Render requires it)

### Webhook Not Working
- Verify `WEBHOOK_HOST` matches your Render URL exactly
- Ensure `WEBHOOK_PATH` is `/webhook`
- Check Telegram Bot API response (use BotFather /getwebhookinfo)

### App Sleeps on Free Tier
- Free tier services sleep after 15 minutes of inactivity
- Upgrade to Starter plan ($7/month) for always-on service
- Or use a service like UptimeRobot to ping your app every 5 minutes

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `10000` (Render default) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `TELEGRAM_BOT_API_URL` | No | `https://api.telegram.org` |
| `WEBHOOK_HOST` | Yes | Your Render URL |
| `WEBHOOK_PATH` | No | `/webhook` |

## Costs

### Free Tier
- Web service: 750 hours/month (sleeps after inactivity)
- Database: 90 days free trial, then $7/month

### Starter Plan ($7/month)
- Always-on web service
- No sleep
- 1000 hours/month included

### Database ($7/month)
- 1 GB storage
- Continuous backups

## Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically redeploy on every push to `main`.

## Monitoring

- Check logs in Render dashboard → "Logs" tab
- Set up alerts for downtime
- Monitor database usage

## Security Best Practices

1. **Never commit `.env` file** - already in `.gitignore`
2. **Use Render's environment variables** - encrypted at rest
3. **Enable HTTPS** - automatic on Render
4. **Rotate webhook secrets** - bots regenerate secrets on connect
5. **Monitor API logs** - check for suspicious activity

## Support

- Render Docs: https://render.com/docs
- Render Support: support@render.com
- Issue Tracker: GitHub Issues for this project
