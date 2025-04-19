/**
 * 文档状态枚举：定义文档处理的不同状态
 */
export enum DocumentStatus {
  PENDING = 'pending', // 待处理：文档已上传但尚未处理
  PARSED = 'parsed', // 已解析：文档已成功解析为题目
  ERROR = 'error', // 解析错误：文档解析过程中出现错误
}
