import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  PrismaClient,
  VerificationStatus,
} from '../../../prisma/generated/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CompanyService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('CompanyService');
  }

  /**
   * 创建公司
   * @param createCompanyDto 创建公司DTO
   * @param userId 创建用户ID
   * @returns 创建的公司信息
   */
  async create(createCompanyDto: CreateCompanyDto, userId: number) {
    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`创建公司失败，用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否为面试官
    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`创建公司失败，用户不是面试官: ${userId}`);
      throw new BadRequestException('只有面试官可以创建公司');
    }

    try {
      // 创建公司
      const company = await this.prisma.company.create({
        data: {
          ...createCompanyDto,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      this.logger.log(`创建公司成功: ${company.id}`);
      return company;
    } catch (error) {
      this.logger.error(`创建公司失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建公司失败');
    }
  }

  /**
   * 分页获取公司列表
   * @param query 查询参数
   * @returns 公司列表及总数
   */
  async findAll(query: QueryCompanyDto) {
    const {
      page = 1,
      pageSize = 10,
      name,
      industryId,
      verificationStatus,
    } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = { deletedAt: null };
    if (name) {
      where.name = { contains: name };
    }
    if (industryId) {
      where.industryId = parseInt(industryId.toString(), 10);
    }
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    try {
      const [companies, total] = await Promise.all([
        this.prisma.company.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            industry: true, // 包含行业信息
          },
        }),
        this.prisma.company.count({ where }),
      ]);

      this.logger.log(
        `查询公司列表成功: 页码${page}, 每页${pageSize}, 总数${total}`,
      );
      return { companies, total };
    } catch (error) {
      this.logger.error(`查询公司列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询公司列表失败');
    }
  }

  /**
   * 根据ID获取公司信息
   * @param id 公司ID
   * @returns 公司信息
   */
  async findOne(id: number) {
    try {
      const company = await this.prisma.company.findFirst({
        where: { id, deletedAt: null },
        include: {
          industry: true, // 包含行业信息
        },
      });

      if (!company) {
        this.logger.warn(`查询公司失败，公司不存在: ${id}`);
        throw new NotFoundException('公司不存在');
      }

      this.logger.log(`查询公司成功: ${id}`);
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`查询公司失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询公司失败');
    }
  }

  /**
   * 更新公司信息
   * @param id 公司ID
   * @param updateCompanyDto 更新公司DTO
   * @param userId 更新用户ID
   * @returns 更新后的公司信息
   */
  async update(id: number, updateCompanyDto: UpdateCompanyDto, userId: number) {
    // 检查公司是否存在
    await this.findOne(id);

    // 检查用户是否有权限更新公司信息
    const interviewer = await this.prisma.interviewer.findFirst({
      where: { userId, companyId: id, deletedAt: null },
    });

    if (!interviewer) {
      this.logger.warn(`更新公司失败，用户无权限: ${userId}`);
      throw new ForbiddenException('无权限更新该公司信息');
    }

    try {
      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: {
          ...updateCompanyDto,
          // 如果更新了公司信息，需要重新验证
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      this.logger.log(`更新公司成功: ${id}`);
      return updatedCompany;
    } catch (error) {
      this.logger.error(`更新公司失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新公司失败');
    }
  }

  /**
   * 删除公司
   * @param id 公司ID
   * @param userId 删除用户ID
   */
  async remove(id: number, userId: number) {
    // 检查公司是否存在
    await this.findOne(id);

    // 检查用户是否有权限删除公司
    const interviewer = await this.prisma.interviewer.findFirst({
      where: { userId, companyId: id, deletedAt: null },
    });

    if (!interviewer) {
      this.logger.warn(`删除公司失败，用户无权限: ${userId}`);
      throw new ForbiddenException('无权限删除该公司');
    }

    try {
      // 软删除公司
      await this.prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`删除公司成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除公司失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除公司失败');
    }
  }

  /**
   * 验证公司信息
   * @param id 公司ID
   * @param userId 验证用户ID
   * @returns 验证后的公司信息
   */
  async verifyCompany(id: number, userId: number) {
    // 检查公司是否存在
    await this.findOne(id);

    // 检查用户是否为管理员（这里简化处理，实际应该检查用户角色）
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`验证公司失败，用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    try {
      const verifiedCompany = await this.prisma.company.update({
        where: { id },
        data: { verificationStatus: VerificationStatus.VERIFIED },
      });

      this.logger.log(`验证公司成功: ${id}`);
      return verifiedCompany;
    } catch (error) {
      this.logger.error(`验证公司失败: ${error.message}`, error.stack);
      throw new BadRequestException('验证公司失败');
    }
  }
}
