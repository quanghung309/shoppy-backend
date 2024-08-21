import { Injectable, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async login(user: User, response: Response) {
    // const ms = require('ms');
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(this.configService.getOrThrow<string>('JWT_EXPIRATION')),
    );
    console.log(
      'Hello',
      ms(this.configService.getOrThrow<string>('JWT_EXPIRATION')),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });

    return { tokenPayload };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      } else {
        console.log('compare success');
        return user;
      }
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
