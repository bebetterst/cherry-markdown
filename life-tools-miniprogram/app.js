const storage = require('./utils/storage')

App({
  onLaunch() {
    storage.ensureDefaults()
    this.loadBrandFont()
  },

  loadBrandFont() {
    // 品牌标题用书法感字体；失败则回退系统字体，不影响使用
    if (!wx.loadFontFace) return
    wx.loadFontFace({
      family: 'HaosuanDisplay',
      source: 'url("https://cdn.jsdelivr.net/npm/@fontsource/zcool-xiaowei@5.0.0/files/zcool-xiaowei-chinese-simplified-400-normal.woff2")',
      global: true,
      desc: { style: 'normal', weight: '400' },
      fail() {
        // silent fallback
      }
    })
  },

  globalData: {
    brand: '好算生活',
    version: '0.2.0'
  }
})
