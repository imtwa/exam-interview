简体中文 | [English](./README.en.md)

## 云面官admin后台管理系统

## 演示图

### 浅色主题

![浅色主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover1.png)

![浅色主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover2.png)

### 暗黑主题

![暗黑主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover3.png)

![暗黑主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover4.png)

## 特点

- 使用最新技术栈
- 内置常用业务组件模版
- 提供多种主题模式，可以自定义主题
- 漂亮的 UI设计、极致的用户体验和细节处理
- 系统全面支持自定义设置，满足您的个性化需求

## 技术栈

- 开发框架：Vue3、TypeScript、Vite、Element-Plus
- 代码规范：Eslint、Prettier、Stylelint、Husky、Lint-staged、cz-git

## 功能

- 丰富主题切换
- 全局搜索
- 锁屏
- 多标签页
- 全局面包屑
- 多语言
- 图标库
- 富文本编辑器
- Echarts 图表
- Utils工具包
- 网络异常处理
- 路由级别鉴权
- 侧边栏菜单鉴权
- 鉴权指令
- 移动端适配
- 优秀的持久化存储方案
- 本地数据存储校验
- 代码提交校验与格式化
- 代码提交规范化

## 兼容性

- 支持 Chrome、Safari、Firefox 等现代主流浏览器。

## 安装运行

```bash
# 安装依赖
pnpm install

# 如果 pnpm install 安装失败，尝试使用下面的命令安装依赖
pnpm install --ignore-scripts

# 本地开发环境启动
pnpm dev

# 生产环境打包
pnpm build
```

![捐赠二维码](https://www.qiniu.lingchen.kim/%E7%BB%84%202%402x%202.png)

# 考试系统后台管理项目

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
