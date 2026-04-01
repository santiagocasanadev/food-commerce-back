import { Role } from "src/security/roles.enum";
import { User } from "../entities/user.entity";

export interface UserRepository {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findAll(): Promise<User[]>;

  findByTenantId(tenantId: string): Promise<User[]>;

  create(data: {
    tenantId?: string | null;
    email?: string | null;
    name: string;
    imageUrl?: string | null;
    address?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    role?: Role;
    emailVerified?: boolean;
    emailVerifiedAt?: Date | null;
    marketingOptIn?: boolean;
    marketingConsentAt?: Date | null;
    termsAcceptedAt?: Date | null;
    privacyAcceptedAt?: Date | null;
  }): Promise<User>;

  save(user: User): Promise<void>;

  deleteById(id: string): Promise<void>;
}
