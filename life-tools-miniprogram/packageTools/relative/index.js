/**
 * 亲戚称呼：4 栏位（两行）→ 点栏位出候选；按性别过滤配偶选项
 */
const {
  calcRelative,
  getCandidateGroups,
  pathLabels,
  EDGE
} = require('../../utils/relative')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

const SLOT_COUNT = 4

function buildSlots(pathKeys, activeSlot) {
  const labels = pathLabels(pathKeys)
  const slots = []
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    const filled = i < pathKeys.length
    const canOpen = i === 0 || i <= pathKeys.length
    // 只能点：已填栏、下一空栏；更后面的锁定
    const locked = i > pathKeys.length
    const isActive = activeSlot === i
    let status = 'empty'
    if (locked) status = 'locked'
    else if (filled) status = 'filled'
    else if (canOpen) status = 'next'
    slots.push({
      index: i,
      no: i + 1,
      key: filled ? pathKeys[i] : '',
      label: filled ? labels[i] : '',
      badge: filled ? labels[i][0] : String(i + 1),
      filled,
      locked,
      canOpen: !locked,
      isActive,
      status,
      hint: locked ? '先填前面' : filled ? '可改选' : i === pathKeys.length ? '点此选择' : ''
    })
  }
  return slots
}

function buildState(pathKeys, activeSlot) {
  const depth = pathKeys.length
  const preview = calcRelative(pathKeys)
  const canShare = !!(preview.title && preview.title !== '暂未收录' && preview.title !== '关系过远')
  const picking = activeSlot != null && activeSlot >= 0 && activeSlot < SLOT_COUNT
  const candidateGroups = picking ? getCandidateGroups(pathKeys, activeSlot) : []
  const activeLabel =
    picking && pathKeys[activeSlot] && EDGE[pathKeys[activeSlot]]
      ? EDGE[pathKeys[activeSlot]].label
      : ''

  return {
    pathKeys,
    pathLabels: pathLabels(pathKeys),
    slots: buildSlots(pathKeys, picking ? activeSlot : -1),
    activeSlot: picking ? activeSlot : -1,
    picking,
    candidateGroups,
    activeLabel,
    preview,
    resultTitle: preview.title && !preview.empty ? preview.title : '',
    resultTip: preview.tip || '',
    aliasText: preview.aliasText || '',
    canShare,
    shareTitle: preview.shareText || '好算生活｜亲戚称呼计算',
    stepHint: depth
      ? picking
        ? `正在设置第 ${activeSlot + 1} 栏`
        : '可继续点下一栏，或点已选栏修改'
      : '请从第 1 栏开始选择关系'
  }
}

Page({
  data: {
    pathKeys: [],
    pathLabels: [],
    slots: [],
    activeSlot: -1,
    picking: false,
    candidateGroups: [],
    activeLabel: '',
    preview: {},
    resultTitle: '',
    resultTip: '',
    aliasText: '',
    canShare: false,
    fav: false,
    shareTitle: '',
    stepHint: '请从第 1 栏开始选择关系'
  },

  onLoad() {
    this.apply([], 0)
  },

  onShow() {
    this.setData({ fav: storage.isFavorite('relative') })
  },

  apply(pathKeys, activeSlot) {
    this.setData(buildState(pathKeys, activeSlot))
  },

  tapSlot(e) {
    const index = Number(e.currentTarget.dataset.index)
    const slot = this.data.slots[index]
    if (!slot || slot.locked) {
      feedback.warn('请先完成前面的栏位')
      return
    }
    feedback.soft()
    // 再次点当前激活栏 → 收起
    if (this.data.activeSlot === index && this.data.picking) {
      this.apply(this.data.pathKeys, -1)
      return
    }
    this.apply(this.data.pathKeys, index)
  },

  pickRelation(e) {
    const { key, label } = e.currentTarget.dataset
    const slot = this.data.activeSlot
    if (slot < 0 || slot > this.data.pathKeys.length) return

    const pathKeys = this.data.pathKeys.slice(0, slot)
    pathKeys.push(key)
    // 改选中间栏时，清掉后面的栏
    feedback.soft()
    storage.addHistory({ id: 'relative', path: '/packageTools/relative/index' })

    const nextSlot = pathKeys.length < SLOT_COUNT ? pathKeys.length : -1
    this.apply(pathKeys, nextSlot)

    const preview = calcRelative(pathKeys)
    if (preview.title && preview.title !== '暂未收录' && preview.title !== '关系过远') {
      // 出结果时轻反馈即可
    }
  },

  closePicker() {
    feedback.soft()
    this.apply(this.data.pathKeys, -1)
  },

  back() {
    if (this.data.picking) {
      this.closePicker()
      return
    }
    if (!this.data.pathKeys.length) return
    feedback.soft()
    const pathKeys = this.data.pathKeys.slice(0, -1)
    this.apply(pathKeys, pathKeys.length)
  },

  reset() {
    feedback.soft()
    this.apply([], 0)
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
