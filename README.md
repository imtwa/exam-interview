# 在线面试平台 - 云面官

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![开源协议](https://img.shields.io/badge/协议-MIT-green)

## 项目简介

云面官是一个面向个人用户和企业用户的在线面试与考试平台，提供丰富的试题资源、文档资料和智能面试系统。本平台采用前后端分离架构，支持用户注册登录、在线考试、题库管理、面试模拟等功能。

## 功能特点

### 用户中心
- 用户注册与登录（支持邮箱验证码）
- 图形验证码安全校验
- 密码找回功能

### 首页功能
- 试题与文档搜索
- 平台数据统计展示
- 核心功能模块导航

### 核心功能
- 顺序练习与随机练习
- 模拟考试系统
- 题库浏览与搜索
- 错题收集与分析
- 文档资料下载

### 数据统计
- 36亿+职业资格试题库
- 2000万+题库总数
- 100万+文档资料
- 10000+每年服务企业

## 技术栈

### 前端技术栈
- **框架**: Vue 3.5 (Composition API)
- **路由**: Vue Router 4.5
- **状态管理**: Pinia 3.0
- **UI组件**: Element Plus 2.9
- **HTTP客户端**: Axios
- **构建工具**: Vite 6.2
- **CSS预处理器**: Less 4.3
- **图表可视化**: ECharts 5.6
- **工具库**: Lodash-es
- **自动导入**: unplugin-auto-import, unplugin-vue-components
- **CSS框架**: Tailwind CSS 4.1

### 后端技术栈
- **框架**: NestJS 10.0
- **数据库ORM**: Prisma 6.6
- **数据库**: MySQL
- **缓存系统**: Redis 4.7
- **验证码生成**: svg-captcha
- **邮件服务**: Nodemailer
- **加密工具**: bcryptjs
- **环境配置**: @nestjs/config
- **UUID生成**: uuid
- **响应式编程**: RxJS

## 项目结构

```
├── node-exam-service/          # 后端服务
│   ├── prisma/                 # Prisma数据库模型
│   ├── src/                    # 源代码
│   │   ├── apps/               # 模块目录
│   │   │   ├── email/          # 邮件服务模块  
│   │   │   ├── redis/          # Redis缓存模块
│   │   │   └── user/           # 用户管理模块
│   │   ├── app.module.ts       # 应用主模块
│   │   └── main.ts             # 应用入口
│   └── .env                    # 环境配置
│
├── vue-exam-front/             # 前端应用
│   ├── src/                    # 源代码
│   │   ├── api/                # API请求
│   │   ├── assets/             # 静态资源
│   │   ├── components/         # 公共组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态
│   │   ├── utils/              # 工具函数
│   │   └── views/              # 页面视图
│   │       ├── Auth/           # 认证相关页面
│   │       └── Home/           # 首页
│   ├── .env.development        # 开发环境配置
│   └── .env.production         # 生产环境配置
```

## 快速开始

### 前端项目启动
```bash
# 进入前端目录
cd vue-exam-front

# 安装依赖
npm install

# 启动开发服务
npm run dev

mkcert localhost 192.168.100.100
```

### 后端项目启动
```bash
# 进入后端目录
cd node-exam-service

# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev

# 启动开发服务
npm run start:dev
```

## 系统要求
- Node.js: 18.x 或 20.x
- Redis: 3.0+
- MySQL: 8.0+

## 许可证
[MIT License](LICENSE)

## 联系我们
如有问题，请通过以下方式联系我们：
- Email: imtwa@qq.com