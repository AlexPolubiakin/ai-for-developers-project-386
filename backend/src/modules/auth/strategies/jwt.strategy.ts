import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

type CookieRequest = Request & {
  cookies?: Record<string, string>;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: CookieRequest) => {
          const cookies: unknown = request.cookies;
          if (!cookies || typeof cookies !== 'object') {
            return null;
          }

          const token = (cookies as Record<string, unknown>)['access_token'];
          return typeof token === 'string' ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  validate(payload: { userId: string; email: string }) {
    return { userId: payload.userId, email: payload.email };
  }
}
