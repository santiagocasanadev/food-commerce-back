import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user?.userId ?? 'anonymous';
    const path = req.url;
    return next.handle().pipe(
      tap(() => this.logger.verbose(`user=${user} path=${path}`))
    );
  }
}
