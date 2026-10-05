const { OPTIONS, calcRelative } = require('../../utils/relative')
const storage = require('../../utils/storage')

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
      wx.showToast({ title: '最多 4 层关系', icon: 'none' })
      return
    }
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
    this.setData({
      result,
      shareTitle: result.shareText || '好算生活｜亲戚称呼计算'
    })
  },

  toggleFav() {
    this.setData({ fav: storage.toggleFavorite('relative') })
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜亲戚称呼计算',
      path: '/packageTools/relative/index'
    }
  }
})
