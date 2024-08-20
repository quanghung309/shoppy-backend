import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      return this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10), // Hash the password before storing it
        },
      });
    } catch (error) {
      console.log(error);
      if (error.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists');
      }
    }
  }
}
