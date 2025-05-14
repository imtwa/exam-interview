# 云面官在线面试平台 - 后端服务

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## 项目介绍

云面官是一个在线面试与考试平台的后端服务，基于NestJS框架开发，提供完整的招聘流程管理、在线考试、远程面试等功能的API支持。系统采用Prisma作为ORM工具，MySQL作为主数据库，Redis提供缓存支持，并集成了JWT认证、邮件服务、文件上传等功能。

## 主要功能

### 用户认证与管理
- 多角色用户系统（求职者、面试官/HR、管理员）
- 用户认证与授权（登录、注册、密码重置）
- 图形验证码与邮箱验证码
- JWT身份验证
- 用户资料管理

### 考试系统
- 题库分类管理（一级分类、二级分类）
- 试卷管理（创建、更新、删除、查询）
- 题目管理（多种题型支持）
- 在线考试分配与评分
- 考试结果与数据分析
- 用户收藏功能

### 招聘系统
- 企业与行业管理
- 职位发布与管理
- 简历投递与筛选
- 招聘流程数据分析
- 求职申请状态管理

### 面试系统
- 面试安排与管理
- 面试邀请码生成
- 远程视频面试支持
- 面试评价与反馈
- 多轮面试流程管理

### 求职者与面试官管理
- 求职者资料维护（教育经历、工作经验）
- 面试官资料维护
- 企业信息管理与验证
- 简历上传与管理

## 技术栈

- **框架**: NestJS 10.0
- **数据库**: MySQL 8.0+
- **ORM**: Prisma 6.6
- **缓存**: Redis 4.7
- **认证**: JWT、Passport.js
- **API文档**: Swagger/OpenAPI
- **邮件服务**: Nodemailer
- **日志系统**: Winston、nest-winston
- **文件处理**: Multer、ExcelJS
- **数据验证**: class-validator、class-transformer
- **工具库**: bcryptjs、uuid

## 项目结构

```
node-exam-service/
├── dist/                   # 编译后的代码
├── logs/                   # 日志文件
├── prisma/                 # Prisma配置和模型定义
│   └── schema.prisma       # 数据库模型定义
├── templates/              # 邮件模板
├── uploads/                # 上传文件存储
├── src/                    # 源代码
│   ├── app.module.ts       # 主模块
│   ├── main.ts             # 入口文件
│   ├── apps/               # 业务模块
│   │   ├── auth/           # 认证模块
│   │   ├── company/        # 公司模块
│   │   ├── email/          # 邮件模块
│   │   ├── exam/           # 试卷与考试模块
│   │   ├── industry/       # 行业分类模块
│   │   ├── interview/      # 面试模块
│   │   ├── interviewer/    # 面试官模块
│   │   ├── job/            # 职位模块
│   │   ├── jobseeker/      # 求职者模块
│   │   ├── redis/          # Redis缓存模块
│   │   ├── upload/         # 文件上传模块
│   │   └── user/           # 用户模块
│   └── common/             # 公共模块
│       ├── filters/        # 异常过滤器
│       ├── interceptors/   # 拦截器
│       ├── interfaces/     # 接口定义
│       ├── logger/         # 日志配置
│       ├── pipes/          # 数据验证管道
│       └── utils/          # 工具函数
└── test/                   # 测试代码
```

## 数据库设计

系统使用MySQL数据库，采用Prisma ORM进行数据访问。主要实体关系包括：

### 用户与认证相关表
- `exam_admin_user`: 管理员用户表
- `exam_front_user`: 前台用户表（求职者/面试官）

### 考试系统相关表
- `exam_category`: 一级分类表
- `exam_subcategory`: 二级分类表
- `exam_question`: 题目表
- `exam_exampaper`: 试卷表
- `exam_examquestion`: 试卷题目关联表
- `exam_favorite`: 用户收藏表

### 招聘系统相关表
- `exam_recruitment_companies`: 公司表
- `exam_recruitment_industry_categories`: 行业一级分类表
- `exam_recruitment_industry_subcategories`: 行业二级分类表
- `exam_recruitment_job_postings`: 职位发布表
- `exam_recruitment_job_applications`: 职位申请表
- `exam_recruitment_exam_assignments`: 笔试分配表
- `exam_recruitment_interviews`: 面试安排表

### 用户资料相关表
- `exam_recruitment_job_seekers`: 求职者详情表
- `exam_recruitment_education`: 教育经历表
- `exam_recruitment_work_experience`: 工作经验表
- `exam_recruitment_interviewers`: 面试官详情表

详细的数据库模型定义可以在`prisma/schema.prisma`文件中查看。

## API接口概览

系统提供完整的RESTful API，主要包括以下接口组：

### 认证接口 (/auth)
- 用户注册、登录
- 验证码生成与验证
- 密码重置
- 用户资料获取

### 考试与题库接口
- 试卷管理
- 题目管理
- 分类管理
- 收藏管理
- 在线考试

### 招聘接口
- 职位发布与管理
- 公司信息管理
- 行业分类管理
- 职位申请管理

### 面试接口
- 面试安排
- 面试评价
- 面试邀请验证

### 求职者与面试官接口
- 资料管理
- 教育与工作经历
- 简历上传
- 面试官企业设置

完整的API文档可以通过Swagger界面访问：`/api/docs`

## 环境要求

- Node.js (>= 18.x || 20.x)
- MySQL (>= 8.0)
- Redis (>= 3.0)

## 安装与部署

### 1. 环境准备

确保你已安装Node.js、MySQL和Redis，并已创建相应的数据库。

### 2. 安装依赖

```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

### 3. 配置环境变量

创建`.env`文件，配置以下环境变量：

```
# 服务器配置
PORT=3000
HOST=localhost

# 数据库
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"

# JWT
JWT_SECRET="你的JWT密钥"
JWT_EXPIRES_IN="24h"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# 邮件服务
MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_USER="your-email@example.com"
MAIL_PASS="your-password"
MAIL_FROM="Cloud Interview <your-email@example.com>"

# 文件上传
UPLOAD_DEST="./uploads"
MAX_FILE_SIZE=5242880  # 5MB
```

### 4. 数据库初始化

```bash
# 使用Prisma迁移创建数据库表结构
npx prisma migrate dev --name init

# 生成Prisma客户端
npx prisma generate
```

### 5. 启动服务

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

## 前后端集成

本后端服务与前端项目集成，支持以下核心功能：

### 1. 考试系统
- 提供试卷和题目API
- 支持在线考试流程
- 提供考试结果分析

### 2. 招聘流程管理
- 提供完整的职位发布、申请流程API
- 支持简历筛选与管理
- 提供招聘数据分析

### 3. 远程面试支持
- 提供面试邀请码生成与验证
- 面试安排和状态管理
- 面试评价与反馈提交

## 系统安全性

- 使用JWT进行身份验证
- 密码加密存储
- 输入数据验证
- 邮箱验证码验证
- 图形验证码防护
- 文件上传安全检查

## 相关链接

- [项目主页](../README.md)
- [前端项目](../vue-exam-front/)
- [管理后台](../vue-exam-admin/)
- [API文档](/api/docs)

## 许可证

[MIT License](LICENSE)
