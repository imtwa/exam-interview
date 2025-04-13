import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './apps/user/user.module';
import { EmailModule } from './apps/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './apps/redis/redis.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env'
    }),
    EmailModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
