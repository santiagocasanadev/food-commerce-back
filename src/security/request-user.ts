export interface RequestUser {
  userId: string;
  sessionId: string | null;
  customerId: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'OPERATOR';
}
