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
  // Order matters: API routes MUST be handled by NestJS, not static middleware
  const expressApp = app.getHttpAdapter().getInstance();

  // Owner MiniApp: serve static files, but skip /app/api/* routes
  expressApp.use('/app', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    express.static(join(__dirname, '..', 'public', 'app'))(req, res, next);
  });

  // Customer MiniApp: serve static files, but skip /customer/bot/* API routes
  expressApp.use('/customer', (req, res, next) => {
    if (/^\/bot\//.test(req.path)) return next();
    express.static(join(__dirname, '..', 'public', 'customer'))(req, res, next);
  });

  // SPA fallback: for any unmatched /app/* route, serve index.html
  // Skip /app/api/* — these are API routes handled by NestJS controllers
  expressApp.get('/app/*path', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(__dirname, '..', 'public', 'app', 'index.html'));
  });

  // SPA fallback: for any unmatched /customer/* route, serve index.html
  // Skip /customer/bot/* — these are API routes handled by NestJS controllers
  expressApp.get('/customer/*path', (req, res, next) => {
    if (req.path.startsWith('/bot/')) return next();
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  // SPA fallback: for /customer (with query params like ?botId=xxx)
  expressApp.get('/customer', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  // SPA fallback: for any unmatched /customer/* route, serve index.html
  expressApp.get('/customer/*path', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
