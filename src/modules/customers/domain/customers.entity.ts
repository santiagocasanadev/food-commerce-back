import { Role } from "src/security/roles.enum";

export class Customer {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly address: string | null,
    readonly googleId: string | null,
    readonly role: Role
  ) {}
}
