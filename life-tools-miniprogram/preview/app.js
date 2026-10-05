(function () {
  const TOOLS = [
    { code: '房', name: '房贷计算器', desc: '等额本息 / 等额本金月供速算', panel: 'mortgage' },
    { code: '税', name: '工资个税估算', desc: '税后收入快速估算', panel: 'mortgage' },
    { code: '退', name: '退休年龄查询', desc: '渐进式延迟退休估算', panel: 'tools' },
    { code: '亲', name: '亲戚称呼计算', desc: '逐级选择关系', panel: 'relative' },
    { code: '日', name: '倒数日', desc: '记录人生关键日', panel: 'countdown' },
    { code: '换', name: '单位换算', desc: '长度 / 重量 / 温度', panel: 'tools' }
  ]

  const ICON = '../assets/icons'
  const OPTION_GROUPS = [
    {
      id: 'parents',
      title: '父母长辈',
      desc: '爸爸、妈妈',
      icon: `${ICON}/cat-parents.png`,
      items: [
        { key: '父', label: '爸爸', hint: '父亲' },
        { key: '母', label: '妈妈', hint: '母亲' }
      ]
    },
    {
      id: 'spouse',
      title: '配偶',
      desc: '丈夫、妻子',
      icon: `${ICON}/cat-spouse.png`,
      items: [
        { key: '夫', label: '丈夫', hint: '老公' },
        { key: '妻', label: '妻子', hint: '老婆' }
      ]
    },
    {
      id: 'siblings',
      title: '兄弟姐妹',
      desc: '兄姐弟妹',
      icon: `${ICON}/cat-sibling.png`,
      items: [
        { key: '兄', label: '哥哥', hint: '兄长' },
        { key: '弟', label: '弟弟', hint: '弟弟' },
        { key: '姐', label: '姐姐', hint: '姐姐' },
        { key: '妹', label: '妹妹', hint: '妹妹' }
      ]
    },
    {
      id: 'children',
      title: '子女晚辈',
      desc: '儿子、女儿',
      icon: `${ICON}/cat-child.png`,
      items: [
        { key: '子', label: '儿子', hint: '儿子' },
        { key: '女', label: '女儿', hint: '女儿' }
      ]
    }
  ]

  const REL_MAP = {
    父: '爸爸', 母: '妈妈', 父父: '爷爷', 父母: '奶奶', 母父: '外公', 母母: '外婆',
    父兄: '伯伯', 父弟: '叔叔', 母兄: '舅舅', 母弟: '舅舅', 母姐: '姨妈', 母妹: '姨妈',
    妻父: '岳父', 妻母: '岳母', 夫父: '公公', 夫母: '婆婆'
  }

  function relStepPrompt(depth, labels) {
    if (depth >= 4) return '已选满 4 层'
    if (depth === 0) return '先选 Ta 和你的关系'
    return `「${labels[labels.length - 1]}」的…`
  }

  function relPreview(keys) {
    if (!keys.length) return { title: '', tip: '选一类，再选具体是谁', empty: true }
    if (keys.length > 4) return { title: '关系过远', tip: '暂支持 4 层以内', empty: false }
    const title = REL_MAP[keys.join('')]
    if (title) return { title, tip: `关系链：我 → ${keys.join(' → ')}`, empty: false }
    return { title: '', tip: '暂未收录，可回退一层换个路径', empty: true }
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
    relLabels: [],
    relUiStage: 'category',
    relActiveGroupId: '',
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
    const depth = state.relKeys.length
    const atMax = depth >= 4
    const stepIndex = Math.min(depth, 3)
    const stepPrompt = relStepPrompt(depth, state.relLabels)
    const preview = relPreview(state.relKeys)
    const resultTitle = preview.title && !preview.empty ? preview.title : ''
    const shareBtn = document.getElementById('rel-share')
    const backBtn = document.getElementById('rel-back')

    document.getElementById('rel-step-bar').innerHTML = [0, 1, 2, 3]
      .map((i) => {
        const done = i <= stepIndex
        const current = i === stepIndex && !atMax
        return `<span class="rel-step-dot ${done ? 'done' : ''} ${current ? 'current' : ''}"></span>`
      })
      .join('')

    let chainHtml = `<button type="button" class="rel-chain-node ${depth === 0 ? 'on' : ''}" data-i="-1"><span class="rel-node-avatar">我</span><span class="rel-node-label">起点</span></button>`
    state.relLabels.forEach((label, i) => {
      chainHtml += `<span class="rel-chain-line"></span><button type="button" class="rel-chain-node ${i === depth - 1 ? 'on' : ''}" data-i="${i}"><span class="rel-node-avatar">${label[0]}</span><span class="rel-node-label">${label}</span></button>`
    })
    const chainEl = document.getElementById('rel-chain')
    chainEl.innerHTML = `<div class="rel-chain">${chainHtml}</div>`
    chainEl.querySelectorAll('.rel-chain-node').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i)
        if (i < 0) {
          state.relKeys = []
          state.relLabels = []
        } else {
          state.relKeys = state.relKeys.slice(0, i + 1)
          state.relLabels = state.relLabels.slice(0, i + 1)
        }
        state.relUiStage = 'category'
        state.relActiveGroupId = ''
        renderRelative()
      })
    })

    const outcome = document.getElementById('rel-outcome')
    outcome.className = `rel-outcome ${resultTitle ? 'hit' : 'idle'}`
    outcome.innerHTML = `
      <div class="rel-outcome-kicker">${resultTitle ? '应该称呼' : '称呼结果'}</div>
      <div class="rel-outcome-title">${resultTitle || '—'}</div>
      <div class="rel-outcome-tip">${resultTitle ? preview.tip : stepPrompt}</div>
    `

    shareBtn.disabled = !(resultTitle && resultTitle !== '暂未收录' && resultTitle !== '关系过远')
    backBtn.disabled = depth === 0 && state.relUiStage === 'category'

    const sheet = document.getElementById('rel-sheet')
    if (atMax) {
      sheet.innerHTML = `
        <div class="rel-sheet">
          <div class="rel-sheet-title">关系已选满</div>
          <div class="rel-sheet-desc">最多支持 4 层。可点上方路径回退，或分享当前结果。</div>
        </div>`
      return
    }

    if (state.relUiStage === 'person' && state.relActiveGroupId) {
      const group = OPTION_GROUPS.find((g) => g.id === state.relActiveGroupId)
      if (!group) {
        state.relUiStage = 'category'
        state.relActiveGroupId = ''
        renderRelative()
        return
      }
      const cols = group.items.length > 2 ? 'cols-2' : 'cols-1'
      sheet.innerHTML = `
        <div class="rel-sheet">
          <button type="button" class="rel-sheet-nav" id="rel-back-cat">‹ 返回选关系大类</button>
          <div class="rel-sheet-head">
            <div class="rel-sheet-title">${group.title}</div>
            <div class="rel-sheet-desc">点选具体一位</div>
          </div>
          <div class="rel-person-grid ${cols}">
            ${group.items.map((item) => `
              <button type="button" class="rel-person-tile" data-key="${item.key}" data-label="${item.label}">
                <div class="rel-person-name">${item.label}</div>
                <div class="rel-person-hint">${item.hint}</div>
              </button>
            `).join('')}
          </div>
        </div>`
      document.getElementById('rel-back-cat').addEventListener('click', () => {
        state.relUiStage = 'category'
        state.relActiveGroupId = ''
        renderRelative()
      })
      sheet.querySelectorAll('.rel-person-tile').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (state.relKeys.length >= 4) return
          state.relKeys.push(btn.dataset.key)
          state.relLabels.push(btn.dataset.label)
          state.relUiStage = 'category'
          state.relActiveGroupId = ''
          renderRelative()
        })
      })
      return
    }

    sheet.innerHTML = `
      <div class="rel-sheet">
        <div class="rel-sheet-head">
          <div class="rel-sheet-title">${stepPrompt}</div>
          <div class="rel-sheet-desc">选一类，再选具体是谁</div>
        </div>
        <div class="rel-cat-grid">
          ${OPTION_GROUPS.map((g) => `
            <button type="button" class="rel-cat-tile" data-id="${g.id}">
              <img class="rel-cat-icon" src="${g.icon}" alt="" />
              <div class="rel-cat-name">${g.title}</div>
              <div class="rel-cat-desc">${g.desc}</div>
            </button>
          `).join('')}
        </div>
      </div>`
    sheet.querySelectorAll('.rel-cat-tile').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.relUiStage = 'person'
        state.relActiveGroupId = btn.dataset.id
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
      if (state.relUiStage === 'person') {
        state.relUiStage = 'category'
        state.relActiveGroupId = ''
        renderRelative()
        return
      }
      state.relKeys.pop()
      state.relLabels.pop()
      state.relUiStage = 'category'
      state.relActiveGroupId = ''
      renderRelative()
    })
    document.getElementById('rel-reset').addEventListener('click', () => {
      state.relKeys = []
      state.relLabels = []
      state.relUiStage = 'category'
      state.relActiveGroupId = ''
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
    document.querySelector('.rel-cat-tile[data-id="parents"]')?.click()
    await sleep(450)
    document.querySelector('.rel-person-tile[data-key="母"]')?.click()
    await sleep(450)
    document.querySelector('.rel-cat-tile[data-id="siblings"]')?.click()
    await sleep(450)
    document.querySelector('.rel-person-tile[data-key="兄"]')?.click()
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
