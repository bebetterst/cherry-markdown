# 好算生活（微信小程序）

生活计算工具箱 + 倒数日。面向个人主体、广告变现与搜一搜增长。

## 本地打开

1. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本目录 `life-tools-miniprogram`
3. 填入你的 AppID（可先用测试号）
4. 编译预览

## 目录

- `pages/`：首页、倒数日、我的
- `packageTools/`：房贷 / 个税 / 退休 / 亲戚称呼 / 单位换算 / 日期间隔
- `config/ads.js`：流量主广告位 ID
- `config/tools.js`：工具目录与关键词
- `utils/`：计算与本地存储

## 开通广告

累计用户达标并开通流量主后，编辑 `config/ads.js`：

```js
module.exports = {
  enabled: true,
  banner: 'adunit-xxx',
  rewarded: 'adunit-yyy',
  interstitial: 'adunit-zzz'
}
```

## 浏览器演示

仓库内提供静态预览（不依赖微信开发者工具）：

```bash
cd life-tools-miniprogram/preview
python3 -m http.server 8765
# 打开 http://127.0.0.1:8765
```

## 免责声明

房贷、个税、退休等结果为简化估算，仅供参考，不构成金融/税务/法律建议。
