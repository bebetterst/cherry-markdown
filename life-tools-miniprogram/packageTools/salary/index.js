const { calcSalary } = require('../../utils/salary')
const { money } = require('../../utils/format')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

Page({
  data: {
    gross: '15000',
    social: '2000',
    special: '1000',
    result: null,
    fav: false,
    hint: '按综合所得税率表简化估算，未覆盖全部专项情形，仅供参考。',
    shareTitle: ''
  },

  onShow() { this.setData({ fav: storage.isFavorite('salary') }) },
  onGross(e) { this.setData({ gross: e.detail.value }) },
  onSocial(e) { this.setData({ social: e.detail.value }) },
  onSpecial(e) { this.setData({ special: e.detail.value }) },

  calc() {
    const raw = calcSalary({
      gross: this.data.gross,
      social: this.data.social,
      special: this.data.special
    })
    if (!raw) {
      feedback.warn('请检查输入')
      return
    }
    const result = {
      netText: money(raw.net),
      taxText: money(raw.monthlyTax),
      annualText: money(raw.annualTax)
    }
    storage.addHistory({ id: 'salary', path: '/packageTools/salary/index' })
    this.setData({ result: null })
    setTimeout(() => {
      this.setData({
        result,
        shareTitle: `【好算生活】税后月收入约 ${result.netText} 元`
      })
      feedback.success('算好了')
    }, 16)
  },

  toggleFav() {
    const fav = storage.toggleFavorite('salary')
    this.setData({ fav })
    feedback.success(fav ? '已收藏' : '已取消')
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜工资个税估算',
      path: '/packageTools/salary/index'
    }
  }
})
