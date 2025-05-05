import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { logger } from '../../common/logger/logger.config';
import { LoggerService } from '../../common/logger/logger.service';
import { join } from 'path';
import { readFile } from 'fs/promises';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  transporter: Transporter;

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.logger.log(
      `初始化邮件服务，使用账号: ${this.configService.get('EMAIL_USER')}`,
    );
    logger.info('初始化邮件服务', {
      context: 'EmailService',
      user: this.configService.get('EMAIL_USER'),
    });

    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });

    // 验证SMTP连接配置
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`SMTP连接验证失败: ${error.message}`);
        logger.error('SMTP连接验证失败', { context: 'EmailService', error });
      } else {
        this.logger.log('SMTP连接验证成功，准备发送邮件');
        logger.info('SMTP连接验证成功', { context: 'EmailService' });
      }
    });
  }

  async sendMail({ to, subject, html }) {
    try {
      this.logger.log(`正在发送邮件至: ${to}, 主题: ${subject}`);
      logger.info('发送邮件', { context: 'EmailService', to, subject });

      const result = await this.transporter.sendMail({
        from: {
          name: '云面官',
          address: this.configService.get('EMAIL_USER'),
        },
        to,
        subject,
        html,
      });

      this.logger.log(`邮件发送成功: ${result.messageId}`);
      logger.info('邮件发送成功', {
        context: 'EmailService',
        messageId: result.messageId,
        to,
      });

      return result;
    } catch (error) {
      this.logger.error(`邮件发送失败: ${error.message}`);
      logger.error('邮件发送失败', {
        context: 'EmailService',
        to,
        subject,
        error,
      });
      throw error;
    }
  }

  /**
   * 发送面试邀请邮件
   * @param params 面试邀请数据
   * @returns Promise<boolean> 是否发送成功
   */
  async sendInterviewInvitation(params: {
    to: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    interviewTime: string;
    interviewType: string;
    interviewLocation: string;
    interviewNotes: string;
    verificationLink: string;
    round: string;
  }): Promise<boolean> {
    const {
      to,
      candidateName,
      jobTitle,
      companyName,
      interviewTime,
      interviewType,
      interviewLocation,
      interviewNotes,
      verificationLink,
      round,
    } = params;

    const templatePath = join(
      process.cwd(),
      'templates',
      'interview-invitation.html',
    );
    const templateContent = await readFile(templatePath, 'utf8');

    const html = templateContent
      .replace(/{{candidate_name}}/g, candidateName)
      .replace(/{{job_title}}/g, jobTitle)
      .replace(/{{company_name}}/g, companyName)
      .replace(/{{interview_round}}/g, round)
      .replace(/{{interview_time}}/g, interviewTime)
      .replace(/{{interview_type}}/g, interviewType)
      .replace(/{{interview_location}}/g, interviewLocation)
      .replace(/{{interview_notes}}/g, interviewNotes)
      .replace(/{{verification_link}}/g, verificationLink);

    return this.sendMail({
      to,
      subject: `【面试邀请】${companyName} - ${jobTitle} - ${round}`,
      html,
    });
  }
}
