export interface RequestUser {
  userId: string;
  sessionId: string | null;
  customerId: string | null;
  tenantId: string | null;
  platformScope?: boolean;
  role: 'CUSTOMER' | 'TENANT_STAFF' | 'TENANT_ADMIN' | 'PLATFORM_ADMIN';
}
