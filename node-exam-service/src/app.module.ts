import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './apps/user/user.module';
import { EmailModule } from './apps/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './apps/redis/redis.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './apps/auth/auth.module';
import { ExamModule } from './apps/exam/exam.module';
import { CompanyModule } from './apps/company/company.module';
import { InterviewModule } from './apps/interview/interview.module';
import { InterviewerModule } from './apps/interviewer/interviewer.module';
import { JobSeekerModule } from './apps/jobseeker/jobseeker.module';
import { JobModule } from './apps/job/job.module';
import { IndustryModule } from './apps/industry/industry.module';
@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EmailModule,
    RedisModule,
    LoggerModule,
    AuthModule,
    ExamModule,
    CompanyModule,
    InterviewModule,
    InterviewerModule,
    JobSeekerModule,
    JobModule,
    IndustryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
