const storage = require('../../utils/storage')
const { daysBetween, todayStr } = require('../../utils/format')
const feedback = require('../../utils/feedback')

Page({
  data: {
    list: [],
    focus: null,
    showModal: false,
    emojis: ['🎯', '🎂', '💍', '📚', '🛫', '💼', '🏡', '🎊'],
    form: { title: '', date: '', emoji: '🎯' },
    shareItem: null
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const today = todayStr()
    const list = storage.getCountdowns()
      .map((item) => {
        const delta = daysBetween(today, item.date)
        return {
          ...item,
          delta,
          abs: Math.abs(delta ?? 0)
        }
      })
      .sort((a, b) => {
        const ax = a.delta < 0 ? 100000 + a.abs : a.abs
        const bx = b.delta < 0 ? 100000 + b.abs : b.abs
        return ax - bx
      })
    this.setData({ list, focus: list[0] || null })
  },

  onAdd() {
    feedback.soft()
    this.setData({
      showModal: true,
      form: { title: '', date: todayStr(), emoji: '🎯' }
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  noop() {},

  onTitle(e) {
    this.setData({ 'form.title': e.detail.value })
  },

  onDate(e) {
    this.setData({ 'form.date': e.detail.value })
  },

  onEmoji(e) {
    this.setData({ 'form.emoji': e.currentTarget.dataset.emoji })
  },

  save() {
    const { title, date, emoji } = this.data.form
    if (!title.trim() || !date) {
      feedback.warn('请填写标题和日期')
      return
    }
    const list = storage.getCountdowns()
    list.unshift({
      id: `c_${Date.now()}`,
      title: title.trim(),
      date,
      emoji,
      createdAt: Date.now()
    })
    storage.saveCountdowns(list)
    this.setData({ showModal: false })
    this.refresh()
    feedback.success('已添加')
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条倒数日？',
      content: '删除后无法恢复',
      confirmColor: '#0B3D32',
      success: (res) => {
        if (!res.confirm) return
        const list = storage.getCountdowns().filter((x) => x.id !== id)
        storage.saveCountdowns(list)
        this.refresh()
        feedback.success('已删除')
      }
    })
  },

  onShareTap(e) {
    this.setData({ shareItem: e.currentTarget.dataset.item })
  },

  onShareAppMessage() {
    const item = this.data.shareItem || this.data.focus
    if (item) {
      const text =
        item.delta < 0
          ? `${item.title} 已过去 ${item.abs} 天`
          : item.delta === 0
            ? `${item.title} 就是今天`
            : `${item.title} 还有 ${item.abs} 天`
      return {
        title: `【好算生活】${text}`,
        path: '/pages/countdown/index'
      }
    }
    return {
      title: '好算生活｜倒数日提醒人生关键节点',
      path: '/pages/countdown/index'
    }
  }
})
