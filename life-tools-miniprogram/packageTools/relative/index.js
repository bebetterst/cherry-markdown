const { OPTIONS, calcRelative } = require('../../utils/relative')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

Page({
  data: {
    options: OPTIONS,
    pathKeys: [],
    pathLabels: [],
    result: null,
    fav: false,
    shareTitle: ''
  },

  onShow() { this.setData({ fav: storage.isFavorite('relative') }) },

  push(e) {
    const { key, label } = e.currentTarget.dataset
    const pathKeys = this.data.pathKeys.concat(key)
    const pathLabels = this.data.pathLabels.concat(label)
    if (pathKeys.length > 4) {
      feedback.warn('最多 4 层关系')
      return
    }
    feedback.soft()
    this.setData({ pathKeys, pathLabels, result: null })
  },

  back() {
    this.setData({
      pathKeys: this.data.pathKeys.slice(0, -1),
      pathLabels: this.data.pathLabels.slice(0, -1),
      result: null
    })
  },

  reset() {
    this.setData({ pathKeys: [], pathLabels: [], result: null, shareTitle: '' })
  },

  calc() {
    const result = calcRelative(this.data.pathKeys)
    storage.addHistory({ id: 'relative', path: '/packageTools/relative/index' })
    this.setData({ result: null })
    setTimeout(() => {
      this.setData({
        result,
        shareTitle: result.shareText || '好算生活｜亲戚称呼计算'
      })
      if (result.title && result.title !== '暂未收录' && result.title !== '') {
        feedback.success('算好了')
      } else {
        feedback.warn(result.title || '请选择关系')
      }
    }, 16)
  },

  toggleFav() {
    const fav = storage.toggleFavorite('relative')
    this.setData({ fav })
    feedback.success(fav ? '已收藏' : '已取消')
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜亲戚称呼计算',
      path: '/packageTools/relative/index'
    }
  }
})
