/**
 * 亲戚称呼：4 栏位；选后若触发折叠则归一化路径，后续从折叠称呼继续算
 */
const {
  calcRelative,
  getCandidateGroups,
  progressiveLabels,
  normalizePathKeys
} = require('../../utils/relative')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

const SLOT_COUNT = 4

function buildSlots(pathKeys, activeSlot) {
  const labels = progressiveLabels(pathKeys)
  const slots = []
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    const filled = i < pathKeys.length
    const locked = i > pathKeys.length
    const isActive = activeSlot === i
    let status = 'empty'
    if (locked) status = 'locked'
    else if (filled) status = 'filled'
    else status = 'next'
    const label = filled ? labels[i] : ''
    const badge = filled ? (label.split(' / ')[0][0] || String(i + 1)) : String(i + 1)
    slots.push({
      index: i,
      no: i + 1,
      key: filled ? pathKeys[i] : '',
      label,
      badge,
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

function buildState(pathKeys, activeSlot, foldNotice) {
  const depth = pathKeys.length
  const preview = calcRelative(pathKeys)
  const canShare = !!(
    preview.title &&
    preview.title !== '暂未收录' &&
    preview.title !== '关系过远'
  )
  const picking = activeSlot != null && activeSlot >= 0 && activeSlot < SLOT_COUNT
  const candidateGroups = picking ? getCandidateGroups(pathKeys, activeSlot) : []
  const continueName = preview.continueFrom || preview.title || ''

  let stepHint = '请从第 1 栏开始选择关系'
  if (foldNotice) {
    stepHint = foldNotice
  } else if (depth) {
    stepHint = picking
      ? `正在设置第 ${activeSlot + 1} 栏${continueName ? `（接在「${continueName.split(' / ')[0]}」后面）` : ''}`
      : continueName
        ? `当前是「${continueName}」，可继续点下一栏往下算`
        : '可继续点下一栏，或点已选栏修改'
  }

  return {
    pathKeys,
    pathLabels: progressiveLabels(pathKeys),
    slots: buildSlots(pathKeys, picking ? activeSlot : -1),
    activeSlot: picking ? activeSlot : -1,
    picking,
    candidateGroups,
    preview,
    resultTitle: preview.title && !preview.empty ? preview.title : '',
    resultTip: preview.tip || '',
    aliasText: preview.aliasText || '',
    canShare,
    shareTitle: preview.shareText || '好算生活｜亲戚称呼计算',
    stepHint,
    foldNotice: foldNotice || ''
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
    preview: {},
    resultTitle: '',
    resultTip: '',
    aliasText: '',
    canShare: false,
    fav: false,
    shareTitle: '',
    stepHint: '请从第 1 栏开始选择关系',
    foldNotice: ''
  },

  onLoad() {
    this.apply([], 0)
  },

  onShow() {
    this.setData({ fav: storage.isFavorite('relative') })
  },

  apply(pathKeys, activeSlot, foldNotice) {
    this.setData(buildState(pathKeys, activeSlot, foldNotice))
  },

  tapSlot(e) {
    const index = Number(e.currentTarget.dataset.index)
    const slot = this.data.slots[index]
    if (!slot || slot.locked) {
      feedback.warn('请先完成前面的栏位')
      return
    }
    feedback.soft()
    if (this.data.activeSlot === index && this.data.picking) {
      this.apply(this.data.pathKeys, -1)
      return
    }
    this.apply(this.data.pathKeys, index)
  },

  pickRelation(e) {
    const { key } = e.currentTarget.dataset
    const slot = this.data.activeSlot
    if (slot < 0 || slot > this.data.pathKeys.length) return

    let pathKeys = this.data.pathKeys.slice(0, slot)
    pathKeys.push(key)

    // 折叠归一化：后续从折叠后的链继续算
    const norm = normalizePathKeys(pathKeys)
    pathKeys = norm.keys

    feedback.soft()
    storage.addHistory({ id: 'relative', path: '/packageTools/relative/index' })

    let foldNotice = ''
    if (norm.folded && norm.title) {
      foldNotice = `已折叠为「${norm.title}」，下一栏从「${norm.title.split(' / ')[0]}」继续`
      feedback.success(`已折叠为${norm.title.split(' / ')[0]}`)
    }

    const nextSlot = pathKeys.length < SLOT_COUNT ? pathKeys.length : -1
    this.apply(pathKeys, nextSlot, foldNotice)
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
