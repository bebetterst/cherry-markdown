const storage = require('./utils/storage')

App({
  onLaunch() {
    storage.ensureDefaults()
  },
  globalData: {
    brand: '好算生活',
    version: '0.1.0'
  }
})
