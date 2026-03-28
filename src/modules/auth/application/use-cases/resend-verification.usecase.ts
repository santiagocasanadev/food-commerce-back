import { Injectable } from "@nestjs/common";
import { SendVerificationEmailUseCase } from "./email-verification.token.usecase";

@Injectable()
export class ResendVerificationUseCase {

  constructor(
    private readonly sendVerification: SendVerificationEmailUseCase
  ) {}

  async execute(userId: string) {
    return this.sendVerification.execute(userId);
  }
}