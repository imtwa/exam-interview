/**
 * 验证状态枚举：定义账户或信息的验证状态
 */
export enum VerificationStatus {
  PENDING = 'PENDING',   // 待验证：信息已提交但尚未验证
  VERIFIED = 'VERIFIED', // 已验证：信息已经过验证，确认有效
  REJECTED = 'REJECTED'  // 已拒绝：信息验证失败或被拒绝
} 