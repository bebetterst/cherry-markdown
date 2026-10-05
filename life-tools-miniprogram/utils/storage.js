const KEYS = {
  favorites: 'hs_favorites',
  history: 'hs_history',
  countdowns: 'hs_countdowns'
}

function get(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
  } catch (e) {
    return fallback
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
    // ignore quota errors in MVP
  }
}

function ensureDefaults() {
  if (!get(KEYS.favorites, null)) set(KEYS.favorites, [])
  if (!get(KEYS.history, null)) set(KEYS.history, [])
  if (!get(KEYS.countdowns, null)) {
    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 1, 0, 1)
    set(KEYS.countdowns, [
      {
        id: 'demo-newyear',
        title: '元旦',
        date: formatDate(nextYear),
        symbol: 'party',
        createdAt: Date.now()
      }
    ])
  }
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addHistory(item) {
  const list = get(KEYS.history, [])
  const next = [{ ...item, at: Date.now() }, ...list.filter((x) => x.id !== item.id)].slice(0, 20)
  set(KEYS.history, next)
}

function toggleFavorite(id) {
  const list = get(KEYS.favorites, [])
  const exists = list.includes(id)
  const next = exists ? list.filter((x) => x !== id) : [id, ...list]
  set(KEYS.favorites, next)
  return !exists
}

function isFavorite(id) {
  return get(KEYS.favorites, []).includes(id)
}

function getCountdowns() {
  return get(KEYS.countdowns, [])
}

function saveCountdowns(list) {
  set(KEYS.countdowns, list)
}

module.exports = {
  KEYS,
  get,
  set,
  ensureDefaults,
  formatDate,
  addHistory,
  toggleFavorite,
  isFavorite,
  getCountdowns,
  saveCountdowns
}
