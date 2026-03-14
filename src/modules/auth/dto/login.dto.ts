import { Role } from "src/security/roles.enum";

export class LoginDto {
  userId: string;
  role: Role;
}
