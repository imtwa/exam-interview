/**
 * 公司规模枚举：定义公司的员工人数范围
 */
export enum CompanySize {
  TINY = 'TINY',         // 0-20人：微型企业或创业团队
  SMALL = 'SMALL',       // 20-99人：小型企业
  MEDIUM = 'MEDIUM',     // 100-499人：中型企业
  LARGE = 'LARGE',       // 500-999人：大型企业
  XLARGE = 'XLARGE',     // 1000-9999人：特大型企业
  XXLARGE = 'XXLARGE'    // 10000+人：超大型企业或跨国公司
} 