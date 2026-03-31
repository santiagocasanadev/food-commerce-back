import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: any) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      sessionId: payload.sid ?? null,
      customerId: payload.customerId ?? null,
      role: payload.role,
    };
  }
}
