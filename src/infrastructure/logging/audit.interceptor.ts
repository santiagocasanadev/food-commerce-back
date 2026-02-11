import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user?.id ?? 'anonymous';
    const path = req.url;
    return next.handle().pipe(
      tap(() => console.log(`[AUDIT] user=${user} path=${path}`))
    );
  }
}
