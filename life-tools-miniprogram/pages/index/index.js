const { tools, categories, hotKeywords } = require('../../config/tools')
const storage = require('../../utils/storage')
const { daysBetween, todayStr } = require('../../utils/format')
const feedback = require('../../utils/feedback')

Page({
  data: {
    keyword: '',
    category: 'calc',
    categories,
    hotKeywords,
    hotTools: [],
    filteredTools: [],
    continueTool: null,
    nearestDay: null
  },

  onShow() {
    this.applyFilter()
    this.loadRetentionBlocks()
  },

  loadRetentionBlocks() {
    const map = Object.fromEntries(tools.map((t) => [t.id, t]))
    const history = storage.get(storage.KEYS.history, [])
    const continueTool = history.length ? map[history[0].id] || null : null

    const today = todayStr()
    const countdowns = storage.getCountdowns()
      .map((item) => {
        const delta = daysBetween(today, item.date)
        return { ...item, delta, abs: Math.abs(delta ?? 0) }
      })
      .sort((a, b) => {
        const ax = a.delta < 0 ? 100000 + a.abs : a.abs
        const bx = b.delta < 0 ? 100000 + b.abs : b.abs
        return ax - bx
      })

    this.setData({
      continueTool,
      nearestDay: countdowns[0] || null
    })
  },

  applyFilter() {
    const keyword = (this.data.keyword || '').trim().toLowerCase()
    const hotTools = tools.filter((t) => t.hot)
    let filteredTools = tools.filter((t) => t.category === this.data.category)
    if (keyword) {
      filteredTools = tools.filter((t) => {
        const bag = [t.name, t.desc, ...(t.keywords || [])].join(' ').toLowerCase()
        return bag.includes(keyword)
      })
    }
    this.setData({ hotTools, filteredTools })
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.applyFilter())
  },

  clearSearch() {
    this.setData({ keyword: '' }, () => this.applyFilter())
  },

  onChip(e) {
    feedback.soft()
    const word = e.currentTarget.dataset.word
    this.setData({ keyword: word }, () => this.applyFilter())
  },

  onCategory(e) {
    feedback.soft()
    this.setData({ category: e.currentTarget.dataset.id, keyword: '' }, () => this.applyFilter())
  },

  goCountdown() {
    wx.switchTab({ url: '/pages/countdown/index' })
  },

  goTool(e) {
    const { path, id, tab } = e.currentTarget.dataset
    storage.addHistory({ id, path })
    if (tab) {
      wx.switchTab({ url: path })
      return
    }
    wx.navigateTo({ url: path })
  },

  onShareAppMessage() {
    return {
      title: '好算生活｜房贷个税退休亲戚称呼一站算清',
      path: '/pages/index/index'
    }
  }
})
