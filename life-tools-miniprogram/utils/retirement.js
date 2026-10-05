/**
 * 渐进式延迟法定退休年龄（简化查询）
 * 口径参考公开政策摘要，结果仅供参考。
 */

function parseBirth(monthStr) {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return null
  const [y, m] = monthStr.split('-').map(Number)
  if (m < 1 || m > 12) return null
  return { year: y, month: m }
}

function addMonths(year, month, delta) {
  const idx = year * 12 + (month - 1) + delta
  return {
    year: Math.floor(idx / 12),
    month: (idx % 12) + 1
  }
}

function formatYM({ year, month }) {
  return `${year}年${month}月`
}

function calcRetirement({ birthMonth, gender, femaleType }) {
  const birth = parseBirth(birthMonth)
  if (!birth) return null

  let originalAge
  let delayMonthsMax
  let monthsPerStep

  if (gender === 'male') {
    originalAge = 60
    delayMonthsMax = 36
    monthsPerStep = 4
  } else if (femaleType === '50') {
    originalAge = 50
    delayMonthsMax = 60
    monthsPerStep = 2
  } else {
    originalAge = 55
    delayMonthsMax = 36
    monthsPerStep = 4
  }

  const reformStart = { year: 2025, month: 1 }
  const originalRetire = addMonths(birth.year, birth.month, originalAge * 12)
  const startIdx = reformStart.year * 12 + (reformStart.month - 1)
  const oriIdx = originalRetire.year * 12 + (originalRetire.month - 1)

  let delay = 0
  if (oriIdx >= startIdx) {
    delay = Math.min(delayMonthsMax, Math.floor((oriIdx - startIdx) / monthsPerStep) + 1)
  }

  const actual = addMonths(originalRetire.year, originalRetire.month, delay)
  const actualAgeMonths = originalAge * 12 + delay
  const ageYears = Math.floor(actualAgeMonths / 12)
  const ageRemainMonths = actualAgeMonths % 12

  return {
    originalAge,
    delayMonths: delay,
    retireAt: formatYM(actual),
    retireAgeText: ageRemainMonths ? `${ageYears}岁${ageRemainMonths}个月` : `${ageYears}岁`,
    policyNote: '依据公开渐进式延迟退休规则摘要估算，具体以当地社保部门解释为准。'
  }
}

module.exports = { calcRetirement, parseBirth }
