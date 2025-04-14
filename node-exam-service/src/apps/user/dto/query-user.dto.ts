import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUserDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '页码必须是整数' })
    @Min(1, { message: '页码最小为1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '每页数量必须是整数' })
    @Min(1, { message: '每页数量最小为1' })
    @Max(100, { message: '每页数量最大为100' })
    pageSize?: number = 10;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    email?: string;
} 