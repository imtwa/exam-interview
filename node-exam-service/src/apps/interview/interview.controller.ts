import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { QueryInterviewDto } from './dto/query-interview.dto';
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
import { LoggerService } from '../../common/logger/logger.service';

@ApiTags('interview')
@Controller('interview')
export class InterviewController {
  private readonly logger: LoggerService;

  constructor(
    private readonly interviewService: InterviewService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(InterviewController.name);
  }

  @ApiOperation({ summary: '创建面试' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createInterviewDto: CreateInterviewDto, @Request() req) {
    this.logger.log(`创建面试: ${JSON.stringify(createInterviewDto)}`);
    const result = await this.interviewService.create(
      createInterviewDto,
      req.user.userId,
    );
    return success(result, '创建成功');
  }

  @ApiOperation({ summary: '分页获取面试列表' })
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
  @ApiResponse({ status: 200, description: '返回面试列表及分页信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('page')
  async findAll(@Query() query: QueryInterviewDto, @Request() req) {
    this.logger.log(`查询面试列表: 页码${query.page}, 每页${query.pageSize}`);
    const { interviews, total } = await this.interviewService.findAll(
      query,
      req.user.userId,
    );
    return pagination(interviews, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '根据ID获取面试信息' })
  @ApiParam({ name: 'id', description: '面试ID', type: 'number' })
  @ApiResponse({ status: 200, description: '返回面试信息' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    this.logger.log(`查询面试: ${id}`);
    const result = await this.interviewService.findOne(+id, req.user.userId);
    return success(result);
  }

  @ApiOperation({ summary: '更新面试信息' })
  @ApiParam({ name: 'id', description: '面试ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
    @Request() req,
  ) {
    this.logger.log(`更新面试: ${id}`);
    const result = await this.interviewService.update(
      +id,
      updateInterviewDto,
      req.user.userId,
    );
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除面试' })
  @ApiParam({ name: 'id', description: '面试ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`删除面试: ${id}`);
    await this.interviewService.remove(+id, req.user.userId);
    return success(null, '删除成功');
  }
}
