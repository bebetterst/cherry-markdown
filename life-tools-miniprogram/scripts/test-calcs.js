/**
 * 纯 Node 校验核心计算，不依赖微信运行时
 */
const assert = require('assert')
const path = require('path')

// 临时把 wx 存根挂上，避免 storage 在被间接引用时炸掉（本文件直接测纯函数）
global.wx = {
  getStorageSync() { return '' },
  setStorageSync() {}
}

const { calcMortgage } = require('../utils/mortgage')
const { calcSalary } = require('../utils/salary')
const { calcRelative } = require('../utils/relative')
const { convert } = require('../utils/unit')
const { daysBetween } = require('../utils/format')
const { calcRetirement } = require('../utils/retirement')

function almost(a, b, eps = 1) {
  assert.ok(Math.abs(a - b) <= eps, `${a} !≈ ${b}`)
}

// 房贷：100万、30年、3.5% 等额本息，月供约 4490
const m = calcMortgage({ amountWan: 100, years: 30, rateAnnual: 3.5, method: 'equalPayment' })
almost(m.monthly, 4490, 5)

const m2 = calcMortgage({ amountWan: 100, years: 30, rateAnnual: 3.5, method: 'equalPrincipal' })
assert.ok(m2.firstMonth > m2.lastMonth)

const s = calcSalary({ gross: 15000, social: 2000, special: 1000 })
assert.ok(s.net > 0 && s.net < 15000)

assert.strictEqual(calcRelative(['母', '兄']).title, '舅舅')
assert.strictEqual(calcRelative(['父', '父']).title, '爷爷')
assert.strictEqual(calcRelative(['妻', '父']).title, '岳父')
assert.strictEqual(calcRelative(['父', '兄', '子']).title, '堂兄弟')
assert.ok(calcRelative(['母', '兄']).aliasText.includes('舅父'))

const { filterOptionsBySex, sexAtPath } = require('../utils/relative')
assert.strictEqual(sexAtPath(['父']), 'male')
assert.strictEqual(sexAtPath(['母']), 'female')
assert.ok(!filterOptionsBySex(['父']).some((o) => o.key === '夫'))
assert.ok(filterOptionsBySex(['父']).some((o) => o.key === '妻'))
assert.ok(!filterOptionsBySex(['母']).some((o) => o.key === '妻'))
assert.ok(filterOptionsBySex(['母']).some((o) => o.key === '夫'))
assert.ok(filterOptionsBySex([]).some((o) => o.key === '夫'))
assert.ok(filterOptionsBySex([]).some((o) => o.key === '妻'))

almost(convert({ group: 'weight', value: 1, from: 'jin', to: 'kg' }), 0.5, 1e-9)
almost(convert({ group: 'temperature', value: 0, from: 'c', to: 'f' }), 32, 1e-9)

assert.strictEqual(daysBetween('2026-01-01', '2026-01-11'), 10)

const r = calcRetirement({ birthMonth: '1970-01', gender: 'male' })
assert.ok(r && r.retireAt)

console.log('All calculation tests passed.')
console.log('CWD check:', path.basename(process.cwd()))
