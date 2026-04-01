import { AsyncLocalStorage } from 'async_hooks';
import { Pool } from 'pg';

export type TenantContextState = {
  tenantId: string | null;
  tenantSlug: string | null;
  pool: Pool | null;
  source: 'default' | 'registry';
};

const tenantContext = new AsyncLocalStorage<TenantContextState>();

export function runWithTenantContext<T>(
  state: TenantContextState,
  callback: () => T,
): T {
  return tenantContext.run(state, callback);
}

export function getTenantContext(): TenantContextState | undefined {
  return tenantContext.getStore();
}
