const { tools, categories, hotKeywords } = require('../../config/tools')
const storage = require('../../utils/storage')

Page({
  data: {
    keyword: '',
    category: 'calc',
    categories,
    hotKeywords,
    hotTools: [],
    filteredTools: []
  },

  onShow() {
    this.applyFilter()
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

  onChip(e) {
    const word = e.currentTarget.dataset.word
    this.setData({ keyword: word }, () => this.applyFilter())
  },

  onCategory(e) {
    this.setData({ category: e.currentTarget.dataset.id, keyword: '' }, () => this.applyFilter())
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
