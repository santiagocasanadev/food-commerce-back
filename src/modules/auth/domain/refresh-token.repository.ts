import { PoolClient } from 'pg';
import { RefreshToken } from 'src/modules/auth/domain/refresh-token.entity';

export interface RefreshTokenRepository {
  save(
    token: RefreshToken,
    client?: PoolClient
  ): Promise<void>;

  findByHash(
    tokenHash: string,
    client?: PoolClient
  ): Promise<RefreshToken | null>;
}
