import {
  Inject,
  Injectable,
  NotFoundException,
  // Removed unused import BadRequestException
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('UserService');
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, pageSize = 10, username, email } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = {};
    if (username) {
      where['username'] = { contains: username };
    }
    if (email) {
      where['email'] = { contains: email };
    }

    const [users, total] = await Promise.all([
      this.prisma.frontUser.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.frontUser.count({ where }),
    ]);

    this.logger.log(
      `查询用户列表成功: 页码${page}, 每页${pageSize}, 总数${total}`,
    );
    return { users, total };
  }

  async findOne(id: number) {
    const user = await this.prisma.frontUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      this.logger.warn(`查询用户失败，用户不存在: ${id}`);
      throw new NotFoundException('用户不存在');
    }

    this.logger.log(`查询用户成功: ${id}`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // 先检查用户是否存在
    await this.findOne(id);

    // 处理密码更新
    let updateData = { ...updateUserDto };

    if (updateUserDto.password) {
      // 加密密码
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateData = {
        ...updateData,
        password: hashedPassword,
      };
      this.logger.debug(`用户密码已更新: ${id}`);
    }

    const updatedUser = await this.prisma.frontUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`更新用户成功: ${id}`);
    return updatedUser;
  }

  async remove(id: number) {
    // 先检查用户是否存在
    await this.findOne(id);

    await this.prisma.frontUser.delete({
      where: { id },
    });

    this.logger.log(`删除用户成功: ${id}`);
    return null;
  }

  /**
   * 检查用户是否已设置用户资料
   *
   * @param userId 用户ID
   * 示例: 1
   *
   * @returns 用户资料信息，包括角色和面试官信息
   */
  async checkUserProfile(userId: number) {
    this.logger.log(`检查用户是否已设置用户资料: ${userId}`);

    // 获取用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    const result = {
      isProfileCompleted: false,
      role: user.role,
      isInterviewer: user.role === UserRole.INTERVIEWER,
      interviewer: null,
      company: null,
    };

    // 如果是面试官，检查是否已设置面试官信息和公司信息
    if (user.role === UserRole.INTERVIEWER) {
      const interviewer = await this.prisma.interviewer.findFirst({
        where: { userId, deletedAt: null },
        include: {
          company: true,
        },
      });

      if (interviewer) {
        result.interviewer = interviewer;
        result.company = interviewer.company;
        result.isProfileCompleted = true;
      }
    }

    return result;
  }
}
