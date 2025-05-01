import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '获取图片验证码' })
  @ApiResponse({
    status: 200,
    description: '返回验证码图片和验证码ID',
    schema: {
      properties: {
        id: { type: 'string', description: '验证码ID' },
        imageUrl: { type: 'string', description: '验证码图片Base64' },
      },
    },
  })
  @Get('captcha/image')
  async getImageCaptcha() {
    return this.authService.getImageCaptcha();
  }

  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 400, description: '邮箱地址不能为空' })
  @Get('captcha/email')
  async sendEmailCode(@Query('address') address: string) {
    if (!address) {
      throw new BadRequestException('邮箱地址不能为空');
    }

    return this.authService.sendEmailCode(address);
  }

  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '验证码错误或用户名已存在' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      properties: {
        token: { type: 'string', description: 'JWT令牌' },
        user: { type: 'object', description: '用户信息' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: '管理员登录' })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      properties: {
        token: { type: 'string', description: 'JWT令牌' },
        user: { type: 'object', description: '管理员信息' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @ApiOperation({ summary: '重置密码' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 400, description: '验证码错误或用户不存在' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: '获取当前用户详细信息' })
  @ApiResponse({ status: 200, description: '返回用户详细信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const user = await this.authService.getUserById(userId);
    return {
      ...user,
      password: undefined, // 不返回密码
    };
  }

  @ApiOperation({ summary: '获取管理员详细信息' })
  @ApiResponse({ status: 200, description: '返回管理员详细信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('admin/profile')
  async getAdminProfile(@Request() req) {
    // 检查是否是管理员
    if (!req.user.isAdmin) {
      throw new BadRequestException('无权限访问管理员接口');
    }
    
    const adminId = req.user.userId;
    await this.authService.validateAdmin(adminId);
    
    const admin = await this.authService.getAdminById(adminId);
    return admin;
  }

  @ApiOperation({ summary: '检查用户资料完成状态' })
  @ApiResponse({
    status: 200,
    description: '返回用户资料完成状态',
    schema: {
      properties: {
        isCompleted: { type: 'boolean', description: '资料是否完整' },
        profileType: { type: 'string', description: '资料类型（HR/求职者）' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('check-profile-status')
  async checkProfileStatus(@Request() req) {
    const userId = req.user.userId;
    return this.authService.checkProfileStatus(userId);
  }
}
