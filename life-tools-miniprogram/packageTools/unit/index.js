const { GROUPS, convert } = require('../../utils/unit')
const { number } = require('../../utils/format')
const storage = require('../../utils/storage')
const feedback = require('../../utils/feedback')

Page({
  data: {
    group: 'length',
    value: '1',
    units: [],
    unitNames: [],
    fromIndex: 0,
    toIndex: 1,
    resultText: '',
    fav: false,
    shareTitle: ''
  },

  onLoad() { this.applyGroup('length') },
  onShow() { this.setData({ fav: storage.isFavorite('unit') }) },

  applyGroup(group) {
    const units = GROUPS[group].units
    this.setData({
      group,
      units,
      unitNames: units.map((u) => u.name),
      fromIndex: 0,
      toIndex: Math.min(1, units.length - 1),
      resultText: ''
    })
  },

  onGroup(e) {
    feedback.soft()
    this.applyGroup(e.currentTarget.dataset.g)
  },
  onValue(e) { this.setData({ value: e.detail.value }) },
  onFrom(e) { this.setData({ fromIndex: Number(e.detail.value) }) },
  onTo(e) { this.setData({ toIndex: Number(e.detail.value) }) },

  calc() {
    const from = this.data.units[this.data.fromIndex]
    const to = this.data.units[this.data.toIndex]
    const val = convert({
      group: this.data.group,
      value: this.data.value,
      from: from.id,
      to: to.id
    })
    if (val === null) {
      feedback.warn('请检查输入')
      return
    }
    const resultText = `${this.data.value} ${from.name} = ${number(val, 6)} ${to.name}`
    storage.addHistory({ id: 'unit', path: '/packageTools/unit/index' })
    this.setData({ resultText: '' })
    setTimeout(() => {
      this.setData({
        resultText,
        shareTitle: `【好算生活】${resultText}`
      })
      feedback.success('换算完成')
    }, 16)
  },

  toggleFav() {
    const fav = storage.toggleFavorite('unit')
    this.setData({ fav })
    feedback.success(fav ? '已收藏' : '已取消')
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '好算生活｜单位换算',
      path: '/packageTools/unit/index'
    }
  }
})
