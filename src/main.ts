import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { AppModule } from './app.module';
import { initSchema } from './infrastructure/database/sqlite.connection';
import { initPostgres } from './infrastructure/database/postgres.connection';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  // Usa SQLite en desarrollo local. Postgres requiere AWS credenciales.
  // Para usar Postgres, configura AWS CLI: aws configure
  if (process.env.NODE_ENV === 'development') {
    await initPostgres();
  }
  initSchema();
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter);

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  try {
    const openapiPath = join(process.cwd(), 'contracts', 'openapi.yml');
    const file = fs.readFileSync(openapiPath, 'utf8');
    const document = yaml.load(file) as OpenAPIObject;
    SwaggerModule.setup('api', app, document);
    console.log('Swagger UI available at /api');
  } catch (err) {
    console.warn('Could not load OpenAPI spec for Swagger UI:', err.message ?? err);
  }

  await app.listen(3000);
}
bootstrap();
