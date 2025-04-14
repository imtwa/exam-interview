# 云端面试官后端服务 (Node Exam Service)

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## 项目介绍

云端面试官是一个在线面试题库管理系统，本仓库包含系统的后端服务代码。系统基于NestJS框架开发，使用Prisma作为ORM工具，MySQL作为数据库，并集成了JWT认证、Redis缓存、邮件服务等功能。

## 主要功能

- 用户认证与授权（登录、注册、密码重置）
- 图形验证码生成与验证
- 邮箱验证码发送与验证
- 题库分类管理（一级分类、二级分类）
- 试卷管理（创建、更新、删除、查询）
- 题目管理（创建、更新、删除、查询）
- 用户收藏功能
- 用户上传文档处理

## 技术栈

- **框架**: NestJS
- **数据库**: MySQL
- **ORM**: Prisma
- **缓存**: Redis
- **认证**: JWT、Passport.js
- **邮件**: Nodemailer
- **日志**: Winston
- **验证**: class-validator

## 项目结构

```
node-exam-service/
├── dist/                   # 编译后的代码
├── generated/              # Prisma生成的代码
│   └── prisma/             
├── logs/                   # 日志文件
├── prisma/                 # Prisma配置和模型定义
│   └── schema.prisma       # 数据库模型定义
├── resources/              # 资源文件
│   └── db-init.sql         # 数据库初始化脚本
├── src/                    # 源代码
│   ├── app.module.ts       # 主模块
│   ├── main.ts             # 入口文件
│   ├── apps/               # 业务模块
│   │   ├── auth/           # 认证模块
│   │   ├── category/       # 分类模块
│   │   ├── document/       # 文档模块
│   │   ├── email/          # 邮件模块
│   │   ├── exam/           # 试卷模块
│   │   ├── question/       # 题目模块
│   │   ├── redis/          # Redis模块
│   │   └── user/           # 用户模块
│   └── common/             # 公共模块
│       ├── filters/        # 异常过滤器
│       ├── interceptors/   # 拦截器
│       ├── interfaces/     # 接口定义
│       ├── logger/         # 日志配置
│       ├── pipes/          # 管道
│       └── utils/          # 工具函数
└── test/                   # 测试代码
```

## 数据库设计

系统使用MySQL数据库，主要包含以下表：

- `exam_front_user`: 用户表
- `exam_front_category`: 一级分类表
- `exam_front_subcategory`: 二级分类表
- `exam_front_document`: 文档表
- `exam_front_question`: 题目表
- `exam_front_exampaper`: 试卷表
- `exam_front_examquestion`: 试卷题目关联表
- `exam_front_favorite`: 用户收藏表

详细的表结构定义可以在`prisma/schema.prisma`文件中查看。

## 环境要求

- Node.js (>= 14.x)
- MySQL (>= 5.7)
- Redis (>= 6.x)

## 安装与部署

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建`.env`文件，配置以下环境变量：

```
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
```

### 3. 初始化数据库

```bash
# 使用Prisma创建数据库表
npx prisma migrate dev --name init

# 或者执行SQL脚本
mysql -u 用户名 -p < resources/db-init.sql
```

### 4. 生成Prisma客户端

```bash
npx prisma generate
```

### 5. 编译项目

```bash
npm run build
```

### 6. 运行服务

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run start:prod
```

## API文档

启动服务后，可以通过以下URL访问API文档：

```
http://localhost:3000/api/docs
```

## 主要API接口

### 认证接口

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/captcha/image` - 获取图片验证码
- `GET /auth/captcha/email` - 发送邮箱验证码
- `POST /auth/reset-password` - 重置密码

### 用户接口

- `GET /user` - 获取用户列表
- `GET /user/:id` - 获取用户详情
- `PATCH /user/:id` - 更新用户信息
- `DELETE /user/:id` - 删除用户

### 分类接口

- `GET /category` - 获取一级分类列表
- `GET /category/:id` - 获取一级分类详情
- `POST /category` - 创建一级分类
- `PATCH /category/:id` - 更新一级分类
- `DELETE /category/:id` - 删除一级分类
- `GET /category/:id/subcategories` - 获取二级分类列表

### 试卷接口

- `GET /exam` - 获取试卷列表
- `GET /exam/:id` - 获取试卷详情
- `POST /exam` - 创建试卷
- `PATCH /exam/:id` - 更新试卷
- `DELETE /exam/:id` - 删除试卷
- `POST /exam/:id/favorite` - 收藏试卷
- `DELETE /exam/:id/favorite` - 取消收藏试卷

### 题目接口

- `GET /question` - 获取题目列表
- `GET /question/:id` - 获取题目详情
- `POST /question` - 创建题目
- `PATCH /question/:id` - 更新题目
- `DELETE /question/:id` - 删除题目

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

## 许可证

本项目采用 MIT 许可证，详情请参见 [LICENSE](LICENSE) 文件。
