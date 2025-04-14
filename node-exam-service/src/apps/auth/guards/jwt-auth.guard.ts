import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 重写handleRequest方法，确保在req.user中设置userId
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      return super.handleRequest(err, user, info, context, status);
    }
    
    // 确保用户信息包含userId
    return {
      ...user,
      userId: user.userId || user.sub,
    };
  }
} 