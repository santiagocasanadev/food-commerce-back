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
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
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
    const httpAdapter = app.getHttpAdapter().getInstance();

    httpAdapter.get('/docs/openapi.json', (_req, res) => {
      res.type('application/json').send(document);
    });

    httpAdapter.get('/docs/openapi.yml', (_req, res) => {
      res.type('application/yaml').send(file);
    });

    httpAdapter.get('/docs/routes', (_req, res) => {
      const routes = Object.entries(document.paths ?? {}).flatMap(
        ([path, pathItem]) =>
          Object.entries(pathItem ?? {}).flatMap(([method, operation]) => {
            if (!isOpenApiOperation(method, operation)) {
              return [];
            }

            return [
              {
                path,
                method: method.toUpperCase(),
                operationId: operation.operationId ?? null,
                summary: operation.summary ?? null,
                tags: operation.tags ?? [],
                secured: !isPublicOperation(operation, document),
              },
            ];
          }),
      );

      res.type('application/json').send({
        version: document.info?.version ?? null,
        total: routes.length,
        routes,
      });
    });

    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger UI available at /docs');
    logger.log('OpenAPI JSON available at /docs/openapi.json');
    logger.log('OpenAPI YAML available at /docs/openapi.yml');
    logger.log('Simplified routes available at /docs/routes');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`Could not load OpenAPI spec for Swagger UI: ${message}`);
  }
  
  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

function isOpenApiOperation(method: string, operation: unknown): operation is {
  operationId?: string;
  summary?: string;
  tags?: string[];
  security?: Array<Record<string, string[]>>;
} {
  const operationMethods = new Set([
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
    'trace',
  ]);

  return operationMethods.has(method) && typeof operation === 'object' && operation !== null;
}

function isPublicOperation(
  operation: { security?: Array<Record<string, string[]>> },
  document: OpenAPIObject,
) {
  if (operation.security) {
    return operation.security.length === 0;
  }

  return !(document.security && document.security.length > 0);
}
