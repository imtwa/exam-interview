/**
 * 考试状态枚举：定义考试分配的不同状态
 */
export enum ExamStatus {
  PENDING = 'PENDING', // 待完成：考试已分配但尚未开始
  COMPLETED = 'COMPLETED', // 已完成：考试已完成并提交
  EXPIRED = 'EXPIRED', // 已过期：考试时间已过期且未完成
}
