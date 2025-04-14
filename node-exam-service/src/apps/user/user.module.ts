import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaClient } from '../../../generated/prisma/client';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [UserController],
  providers: [UserService, {
    provide: 'PRISMA_CLIENT',
    useValue: new PrismaClient(),
  }],
  exports: [UserService],
})
export class UserModule {}
