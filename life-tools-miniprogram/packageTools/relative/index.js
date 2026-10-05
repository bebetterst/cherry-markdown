const { OPTION_GROUPS, calcRelative } = require('../../utils/relative')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

function buildState(pathKeys, pathLabels, uiStage, activeGroupId) {
  const depth = pathKeys.length
  const preview = calcRelative(pathKeys)
  const canShare = !!(preview.title && !preview.empty && preview.title !== '暂未收录' && preview.title !== '关系过远')
  const activeGroup = activeGroupId ? OPTION_GROUPS.find((g) => g.id === activeGroupId) : null
  const stepIndex = Math.min(depth, 3)
  const stepPrompt =
    depth >= 4
      ? '已选满 4 层'
      : depth === 0
        ? '先选 Ta 和你的关系'
        : `「${pathLabels[pathLabels.length - 1]}」的…`

  return {
    pathKeys,
    pathLabels,
    uiStage,
    activeGroupId,
    activeGroup,
    optionGroups: OPTION_GROUPS,
    preview,
    resultTitle: preview.title && !preview.empty ? preview.title : '',
    resultTip: preview.tip || '',
    stepIndex,
    stepPrompt,
    canShare,
    shareTitle: preview.shareText || '好算生活｜亲戚称呼计算',
    atMaxDepth: depth >= 4
  }
}

Page({
  data: {
    pathKeys: [],
    pathLabels: [],
    uiStage: 'category',
    activeGroupId: '',
    activeGroup: null,
    optionGroups: OPTION_GROUPS,
    preview: {},
    resultTitle: '',
    resultTip: '',
    stepIndex: 0,
    stepPrompt: '先选 Ta 和你的关系',
    canShare: false,
    fav: false,
    shareTitle: '',
    atMaxDepth: false
  },

  onShow() {
    this.setData({ fav: storage.isFavorite('relative') })
  },

  apply(pathKeys, pathLabels, uiStage, activeGroupId) {
    this.setData(buildState(pathKeys, pathLabels, uiStage, activeGroupId))
  },

  openGroup(e) {
    if (this.data.atMaxDepth) {
      feedback.warn('最多 4 层关系')
      return
    }
    const id = e.currentTarget.dataset.id
    feedback.soft()
    this.apply(this.data.pathKeys, this.data.pathLabels, 'person', id)
  },

  backToCategory() {
    feedback.soft()
    this.apply(this.data.pathKeys, this.data.pathLabels, 'category', '')
  },

  pickPerson(e) {
    if (this.data.pathKeys.length >= 4) {
      feedback.warn('最多 4 层关系')
      return
    }
    const { key, label } = e.currentTarget.dataset
    const pathKeys = this.data.pathKeys.concat(key)
    const pathLabels = this.data.pathLabels.concat(label)
    feedback.soft()
    storage.addHistory({ id: 'relative', path: '/packageTools/relative/index' })
    const nextStage = pathKeys.length >= 4 ? 'done' : 'category'
    this.apply(pathKeys, pathLabels, nextStage, '')
    const preview = calcRelative(pathKeys)
    if (preview.title && preview.title !== '暂未收录' && preview.title !== '关系过远') {
      feedback.soft()
    }
  },

  back() {
    if (this.data.uiStage === 'person') {
      this.backToCategory()
      return
    }
    if (!this.data.pathKeys.length) return
    feedback.soft()
    const pathKeys = this.data.pathKeys.slice(0, -1)
    const pathLabels = this.data.pathLabels.slice(0, -1)
    this.apply(pathKeys, pathLabels, 'category', '')
  },

  jumpTo(e) {
    const index = Number(e.currentTarget.dataset.index)
    feedback.soft()
    if (index < 0) {
      this.apply([], [], 'category', '')
      return
    }
    this.apply(
      this.data.pathKeys.slice(0, index + 1),
      this.data.pathLabels.slice(0, index + 1),
      'category',
      ''
    )
  },

  reset() {
    feedback.soft()
    this.apply([], [], 'category', '')
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
