export interface RequestUser {
  userId: string;
  customerId: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'OPERATOR';
}
