import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus
} from '@nestjs/common';
import { getTenantContext } from 'src/infrastructure/database/tenant-context';
    
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let detail: string | string[] | Record<string, unknown> | null = null;
    let stack: string | null = null;

    if (exception instanceof HttpException) {

      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const responseMessage = getResponseMessage(res);

        message =
          typeof responseMessage === 'string'
            ? responseMessage
            : Array.isArray(responseMessage)
            ? responseMessage.join(', ')
            : message;
        detail = res as Record<string, unknown>;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      stack = exception.stack ?? null;
    }

    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      tenantId: getTenantContext()?.tenantId ?? null,
      status,
      message,
      detail,
      stack,
    };

    console.error(errorLog);

    const isDevelopment = process.env.NODE_ENV !== 'production';

    response.status(status).json({
      timestamp: errorLog.timestamp,
      statusCode: status,
      path: request.url,
      method: request.method,
      message,
      ...(isDevelopment && detail ? { detail } : {}),
      ...(isDevelopment && stack ? { stack } : {}),
    });
  }
}

function getResponseMessage(
  value: object,
): string | string[] | undefined {
  const candidate = value as { message?: unknown };
  const message = candidate.message;

  return typeof message === 'string' || Array.isArray(message)
    ? (message as string | string[])
    : undefined;
}
