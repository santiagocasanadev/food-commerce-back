import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

type MetricSnapshot = {
  useCase: string;
  total: number;
  success: number;
  failure: number;
  avgDurationMs: number;
  lastDurationMs: number | null;
  lastStatus: 'success' | 'failure' | null;
  lastSeenAt: string | null;
};

@Injectable()
export class AuthTelemetryService {
  private readonly logger = new Logger(AuthTelemetryService.name);
  private readonly metrics = new Map<string, MetricSnapshot>();

  async track<T>(
    useCase: string,
    meta: Record<string, unknown>,
    handler: (traceId: string) => Promise<T>,
  ): Promise<T> {
    const traceId = crypto.randomUUID();
    const startedAt = Date.now();

    this.logger.log(
      JSON.stringify({
        scope: 'auth',
        event: 'start',
        useCase,
        traceId,
        ...meta,
      }),
    );

    try {
      const result = await handler(traceId);
      const durationMs = Date.now() - startedAt;
      this.recordMetric(useCase, durationMs, 'success');

      this.logger.log(
        JSON.stringify({
          scope: 'auth',
          event: 'success',
          useCase,
          traceId,
          durationMs,
          ...meta,
        }),
      );

      return result;
    } catch (error: unknown) {
      const durationMs = Date.now() - startedAt;
      this.recordMetric(useCase, durationMs, 'failure');

      this.logger.error(
        JSON.stringify({
          scope: 'auth',
          event: 'failure',
          useCase,
          traceId,
          durationMs,
          error: error instanceof Error ? error.message : String(error),
          ...meta,
        }),
      );

      throw error;
    }
  }

  getMetrics() {
    return {
      generatedAt: new Date().toISOString(),
      metrics: [...this.metrics.values()],
    };
  }

  reset() {
    this.metrics.clear();
  }

  private recordMetric(
    useCase: string,
    durationMs: number,
    status: 'success' | 'failure',
  ) {
    const current =
      this.metrics.get(useCase) ?? {
        useCase,
        total: 0,
        success: 0,
        failure: 0,
        avgDurationMs: 0,
        lastDurationMs: null,
        lastStatus: null,
        lastSeenAt: null,
      };

    const total = current.total + 1;
    const totalDuration = current.avgDurationMs * current.total + durationMs;

    current.total = total;
    current.success += status === 'success' ? 1 : 0;
    current.failure += status === 'failure' ? 1 : 0;
    current.avgDurationMs = Number((totalDuration / total).toFixed(2));
    current.lastDurationMs = durationMs;
    current.lastStatus = status;
    current.lastSeenAt = new Date().toISOString();

    this.metrics.set(useCase, current);
  }
}
