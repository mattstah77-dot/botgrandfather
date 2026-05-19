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
  // Order: 1) NestJS API routes, 2) Static files, 3) SPA fallback
  const expressApp = app.getHttpAdapter().getInstance();

  // Owner MiniApp static files
  // Note: /app/api/* exclusion needed because owner APIs still use /miniapp/*
  // (not yet migrated to /api/owner/*)
  expressApp.use('/app', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    express.static(join(__dirname, '..', 'public', 'app'))(req, res, next);
  });

  // Customer MiniApp static files
  // NO exclusion needed - customer APIs now at /api/customer/* (outside SPA namespace)
  expressApp.use('/customer', express.static(join(__dirname, '..', 'public', 'customer')));

  // SPA fallback for Owner MiniApp: serve index.html for unmatched routes
  expressApp.get('/app/*path', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'app', 'index.html'));
  });

  // SPA fallback for Customer MiniApp: serve index.html for unmatched routes
  // NO exclusion needed - /api/customer/* is handled by NestJS before this
  expressApp.get('/customer/*path', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  // SPA fallback for /customer (with query params like ?botId=xxx)
  expressApp.get('/customer', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
