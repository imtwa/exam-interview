import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaClient } from '../../../generated/prisma/client';

@Module({
  controllers: [UserController],
  providers: [UserService, {
    provide: 'PRISMA_CLIENT',
    useValue: new PrismaClient(),
  }],
})
export class UserModule {}
