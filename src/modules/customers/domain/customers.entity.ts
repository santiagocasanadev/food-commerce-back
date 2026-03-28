import { Role } from "src/security/roles.enum";

export class Customer {

  constructor(
    readonly id: string,
    readonly userId: string,
    readonly role: Role
  ) {}
}
