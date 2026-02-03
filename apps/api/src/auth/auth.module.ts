import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

import { User } from '@sacharya/data';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      // ✅ Read from environment variable with fallback
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { 
        // ✅ Convert string to appropriate type
        expiresIn: (process.env.JWT_EXPIRATION as any) || '1h' 
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
