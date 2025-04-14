import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter} from 'nodemailer';
import { logger } from '../../common/logger/logger.config';

@Injectable()
export class EmailService {
    private readonly logger = new Logger('EmailService');
    transporter: Transporter
    
    constructor(private configService: ConfigService) {
      const user = this.configService.get('EMAIL_USER');
      
      this.logger.log(`初始化邮件服务，使用账号: ${user}`);
      logger.info('初始化邮件服务', { context: 'EmailService', user });
      
      this.transporter = createTransport({
          host: "smtp.qq.com",
          port: 587,
          secure: false,
          auth: {
              user,
              pass: this.configService.get('EMAIL_PASSWORD')
          },
      });
      
      // 验证SMTP连接配置
      this.transporter.verify((error, success) => {
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
            address: this.configService.get('EMAIL_USER')
          },
          to,
          subject,
          html
        });
        
        this.logger.log(`邮件发送成功: ${result.messageId}`);
        logger.info('邮件发送成功', { context: 'EmailService', messageId: result.messageId, to });
        
        return result;
      } catch (error) {
        this.logger.error(`邮件发送失败: ${error.message}`);
        logger.error('邮件发送失败', { context: 'EmailService', to, subject, error });
        throw error;
      }
    }
}
