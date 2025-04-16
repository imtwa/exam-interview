/**
 * 融资阶段枚举：定义公司的融资状态
 */
export enum FundingStage {
  UNFUNDED = 'UNFUNDED',       // 未融资：尚未获得外部投资
  ANGEL = 'ANGEL',             // 天使轮：获得天使投资人的早期投资
  SERIES_A = 'SERIES_A',       // A轮：获得A轮融资
  SERIES_B = 'SERIES_B',       // B轮：获得B轮融资
  SERIES_C = 'SERIES_C',       // C轮：获得C轮融资
  SERIES_D = 'SERIES_D',       // D轮及以上：获得D轮或更高轮次融资
  IPO = 'IPO',                 // 已上市：公司已在证券交易所公开上市
  SELF_FUNDED = 'SELF_FUNDED'  // 不需要融资：公司自给自足，不需要外部融资
} 