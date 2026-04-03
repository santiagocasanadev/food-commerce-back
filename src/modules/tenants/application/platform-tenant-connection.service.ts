import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { describeConnectionTarget } from '../utils/masked-connection';

@Injectable()
export class PlatformTenantConnectionService {
  private readonly logger = new Logger(PlatformTenantConnectionService.name);

  async testConnection(payload: { dbConnectionUrl: string }) {
    const dbConnectionUrl = payload.dbConnectionUrl.trim();
    const target = describeConnectionTarget(dbConnectionUrl);

    const pool = new Pool({
      connectionString: dbConnectionUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    try {
      this.logger.log(
        `Testing tenant connection against ${JSON.stringify(target)}`,
      );

      await pool.query('SELECT 1');

      return {
        success: true,
        target,
      };
    } catch (error: any) {
      this.logger.error(
        `Tenant connection test failed for ${JSON.stringify(target)}: ${
          error?.message ?? error
        }`,
      );

      throw new InternalServerErrorException({
        message: 'Tenant connection test failed',
        target,
      });
    } finally {
      await pool.end();
    }
  }
}
