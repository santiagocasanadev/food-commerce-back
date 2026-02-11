import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(userId: string, role: string) {
    const payload = { sub: userId, role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
