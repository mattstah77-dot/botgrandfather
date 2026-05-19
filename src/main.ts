import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { PORT } from './config/env.config';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for Mini App API requests
  // Must allow X-Telegram-Init-Data header for auth to work
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Telegram-Init-Data', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Static serving + SPA fallback for Mini Apps
  // Order matters: 1) static files, 2) SPA fallback for unmatched routes
  const expressApp = app.getHttpAdapter().getInstance();

  // Owner MiniApp: serve static files from /app/assets/*, /app/index.html
  expressApp.use('/app', express.static(join(__dirname, '..', 'public', 'app')));

  // Customer MiniApp: serve static files from /customer/assets/*, /customer/index.html
  expressApp.use('/customer', express.static(join(__dirname, '..', 'public', 'customer')));

  // SPA fallback: for any unmatched /app/* route, serve index.html
  // This enables React Router direct refresh on /app/bots/:id
  expressApp.get('/app/*path', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'app', 'index.html'));
  });

  // SPA fallback: for any unmatched /customer/* route, serve index.html
  expressApp.get('/customer/*path', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
