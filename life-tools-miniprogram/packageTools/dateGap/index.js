const { daysBetween, todayStr } = require('../../utils/format')
const storage = require('../../utils/storage')

Page({
  data: {
    start: '',
    end: '',
    resultText: '',
    shareTitle: ''
  },

  onLoad() {
    const t = todayStr()
    this.setData({ start: t, end: t })
  },

  onStart(e) { this.setData({ start: e.detail.value }) },
  onEnd(e) { this.setData({ end: e.detail.value }) },

  calc() {
    const days = daysBetween(this.data.start, this.data.end)
    if (days === null) {
      wx.showToast({ title: '日期无效', icon: 'none' })
      return
    }
    const resultText = `${Math.abs(days)} 天${days < 0 ? '（结束早于开始）' : ''}`
    storage.addHistory({ id: 'dateGap', path: '/packageTools/dateGap/index' })
    this.setData({
      resultText,
      shareTitle: `【好算生活】两日相差 ${Math.abs(days)} 天`
    })
  },

  goCountdown() {
    wx.switchTab({ url: '/pages/countdown/index' })
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜日期间隔',
      path: '/packageTools/dateGap/index'
    }
  }
})
