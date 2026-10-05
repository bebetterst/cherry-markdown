function money(n, digits = 2) {
  if (!Number.isFinite(n)) return '--'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function number(n, digits = 2) {
  if (!Number.isFinite(n)) return '--'
  return Number(n.toFixed(digits)).toString()
}

function daysBetween(a, b) {
  const da = parseDate(a)
  const db = parseDate(b)
  if (!da || !db) return null
  const ms = db.setHours(0, 0, 0, 0) - da.setHours(0, 0, 0, 0)
  return Math.round(ms / 86400000)
}

function parseDate(str) {
  if (!str) return null
  const parts = String(str).split('-').map((x) => Number(x))
  if (parts.length !== 3 || parts.some((x) => !Number.isFinite(x))) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function todayStr() {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

module.exports = {
  money,
  number,
  daysBetween,
  parseDate,
  todayStr
}
