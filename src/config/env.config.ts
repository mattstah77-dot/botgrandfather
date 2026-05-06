import "dotenv/config";

export const TELEGRAM_BOT_API_URL = process.env.TELEGRAM_BOT_API_URL || 'https://api.telegram.org';
export const WEBHOOK_HOST = process.env.WEBHOOK_HOST || 'https://your-domain.com';
export const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/webhook';
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
