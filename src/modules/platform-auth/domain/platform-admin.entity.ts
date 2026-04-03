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

  withChanges(changes: {
    email?: string;
    name?: string;
    passwordHash?: string;
    active?: boolean;
    updatedAt?: Date;
  }) {
    return new PlatformAdmin(
      this.id,
      changes.email ?? this.email,
      changes.name ?? this.name,
      changes.passwordHash ?? this.passwordHash,
      changes.active ?? this.active,
      this.createdAt,
      changes.updatedAt ?? this.updatedAt,
    );
  }
}
