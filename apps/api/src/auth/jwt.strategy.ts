import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: number;
  email: string;
  role: 'owner' | 'admin' | 'viewer' | string;
  orgId: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // This becomes req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.orgId,
    };
  }
}
