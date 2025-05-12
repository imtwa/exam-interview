# 云面官在线面试平台 - 前端

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-green)
![Vite](https://img.shields.io/badge/Vite-6.2-yellow)
![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-orange)

## 项目简介

云面官前端项目是一个基于Vue3构建的在线面试与考试平台，为个人用户和企业用户提供丰富的试题资源、文档资料和招聘面试系统。采用现代前端技术栈打造，提供流畅的用户体验和友好的交互界面。系统特别集成了基于WebRTC的实时视频面试功能，支持多轮远程面试，让招聘全流程在线化。

## 技术栈

- **核心框架**: Vue 3.5 (Composition API)
- **路由管理**: Vue Router 4.5
- **状态管理**: Pinia 3.0
- **UI组件**: Element Plus 2.9 + @element-plus/icons-vue
- **HTTP客户端**: Axios
- **构建工具**: Vite 6.2
- **CSS技术**: 
  - Less 4.3 (CSS预处理器)
  - Tailwind CSS 4.1 (原子化CSS框架)
- **图表可视化**: ECharts 5.6
- **工具库**: Lodash-es
- **自动导入**: unplugin-auto-import, unplugin-vue-components
- **实时通信**: 
  - Socket.io-client (WebSocket客户端)
  - simple-signal-client (WebRTC信令客户端)
  - WebRTC原生API (音视频传输)

## 项目结构

```
vue-exam-front/
├── cert/                     # SSL证书目录（WebRTC需要HTTPS环境）
├── public/                   # 静态资源
├── src/                      # 源代码
│   ├── api/                  # API请求接口
│   │   ├── auth.js           # 认证相关接口
│   │   ├── exam.js           # 考试相关接口
│   │   ├── interview.js      # 面试相关接口
│   │   ├── job.js            # 招聘岗位接口
│   │   └── user.js           # 用户相关接口
│   ├── assets/               # 静态资源文件
│   ├── components/           # 通用组件
│   │   ├── auth/             # 认证相关组件
│   │   ├── common/           # 公共UI组件
│   │   ├── exam/             # 考试相关组件
│   │   ├── interview/        # 面试相关组件
│   │   └── video/            # 视频通话组件
│   │       ├── Controls.vue  # 视频控制面板
│   │       ├── Participant.vue # 参与者视图
│   │       └── VideoChat.vue  # 视频聊天主组件
│   ├── router/               # 路由配置
│   │   ├── index.js          # 路由定义
│   │   └── permission.js     # 路由权限控制
│   ├── stores/               # Pinia状态管理
│   │   ├── auth.js           # 认证状态
│   │   ├── interview.js      # 面试状态
│   │   ├── user.js           # 用户状态
│   │   └── video.js          # 视频通话状态
│   ├── utils/                # 工具函数
│   │   ├── request.js        # Axios请求封装
│   │   ├── auth.js           # 认证工具
│   │   ├── date.js           # 日期处理
│   │   └── rtc.js            # WebRTC相关工具
│   ├── views/                # 页面视图
│   │   ├── Auth/             # 认证相关页面
│   │   ├── Exam/             # 考试相关页面
│   │   ├── Home/             # 首页
│   │   ├── Interviewer/      # 面试官功能
│   │   ├── JobSeeker/        # 求职者功能
│   │   ├── Layouts/          # 布局组件
│   │   ├── OnlineExam/       # 在线考试功能
│   │   ├── OnlineInterview/  # 在线面试功能
│   │   │   ├── index.vue     # 面试验证页面
│   │   │   ├── InterviewSession.vue # 面试视频会话页面
│   │   │   └── InterviewFeedback.vue # 面试反馈页面
│   │   ├── Recruitment/      # 招聘相关页面
│   │   └── User/             # 用户中心
│   ├── App.vue               # 应用入口组件
│   ├── main.js               # 应用入口文件
│   └── style.css             # 全局样式
├── .gitignore                # Git忽略文件
├── .npmrc                    # NPM配置
├── .prettierrc               # Prettier配置
├── index.html                # HTML模板
├── package.json              # 项目依赖配置
└── vite.config.js            # Vite配置
```

## 功能模块

### 用户中心

- 多角色用户系统（求职者、面试官/HR）
- 用户注册与登录，支持邮箱验证码
- 密码找回功能
- 用户资料管理
- 收藏管理

### 考试系统

- 专业试卷分类浏览与搜索
- 多种题型支持（单选、多选、判断、填空）
- 题库上传与管理
- 自主练习与收藏
- 考试结果分析与评分

### 招聘平台

- 职位分类与智能筛选
- 公司信息详情展示
- 一键投递简历
- 应聘状态追踪
- 收藏职位功能

### 面试官系统

- 企业与岗位管理
- 候选人筛选与管理
- 多轮面试安排
- 笔试试卷分配
- 专属试卷创建与管理
- 招聘流程数据分析

### 求职者系统

- 个人资料与简历管理
- 教育及工作经历管理
- 应聘申请管理
- 笔试与面试记录查看

### 在线考试

- 笔试邀请码验证
- 计时答题系统
- 防作弊监控机制
- 自动评分与结果展示
- 答题进度保存

### 在线面试（核心功能）

- **实时视频面试**：基于WebRTC的高清视频通话
- **多轮面试支持**：一面、二面、HR面等多轮远程面试
- **屏幕共享**：支持分享屏幕进行技术演示
- **音视频控制**：麦克风/摄像头开关、视频设置
- **面试邀请系统**：邀请码验证与安全保障
- **网络自适应**：根据网络状况自动调整视频质量
- **面试反馈**：面试后评价与反馈系统

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发环境启动

```bash
npm run dev
# 或
pnpm dev
```

### 生产环境构建

```bash
npm run build
# 或
pnpm build
```

### 代码格式化

```bash
npm run lintfix
# 或
pnpm lintfix
```

## WebRTC视频面试环境配置

WebRTC技术要求HTTPS安全环境，以下是本地开发环境配置HTTPS的步骤：

### 一、安装Chocolatey (Windows)

Chocolatey是Windows上的包管理工具，使用管理员权限打开PowerShell或CMD，执行：

```bash
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```

### 二、安装mkcert并生成证书

```bash
# 安装mkcert
choco install mkcert -y

# 生成根证书
mkcert -install

# 进入证书目录
cd vue-exam-front/cert

# 生成域名证书（使用本机IP以支持局域网访问）
mkcert localhost 192.168.x.x
```

注意：将"192.168.x.x"替换为实际IP地址，可使用`ipconfig`命令查看。配置IP地址后才能在局域网内通过IP访问并使用视频面试功能。

### 三、在vite.config.js中配置HTTPS

```javascript
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.join(__dirname, './cert/localhost+1-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, './cert/localhost+1.pem'))
    }
  }
  // 其他配置...
})
```

## 视频面试功能使用说明

1. **面试官操作流程**：
   - 登录面试官账号
   - 进入"面试管理"
   - 选择候选人并安排面试
   - 设置面试时间并生成邀请码
   - 在约定时间进入面试房间

2. **求职者操作流程**：
   - 登录求职者账号
   - 查看"面试通知"
   - 使用收到的邀请码
   - 在约定时间进入面试房间
   - 完成面试后提交反馈

## 系统要求

- **Node.js**: 18.x 或 20.x
- **浏览器**: 支持WebRTC的现代浏览器（Chrome 60+, Firefox 55+, Safari 11+, Edge 79+）
- **网络环境**: 稳定的网络连接，建议5Mbps以上带宽
- **硬件**: 支持摄像头和麦克风的设备

## 相关链接

- [项目主页](../README.md)
- [后端服务仓库](../node-exam-service/)
- [管理员后台](../vue-exam-admin/)
