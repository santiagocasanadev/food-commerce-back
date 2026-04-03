export class PlatformAdmin {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly passwordHash: string,
    readonly active: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
