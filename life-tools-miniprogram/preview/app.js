(function () {
  const TOOLS = [
    { code: '房', name: '房贷计算器', desc: '等额本息 / 等额本金月供速算', panel: 'mortgage' },
    { code: '税', name: '工资个税估算', desc: '税后收入快速估算', panel: 'mortgage' },
    { code: '退', name: '退休年龄查询', desc: '渐进式延迟退休估算', panel: 'tools' },
    { code: '亲', name: '亲戚称呼计算', desc: '四栏位逐级选择', panel: 'relative' },
    { code: '日', name: '倒数日', desc: '记录人生关键日', panel: 'countdown' },
    { code: '换', name: '单位换算', desc: '长度 / 重量 / 温度', panel: 'tools' }
  ]

  const EDGE = {
    父: { label: '爸爸', nextSex: 'male' },
    母: { label: '妈妈', nextSex: 'female' },
    夫: { label: '丈夫', nextSex: 'male' },
    妻: { label: '妻子', nextSex: 'female' },
    兄: { label: '哥哥', nextSex: 'male' },
    弟: { label: '弟弟', nextSex: 'male' },
    姐: { label: '姐姐', nextSex: 'female' },
    妹: { label: '妹妹', nextSex: 'female' },
    子: { label: '儿子', nextSex: 'male' },
    女: { label: '女儿', nextSex: 'female' }
  }

  const OPTION_DEFS = [
    { key: '父', label: '爸爸', hint: '父亲', group: '父母', badge: '父' },
    { key: '母', label: '妈妈', hint: '母亲', group: '父母', badge: '母' },
    { key: '夫', label: '丈夫', hint: '老公', group: '配偶', badge: '夫' },
    { key: '妻', label: '妻子', hint: '老婆', group: '配偶', badge: '妻' },
    { key: '兄', label: '哥哥', hint: '兄长', group: '同胞', badge: '兄' },
    { key: '弟', label: '弟弟', hint: '弟弟', group: '同胞', badge: '弟' },
    { key: '姐', label: '姐姐', hint: '姐姐', group: '同胞', badge: '姐' },
    { key: '妹', label: '妹妹', hint: '妹妹', group: '同胞', badge: '妹' },
    { key: '子', label: '儿子', hint: '儿子', group: '子女', badge: '子' },
    { key: '女', label: '女儿', hint: '女儿', group: '子女', badge: '女' }
  ]

  const GROUP_ORDER = ['父母', '配偶', '同胞', '子女']

  const REL_MAP = {
    父: '爸爸', 母: '妈妈', 夫: '老公', 妻: '老婆', 兄: '哥哥', 弟: '弟弟', 姐: '姐姐', 妹: '妹妹', 子: '儿子', 女: '女儿',
    父父: '爷爷', 父母: '奶奶', 母父: '外公', 母母: '外婆',
    父兄: '伯伯', 父弟: '叔叔', 父姐: '姑妈', 父妹: '姑妈',
    母兄: '舅舅', 母弟: '舅舅', 母姐: '姨妈', 母妹: '姨妈',
    夫父: '公公', 夫母: '婆婆', 妻父: '岳父', 妻母: '岳母',
    夫兄: '大伯子', 夫弟: '小叔子', 夫姐: '大姑子', 夫妹: '小姑子',
    妻兄: '内兄', 妻弟: '内弟', 妻姐: '大姨子', 妻妹: '小姨子',
    兄子: '侄子', 兄女: '侄女', 弟子: '侄子', 弟女: '侄女',
    姐子: '外甥', 姐女: '外甥女', 妹子: '外甥', 妹女: '外甥女',
    子子: '孙子', 子女: '孙女', 女子: '外孙', 女女: '外孙女',
    子妻: '儿媳', 女夫: '女婿', 兄妻: '嫂子', 弟妻: '弟妹', 姐夫: '姐夫', 妹夫: '妹夫',
    父妻: '妈妈', 母夫: '爸爸',
    父父子: '爸爸 / 伯伯 / 叔叔', 父父女: '姑妈',
    父母子: '爸爸 / 伯伯 / 叔叔', 父母女: '姑妈',
    母父子: '妈妈 / 舅舅', 母父女: '妈妈 / 姨妈',
    母母子: '妈妈 / 舅舅', 母母女: '妈妈 / 姨妈',
    父兄子: '堂兄弟', 父弟子: '堂兄弟', 母兄子: '表兄弟', 母弟子: '表兄弟',
    父姐子: '表兄弟', 父妹子: '表兄弟', 母姐子: '表兄弟', 母妹子: '表兄弟',
    父兄女: '堂姐妹', 父弟女: '堂姐妹', 母兄女: '表姐妹', 母弟女: '表姐妹',
    父父兄: '伯祖父', 父父弟: '叔祖父'
  }

  const ALIASES = {
    外公: ['外祖父', '姥爷', '公公(吴语)'],
    外婆: ['外祖母', '姥姥', '婆婆(吴语)'],
    舅舅: ['舅父', '娘舅'],
    姨妈: ['姨母', '阿姨', '姨娘'],
    姑妈: ['姑姑', '姑母', '嬢嬢(川渝)'],
    伯伯: ['伯父', '大爷'],
    叔叔: ['叔父', '阿叔'],
    岳父: ['丈人', '泰山'],
    岳母: ['丈母娘', '泰水'],
    内兄: ['大舅子'],
    内弟: ['小舅子']
  }

  const SLOT_COUNT = 4

  function sexAtPath(keys) {
    if (!keys.length) return 'unknown'
    const last = keys[keys.length - 1]
    return EDGE[last] ? EDGE[last].nextSex : 'unknown'
  }

  function candidatesFor(keysBefore) {
    const sex = sexAtPath(keysBefore)
    const items = OPTION_DEFS.filter((opt) => {
      if (opt.key === '夫' && sex === 'male') return false
      if (opt.key === '妻' && sex === 'female') return false
      return true
    })
    return GROUP_ORDER.map((title) => ({
      title,
      items: items.filter((i) => i.group === title)
    })).filter((g) => g.items.length)
  }

  const REDUCE_PAIR = {
    母夫: ['父'], 父妻: ['母'], 夫妻: [], 妻夫: [],
    子父: [], 女父: [], 子母: [], 女母: [],
    兄父: ['父'], 弟父: ['父'], 姐父: ['父'], 妹父: ['父'],
    兄母: ['母'], 弟母: ['母'], 姐母: ['母'], 妹母: ['母'],
    子兄: ['子'], 子弟: ['子'], 子姐: ['女'], 子妹: ['女'],
    女兄: ['子'], 女弟: ['子'], 女姐: ['女'], 女妹: ['女'],
    夫子: ['子'], 夫女: ['女'], 妻子: ['子'], 妻女: ['女']
  }

  function reducePath(pathKeys) {
    let keys = pathKeys.slice()
    let guard = 0
    let steps = 0
    while (guard < 32) {
      guard += 1
      let hit = false
      for (let i = 0; i < keys.length - 1; i += 1) {
        const pair = keys[i] + keys[i + 1]
        if (!Object.prototype.hasOwnProperty.call(REDUCE_PAIR, pair)) continue
        keys = keys.slice(0, i).concat(REDUCE_PAIR[pair], keys.slice(i + 2))
        steps += 1
        hit = true
        break
      }
      if (!hit) break
    }
    return { keys, steps }
  }

  function progressiveLabels(keys) {
    return keys.map((_, i) => {
      const prefix = keys.slice(0, i + 1)
      const title = REL_MAP[prefix.join('')]
      if (title) return title
      return EDGE[keys[i]].label
    })
  }

  function formatChain(keys) {
    if (!keys.length) return '我'
    return `我 → ${progressiveLabels(keys).join(' → ')}`
  }

  function normalizePathKeys(pathKeys) {
    const before = pathKeys.join('')
    const { keys, steps } = reducePath(pathKeys)
    const title = keys.length ? (REL_MAP[keys.join('')] || '') : '自己'
    return {
      keys,
      folded: steps > 0 && keys.join('') !== before,
      title
    }
  }

  function relPreview(keys) {
    if (!keys.length) {
      return { title: '', tip: '从第 1 栏开始点选关系', aliasText: '', empty: true }
    }
    const raw = `我 → ${keys.map((k) => EDGE[k].label).join(' → ')}`
    const { keys: reduced, steps } = reducePath(keys)
    const folded = steps > 0 && reduced.join('') !== keys.join('')
    if (!reduced.length) {
      return { title: '自己', tip: `${raw} → 已折叠为「自己」`, aliasText: '地方 / 口语也叫：本人', empty: false }
    }
    const title = REL_MAP[reduced.join('')] || REL_MAP[keys.join('')]
    if (!title) {
      return { title: '暂未收录', tip: formatChain(reduced), aliasText: '', empty: false }
    }
    const ambiguous = title.indexOf(' / ') >= 0
    let tip = folded
      ? `${raw} → 已折叠为「${title}」，后续从此人继续算`
      : formatChain(reduced)
    if (ambiguous) tip += '。存在多种可能，请结合家谱实际情况判断'
    return {
      title,
      tip,
      aliasText: ambiguous ? `可能称呼：${title}` : ((ALIASES[title] || []).length ? `地方 / 口语也叫：${ALIASES[title].join('、')}` : ''),
      empty: false
    }
  }

  function calcMortgage({ amountWan, years, rateAnnual, method }) {
    const principal = Number(amountWan) * 10000
    const months = Number(years) * 12
    const monthlyRate = Number(rateAnnual) / 100 / 12
    if (!(principal > 0) || !(months > 0) || !(monthlyRate >= 0)) return null
    if (method === 'equalPrincipal') {
      const monthlyPrincipal = principal / months
      const firstMonth = monthlyPrincipal + principal * monthlyRate
      let totalInterest = 0
      let remain = principal
      for (let i = 0; i < months; i += 1) {
        totalInterest += remain * monthlyRate
        remain -= monthlyPrincipal
      }
      return { methodLabel: '等额本金', monthly: firstMonth, totalInterest, totalPay: principal + totalInterest, months }
    }
    const pow = Math.pow(1 + monthlyRate, months)
    const monthly = monthlyRate === 0 ? principal / months : (principal * monthlyRate * pow) / (pow - 1)
    const totalPay = monthly * months
    return { methodLabel: '等额本息', monthly, totalInterest: totalPay - principal, totalPay, months }
  }

  function money(n) {
    return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function daysBetween(a, b) {
    const da = new Date(a)
    const db = new Date(b)
    return Math.round((db.setHours(0, 0, 0, 0) - da.setHours(0, 0, 0, 0)) / 86400000)
  }

  const state = {
    relKeys: [],
    activeSlot: 0,
    countdowns: []
  }

  function switchPanel(name) {
    window.location.hash = name
    document.querySelectorAll('.tab').forEach((el) => {
      el.classList.toggle('active', el.dataset.panel === name)
    })
    document.querySelectorAll('.panel').forEach((el) => {
      el.classList.toggle('active', el.id === `panel-${name}`)
    })
  }

  function renderTools() {
    const list = document.getElementById('tool-list')
    list.innerHTML = TOOLS.map((t) => `
      <div class="list-row" data-panel="${t.panel}">
        <div class="icon">${t.code}</div>
        <div><div class="name">${t.name}</div><div class="desc">${t.desc}</div></div>
        <div class="chev">›</div>
      </div>
    `).join('')
    list.querySelectorAll('.list-row').forEach((el) => {
      el.addEventListener('click', () => switchPanel(el.dataset.panel))
    })
  }

  function renderRelative() {
    const keys = state.relKeys
    const preview = relPreview(keys)
    const resultTitle = preview.title && preview.title !== '暂未收录' ? preview.title : (preview.title === '暂未收录' ? '暂未收录' : '')
    const shareBtn = document.getElementById('rel-share')
    const picking = state.activeSlot >= 0

    const outcome = document.getElementById('rel-outcome')
    const hit = resultTitle && resultTitle !== '暂未收录'
    outcome.className = `rel-outcome ${hit ? 'hit' : 'idle'}`
    outcome.innerHTML = `
      <div class="rel-outcome-kicker">${hit ? '应该称呼' : '称呼结果'}</div>
      <div class="rel-outcome-title">${resultTitle || '—'}</div>
      ${preview.aliasText ? `<div class="rel-outcome-alias">${preview.aliasText}</div>` : ''}
      <div class="rel-outcome-tip">${preview.tip || '从第 1 栏开始点选关系'}</div>
    `
    shareBtn.disabled = !hit

    const hint = keys.length
      ? picking
        ? `正在设置第 ${state.activeSlot + 1} 栏`
        : '可继续点下一栏，或点已选栏修改'
      : '请从第 1 栏开始选择关系'
    document.getElementById('rel-step-hint').textContent = hint

    const slotsEl = document.getElementById('rel-slots')
    slotsEl.innerHTML = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const filled = i < keys.length
      const locked = i > keys.length
      const labels = progressiveLabels(keys)
      const status = locked ? 'locked' : filled ? 'filled' : 'next'
      const active = state.activeSlot === i ? 'active' : ''
      const label = filled ? labels[i] : locked ? '待解锁' : '点选'
      const badge = filled ? (labels[i].split(' / ')[0][0] || String(i + 1)) : String(i + 1)
      const sub = locked ? '先填前面' : filled ? '可改选' : i === keys.length ? '点此选择' : ''
      return `<button type="button" class="rel-slot status-${status} ${active}" data-i="${i}">
        <span class="rel-slot-no">${i + 1}</span>
        <span class="rel-slot-badge">${badge}</span>
        <span class="rel-slot-label">${label}</span>
        <span class="rel-slot-hint">${sub}</span>
      </button>`
    }).join('')

    slotsEl.querySelectorAll('.rel-slot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i)
        if (i > keys.length) return
        if (state.activeSlot === i) {
          state.activeSlot = -1
        } else {
          state.activeSlot = i
        }
        renderRelative()
      })
    })

    const picker = document.getElementById('rel-picker')
    if (!picking) {
      picker.innerHTML = `<div class="rel-idle-tip">点上方栏位选择或修改关系；最多 4 层</div>`
      return
    }

    const groups = candidatesFor(keys.slice(0, state.activeSlot))
    picker.innerHTML = `
      <div class="rel-picker">
        <div class="rel-picker-bar">
          <div class="rel-picker-title">第 ${state.activeSlot + 1} 栏 · 选关系</div>
          <button type="button" class="rel-picker-close" id="rel-close-picker">收起</button>
        </div>
        <div class="rel-picker-tip">已按当前人物性别过滤不合理选项</div>
        ${groups.map((g) => `
          <div class="rel-opt-group">
            <div class="rel-opt-group-title">${g.title}</div>
            <div class="rel-opt-row">
              ${g.items.map((opt) => `
                <button type="button" class="rel-opt-chip ${keys[state.activeSlot] === opt.key ? 'on' : ''}" data-key="${opt.key}">
                  <span class="rel-opt-badge">${opt.badge}</span>
                  <span><span class="rel-opt-name">${opt.label}</span><span class="rel-opt-hint">${opt.hint}</span></span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>`

    document.getElementById('rel-close-picker').addEventListener('click', () => {
      state.activeSlot = -1
      renderRelative()
    })
    picker.querySelectorAll('.rel-opt-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
          const next = keys.slice(0, state.activeSlot)
          next.push(btn.dataset.key)
          const norm = normalizePathKeys(next)
          state.relKeys = norm.keys
          state.activeSlot = state.relKeys.length < SLOT_COUNT ? state.relKeys.length : -1
          renderRelative()
        })
    })
  }

  function renderCountdowns() {
    const list = document.getElementById('cd-list')
    const focus = document.getElementById('cd-focus')
    const today = new Date().toISOString().slice(0, 10)
    const enriched = state.countdowns.map((item) => {
      const delta = daysBetween(today, item.date)
      return { ...item, delta, abs: Math.abs(delta) }
    }).sort((a, b) => {
      const ax = a.delta < 0 ? 100000 + a.abs : a.abs
      const bx = b.delta < 0 ? 100000 + b.abs : b.abs
      return ax - bx
    })
    if (enriched[0]) {
      const f = enriched[0]
      const unit = f.delta < 0 ? '天前' : f.delta === 0 ? '就是今天' : '天后'
      focus.innerHTML = `<div class="kicker">好算生活 · 倒数日</div><div class="title">${f.title}</div><div class="num">${f.abs}</div><div class="unit">${unit}</div>`
    }
    list.innerHTML = enriched.map((item) => {
      const unit = item.delta < 0 ? '天前' : item.delta === 0 ? '就是今天' : '天后'
      return `<div class="cd-item"><div><strong>${item.title}</strong><div style="color:var(--muted);font-size:12px;margin-top:4px">${item.date}</div></div><div class="count">${item.abs}<span class="unit">${unit}</span></div></div>`
    }).join('')
  }

  function bindEvents() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault()
        switchPanel(tab.dataset.panel)
      })
    })

    document.getElementById('mortgage-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const raw = calcMortgage({
        amountWan: document.getElementById('m-amount').value,
        years: document.getElementById('m-years').value,
        rateAnnual: document.getElementById('m-rate').value,
        method: document.getElementById('m-method').value
      })
      const box = document.getElementById('m-result')
      if (!raw) {
        box.classList.remove('hidden')
        box.innerHTML = '<div class="label">请检查输入</div>'
        return
      }
      box.classList.remove('hidden')
      box.innerHTML = `
        <div class="label">${raw.methodLabel} · 首月月供（元）</div>
        <div class="value">${money(raw.monthly)}</div>
        <div class="meta">总利息 ${money(raw.totalInterest)} 元</div>
        <div class="meta">还款总额 ${money(raw.totalPay)} 元 · ${raw.months} 期</div>
      `
    })

    document.getElementById('rel-back').addEventListener('click', () => {
      if (state.activeSlot >= 0) {
        state.activeSlot = -1
        renderRelative()
        return
      }
      state.relKeys.pop()
      state.activeSlot = state.relKeys.length
      renderRelative()
    })
    document.getElementById('rel-reset').addEventListener('click', () => {
      state.relKeys = []
      state.activeSlot = 0
      renderRelative()
    })

    document.getElementById('cd-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const title = document.getElementById('cd-title').value.trim()
      const date = document.getElementById('cd-date').value
      if (!title || !date) return
      state.countdowns.unshift({ title, date })
      renderCountdowns()
    })

    window.addEventListener('hashchange', () => {
      const name = (window.location.hash || '#tools').slice(1)
      if (['tools', 'countdown', 'mortgage', 'relative'].includes(name)) {
        document.querySelectorAll('.tab').forEach((el) => {
          el.classList.toggle('active', el.dataset.panel === name)
        })
        document.querySelectorAll('.panel').forEach((el) => {
          el.classList.toggle('active', el.id === `panel-${name}`)
        })
      }
    })
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function runDemo() {
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') !== '1') return
    await sleep(500)
    switchPanel('relative')
    await sleep(400)
    document.querySelector('.rel-opt-chip[data-key="母"]')?.click()
    await sleep(450)
    document.querySelector('.rel-opt-chip[data-key="兄"]')?.click()
    await sleep(700)
    switchPanel('mortgage')
    await sleep(350)
    document.getElementById('mortgage-form').requestSubmit()
    await sleep(700)
    switchPanel('countdown')
    await sleep(350)
    document.getElementById('cd-title').value = '旅行'
    const future = new Date()
    future.setDate(future.getDate() + 45)
    document.getElementById('cd-date').value = future.toISOString().slice(0, 10)
    document.getElementById('cd-form').requestSubmit()
    await sleep(600)
    switchPanel('tools')
  }

  function init() {
    renderTools()
    bindEvents()
    renderRelative()
    const dateInput = document.getElementById('cd-date')
    const next = new Date()
    next.setMonth(next.getMonth() + 6)
    dateInput.value = next.toISOString().slice(0, 10)
    state.countdowns = [
      { title: '元旦', date: `${new Date().getFullYear() + 1}-01-01` },
      { title: '高考', date: dateInput.value }
    ]
    renderCountdowns()
    const initial = (window.location.hash || '#tools').slice(1)
    switchPanel(['tools', 'countdown', 'mortgage', 'relative'].includes(initial) ? initial : 'tools')
    runDemo()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
