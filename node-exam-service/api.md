# 接口文档

## 目录
- [认证接口 (auth)](#认证接口)
- [用户接口 (user)](#用户接口)
- [考试接口 (exam)](#考试接口)
- [公司接口 (company)](#公司接口)
- [行业接口 (industry)](#行业接口)
- [面试接口 (interview)](#面试接口)
- [面试官接口 (interviewer)](#面试官接口)
- [求职者接口 (jobseeker)](#求职者接口)
- [职位接口 (job)](#职位接口)
- [上传接口 (upload)](#上传接口)
- [邮件接口 (email)](#邮件接口)
- [缓存接口 (redis)](#缓存接口)

## 认证接口
**基础路径**: `/auth`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/auth/captcha/image` | 获取图片验证码 |
| GET | `/auth/captcha/email` | 发送邮箱验证码 |
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/admin/login` | 管理员登录 |
| POST | `/auth/reset-password` | 重置密码 |
| GET | `/auth/profile` | 获取当前用户详细信息 |
| GET | `/auth/admin/profile` | 获取管理员详细信息 |
| GET | `/auth/check-profile-status` | 检查用户资料完成状态 |

## 用户接口
**基础路径**: `/user`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/user/page` | 获取用户个人资料 |
| GET | `/user/profile` | 获取用户个人资料 |
| GET | `/user/:id` | 获取指定用户信息 |
| POST | `/user/update/:id` | 更新用户信息 |
| POST | `/user/delete/:id` | 删除用户 |

## 考试接口
**基础路径**: `/` (根路径)

### 分类管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/category/list` | 获取所有试卷分类 |
| POST | `/category` | 创建试卷分类 |
| POST | `/category/:id` | 更新试卷分类 |
| POST | `/category/delete/:id` | 删除试卷分类 |
| POST | `/subcategory` | 创建试卷子分类 |
| POST | `/subcategory/:id` | 更新试卷子分类 |
| POST | `/subcategory/delete/:id` | 删除试卷子分类 |

### 考试管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/exam/list` | 获取考试列表 |
| GET | `/exam/:id` | 获取考试详情 |
| POST | `/exam/upload` | 上传考试 |
| GET | `/exam/favorite/:id` | 检查是否收藏考试 |
| POST | `/exam/favorite/:id` | 收藏/取消收藏考试 |
| POST | `/exam/getUserFavorites` | 获取用户收藏的考试 |
| POST | `/exam/private` | 创建专属考试 |
| GET | `/exam/private` | 获取专属考试列表 |
| POST | `/exam/private/interviewer` | 获取面试官创建的专属考试 |
| GET | `/exam/private/:id` | 获取专属考试详情 |

### 在线考试
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/invitation/verify` | 验证邀请码 |
| GET | `/online-exam/start/:code` | 开始在线考试 |
| POST | `/online-exam/submit` | 提交考试答案 |
| GET | `/online-exam/result/:invitationCode` | 获取考试结果 |
| POST | `/online-exam/user-exams` | 获取用户参与的考试 |

## 公司接口
**基础路径**: `/company`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/company` | 创建公司 |
| GET | `/company/page` | 获取公司列表 |
| GET | `/company/:id` | 获取公司详情 |
| GET | `/company/:id/interviewers` | 获取公司HR列表 |
| POST | `/company/update/:id` | 更新公司信息 |
| POST | `/company/delete/:id` | 删除公司 |
| POST | `/company/verify/:id` | 验证公司 |

## 行业接口
**基础路径**: `/industry`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/industry/category` | 创建行业一级分类 |
| GET | `/industry/category` | 获取行业一级分类列表 |
| GET | `/industry/category/{id}` | 获取行业一级分类详情 |
| POST | `/industry/category/update/{id}` | 更新行业一级分类 |
| POST | `/industry/category/delete/{id}` | 删除行业一级分类 |
| POST | `/industry/subcategory` | 创建行业二级分类 |
| GET | `/industry/category/{categoryId}/subcategories` | 获取行业二级分类列表 |
| GET | `/industry/subcategory/{id}` | 获取单个行业二级分类详情 |
| POST | `/industry/subcategory/update/{id}` | 更新行业二级分类 |
| POST | `/industry/subcategory/delete/{id}` | 删除行业二级分类 |

## 面试接口
**基础路径**: `/interview`
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/interview` | 创建面试安排 |
| GET | `/interview/page` | 获取面试列表 |
| POST | `/interview/update/:id` | 更新面试信息 |
| POST | `/interview/delete/:id` | 删除面试 |
| GET | `/interview/invitation/verify` | 验证面试邀请码 |

## 面试官接口
**基础路径**: `/interviewer`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/interviewer/profile` | 获取当前用户的面试官信息 |
| POST | `/interviewer/profile` | 创建或更新面试官信息 |
| GET | `/interviewer/jobs` | 获取面试官创建的职位列表 |
| GET | `/interviewer/applications` | 获取面试官收到的职位申请列表 |
| POST | `/interviewer/applications/{id}/status` | 更新候选申请状态 |
| POST | `/interviewer/applications/{id}/schedule` | 安排面试 |
| POST | `/interviewer/profile/setup` | 更新面试官资料（支持同时设置公司） |
| POST | `/interviewer/applications/assign-exam` | 分配考试给候选求职者 |
| POST | `/interviewer/exams` | 获取面试官管理的考试列表 |
| POST | `/interviewer/exams/extend-deadline` | 延长考试截止时间 |
| POST | `/interviewer/exams/send-reminder` | 发送考试提醒邮件 |
| POST | `/interviewer/exams/cancel` | 取消考试 |
| POST | `/interviewer/interviews/{id}/feedback` | 提交面试评价 |

## 求职者接口
**基础路径**: `/jobseeker`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/jobseeker/profile` | 获取当前用户的求职者资料 |
| POST | `/jobseeker/profile/update` | 更新求职者基本资料 |
| POST | `/jobseeker/profile/sync` | 一次性同步更新求职者完整资料 |
| GET | `/jobseeker/page` | 分页获取求职者列表 |
| GET | `/jobseeker/{userId}` | 根据ID获取求职者信息 |
| POST | `/jobseeker/education` | 添加教育经历 |
| POST | `/jobseeker/education/update/{id}` | 更新教育经历 |
| POST | `/jobseeker/education/delete/{id}` | 删除教育经历 |
| POST | `/jobseeker/work-experience` | 添加工作经验 |
| POST | `/jobseeker/work-experience/update/{id}` | 更新工作经验 |
| POST | `/jobseeker/work-experience/delete/{id}` | 删除工作经验 |
| GET | `/jobseeker/applications` | 获取求职申请应用列表 |

## 职位接口
**基础路径**: `/job`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/job` | 创建招聘信息 |
| POST | `/job/{jobId}/apply` | 申请职位 |
| GET | `/job/page` | 获取分页招聘信息列表 |
| GET | `/job/{id}` | 获取招聘信息详情 |
| POST | `/job/update/{id}` | 更新招聘信息 |
| POST | `/job/delete/{id}` | 删除招聘信息 |
| GET | `/job/company/{companyId}` | 获取公司发布的职位列表 |
| GET | `/job/interviewer/jobs` | 获取面试官发布的职位列表 |
| GET | `/job/interviewer/jobs/search` | 获取面试官发布的职位列表(带筛选) |
| GET | `/job/applications/jobseeker` | 获取求职者的职位申请列表 |
| POST | `/job/applications/{applicationId}/withdraw` | 撤回职位申请 |

## 上传接口
**基础路径**: `/upload`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/upload/resume` | 更新&上传求职者简历 |

## 邮件接口
**基础路径**: `/email`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/email/send` | 发送邮件 |
| POST | `/email/template` | 使用模板发送邮件 |

## 缓存接口
**基础路径**: `/redis`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/redis/get/:key` | 获取缓存值 |
| POST | `/redis/set` | 设置缓存值 |
| DELETE | `/redis/delete/:key` | 删除缓存值 |

----

**注**：本文档只列出了主要的API端点，具体的请求参数和响应数据结构请参考 Swagger 文档。
访问路径: `/api/docs`