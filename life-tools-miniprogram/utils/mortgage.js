/**
 * 房贷计算：等额本息 / 等额本金
 */
function calcMortgage({ amountWan, years, rateAnnual, method }) {
  const principal = Number(amountWan) * 10000
  const months = Number(years) * 12
  const monthlyRate = Number(rateAnnual) / 100 / 12

  if (!(principal > 0) || !(months > 0) || !(monthlyRate >= 0)) {
    return null
  }

  if (method === 'equalPrincipal') {
    const monthlyPrincipal = principal / months
    const firstMonth = monthlyPrincipal + principal * monthlyRate
    const lastMonth = monthlyPrincipal + monthlyPrincipal * monthlyRate
    let totalInterest = 0
    let remain = principal
    for (let i = 0; i < months; i += 1) {
      const interest = remain * monthlyRate
      totalInterest += interest
      remain -= monthlyPrincipal
    }
    return {
      methodLabel: '等额本金',
      monthly: firstMonth,
      firstMonth,
      lastMonth,
      totalInterest,
      totalPay: principal + totalInterest,
      months
    }
  }

  // 等额本息
  let monthly
  if (monthlyRate === 0) {
    monthly = principal / months
  } else {
    const pow = Math.pow(1 + monthlyRate, months)
    monthly = (principal * monthlyRate * pow) / (pow - 1)
  }
  const totalPay = monthly * months
  return {
    methodLabel: '等额本息',
    monthly,
    firstMonth: monthly,
    lastMonth: monthly,
    totalInterest: totalPay - principal,
    totalPay,
    months
  }
}

module.exports = { calcMortgage }
