import { Role } from "src/security/roles.enum";
import { User } from "../entities/user.entity";

export interface UserRepository {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(data: {
    email?: string | null;
    name: string;
    avatarUrl?: string | null;
    role?: Role;
    emailVerified?: boolean;
  }): Promise<User>;

  save(user: User): Promise<void>;
}
