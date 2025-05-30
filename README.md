# 在线面试平台 - 云面官

![开源协议](https://img.shields.io/badge/协议-MIT-green)

## 项目简介

云面官是一个面向个人用户和企业用户的在线面试与考试平台，提供丰富的试题资源、文档资料和智能面试系统。本平台采用前后端分离架构，支持用户注册登录、在线考试、题库管理、实时远程视频面试等功能，打造一站式招聘解决方案。

## 功能特点

### 用户中心
- 多角色用户系统（求职者、面试官/HR、管理员）
- 用户注册与登录（支持邮箱验证码）
- 图形验证码安全校验
- 密码找回功能
- 个人资料与公司信息管理

### 招聘管理
- 企业信息与招聘职位发布
- 简历投递与筛选
- 多轮面试流程管理
- 应聘状态实时追踪
- 面试反馈与评价

### 考试系统
- 专业试卷管理（分类、子分类）
- 多题型支持（单选、多选、判断、填空）
- 在线笔试分配与监控
- 考试结果自动评分
- 题目智能AI解析

### 实时视频面试
- 基于WebRTC的点对点视频通话
- 支持多轮面试远程进行
- 屏幕共享与代码协作
- 音视频控制与网络自适应
- 面试邀请码安全验证

### 数据统计
- 招聘流程数据可视化
- 应聘者分析与筛选
- 考试成绩统计分析
- 公司招聘效率指标

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
- **实时通讯**: WebRTC, Socket.IO

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
- **WebSocket**: Socket.IO
- **音视频服务**: WebRTC

## 项目结构

```
├── node-exam-service/          # 后端服务
│   ├── prisma/                 # Prisma数据库模型
│   ├── src/                    # 源代码
│   │   ├── apps/               # 模块目录
│   │   │   ├── auth/           # 认证模块
│   │   │   ├── exam/           # 考试模块
│   │   │   ├── interview/      # 面试模块
│   │   │   ├── job/            # 职位管理模块
│   │   │   ├── rtc/            # 实时视频通讯模块
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
│   │   │   ├── auth/           # 认证组件
│   │   │   ├── exam/           # 考试组件
│   │   │   ├── interview/      # 面试组件
│   │   │   └── video/          # 视频通话组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态
│   │   ├── utils/              # 工具函数
│   │   └── views/              # 页面视图
│   │       ├── Auth/           # 认证相关页面
│   │       ├── Interview/      # 面试相关页面
│   │       ├── Exam/           # 考试相关页面
│   │       ├── VideoCall/      # 视频通话页面
│   │       └── Home/           # 首页
│   ├── .env.development        # 开发环境配置
│   └── .env.production         # 生产环境配置
│
├── vue-exam-admin/             # 管理员后台
│   ├── src/                    # 源代码
│   │   ├── api/                # API请求
│   │   ├── components/         # 公共组件
│   │   ├── views/              # 页面视图
│   │   └── ...                 # 其他目录
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

# 本地HTTPS证书生成（视频通话需要）
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

nginx反向代理配置
```bash
location /api/ {
        rewrite /api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header REMOTE-HOST $remote_addr;
        add_header X-Cache $upstream_cache_status;
        proxy_set_header X-Host $host:$server_port;
        proxy_set_header X-Scheme $scheme;

        proxy_connect_timeout 30s;
        proxy_read_timeout 86400s;
        proxy_send_timeout 30s;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
```

## 系统要求
- Node.js: 18.x 或 20.x
- Redis: 3.0+
- MySQL: 8.0+
- 现代浏览器（支持WebRTC）

## 许可证
[MIT License](LICENSE)

## 联系我们
如有问题，请通过以下方式联系我们：
- Email: imtwa@qq.com