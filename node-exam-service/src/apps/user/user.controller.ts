import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { success, pagination } from '../../common/utils/response.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '分页获取用户列表' })
  @ApiQuery({
    name: 'page',
    description: '当前页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: '返回用户列表及分页信息' })
  @Get('page')
  async findAll(@Query() query: QueryUserDto) {
    const { users, total } = await this.userService.findAll(query);
    return pagination(users, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '返回用户个人资料' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  // 受保护的API路由，需要JWT认证
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return success(req.user, '获取用户信息成功');
  }

  @ApiOperation({ summary: '根据ID获取用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '返回用户信息' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.userService.findOne(+id);
    return success(result);
  }

  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(+id, updateUserDto);
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(+id);
    return success(null, '删除成功');
  }

  @ApiOperation({ summary: '检查用户资料完善状态' })
  @ApiResponse({
    status: 200,
    description: '返回用户资料信息',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取用户资料成功' },
        data: {
          type: 'object',
          properties: {
            isProfileCompleted: { type: 'boolean', example: true },
            role: { type: 'string', example: 'INTERVIEWER' },
            isInterviewer: { type: 'boolean', example: true },
            interviewer: { type: 'object' },
            company: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('profile/check')
  async checkUserProfile(@Request() req) {
    const userId = req.user.userId;
    const result = await this.userService.checkUserProfile(userId);
    return success(result, '获取用户资料成功');
  }
}
