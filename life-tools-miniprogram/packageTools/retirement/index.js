const { calcRetirement } = require('../../utils/retirement')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

Page({
  data: {
    birth: '1990-06',
    gender: 'male',
    femaleType: '55',
    result: null,
    fav: false,
    hint: '依据公开渐进式延迟退休规则摘要估算，具体以当地社保部门为准。',
    shareTitle: ''
  },

  onShow() { this.setData({ fav: storage.isFavorite('retirement') }) },
  onBirth(e) { this.setData({ birth: e.detail.value.slice(0, 7) }) },
  onGender(e) {
    feedback.soft()
    this.setData({ gender: e.currentTarget.dataset.g })
  },
  onFemaleType(e) {
    feedback.soft()
    this.setData({ femaleType: e.currentTarget.dataset.t })
  },

  calc() {
    const result = calcRetirement({
      birthMonth: this.data.birth,
      gender: this.data.gender,
      femaleType: this.data.femaleType
    })
    if (!result) {
      feedback.warn('请选择出生年月')
      return
    }
    storage.addHistory({ id: 'retirement', path: '/packageTools/retirement/index' })
    this.setData({ result: null })
    setTimeout(() => {
      this.setData({
        result,
        shareTitle: `【好算生活】预计 ${result.retireAt} 退休（约${result.retireAgeText}）`
      })
      feedback.success('查询完成')
    }, 16)
  },

  toggleFav() {
    const fav = storage.toggleFavorite('retirement')
    this.setData({ fav })
    feedback.success(fav ? '已收藏' : '已取消')
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜退休年龄查询',
      path: '/packageTools/retirement/index'
    }
  }
})
