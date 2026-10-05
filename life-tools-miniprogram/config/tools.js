/**
 * 首页工具目录：名称与路径同时服务「搜一搜」关键词覆盖
 */
module.exports = {
  hotKeywords: ['房贷计算', '个税计算', '退休年龄', '亲戚称呼', '倒数日', '单位换算'],
  categories: [
    { id: 'calc', name: '计算' },
    { id: 'life', name: '生活' },
    { id: 'day', name: '倒数日' }
  ],
  tools: [
    {
      id: 'mortgage',
      name: '房贷计算器',
      desc: '等额本息 / 等额本金月供速算',
      keywords: ['房贷', '月供', '贷款计算', '房贷计算'],
      category: 'calc',
      hot: true,
      path: '/packageTools/mortgage/index',
      emoji: '🏠'
    },
    {
      id: 'salary',
      name: '工资个税估算',
      desc: '税后收入快速估算（仅供参考）',
      keywords: ['个税', '工资计算', '税后工资', '个税计算'],
      category: 'calc',
      hot: true,
      path: '/packageTools/salary/index',
      emoji: '💼'
    },
    {
      id: 'retirement',
      name: '退休年龄查询',
      desc: '对照渐进式延迟退休口径估算',
      keywords: ['退休年龄', '延迟退休', '几岁退休'],
      category: 'life',
      hot: true,
      path: '/packageTools/retirement/index',
      emoji: '🗓️'
    },
    {
      id: 'relative',
      name: '亲戚称呼计算',
      desc: '快速弄清该叫什么',
      keywords: ['亲戚称呼', '称呼计算', '亲戚关系'],
      category: 'life',
      hot: true,
      path: '/packageTools/relative/index',
      emoji: '👪'
    },
    {
      id: 'unit',
      name: '单位换算',
      desc: '长度 / 重量 / 温度常见换算',
      keywords: ['单位换算', '换算器', '斤两'],
      category: 'calc',
      hot: false,
      path: '/packageTools/unit/index',
      emoji: '📏'
    },
    {
      id: 'dateGap',
      name: '日期间隔',
      desc: '算两天相差多少天',
      keywords: ['日期间隔', '日期计算', '相差几天'],
      category: 'day',
      hot: false,
      path: '/packageTools/dateGap/index',
      emoji: '⏳'
    },
    {
      id: 'countdown',
      name: '倒数日',
      desc: '记录人生关键日并提醒自己',
      keywords: ['倒数日', '纪念日', '高考倒计时'],
      category: 'day',
      hot: true,
      path: '/pages/countdown/index',
      emoji: '🎯',
      tab: true
    }
  ]
}
