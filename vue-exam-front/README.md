# 云面官在线面试平台 - 前端

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-green)
![Vite](https://img.shields.io/badge/Vite-6.2-yellow)

## 项目简介

云面官前端项目是一个基于Vue3构建的在线面试与考试平台，为个人用户和企业用户提供丰富的试题资源、文档资料和招聘面试系统。采用现代前端技术栈打造，提供流畅的用户体验和友好的交互界面。

## 技术栈

- **框架**: Vue 3.5 (Composition API)
- **路由**: Vue Router 4.5
- **状态管理**: Pinia 3.0
- **UI组件**: Element Plus 2.9 + @element-plus/icons-vue
- **HTTP客户端**: Axios
- **构建工具**: Vite 6.2
- **CSS预处理器**: Less 4.3
- **图表可视化**: ECharts 5.6
- **工具库**: Lodash-es
- **自动导入**: unplugin-auto-import, unplugin-vue-components
- **CSS框架**: Tailwind CSS 4.1
- **实时通信**: Socket.io-client
- **WebRTC信令**: simple-signal-client

## 项目结构

```
vue-exam-front/
├── cert/                     # SSL证书目录
├── public/                   # 静态资源
├── src/                      # 源代码
│   ├── api/                  # API请求接口
│   ├── assets/               # 静态资源文件
│   ├── components/           # 通用组件
│   ├── router/               # 路由配置
│   │   ├── index.js          # 路由定义
│   │   └── permission.js     # 路由权限控制
│   ├── stores/               # Pinia状态管理
│   ├── utils/                # 工具函数
│   ├── views/                # 页面视图
│   │   ├── Auth/             # 认证相关页面
│   │   ├── Exam/             # 考试相关页面
│   │   ├── Home/             # 首页
│   │   ├── Interviewer/      # 面试官功能
│   │   ├── JobSeeker/        # 求职者功能
│   │   ├── Layouts/          # 布局组件
│   │   ├── OnlineExam/       # 在线考试功能
│   │   ├── OnlineInterview/  # 在线面试功能
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

- 用户注册与登录
- 密码找回功能
- 用户资料管理
- 收藏管理

### 考试系统

- 试题库浏览与搜索
- 题库上传
- 自主练习
- 收藏试题

### 招聘平台

- 职位搜索与浏览
- 公司信息详情
- 职位申请

### 面试官系统

- 岗位管理
- 候选人管理
- 面试安排
- 考试管理
- 专属试卷管理

### 求职者系统

- 个人资料设置
- 申请管理
- 笔试记录查看

### 在线考试

- 考试邀请
- 实时在线考试
- 考试结果查看

### 在线面试

- 视频面试系统
- 实时沟通功能
- 面试反馈

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

## 本地开启https

- webrtc相关api要求https安全环境
- 本地开启https可以实现局域网内通过ip访问

### 一、安装Chocolatey

Chocolatey是Windows上的包管理工具，使用它可以使用命令行安装程序，使用管理员权限打开cmd，再运行如下代码

```bash
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```

### 二、安装mkcert并生成证书

```bash
# 安装mkcert
choco install  mkcert -y
# 生成根证书
mkcert -install
# 进入vue-exam-front\cert目录，生成域名证书
mkcert localhost 192.168.x.x
```

注意后面一定要是本机ip地址，如果不配置ip将无法在ip环境使用在线面试功能
可使用`ipconfig`命令查看本机ip

### 三、vite开启https

```bash
import fs from 'fs'
import path from 'path'
export default ({ command, mode }) => {
    return defineConfig({
        server: {
            https: {
                key: fs.readFileSync(path.join(__dirname, './cert/localhost+1-key.pem')),
                cert: fs.readFileSync(path.join(__dirname, './cert/localhost+1.pem'))
            }
        }
    })
}
```

## 系统要求

- Node.js: 18.x 或 20.x

## 相关链接

- [后端服务仓库](../node-exam-service/)
