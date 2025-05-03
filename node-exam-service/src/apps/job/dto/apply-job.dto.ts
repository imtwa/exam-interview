import { ApiProperty } from '@nestjs/swagger';

// 简化DTO，一键投递不需要额外字段
export class ApplyJobDto {
  // 一键投递不需要任何字段，保留空DTO用于类型和文档
  @ApiProperty({
    description: '一键投递，无需额外数据',
    example: '{}',
  })
  dummy?: void;
} 