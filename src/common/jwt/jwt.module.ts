import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
const jwtIssuer = process.env.JWT_ISSUER;
const jwtAudience = process.env.JWT_AUDIENCE;
const clockTolerance = Number(process.env.JWT_CLOCK_TOLERANCE || 10);
const accessTtl = (process.env.JWT_EXPIRES_IN as StringValue) || '3m';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: {
        expiresIn: accessTtl,
        ...(jwtIssuer ? { issuer: jwtIssuer } : {}),
        ...(jwtAudience ? { audience: jwtAudience } : {}),
      },
      verifyOptions: {
        ...(jwtIssuer ? { issuer: jwtIssuer } : {}),
        ...(jwtAudience ? { audience: jwtAudience } : {}),
        clockTolerance,
      },
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
