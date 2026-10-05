/**
 * 亲戚称呼：基于常见关系链的简化词典
 * 选项按「父母 / 配偶 / 兄弟姐妹 / 子女」分组，便于移动端逐级点选
 */

const EDGE = {
  父: { male: '爸爸', female: null, nextSex: 'male' },
  母: { male: null, female: '妈妈', nextSex: 'female' },
  夫: { male: '丈夫', female: null, nextSex: 'male' },
  妻: { male: null, female: '妻子', nextSex: 'female' },
  兄: { male: '哥哥', female: null, nextSex: 'male' },
  弟: { male: '弟弟', female: null, nextSex: 'male' },
  姐: { male: null, female: '姐姐', nextSex: 'female' },
  妹: { male: null, female: '妹妹', nextSex: 'female' },
  子: { male: '儿子', female: null, nextSex: 'male' },
  女: { male: null, female: '女儿', nextSex: 'female' }
}

const MAP = {
  父: '爸爸',
  母: '妈妈',
  夫: '老公',
  妻: '老婆',
  兄: '哥哥',
  弟: '弟弟',
  姐: '姐姐',
  妹: '妹妹',
  子: '儿子',
  女: '女儿',
  父父: '爷爷',
  父母: '奶奶',
  母父: '外公',
  母母: '外婆',
  父兄: '伯伯',
  父弟: '叔叔',
  父姐: '姑妈',
  父妹: '姑妈',
  母兄: '舅舅',
  母弟: '舅舅',
  母姐: '姨妈',
  母妹: '姨妈',
  兄子: '侄子',
  兄女: '侄女',
  弟子: '侄子',
  弟女: '侄女',
  姐子: '外甥',
  姐女: '外甥女',
  妹子: '外甥',
  妹女: '外甥女',
  父子: '兄弟',
  父女: '姐妹',
  母子: '兄弟',
  母女: '姐妹',
  父父子: '堂兄弟',
  父父女: '堂姐妹',
  父兄子: '堂兄弟',
  父兄女: '堂姐妹',
  父弟子: '堂兄弟',
  父弟女: '堂姐妹',
  母兄子: '表兄弟',
  母兄女: '表姐妹',
  母弟子: '表兄弟',
  母弟女: '表姐妹',
  父姐子: '表兄弟',
  父姐女: '表姐妹',
  父妹子: '表兄弟',
  父妹女: '表姐妹',
  母姐子: '表兄弟',
  母姐女: '表姐妹',
  母妹子: '表兄弟',
  母妹女: '表姐妹',
  妻父: '岳父',
  妻母: '岳母',
  夫父: '公公',
  夫母: '婆婆',
  妻兄: '内兄',
  妻弟: '内弟',
  妻姐: '大姨子',
  妻妹: '小姨子',
  夫兄: '大伯子',
  夫弟: '小叔子',
  夫姐: '大姑子',
  夫妹: '小姑子',
  子子: '孙子',
  子女: '孙女',
  女子: '外孙',
  女女: '外孙女'
}

const OPTION_GROUPS = [
  {
    id: 'parents',
    title: '父母长辈',
    items: [
      { key: '父', label: '爸爸', hint: '父亲' },
      { key: '母', label: '妈妈', hint: '母亲' }
    ]
  },
  {
    id: 'spouse',
    title: '配偶',
    items: [
      { key: '夫', label: '丈夫', hint: '老公' },
      { key: '妻', label: '妻子', hint: '老婆' }
    ]
  },
  {
    id: 'siblings',
    title: '兄弟姐妹',
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
    items: [
      { key: '子', label: '儿子', hint: '儿子' },
      { key: '女', label: '女儿', hint: '女儿' }
    ]
  }
]

// 兼容旧引用
const OPTIONS = OPTION_GROUPS.reduce((acc, g) => acc.concat(g.items), [])

function calcRelative(pathKeys) {
  if (!pathKeys || !pathKeys.length) {
    return { title: '', tip: '请选择关系路径，例如：妈妈 → 哥哥', empty: true }
  }
  if (pathKeys.length > 4) {
    return { title: '关系过远', tip: '暂支持 4 层以内常见称呼，建议拆开问。' }
  }
  const key = pathKeys.join('')
  const title = MAP[key]
  if (title) {
    return {
      title,
      tip: `关系链：我 → ${pathKeys.map((k) => (EDGE[k] ? EDGE[k].male || EDGE[k].female : k)).join(' → ')}`,
      shareText: `【好算生活】这段亲戚关系应该叫「${title}」`
    }
  }
  return {
    title: '暂未收录',
    tip: '这对组合暂时没有标准简表，可回退一层换个近亲路径。',
    shareText: '【好算生活】亲戚称呼计算'
  }
}

module.exports = { OPTIONS, OPTION_GROUPS, calcRelative, MAP, EDGE }
