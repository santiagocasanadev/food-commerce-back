import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './security/guards/jwt-auth.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from './security/guards/optional-jwt-auth.guard';
import { TenantResolutionMiddleware } from './modules/tenants/middleware/tenant-resolution.middleware';
import { PlatformModule } from './modules/platform/platform.module';
import { TenantAppModule } from './modules/tenant-app/tenant-app.module';

@Module({
  imports: [PlatformModule, TenantAppModule,
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }])
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OptionalJwtAuthGuard,
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolutionMiddleware).forRoutes('*');
  }
}
