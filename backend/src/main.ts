import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[]) =>
        new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: validationErrors.flatMap((error) =>
            Object.values(error.constraints ?? {}).map((message) => ({
              field: error.property,
              message,
            })),
          ),
        }),
    }),
  );

  app.enableCors({
    origin: config.get<string>('app.frontendUrl'),
    credentials: true,
  });

  const frontendDistPath = join(process.cwd(), '../frontend/dist');
  if (existsSync(frontendDistPath)) {
    const expressApp = app.getHttpAdapter().getInstance();

    expressApp.use(express.static(frontendDistPath));
    expressApp.use((request: Request, response: Response, next: NextFunction) => {
      if (request.path.startsWith('/api')) {
        return next();
      }

      response.sendFile(join(frontendDistPath, 'index.html'));
    });
  }

  const port = config.get<number>('app.port') ?? 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
void bootstrap();
