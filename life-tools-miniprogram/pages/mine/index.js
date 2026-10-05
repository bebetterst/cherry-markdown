const { tools } = require('../../config/tools')
const storage = require('../../utils/storage')

Page({
  data: {
    version: '0.1.0',
    favorites: [],
    history: []
  },

  onShow() {
    const app = getApp()
    const favIds = storage.get(storage.KEYS.favorites, [])
    const historyRaw = storage.get(storage.KEYS.history, [])
    const map = Object.fromEntries(tools.map((t) => [t.id, t]))
    this.setData({
      version: (app && app.globalData && app.globalData.version) || '0.1.0',
      favorites: favIds.map((id) => map[id]).filter(Boolean),
      history: historyRaw.map((h) => map[h.id]).filter(Boolean)
    })
  },

  go(e) {
    const { path, tab } = e.currentTarget.dataset
    if (tab) {
      wx.switchTab({ url: path })
      return
    }
    wx.navigateTo({ url: path })
  }
})
