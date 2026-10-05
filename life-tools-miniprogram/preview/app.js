(function () {
  const TOOLS = [
    { emoji: '🏠', name: '房贷计算器', desc: '等额本息 / 等额本金月供速算', panel: 'mortgage' },
    { emoji: '💼', name: '工资个税估算', desc: '税后收入快速估算', panel: 'mortgage' },
    { emoji: '🗓️', name: '退休年龄查询', desc: '渐进式延迟退休估算', panel: 'tools' },
    { emoji: '👪', name: '亲戚称呼计算', desc: '快速弄清该叫什么', panel: 'relative' },
    { emoji: '🎯', name: '倒数日', desc: '记录人生关键日', panel: 'countdown' },
    { emoji: '📏', name: '单位换算', desc: '长度 / 重量 / 温度', panel: 'tools' }
  ]

  const REL_OPTIONS = [
    ['父', '爸爸'], ['母', '妈妈'], ['夫', '丈夫'], ['妻', '妻子'],
    ['兄', '哥哥'], ['弟', '弟弟'], ['姐', '姐姐'], ['妹', '妹妹'],
    ['子', '儿子'], ['女', '女儿']
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
    const grid = document.getElementById('tool-grid')
    grid.innerHTML = TOOLS.map((t) => `
      <article class="tool" data-panel="${t.panel}">
        <div class="bubble">${t.emoji}</div>
        <div class="name">${t.name}</div>
        <div class="desc">${t.desc}</div>
      </article>
    `).join('')
    grid.querySelectorAll('.tool').forEach((el) => {
      el.addEventListener('click', () => switchPanel(el.dataset.panel))
    })
  }

  function renderRelativeOptions() {
    const box = document.getElementById('rel-options')
    box.innerHTML = REL_OPTIONS.map(([key, label]) => `<button type="button" data-key="${key}" data-label="${label}">${label}</button>`).join('')
    box.onclick = (e) => {
      const btn = e.target.closest('button[data-key]')
      if (!btn) return
      if (state.relKeys.length >= 4) return
      state.relKeys.push(btn.dataset.key)
      state.relLabels.push(btn.dataset.label)
      document.getElementById('rel-path').textContent = `我${state.relLabels.map((x) => ` 的 ${x}`).join('')}`
    }
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
      focus.innerHTML = `<div class="kicker">好算生活 · 倒数日</div><div class="title">${f.emoji} ${f.title}</div><div class="num">${f.abs}</div><div class="unit">${unit}</div>`
    } else {
      focus.innerHTML = `<div class="title">倒数日</div><div class="unit">把想奔赴的日子，放在眼前</div>`
    }
    list.innerHTML = enriched.map((item) => {
      const unit = item.delta < 0 ? '天前' : item.delta === 0 ? '就是今天' : '天后'
      return `<div class="cd-item"><div><strong>${item.emoji} ${item.title}</strong><div style="color:var(--muted);font-size:12px;margin-top:4px">${item.date}</div></div><div class="count">${item.abs}<span class="unit">${unit}</span></div></div>`
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
      document.getElementById('rel-path').textContent = state.relLabels.length
        ? `我${state.relLabels.map((x) => ` 的 ${x}`).join('')}`
        : '我'
    })
    document.getElementById('rel-reset').addEventListener('click', () => {
      state.relKeys = []
      state.relLabels = []
      document.getElementById('rel-path').textContent = '我'
      document.getElementById('rel-result').classList.add('hidden')
    })
    document.getElementById('rel-calc').addEventListener('click', () => {
      const key = state.relKeys.join('')
      const title = REL_MAP[key] || (key ? '暂未收录' : '请选择关系')
      const box = document.getElementById('rel-result')
      box.classList.remove('hidden')
      box.innerHTML = `<div class="label">应该称呼</div><div class="value">${title}</div>`
    })

    document.getElementById('cd-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const title = document.getElementById('cd-title').value.trim()
      const date = document.getElementById('cd-date').value
      if (!title || !date) return
      state.countdowns.unshift({ title, date, emoji: '🎯' })
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
    await sleep(600)
    switchPanel('mortgage')
    await sleep(500)
    document.getElementById('mortgage-form').requestSubmit()
    await sleep(900)
    switchPanel('relative')
    await sleep(400)
    const opt = document.getElementById('rel-options')
    const mom = opt.querySelector('button[data-key="母"]')
    const bro = opt.querySelector('button[data-key="兄"]')
    mom && mom.click()
    await sleep(250)
    bro && bro.click()
    await sleep(250)
    document.getElementById('rel-calc').click()
    await sleep(900)
    switchPanel('countdown')
    await sleep(400)
    document.getElementById('cd-title').value = '旅行'
    const future = new Date()
    future.setDate(future.getDate() + 45)
    document.getElementById('cd-date').value = future.toISOString().slice(0, 10)
    document.getElementById('cd-form').requestSubmit()
    await sleep(700)
    switchPanel('tools')
  }

  function init() {
    renderTools()
    renderRelativeOptions()
    bindEvents()
    const dateInput = document.getElementById('cd-date')
    const next = new Date()
    next.setMonth(next.getMonth() + 6)
    dateInput.value = next.toISOString().slice(0, 10)
    state.countdowns = [
      { title: '元旦', date: `${new Date().getFullYear() + 1}-01-01`, emoji: '🎊' },
      { title: '高考', date: dateInput.value, emoji: '📚' }
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
