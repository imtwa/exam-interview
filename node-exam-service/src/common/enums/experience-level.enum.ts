/**
 * 工作经验枚举：定义工作经验年限范围
 */
export enum ExperienceLevel {
  STUDENT = 'STUDENT', // 在校生：尚未毕业的学生
  FRESH_GRADUATE = 'FRESH_GRADUATE', // 应届生：刚毕业，无工作经验
  LESS_THAN_ONE = 'LESS_THAN_ONE', // 一年以内：工作经验不满一年
  ONE_TO_THREE = 'ONE_TO_THREE', // 一到三年：具有1-3年工作经验
  THREE_TO_FIVE = 'THREE_TO_FIVE', // 三到五年：具有3-5年工作经验
  FIVE_TO_TEN = 'FIVE_TO_TEN', // 五到十年：具有5-10年工作经验
  MORE_THAN_TEN = 'MORE_THAN_TEN', // 十年以上：具有10年以上工作经验
}
