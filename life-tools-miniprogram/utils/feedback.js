/**
 * 统一反馈：触感 + Toast，对齐微信/iOS「操作完成」预期
 */
function success(title = '已完成') {
  try {
    wx.vibrateShort({ type: 'light' })
  } catch (e) {
    // ignore
  }
  wx.showToast({ title, icon: 'success', duration: 1200 })
}

function soft() {
  try {
    wx.vibrateShort({ type: 'light' })
  } catch (e) {
    // ignore
  }
}

function warn(title) {
  wx.showToast({ title, icon: 'none' })
}

module.exports = { success, soft, warn }
