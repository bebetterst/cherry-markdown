const { OPTION_GROUPS, calcRelative } = require('../../utils/relative')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

Page({
  data: {
    optionGroups: OPTION_GROUPS,
    pathKeys: [],
    pathLabels: [],
    preview: { title: '', tip: '从「父母长辈」等分组里点选第一层关系', empty: true },
    stepTitle: '选择第一层关系',
    stepNo: 1,
    canShare: false,
    fav: false,
    shareTitle: ''
  },

  onShow() {
    this.setData({ fav: storage.isFavorite('relative') })
  },

  refreshPreview(pathKeys, pathLabels) {
    const preview = calcRelative(pathKeys)
    const stepNo = Math.min(pathKeys.length + 1, 4)
    const stepTitle =
      pathKeys.length >= 4
        ? '已选满四层'
        : pathKeys.length === 0
          ? '选择第一层关系'
          : `继续选择：${pathLabels[pathLabels.length - 1]}的…`
    const canShare = !!(preview.title && !preview.empty && preview.title !== '暂未收录' && preview.title !== '关系过远')
    this.setData({
      pathKeys,
      pathLabels,
      preview: pathKeys.length === 0
        ? { title: '', tip: '从下方列表点选第一层关系，例如先点「妈妈」', empty: true }
        : preview,
      stepTitle,
      stepNo,
      canShare,
      shareTitle: preview.shareText || '好算生活｜亲戚称呼计算'
    })
  },

  push(e) {
    if (this.data.pathKeys.length >= 4) {
      feedback.warn('最多 4 层关系')
      return
    }
    const { key, label } = e.currentTarget.dataset
    const pathKeys = this.data.pathKeys.concat(key)
    const pathLabels = this.data.pathLabels.concat(label)
    feedback.soft()
    storage.addHistory({ id: 'relative', path: '/packageTools/relative/index' })
    this.refreshPreview(pathKeys, pathLabels)
  },

  back() {
    if (!this.data.pathKeys.length) return
    feedback.soft()
    this.refreshPreview(this.data.pathKeys.slice(0, -1), this.data.pathLabels.slice(0, -1))
  },

  jumpTo(e) {
    const index = Number(e.currentTarget.dataset.index)
    feedback.soft()
    if (index < 0) {
      this.refreshPreview([], [])
      return
    }
    this.refreshPreview(this.data.pathKeys.slice(0, index + 1), this.data.pathLabels.slice(0, index + 1))
  },

  reset() {
    feedback.soft()
    this.refreshPreview([], [])
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
