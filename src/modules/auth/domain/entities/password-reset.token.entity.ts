export class PasswordResetToken {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly tokenHash: string,
    readonly expiresAt: Date,
    private consumed: boolean,
  ) {}

  isExpired() {
    return new Date() > this.expiresAt;
  }

  isConsumed() {
    return this.consumed;
  }

  consume() {
    this.consumed = true;
  }
}
