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

    if (exception instanceof HttpException) {

      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message ?? res;
      }
    }

    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      tenantId: getTenantContext()?.tenantId ?? null,
      status,
      message
    };

    console.error(errorLog);

    response.status(status).json({
      timestamp: errorLog.timestamp,
      statusCode: status,
      path: request.url,
      method: request.method,
      message
    });
  }
}
