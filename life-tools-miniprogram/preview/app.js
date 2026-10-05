(function () {
  const TOOLS = [
    { code: '房', name: '房贷计算器', desc: '等额本息 / 等额本金月供速算', panel: 'mortgage' },
    { code: '税', name: '工资个税估算', desc: '税后收入快速估算', panel: 'mortgage' },
    { code: '退', name: '退休年龄查询', desc: '渐进式延迟退休估算', panel: 'tools' },
    { code: '亲', name: '亲戚称呼计算', desc: '逐级选择关系', panel: 'relative' },
    { code: '日', name: '倒数日', desc: '记录人生关键日', panel: 'countdown' },
    { code: '换', name: '单位换算', desc: '长度 / 重量 / 温度', panel: 'tools' }
  ]

  const GROUPS = [
    { title: '父母长辈', items: [['父', '爸爸', '父亲'], ['母', '妈妈', '母亲']] },
    { title: '配偶', items: [['夫', '丈夫', '老公'], ['妻', '妻子', '老婆']] },
    { title: '兄弟姐妹', items: [['兄', '哥哥', '兄长'], ['弟', '弟弟', '弟弟'], ['姐', '姐姐', '姐姐'], ['妹', '妹妹', '妹妹']] },
    { title: '子女晚辈', items: [['子', '儿子', '儿子'], ['女', '女儿', '女儿']] }
  ]

  const REL_MAP = {
    父: '爸爸', 母: '妈妈', 父父: '爷爷', 父母: '奶奶', 母父: '外公', 母母: '外婆',
    父兄: '伯伯', 父弟: '叔叔', 母兄: '舅舅', 母弟: '舅舅', 母姐: '姨妈', 母妹: '姨妈',
    妻父: '岳父', 妻母: '岳母', 夫父: '公公', 夫母: '婆婆'
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
    const crumbs = document.getElementById('rel-crumbs')
    const preview = document.getElementById('rel-preview')
    const groups = document.getElementById('rel-groups')
    const shareBtn = document.getElementById('rel-share')

    crumbs.innerHTML = `<span class="crumb ${state.relKeys.length ? '' : 'on'}" data-i="-1">我</span>` +
      state.relLabels.map((label, i) => `<span class="crumb-sep">›</span><span class="crumb ${i === state.relLabels.length - 1 ? 'on' : ''}" data-i="${i}">${label}</span>`).join('')

    crumbs.querySelectorAll('.crumb').forEach((el) => {
      el.addEventListener('click', () => {
        const i = Number(el.dataset.i)
        if (i < 0) {
          state.relKeys = []
          state.relLabels = []
        } else {
          state.relKeys = state.relKeys.slice(0, i + 1)
          state.relLabels = state.relLabels.slice(0, i + 1)
        }
        renderRelative()
      })
    })

    const key = state.relKeys.join('')
    const title = REL_MAP[key]
    if (!state.relKeys.length) {
      preview.className = 'preview empty'
      preview.innerHTML = `<div class="label">下一步</div><div class="title" style="font-size:18px;color:var(--muted);font-weight:600">从下方列表点选第一层关系</div>`
      shareBtn.disabled = true
    } else if (title) {
      preview.className = 'preview'
      preview.innerHTML = `<div class="label">当前称呼</div><div class="title">${title}</div>`
      shareBtn.disabled = false
    } else {
      preview.className = 'preview empty'
      preview.innerHTML = `<div class="label">当前称呼</div><div class="title" style="font-size:18px">暂未收录，可回退换路径</div>`
      shareBtn.disabled = true
    }

    if (state.relKeys.length >= 4) {
      groups.innerHTML = `<div class="preview empty">已达 4 层上限，可点路径回退</div>`
      return
    }

    groups.innerHTML = GROUPS.map((g) => `
      <div class="group">
        <div class="group-title">${g.title}</div>
        <div class="group-card">
          ${g.items.map(([key, label, hint]) => `
            <div class="row" data-key="${key}" data-label="${label}">
              <div><div class="t">${label}</div><div class="h">${hint}</div></div>
              <div class="c">›</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')

    groups.querySelectorAll('.row').forEach((row) => {
      row.addEventListener('click', () => {
        if (state.relKeys.length >= 4) return
        state.relKeys.push(row.dataset.key)
        state.relLabels.push(row.dataset.label)
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
      state.relKeys.pop()
      state.relLabels.pop()
      renderRelative()
    })
    document.getElementById('rel-reset').addEventListener('click', () => {
      state.relKeys = []
      state.relLabels = []
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
    // 妈妈
    const mom = [...document.querySelectorAll('#rel-groups .row')].find((el) => el.dataset.key === '母')
    mom && mom.click()
    await sleep(450)
    const bro = [...document.querySelectorAll('#rel-groups .row')].find((el) => el.dataset.key === '兄')
    bro && bro.click()
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
