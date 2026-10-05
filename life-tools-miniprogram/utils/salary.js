/**
 * 简化版月度个税估算（综合所得，累计预扣预缴简化为「当月近似」）
 * 仅供参考，不构成税务建议。
 */
const BRACKETS = [
  { max: 36000, rate: 0.03, quick: 0 },
  { max: 144000, rate: 0.1, quick: 2520 },
  { max: 300000, rate: 0.2, quick: 16920 },
  { max: 420000, rate: 0.25, quick: 31920 },
  { max: 660000, rate: 0.3, quick: 52920 },
  { max: 960000, rate: 0.35, quick: 85920 },
  { max: Infinity, rate: 0.45, quick: 181920 }
]

function calcTaxForTaxable(annualTaxable) {
  const n = Math.max(0, annualTaxable)
  const bracket = BRACKETS.find((b) => n <= b.max)
  return n * bracket.rate - bracket.quick
}

function calcSalary({ gross, social, special, months = 12 }) {
  const g = Number(gross)
  const s = Number(social) || 0
  const sp = Number(special) || 0
  const m = Number(months) || 12
  if (!(g >= 0)) return null

  const threshold = 5000
  // 以「月均应纳税所得」外推年度，再摊回月度，便于快速估算
  const monthlyTaxable = Math.max(0, g - s - sp - threshold)
  const annualTaxable = monthlyTaxable * m
  const annualTax = calcTaxForTaxable(annualTaxable)
  const monthlyTax = annualTax / m
  const net = g - s - monthlyTax

  return {
    monthlyTax,
    annualTax,
    net,
    monthlyTaxable,
    note: '按现行综合所得税率表做简化估算，未覆盖所有专项附加与年终奖单独计税情形。'
  }
}

module.exports = { calcSalary, calcTaxForTaxable }
