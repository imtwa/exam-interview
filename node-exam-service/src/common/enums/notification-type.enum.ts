/**
 * 通知类型枚举：定义系统通知的不同类型
 */
export enum NotificationType {
  APPLICATION_STATUS = 'APPLICATION_STATUS', // 申请状态更新：求职申请状态变更通知
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', // 面试安排：面试时间和地点安排通知
  JOB_INVITATION = 'JOB_INVITATION', // 职位邀请：招聘方主动邀请求职者应聘的通知
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE', // 系统消息：平台公告或其他系统通知
}
