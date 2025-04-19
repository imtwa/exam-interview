/**
 * 面试状态枚举：定义求职过程中的各个阶段
 */
export enum InterviewStatus {
  RESUME_SCREENING = 'RESUME_SCREENING', // 简历筛选：HR正在审核简历
  WRITTEN_TEST = 'WRITTEN_TEST', // 笔试：进入笔试阶段
  FIRST_INTERVIEW = 'FIRST_INTERVIEW', // 一面(线上)：第一轮面试，通常是技术面试
  SECOND_INTERVIEW = 'SECOND_INTERVIEW', // 二面(线上)：第二轮面试，可能是高级技术面试
  HR_INTERVIEW = 'HR_INTERVIEW', // HR面试(线上)：人力资源部门面试
  SCHEDULED = 'SCHEDULED', // 已安排面试：面试已安排，等待进行
  OFFER = 'OFFER', // Offer：已通过所有面试，收到录用通知
  REJECTED = 'REJECTED', // 拒绝：求职申请被拒绝
}
