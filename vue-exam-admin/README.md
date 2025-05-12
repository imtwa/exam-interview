# 云面官后台管理系统

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.9-purple)

## 项目简介

云面官后台管理系统是一个专为管理员设计的综合性后台管理平台，用于管理在线面试与考试平台的各项功能和数据。系统基于Vue 3 + TypeScript + Vite + Element Plus构建，提供了丰富的管理功能，包括用户管理、考试系统管理、招聘系统管理、数据分析等。管理员可以通过该系统全面控制和监督整个平台的运行。

## 核心管理功能

### 系统监控与数据分析
- 平台运行数据实时监控
- 用户注册与活跃度分析
- 试卷与面试数据统计
- 招聘流程效率分析
- 可视化数据图表展示

### 用户管理
- 用户账户管理（创建、编辑、禁用）
- 用户角色与权限管理
- 面试官账号审核与验证
- 公司信息审核与认证
- 用户行为日志监控

### 考试系统管理
- 试卷分类与子分类管理
- 题库管理与维护
- 试卷创建与编辑
- 考试结果查看与分析
- 题目质量监控

### 招聘系统管理
- 行业分类管理
- 企业信息管理
- 职位信息审核
- 招聘流程监控
- 面试安排查看

### 内容审核
- 简历内容审核
- 企业资料审核
- 违规信息处理
- 用户反馈管理

## 技术特性

### 技术栈
- **框架**: Vue 3.5 (Composition API)
- **开发语言**: TypeScript 5.6
- **构建工具**: Vite 6.1
- **UI组件库**: Element Plus 2.9
- **状态管理**: Pinia 3.0
- **路由管理**: Vue Router 4.4
- **国际化**: Vue I18n 9.14
- **图表可视化**: ECharts 5.6
- **富文本编辑**: wangEditor 5.1
- **表格处理**: xlsx 0.18

### 系统特性
- 响应式布局设计，支持多种设备
- 多主题切换，支持暗黑模式
- 多语言支持
- 丰富的UI组件和管理页面模板
- 完善的权限控制系统
- 代码规范与质量保障

## 项目结构

```
vue-exam-admin/
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── api/                 # API请求接口
│   ├── assets/              # 资源文件
│   ├── components/          # 通用组件
│   ├── composables/         # 组合式API
│   ├── config/              # 配置文件
│   ├── directives/          # 自定义指令
│   ├── enums/               # 枚举定义
│   ├── language/            # 国际化语言
│   ├── plugins/             # 插件
│   ├── router/              # 路由配置
│   ├── store/               # Pinia状态管理
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图
│   │   ├── dashboard/       # 控制面板
│   │   ├── user/            # 用户管理
│   │   ├── exam-paper/      # 试卷管理
│   │   ├── question/        # 题目管理
│   │   ├── category/        # 分类管理
│   │   ├── industry/        # 行业管理
│   │   ├── recruitment/     # 招聘管理
│   │   └── login/           # 登录页面
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── .eslintrc.cjs            # ESLint配置
├── .prettierrc              # Prettier配置
├── .stylelintrc.cjs         # StyleLint配置
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite配置
```

## 功能特点

- **高度定制化**: 可自定义主题、布局、菜单等
- **权限控制**: 基于角色的权限控制，细粒度到按钮级别
- **数据可视化**: 强大的数据图表展示功能
- **高级表格**: 支持数据导入导出、筛选、排序等
- **全局搜索**: 快速定位系统功能和数据
- **操作日志**: 记录管理员关键操作
- **系统监控**: 系统性能和用户行为监控
- **多标签页**: 支持多标签页切换

## 安装与部署

### 环境要求
- Node.js: 18.x 或 20.x
- 包管理器: npm, yarn 或 pnpm

### 安装依赖

```bash
# 使用pnpm（推荐）
pnpm install

# 如果安装失败，尝试以下命令
pnpm install --ignore-scripts
```

### 开发环境启动

```bash
# 开发环境运行
pnpm dev

# 或自动打开浏览器
pnpm dev --open
```

### 生产环境构建

```bash
# 构建生产环境
pnpm build

# 预览生产构建
pnpm serve
```

### 代码质量维护

```bash
# ESLint检查并修复
pnpm fix

# Prettier格式化
pnpm lint:prettier

# StyleLint检查并修复
pnpm lint:stylelint

# 提交代码（规范化提交）
pnpm commit
```

## 管理功能示例

### 试卷管理功能

- **试卷列表**: 支持多条件筛选、排序
- **试卷详情**: 查看试卷内容、题目构成
- **试卷创建**: 多种方式创建试卷（手动添加、Excel导入）
- **分类管理**: 维护试卷分类体系

### 用户管理功能

- **用户列表**: 查看所有用户信息
- **用户详情**: 查看用户详细资料
- **账号操作**: 禁用/启用账号、重置密码
- **角色分配**: 分配用户角色和权限

### 招聘管理功能

- **企业管理**: 企业信息审核与管理
- **职位管理**: 职位信息审核与管理
- **招聘流程**: 查看和监控招聘流程
- **面试记录**: 查看面试安排和结果

## 浏览器兼容性

- 支持所有现代浏览器，包括Chrome、Firefox、Safari、Edge等
- 不支持Internet Explorer

## 相关链接

- [项目主页](../README.md)
- [前端用户界面](../vue-exam-front/)
- [后端服务](../node-exam-service/)

## 许可证

[MIT License](LICENSE)

## 考试系统 API 结构

### 试卷管理 API

试卷管理相关的 API 主要涉及以下几个端点：

#### 试卷 API (/exam)

- `GET /exam/list`: 获取试卷列表，支持分页、按分类和子分类筛选
- `GET /exam/{id}`: 获取试卷详情，包括试卷基本信息和题目
- `POST /exam/upload`: 上传试卷文件（Excel 格式），系统自动解析为题目
- `GET /exam/{id}/questions`: 获取试卷的题目列表
- `GET /exam/favorite/{id}`: 检查用户是否收藏了某试卷
- `POST /exam/favorite/{id}`: 收藏或取消收藏试卷
- `GET /exam/favorites`: 获取用户的收藏列表
- `POST /exam/private`: 创建私有试卷
- `GET /exam/private`: 获取用户的私有试卷列表

#### 分类 API (/category)

- `GET /category/list`: 获取分类列表
- `GET /category/{id}`: 获取分类详情
- `POST /category`: 创建分类
- `POST /category/{id}`: 更新分类
- `POST /category/delete/{id}`: 删除分类

#### 子分类 API (/subcategory)

- `POST /subcategory`: 创建子分类
- `POST /subcategory/{id}`: 更新子分类
- `POST /subcategory/delete/{id}`: 删除子分类
- `GET /category/{categoryId}/subcategories`: 获取指定分类下的子分类列表

### 试卷数据结构

试卷数据结构主要包含以下字段：

```typescript
interface ExamPaper {
  id?: number;                  // 试卷ID
  name: string;                 // 试卷名称
  description?: string;         // 试卷描述
  categoryId: number;           // 所属分类ID
  subCategoryId?: number;       // 所属子分类ID
  userId: number;               // 创建用户ID
  isPublic: boolean;            // 是否公开
  favoriteCount?: number;       // 收藏数
  questionsCount?: number;      // 题目数量
  createdAt?: string;           // 创建时间
  updatedAt?: string;           // 更新时间
  category?: Category;          // 所属分类
  subCategory?: SubCategory;    // 所属子分类
}
```

### 实现细节

1. **试卷列表展示**：
   - 支持按分类、子分类筛选
   - 显示试卷基本信息（名称、分类、收藏数等）
   - 显示每个试卷的题目数量

2. **试卷详情**：
   - 显示试卷基本信息
   - 显示试卷中的题目列表
   - 支持查看题目详情、编辑题目顺序和分值

3. **试卷上传**：
   - 支持通过 Excel 文件上传试卷
   - 系统自动解析 Excel 文件中的题目

4. **试卷分类管理**：
   - 支持创建、编辑、删除分类和子分类
   - 支持按分类展示试卷
