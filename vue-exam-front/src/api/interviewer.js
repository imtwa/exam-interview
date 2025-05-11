import request from '@/utils/request'

/**
 * 获取面试官个人资料
 * @returns {Promise} 返回面试官资料
 */
export function getInterviewerProfile() {
  return request({
    url: '/interviewer/profile',
    method: 'get'
  })
}

/**
 * 创建或更新面试官信息
 * @param {Object} data 面试官资料
 * @returns {Promise}
 */
export function updateInterviewerProfile(data) {
  return request({
    url: '/interviewer/profile',
    method: 'post',
    data
  })
}

/**
 * 获取面试官创建的职位列表
 * @returns {Promise}
 */
export function getInterviewerJobs() {
  return request({
    url: '/interviewer/jobs',
    method: 'get'
  })
}

/**
 * 获取面试官收到的职位申请列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回申请列表
 */
export function getInterviewerApplications(params) {
  return request({
    url: '/interviewer/applications',
    method: 'get',
    params
  })
}

/**
 * 更新候选申请状态
 * @param {number} applicationId 申请ID
 * @param {Object} data 状态更新数据
 * @returns {Promise} 返回更新结果
 */
export function updateApplicationStatus(applicationId, data) {
  return request({
    url: `/interviewer/applications/${applicationId}/status`,
    method: 'post',
    data
  })
}

/**
 * 安排面试
 * @param {number} applicationId 申请ID
 * @param {Object} data 面试安排数据
 * @returns {Promise} 返回面试安排结果
 */
export function scheduleInterview(applicationId, data) {
  return request({
    url: `/interviewer/applications/${applicationId}/schedule`,
    method: 'post',
    data
  })
}

/**
 * 更新面试官资料（支持同时设置公司）
 * @param {Object} data 设置数据
 * @returns {Promise}
 */
export function setupInterviewerProfile(data) {
  return request({
    url: '/interviewer/profile/setup',
    method: 'post',
    data
  })
}

/**
 * 分配考试给候选求职者
 * @param {Object} data 包含试卷ID和笔试说明的数据
 * @returns {Promise} 返回分配结果
 */
export function assignExam(data) {
  return request({
    url: `/interviewer/applications/assign-exam`,
    method: 'post',
    data
  })
}

/**
 * 获取面试官管理的考试列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回考试列表
 */
export function getInterviewerExams(params) {
  return request({
    url: '/interviewer/exams',
    method: 'post',
    data: params
  })
}

/**
 * 延长考试截止时间
 * @param {Object} data 包含考试ID和新截止时间的数据
 * @returns {Promise} 返回操作结果
 */
export function extendExamDeadline(data) {
  return request({
    url: '/interviewer/exams/extend-deadline',
    method: 'post',
    data
  })
}

/**
 * 发送考试提醒邮件
 * @param {Object} data 包含考试分配ID的数据
 * @returns {Promise} 返回操作结果
 */
export function sendExamReminder(data) {
  return request({
    url: '/interviewer/exams/send-reminder',
    method: 'post',
    data
  })
}

/**
 * 取消考试
 * @param {Object} data 包含考试分配ID的数据
 * @returns {Promise} 返回操作结果
 */
export function cancelExam(data) {
  return request({
    url: '/interviewer/exams/cancel',
    method: 'post',
    data
  })
}

/**
 * 提交面试评价
 * @param {number} interviewId 面试ID
 * @param {Object} data 评价数据
 * @returns {Promise} 返回评价结果
 */
export function submitInterviewFeedback(interviewId, data) {
  return request({
    url: `/interviewer/interviews/${interviewId}/feedback`,
    method: 'post',
    data
  })
}

/**
 * 获取面试详情
 * @param {number} interviewId 面试ID
 * @returns {Promise} 返回面试详情
 */
export function getInterviewDetail(interviewId) {
  return request({
    url: `/interviewer/interviews/${interviewId}`,
    method: 'get'
  })
}

/**
 * 验证面试邀请码
 * @param {string} code 邀请码
 * @returns {Promise} 返回验证结果
 */
export function verifyInterviewCode(code) {
  return request({
    url: `/interviewer/interviews/verify/${code}`,
    method: 'get'
  })
}
