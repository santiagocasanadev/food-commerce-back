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

async function bootstrap() {
  // Usa SQLite en desarrollo local. Postgres requiere AWS credenciales.
  // Para usar Postgres, configura AWS CLI: aws configure
  if (process.env.NODE_ENV === 'development') {
    await initPostgres();
  }
  initSchema();
  const app = await NestFactory.create(AppModule);

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
