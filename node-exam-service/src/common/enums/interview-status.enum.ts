/**
 * 面试状态枚举：定义面试状态
 */
export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED', // 已安排：面试已安排但尚未进行
  COMPLETED = 'COMPLETED', // 已完成：面试已经完成
  CANCELLED = 'CANCELLED', // 已取消：面试被取消
  PASS = 'PASS', // 通过：面试通过
  PENDING = 'PENDING', // 待定：面试结果待定
  REJECTED = 'REJECTED', // 拒绝：面试未通过
}
