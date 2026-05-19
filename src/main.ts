import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PORT } from './config/env.config';
import { join } from 'path';

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

  // Enable CORS for webhook requests
  app.enableCors();

  // SPA fallback: serve index.html for any non-API route under /app
  // This enables direct refresh on /app/bots/:id/bookings etc.
  const expressApp = app.getHttpAdapter().getInstance();
  // SPA fallback: serve index.html for any non-API route under /app
  // Named wildcard *path required for Express 5 / path-to-regexp v8
  expressApp.get('/app/*path', (req, res, next) => {
    if (req.path.startsWith('/app/api')) return next();
    res.sendFile(join(__dirname, '..', 'public', 'app', 'index.html'));
  });

  // SPA fallback for customer miniapp
  // Customer API routes are /customer/bot/* — must NOT be intercepted
  expressApp.get('/customer/*path', (req, res, next) => {
    if (/^\/customer\/bot\//.test(req.path)) return next();
    res.sendFile(join(__dirname, '..', 'public', 'customer', 'index.html'));
  });

  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
