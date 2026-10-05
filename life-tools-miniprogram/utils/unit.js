const GROUPS = {
  length: {
    name: '长度',
    units: [
      { id: 'm', name: '米', toBase: 1 },
      { id: 'cm', name: '厘米', toBase: 0.01 },
      { id: 'mm', name: '毫米', toBase: 0.001 },
      { id: 'km', name: '千米', toBase: 1000 },
      { id: 'inch', name: '英寸', toBase: 0.0254 },
      { id: 'chi', name: '市尺', toBase: 1 / 3 }
    ]
  },
  weight: {
    name: '重量',
    units: [
      { id: 'kg', name: '千克', toBase: 1 },
      { id: 'g', name: '克', toBase: 0.001 },
      { id: 'jin', name: '斤', toBase: 0.5 },
      { id: 'liang', name: '两', toBase: 0.05 },
      { id: 'lb', name: '磅', toBase: 0.45359237 }
    ]
  },
  temperature: {
    name: '温度',
    units: [
      { id: 'c', name: '摄氏度' },
      { id: 'f', name: '华氏度' },
      { id: 'k', name: '开尔文' }
    ]
  }
}

function convertTemperature(value, from, to) {
  let c
  if (from === 'c') c = value
  else if (from === 'f') c = ((value - 32) * 5) / 9
  else c = value - 273.15

  if (to === 'c') return c
  if (to === 'f') return (c * 9) / 5 + 32
  return c + 273.15
}

function convert({ group, value, from, to }) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (group === 'temperature') {
    return convertTemperature(n, from, to)
  }
  const conf = GROUPS[group]
  const a = conf.units.find((u) => u.id === from)
  const b = conf.units.find((u) => u.id === to)
  if (!a || !b) return null
  const base = n * a.toBase
  return base / b.toBase
}

module.exports = { GROUPS, convert }
