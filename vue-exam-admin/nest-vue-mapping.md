# Nest.js模块与Vue组件映射文档

本文档详细说明了`node-exam-service/src/apps`目录下的Nest.js模块与`vue-exam-admin/src`目录下Vue组件的映射关系，包括路由设计、API调用和组件实现。

## 1. 模块概览

### Nest.js模块结构

在`node-exam-service/src/apps`目录下，主要包含以下核心模块：

- **auth**: 用户认证模块
- **company**: 公司管理模块
- **exam**: 考试系统模块
- **industry**: 行业分类模块
- **interview**: 面试管理模块
- **interviewer**: 面试官管理模块
- **job**: 职位管理模块
- **jobseeker**: 求职者管理模块
- **user**: 用户管理模块

### Vue项目结构

在`vue-exam-admin/src`目录下，主要包含以下核心目录：

- **api**: API接口调用
- **components**: 公共组件
- **router**: 路由配置
- **store**: 状态管理
- **views**: 页面组件

## 2. 路由设计

### 基于Nest.js模块的Vue路由设计

| Nest.js模块 | Vue路由路径 | 组件路径 | 功能描述 |
|------------|------------|---------|--------|
| auth | /login | /views/login/index.vue | 用户登录 |
| auth | /register | /views/register/index.vue | 用户注册 |
| auth | /forget-password | /views/forget-password/index.vue | 密码重置 |
| user | /user/front-users | /views/user/FrontUserList.vue | 前台用户管理 |
| jobseeker | /user/job-seekers | /views/user/JobSeekerList.vue | 求职者管理 |
| jobseeker | /user/job-seeker-detail/:id | /views/user/JobSeekerDetail.vue | 求职者详情 |
| interviewer | /user/interviewers | /views/user/InterviewerList.vue | 面试官管理 |
| interviewer | /user/interviewer-detail/:id | /views/user/InterviewerDetail.vue | 面试官详情 |
| company | /recruitment/companies | /views/recruitment/CompanyList.vue | 公司管理 |
| job | /recruitment/jobs | /views/recruitment/JobList.vue | 职位管理 |
| job | /recruitment/applications | /views/recruitment/ApplicationList.vue | 求职申请管理 |
| interview | /recruitment/interviews | /views/recruitment/InterviewList.vue | 面试管理 |
| exam | /exam-system/category | /views/category/CategoryList.vue | 分类管理 |
| exam | /exam-system/subcategory | /views/category/SubCategoryList.vue | 子分类管理 |
| exam | /exam-system/question | /views/question/QuestionList.vue | 题目管理 |
| exam | /exam-system/exam-paper | /views/exam-paper/ExamPaperList.vue | 试卷管理 |

## 3. API接口映射

### 用户模块 (User)

| Nest.js控制器方法 | Vue API调用 | 功能描述 |
|-----------------|-----------|--------|
| GET /user/page | UserService.getUserList | 获取用户列表 |
| GET /user/profile | UserService.getCurrentUserProfile | 获取当前用户信息 |
| GET /user/:id | UserService.getUserById | 获取用户详情 |
| PATCH /user/:id | UserService.updateUser | 更新用户信息 |
| DELETE /user/:id | UserService.deleteUser | 删除用户 |
| POST /user/:id/reset-password | UserService.resetPassword | 重置用户密码 |

### 求职者模块 (JobSeeker)

| Nest.js控制器方法 | Vue API调用 | 功能描述 |
|-----------------|-----------|--------|
| GET /jobseeker/page | JobSeekerService.getJobSeekerList | 获取求职者列表 |
| GET /jobseeker/:id | JobSeekerService.getJobSeekerById | 获取求职者详情 |
| PATCH /jobseeker/profile | JobSeekerService.updateJobSeeker | 更新求职者信息 |
| PATCH /jobseeker/profile/sync | JobSeekerService.syncJobSeekerProfile | 同步更新求职者资料 |
| GET /jobseeker/:id/work-experience | JobSeekerService.getWorkExperience | 获取工作经历 |
| POST /jobseeker/work-experience | JobSeekerService.addWorkExperience | 添加工作经历 |
| PATCH /jobseeker/work-experience/:id | JobSeekerService.updateWorkExperience | 更新工作经历 |
| DELETE /jobseeker/work-experience/:id | JobSeekerService.deleteWorkExperience | 删除工作经历 |
| GET /jobseeker/:id/education | JobSeekerService.getEducation | 获取教育经历 |
| POST /jobseeker/education | JobSeekerService.addEducation | 添加教育经历 |
| PATCH /jobseeker/education/:id | JobSeekerService.updateEducation | 更新教育经历 |
| DELETE /jobseeker/education/:id | JobSeekerService.deleteEducation | 删除教育经历 |

### 面试官模块 (Interviewer)

| Nest.js控制器方法 | Vue API调用 | 功能描述 |
|-----------------|-----------|--------|
| GET /interviewer/page | InterviewerService.getInterviewerList | 获取面试官列表 |
| GET /interviewer/:id | InterviewerService.getInterviewerById | 获取面试官详情 |
| GET /interviewer/profile | InterviewerService.getCurrentInterviewerProfile | 获取当前面试官信息 |
| POST /interviewer/profile | InterviewerService.createInterviewer | 创建面试官 |
| POST /interviewer/profile | InterviewerService.updateInterviewer | 更新面试官信息 |
| DELETE /interviewer/:id | InterviewerService.deleteInterviewer | 删除面试官 |
| PATCH /interviewer/:id/verify | InterviewerService.updateVerificationStatus | 更新认证状态 |
| PATCH /interviewer/:id/status | InterviewerService.updateInterviewerStatus | 更新面试官状态 |
| POST /interviewer/profile/setup | InterviewerService.setupInterviewerProfile | 设置面试官资料 |

### 公司模块 (Company)

| Nest.js控制器方法 | Vue API调用 | 功能描述 |
|-----------------|-----------|--------|
| GET /company/page | CompanyService.getCompanyList | 获取公司列表 |
| GET /company/:id | CompanyService.getCompanyById | 获取公司详情 |
| POST /company | CompanyService.createCompany | 创建公司 |
| PUT /company/:id | CompanyService.updateCompany | 更新公司信息 |
| DELETE /company/:id | CompanyService.deleteCompany | 删除公司 |
| PUT /company/:id/verify | CompanyService.verifyCompany | 验证公司信息 |

### 职位模块 (Job)

| Nest.js控制器方法 | Vue API调用 | 功能描述 |
|-----------------|-----------|--------|
| GET /job | JobPostingService.getJobPostingList | 获取职位列表 |
| GET /job/:id | JobPostingService.getJobPostingById | 获取职位详情 |
| POST /job | JobPostingService.createJobPosting | 创建职位 |
| PUT /job/:id | JobPostingService.updateJobPosting | 更新职位信息 |
| DELETE /job/:id | JobPostingService.deleteJobPosting | 删除职位 |
| PUT /job/:id/status | JobPostingService.updateJobStatus | 更新职位状态 |

### 面试模块 (Interview)

| Nest.js控制器方法 | Vue API调用 | 功能描述 |
|-----------------|-----------|--------|
| GET /interviews | InterviewService.getInterviewList | 获取面试列表 |
| GET /interviews/:id | InterviewService.getInterviewDetail | 获取面试详情 |
| POST /interviews | InterviewService.createInterview | 创建面试 |
| PUT /interviews/:id | InterviewService.updateInterview | 更新面试 |
| PUT /interviews/:id/cancel | InterviewService.cancelInterview | 取消面试 |
| POST /interviews/:id/feedback | InterviewService.submitFeedback | 提交面试反馈 |
| GET /interviews/:id/feedback | InterviewService.getFeedback | 获取面试反馈 |
| PUT /interviews/:id/status | InterviewService.updateInterviewStatus | 更新面试状态 |

## 4. 组件实现

### 用户管理模块

用户管理模块包括前台用户、求职者和面试官的管理功能。

#### 前台用户列表 (FrontUserList.vue)

- 功能：展示所有前台用户，支持搜索、分页、添加、编辑和删除操作
- API调用：UserService.getUserList, UserService.deleteUser等
- 数据模型：FrontUser

#### 求职者列表 (JobSeekerList.vue)

- 功能：展示所有求职者，支持搜索、分页、查看详情等操作
- API调用：JobSeekerService.getJobSeekerList等
- 数据模型：JobSeeker

#### 求职者详情 (JobSeekerDetail.vue)

- 功能：展示求职者详细信息，包括基本资料、工作经历、教育经历等
- API调用：JobSeekerService.getJobSeekerById, JobSeekerService.getWorkExperience等
- 数据模型：JobSeeker, WorkExperience, Education

#### 面试官列表 (InterviewerList.vue)

- 功能：展示所有面试官，支持搜索、分页、添加、编辑、删除和认证操作
- API调用：InterviewerService.getInterviewerList, InterviewerService.updateVerificationStatus等
- 数据模型：Interviewer

#### 面试官详情 (InterviewerDetail.vue)

- 功能：展示面试官详细信息，包括基本资料、所属公司等
- API调用：InterviewerService.getInterviewerById等
- 数据模型：Interviewer

### 招聘管理模块

招聘管理模块包括公司、职位、申请和面试的管理功能。

#### 公司列表 (CompanyList.vue)

- 功能：展示所有公司，支持搜索、分页、添加、编辑、删除和认证操作
- API调用：CompanyService.getCompanyList, CompanyService.verifyCompany等
- 数据模型：Company

#### 职位列表 (JobList.vue)

- 功能：展示所有职位，支持搜索、分页、添加、编辑、删除和状态更新操作
- API调用：JobPostingService.getJobPostingList, JobPostingService.updateJobStatus等
- 数据模型：JobPosting

#### 申请列表 (ApplicationList.vue)

- 功能：展示所有职位申请，支持搜索、分页、状态更新和安排面试操作
- API调用：JobApplicationService.getJobApplicationList, JobApplicationService.updateJobApplicationStatus等
- 数据模型：JobApplication

#### 面试列表 (InterviewList.vue)

- 功能：展示所有面试安排，支持搜索、分页、添加、编辑、取消和提交反馈操作
- API调用：InterviewService.getInterviewList, InterviewService.submitFeedback等
- 数据模型：Interview

### 考试系统模块

考试系统模块包括分类、题目和试卷的管理功能。

#### 分类列表 (CategoryList.vue)

- 功能：展示所有分类，支持搜索、分页、添加、编辑和删除操作
- API调用：CategoryService.getCategoryList等
- 数据模型：Category

#### 子分类列表 (SubCategoryList.vue)

- 功能：展示所有子分类，支持搜索、分页、添加、编辑和删除操作
- API调用：CategoryService.getSubCategoryList等
- 数据模型：SubCategory

#### 题目列表 (QuestionList.vue)

- 功能：展示所有题目，支持搜索、分页、添加、编辑和删除操作
- API调用：QuestionService.getQuestionList等
- 数据模型：Question

#### 试卷列表 (ExamPaperList.vue)

- 功能：展示所有试卷，支持搜索、分页、添加、编辑和删除操作
- API调用：ExamPaperService.getExamPaperList等
- 数据模型：ExamPaper

## 5. 模块化开发建议

### 组件复用

- 使用`CommonCrudTable.vue`等通用组件实现列表页面，提高代码复用率
- 将表单组件抽离为独立组件，如`InterviewerForm.vue`、`JobForm.vue`等
- 使用插槽(slot)机制增强组件的灵活性和可扩展性

### 状态管理

- 使用Vuex管理全局状态，如用户信息、权限等
- 按模块划分store，如userStore、recruitmentStore、examStore等
- 使用getters计算派生状态，减少组件中的重复逻辑

### API封装

- 按模块封装API调用，如UserService、JobService、InterviewService等
- 使用统一的请求拦截器处理认证和错误
- 定义清晰的数据模型和接口，提高代码可维护性

### 路由管理

- 使用嵌套路由表示模块层次结构
- 实现路由懒加载，提高首屏加载速度
- 使用路由守卫处理权限控制和页面跳转

## 6. 结论

通过将Nest.js后端模块与Vue前端组件进行映射，我们建立了一个清晰的前后端交互架构。这种模块化的设计方式有助于提高代码的可维护性和可扩展性，同时也便于团队协作开发。

在实际开发中，可以根据业务需求进一步细化和调整模块结构，但总体架构应保持一致，确保前后端的良好对接。