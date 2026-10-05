const { calcMortgage } = require('../../utils/mortgage')
const { money } = require('../../utils/format')
const storage = require('../../utils/storage')

Page({
  data: {
    amountWan: '100',
    years: '30',
    rate: '3.5',
    method: 'equalPayment',
    result: null,
    fav: false,
    shareTitle: ''
  },

  onShow() {
    this.setData({ fav: storage.isFavorite('mortgage') })
  },

  onAmount(e) { this.setData({ amountWan: e.detail.value }) },
  onYears(e) { this.setData({ years: e.detail.value }) },
  onRate(e) { this.setData({ rate: e.detail.value }) },
  onMethod(e) { this.setData({ method: e.currentTarget.dataset.m }) },

  calc() {
    const raw = calcMortgage({
      amountWan: this.data.amountWan,
      years: this.data.years,
      rateAnnual: this.data.rate,
      method: this.data.method
    })
    if (!raw) {
      wx.showToast({ title: '请检查输入', icon: 'none' })
      return
    }
    const result = {
      ...raw,
      monthlyText: money(raw.monthly),
      interestText: money(raw.totalInterest),
      totalText: money(raw.totalPay),
      lastText: money(raw.lastMonth)
    }
    storage.addHistory({ id: 'mortgage', path: '/packageTools/mortgage/index' })
    this.setData({
      result,
      shareTitle: `【好算生活】房贷月供约 ${result.monthlyText} 元（${raw.methodLabel}）`
    })
  },

  toggleFav() {
    const fav = storage.toggleFavorite('mortgage')
    this.setData({ fav })
    wx.showToast({ title: fav ? '已收藏' : '已取消', icon: 'none' })
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜房贷计算器',
      path: '/packageTools/mortgage/index'
    }
  }
})
