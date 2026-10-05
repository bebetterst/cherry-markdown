/**
 * 亲戚称呼：关系链词典 + 性别过滤 + 地方别称
 * 栏位最多 4 层；候选按当前节点性别过滤（男不可选夫、女不可选妻）
 */

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

/** 标准称呼（尽量覆盖 4 层内常见组合） */
const MAP = {
  // —— 1 层 ——
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

  // —— 2 层：祖辈 / 姻亲父母 / 叔伯姑舅姨 / 侄甥 / 孙 ——
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
  夫父: '公公',
  夫母: '婆婆',
  妻父: '岳父',
  妻母: '岳母',
  夫兄: '大伯子',
  夫弟: '小叔子',
  夫姐: '大姑子',
  夫妹: '小姑子',
  妻兄: '内兄',
  妻弟: '内弟',
  妻姐: '大姨子',
  妻妹: '小姨子',
  兄子: '侄子',
  兄女: '侄女',
  弟子: '侄子',
  弟女: '侄女',
  姐子: '外甥',
  姐女: '外甥女',
  妹子: '外甥',
  妹女: '外甥女',
  父子: '自己 / 兄弟',
  父女: '自己 / 姐妹',
  母子: '自己 / 兄弟',
  母女: '自己 / 姐妹',
  子子: '孙子',
  子女: '孙女',
  女子: '外孙',
  女女: '外孙女',
  子妻: '儿媳',
  女夫: '女婿',
  兄妻: '嫂子',
  弟妻: '弟妹',
  姐夫: '姐夫',
  妹夫: '妹夫',
  // 直系配偶互指（归约前也可直接命中）
  父妻: '妈妈',
  母夫: '爸爸',
  夫妻: '自己',
  妻夫: '自己',
  子父: '自己',
  女父: '自己',
  子母: '自己',
  女母: '自己',
  兄父: '爸爸',
  弟父: '爸爸',
  姐父: '爸爸',
  妹父: '爸爸',
  兄母: '妈妈',
  弟母: '妈妈',
  姐母: '妈妈',
  妹母: '妈妈',
  父父兄: '伯祖父',
  父父弟: '叔祖父',
  父父姐: '姑奶奶',
  父父妹: '姑奶奶',
  父母兄: '舅公',
  父母弟: '舅公',
  父母姐: '姨婆',
  父母妹: '姨婆',
  母父兄: '伯外祖父',
  母父弟: '叔外祖父',
  母母兄: '舅公',
  母母弟: '舅公',

  // —— 3 层：曾祖 / 堂表 / 甥侄姻亲 / 孙配偶等 ——
  父父父: '曾祖父',
  父父母: '曾祖母',
  父母父: '曾外祖父',
  父母母: '曾外祖母',
  母父父: '外曾祖父',
  母父母: '外曾祖母',
  母母父: '外曾外祖父',
  母母母: '外曾外祖母',

  // 祖辈的子女：可能是父母本人，也可能是伯叔姑舅姨（歧义并列）
  父父子: '爸爸 / 伯伯 / 叔叔',
  父父女: '姑妈',
  父母子: '爸爸 / 伯伯 / 叔叔',
  父母女: '姑妈',
  母父子: '妈妈 / 舅舅',
  母父女: '妈妈 / 姨妈',
  母母子: '妈妈 / 舅舅',
  母母女: '妈妈 / 姨妈',

  // 从「祖辈的子女」再下一辈：可能是自己/同胞，也可能是堂表
  父父子子: '自己 / 兄弟 / 堂兄弟',
  父父子女: '自己 / 姐妹 / 堂姐妹',
  父父女子: '自己 / 兄弟 / 表兄弟',
  父父女女: '自己 / 姐妹 / 表姐妹',
  父母子子: '自己 / 兄弟 / 堂兄弟',
  父母子女: '自己 / 姐妹 / 堂姐妹',
  母父子子: '自己 / 兄弟 / 表兄弟',
  母父子女: '自己 / 姐妹 / 表姐妹',
  母母子子: '自己 / 兄弟 / 表兄弟',
  母母子女: '自己 / 姐妹 / 表姐妹',

  // 父/母之兄弟的子女 = 堂表（无歧义）
  父兄子: '堂兄弟',
  父兄女: '堂姐妹',
  父弟子: '堂兄弟',
  父弟女: '堂姐妹',
  父姐子: '表兄弟',
  父姐女: '表姐妹',
  父妹子: '表兄弟',
  父妹女: '表姐妹',

  母兄子: '表兄弟',
  母兄女: '表姐妹',
  母弟子: '表兄弟',
  母弟女: '表姐妹',
  母姐子: '表兄弟',
  母姐女: '表姐妹',
  母妹子: '表兄弟',
  母妹女: '表姐妹',

  父兄妻: '伯娘',
  父弟妻: '婶婶',
  父姐夫: '姑父',
  父妹夫: '姑父',
  母兄妻: '舅妈',
  母弟妻: '舅妈',
  母姐夫: '姨父',
  母妹夫: '姨父',

  兄子子: '侄孙',
  兄子女: '侄孙女',
  弟子子: '侄孙',
  弟子女: '侄孙女',
  姐子子: '外甥孙',
  姐子女: '外甥孙女',
  妹子子: '外甥孙',
  妹子女: '外甥孙女',
  兄女子: '侄外孙',
  兄女女: '侄外孙女',
  弟女子: '侄外孙',
  弟女女: '侄外孙女',
  姐女子: '外甥外孙',
  姐女女: '外甥外孙女',
  妹女子: '外甥外孙',
  妹女女: '外甥外孙女',

  子子子: '曾孙',
  子子女: '曾孙女',
  子女子: '曾外孙',
  子女女: '曾外孙女',
  女子子: '外曾孙',
  女子女: '外曾孙女',
  女女子: '外曾外孙',
  女女女: '外曾外孙女',

  子子妻: '孙媳',
  子女夫: '孙女婿',
  女子妻: '外孙媳',
  女女夫: '外孙女婿',

  夫父父: '太公',
  夫父母: '太婆',
  妻父父: '太岳父',
  妻父母: '太岳母',
  夫父兄: '伯公',
  夫父弟: '叔公',
  夫父姐: '姑奶奶',
  夫父妹: '姑奶奶',
  夫母兄: '舅公',
  夫母弟: '舅公',
  夫母姐: '姨奶奶',
  夫母妹: '姨奶奶',
  妻父兄: '伯岳父',
  妻父弟: '叔岳父',
  妻母兄: '舅岳父',
  妻母弟: '舅岳父',

  夫兄子: '侄子',
  夫兄女: '侄女',
  夫弟子: '侄子',
  夫弟女: '侄女',
  夫姐子: '外甥',
  夫姐女: '外甥女',
  夫妹子: '外甥',
  夫妹女: '外甥女',
  妻兄子: '内侄',
  妻兄女: '内侄女',
  妻弟子: '内侄',
  妻弟女: '内侄女',
  妻姐子: '姨侄',
  妻姐女: '姨侄女',
  妻妹子: '姨侄',
  妻妹女: '姨侄女',

  兄妻子: '侄子',
  兄妻女: '侄女',
  弟妻子: '侄子',
  弟妻女: '侄女',
  姐夫子: '外甥',
  姐夫女: '外甥女',
  妹夫子: '外甥',
  妹夫女: '外甥女',

  // —— 4 层：堂表再下一辈 / 高祖等常见 ——
  // 注：父父子子 / 父父女子 等歧义项已在上方定义为「自己/同胞/堂表」，此处不重复覆盖
  父父父父: '高祖父',
  父父父母: '高祖母',
  父兄子子: '堂侄',
  父兄子女: '堂侄女',
  父弟子子: '堂侄',
  父弟子女: '堂侄女',
  父兄女子: '堂侄女',
  父兄女女: '堂侄女',
  父弟女子: '堂侄女',
  父弟女女: '堂侄女',

  父姐子子: '表侄',
  父姐子女: '表侄女',
  父妹子子: '表侄',
  父妹子女: '表侄女',
  母兄子子: '表侄',
  母兄子女: '表侄女',
  母弟子子: '表侄',
  母弟子女: '表侄女',
  母姐子子: '表侄',
  母姐子女: '表侄女',
  母妹子子: '表侄',
  母妹子女: '表侄女',

  父父子妻: '妈妈 / 伯娘 / 婶婶',
  父父女夫: '姑父',
  父母子妻: '妈妈 / 伯娘 / 婶婶',
  父母女夫: '姑父',
  母父子妻: '妈妈 / 舅妈',
  母父女夫: '姨父',
  母母子妻: '妈妈 / 舅妈',
  母母女夫: '姨父',
  父兄子妻: '堂侄媳',
  父兄女夫: '堂侄女婿',
  父弟子妻: '堂侄媳',
  父弟女夫: '堂侄女婿',
  母兄子妻: '表侄媳',
  母兄女夫: '表侄女婿',
  母弟子妻: '表侄媳',
  母弟女夫: '表侄女婿',

  父父父子: '堂叔伯兄弟',
  父父父女: '堂叔伯姐妹',
  父父母子: '堂叔伯兄弟',
  父父母女: '堂叔伯姐妹',

  子子子子: '玄孙',
  子子子女: '玄孙女',
  子子妻子: '曾孙',
  子女夫子: '曾外孙',

  夫父父子: '堂叔',
  夫父母子: '堂叔',
  妻父父子: '堂舅',
  妻父母子: '堂舅'
}

/** 地方 / 口语别称（不取代标准称呼，并列展示） */
const ALIASES = {
  自己: ['本人', '我'],
  伯祖父: ['伯公', '大爷'],
  叔祖父: ['叔公', '老爹'],
  姑奶奶: ['姑婆', '姑奶奶'],
  舅公: ['舅爷', '舅老爷'],
  姨婆: ['姨奶奶', '姨姥姥'],
  伯外祖父: ['外伯公'],
  叔外祖父: ['外叔公'],
  爸爸: ['父亲', '爹', '阿爸', '老爹'],
  妈妈: ['母亲', '娘', '阿妈', '老妈'],
  老公: ['丈夫', '先生', '外头人'],
  老婆: ['妻子', '太太', '屋里人', '婆娘(方言)'],
  哥哥: ['兄长', '阿哥'],
  弟弟: ['兄弟', '阿弟'],
  姐姐: ['阿姐', '家姐(粤)'],
  妹妹: ['阿妹', '细妹(粤)'],
  儿子: ['崽', '仔(粤/闽)'],
  女儿: ['闺女', '囡囡', '姑娘'],

  爷爷: ['祖父', '阿爷', '嗲嗲(湘)'],
  奶奶: ['祖母', '阿嫲(客)', '娭毑(湘)'],
  外公: ['外祖父', '姥爷', '公公(吴语)', '外爷'],
  外婆: ['外祖母', '姥姥', '婆婆(吴语)', '阿婆'],
  伯伯: ['伯父', '大爷', '大爹(川渝)'],
  叔叔: ['叔父', '阿叔', '老爹(部分方言)'],
  姑妈: ['姑姑', '姑母', '嬢嬢(川渝)', '姑姐(粤)'],
  舅舅: ['舅父', '娘舅', '舅仔(部分方言)'],
  姨妈: ['姨母', '阿姨', '姨妈', '姨娘'],

  公公: ['公爹', '老爷子'],
  婆婆: ['婆母', '老太太'],
  岳父: ['丈人', '泰山', '老丈人'],
  岳母: ['丈母娘', '泰水'],
  大伯子: ['大伯', '夫兄'],
  小叔子: ['小叔', '夫弟'],
  大姑子: ['大姑', '姑奶'],
  小姑子: ['小姑', '姑子'],
  内兄: ['大舅子', '妻兄'],
  内弟: ['小舅子', '妻弟'],
  大姨子: ['大姨', '妻姐'],
  小姨子: ['小姨', '妻妹'],

  侄子: ['犹子', '阿侄'],
  侄女: ['犹女'],
  外甥: ['甥'],
  外甥女: ['甥女'],
  孙子: ['孙儿'],
  孙女: ['孙囡'],
  外孙: ['外孙仔'],
  外孙女: ['外孙囡'],
  儿媳: ['媳妇', '儿妇'],
  女婿: ['姑爷', '半子'],
  嫂子: ['嫂', '阿嫂'],
  弟妹: ['弟妇', '婶子(口语)'],
  姐夫: ['姊夫'],
  妹夫: ['妹婿'],

  曾祖父: ['太爷爷', '老爷爷'],
  曾祖母: ['太奶奶', '老奶奶'],
  外曾祖父: ['太姥爷'],
  外曾祖母: ['太姥姥'],
  堂兄弟: ['叔伯兄弟', '堂哥/堂弟'],
  堂姐妹: ['叔伯姐妹', '堂姐/堂妹'],
  表兄弟: ['表哥/表弟', '姑表/舅表'],
  表姐妹: ['表姐/表妹'],
  伯娘: ['伯母', '大娘'],
  婶婶: ['婶母', '叔母', '阿婶'],
  姑父: ['姑丈', '姑爹'],
  舅妈: ['舅母', '妗子', '妗母'],
  姨父: ['姨丈', '姨爹'],
  曾孙: ['重孙'],
  曾孙女: ['重孙女'],
  玄孙: ['元孙'],
  堂侄: ['叔伯侄子'],
  表侄: ['表侄子'],
  内侄: ['妻侄'],
  姨侄: ['襟侄(口语)']
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

/** 当前关系链末端人物的性别；起点「我」为 unknown */
function sexAtPath(pathKeys) {
  if (!pathKeys || !pathKeys.length) return 'unknown'
  const last = pathKeys[pathKeys.length - 1]
  return EDGE[last] ? EDGE[last].nextSex : 'unknown'
}

/**
 * 按当前栏位之前已选路径，过滤明显不合理选项：
 * - 男的不能再选「丈夫/老公」
 * - 女的不能再选「妻子/老婆」
 */
function filterOptionsBySex(pathKeysBeforeSlot) {
  const sex = sexAtPath(pathKeysBeforeSlot)
  return OPTION_DEFS.filter((opt) => {
    if (opt.key === '夫' && sex === 'male') return false
    if (opt.key === '妻' && sex === 'female') return false
    return true
  })
}

function groupOptions(items) {
  const map = {}
  GROUP_ORDER.forEach((g) => {
    map[g] = []
  })
  items.forEach((item) => {
    if (!map[item.group]) map[item.group] = []
    map[item.group].push(item)
  })
  return GROUP_ORDER.filter((g) => map[g] && map[g].length).map((title) => ({
    title,
    items: map[title]
  }))
}

/** 某栏位可选关系（已按性别过滤并分组） */
function getCandidateGroups(pathKeys, slotIndex) {
  const before = (pathKeys || []).slice(0, slotIndex)
  return groupOptions(filterOptionsBySex(before))
}

function pathLabels(pathKeys) {
  return (pathKeys || []).map((k) => (EDGE[k] ? EDGE[k].label : k))
}

/** 直接查词典（不做归约），供已归一化路径的栏位展示 */
function lookupTitle(pathKeys) {
  if (!pathKeys || !pathKeys.length) return ''
  return MAP[pathKeys.join('')] || ''
}

/**
 * 栏位展示名：优先用「到该层为止」的称呼（如 父父 → 爷爷），
 * 歧义称呼保留完整「爸爸 / 伯伯 / 叔叔」
 */
function progressiveLabels(pathKeys) {
  return (pathKeys || []).map((_, i) => {
    const prefix = pathKeys.slice(0, i + 1)
    const title = lookupTitle(prefix)
    if (title && title !== '暂未收录' && title !== '关系过远') return title
    const k = pathKeys[i]
    return EDGE[k] ? EDGE[k].label : k
  })
}

/**
 * 选完一层后归一化：折叠发生则用归约链替换原链，后续从此人继续算
 * @returns {{ keys: string[], folded: boolean, title: string, beforeLen: number }}
 */
function normalizePathKeys(pathKeys) {
  const beforeLen = (pathKeys || []).length
  const reduced = reducePath(pathKeys || [])
  if (reduced.self) {
    return { keys: [], folded: beforeLen > 0, title: '自己', beforeLen }
  }
  const folded = reduced.steps.length > 0 && reduced.keys.join('') !== (pathKeys || []).join('')
  const title = lookupTitle(reduced.keys) || ''
  return { keys: reduced.keys.slice(), folded, title, beforeLen }
}

function aliasesOf(title) {
  if (!title) return []
  if (title.indexOf(' / ') >= 0) {
    const parts = title.split(' / ')
    const extra = []
    parts.forEach((p) => {
      const list = ALIASES[p] || []
      list.forEach((a) => {
        if (extra.indexOf(a) < 0 && parts.indexOf(a) < 0) extra.push(a)
      })
    })
    return extra
  }
  const list = ALIASES[title]
  return list ? list.slice() : []
}

/**
 * 关系链归约：把「妈妈的丈夫」「爸爸的妻子」等语义折叠成更短的标准链
 * 例：父→母→夫 ⇒ 父→父 ⇒ 爷爷
 * 规则为二元改写，反复扫描直至无法再缩（参考常见亲戚称谓计算器思路）
 */
const REDUCE_PAIR = {
  // 父母 ↔ 配偶
  母夫: ['父'],
  父妻: ['母'],
  夫妻: [], // 回到「我」
  妻夫: [],

  // 子女的父母 → 我（若性别不符则为配偶，见 SELF_GENDER_NOTE）
  子父: [],
  女父: [],
  子母: [],
  女母: [],

  // 兄弟姐妹的父母 = 自己的父母
  兄父: ['父'],
  弟父: ['父'],
  姐父: ['父'],
  妹父: ['父'],
  兄母: ['母'],
  弟母: ['母'],
  姐母: ['母'],
  妹母: ['母'],

  // 子女的兄弟姐妹仍是自己的子女
  子兄: ['子'],
  子弟: ['子'],
  子姐: ['女'],
  子妹: ['女'],
  女兄: ['子'],
  女弟: ['子'],
  女姐: ['女'],
  女妹: ['女'],

  // 配偶的子女 = 自己的子女（继亲按直系简化）
  夫子: ['子'],
  夫女: ['女'],
  妻子: ['子'],
  妻女: ['女']
}

/** 归约到「自己」时，若路径含子女父母反向，提示性别歧义 */
const SELF_VIA_CHILD_PARENT = new Set(['子父', '女父', '子母', '女母'])

function reducePath(pathKeys) {
  if (!pathKeys || !pathKeys.length) {
    return { keys: [], self: false, steps: [] }
  }
  let keys = pathKeys.slice()
  const steps = []
  let guard = 0
  while (guard < 32) {
    guard += 1
    let hit = false
    for (let i = 0; i < keys.length - 1; i += 1) {
      const pair = keys[i] + keys[i + 1]
      if (!Object.prototype.hasOwnProperty.call(REDUCE_PAIR, pair)) continue
      const repl = REDUCE_PAIR[pair]
      const before = keys.slice()
      keys = keys.slice(0, i).concat(repl, keys.slice(i + 2))
      steps.push({
        pair,
        from: before,
        to: keys.slice(),
        viaChildParent: SELF_VIA_CHILD_PARENT.has(pair)
      })
      hit = true
      break
    }
    if (!hit) break
  }
  return { keys, self: keys.length === 0, steps }
}

function formatChain(keys) {
  if (!keys.length) return '我'
  const labels = progressiveLabels(keys)
  return `我 → ${labels.join(' → ')}`
}

function calcRelative(pathKeys) {
  if (!pathKeys || !pathKeys.length) {
    return {
      title: '',
      aliases: [],
      aliasText: '',
      tip: '从第 1 栏开始点选关系',
      empty: true,
      reducedKeys: [],
      folded: false,
      ambiguous: false,
      continueFrom: '',
      shareText: '好算生活｜亲戚称呼计算'
    }
  }
  if (pathKeys.length > 4) {
    return {
      title: '关系过远',
      aliases: [],
      aliasText: '',
      tip: '暂支持 4 层以内常见称呼。',
      empty: false,
      reducedKeys: pathKeys.slice(),
      folded: false,
      ambiguous: false,
      continueFrom: '',
      shareText: '【好算生活】亲戚称呼计算'
    }
  }

  const rawChain = `我 → ${pathLabels(pathKeys).join(' → ')}`
  const reduced = reducePath(pathKeys)
  const lookupKeys = reduced.keys
  const folded = reduced.steps.length > 0 && lookupKeys.join('') !== pathKeys.join('')
  const viaChildParent = reduced.steps.some((s) => s.viaChildParent)

  // 归约到自己
  if (reduced.self) {
    const title = '自己'
    const genderTip = viaChildParent
      ? '（若你的性别与「子女的父/母」角色不一致，则对方是你的配偶）'
      : ''
    return {
      title,
      aliases: ['本人', '我'],
      aliasText: genderTip ? `说明：${genderTip.replace(/[（）]/g, '')}` : '地方 / 口语也叫：本人',
      tip: genderTip
        ? `${rawChain} → 已折叠为「自己」${genderTip}`
        : `${rawChain} → 已折叠为「自己」`,
      empty: false,
      reducedKeys: [],
      folded: true,
      ambiguous: false,
      continueFrom: '自己',
      shareText: '【好算生活】这段关系指向「自己」'
    }
  }

  const title = MAP[lookupKeys.join('')] || MAP[pathKeys.join('')]
  const usedKeys = MAP[lookupKeys.join('')] ? lookupKeys : pathKeys
  const niceChain = formatChain(usedKeys)
  const ambiguous = !!(title && title.indexOf(' / ') >= 0)
  const continueFrom = title && title !== '暂未收录' ? title.split(' / ')[0] : ''

  let tip = folded
    ? `${rawChain} → 已折叠为「${title || niceChain}」，后续从此人继续算`
    : niceChain
  if (ambiguous) {
    tip += '。存在多种可能，请结合家谱实际情况判断'
  }

  if (title) {
    const aliases = aliasesOf(title)
    let aliasText = ''
    if (ambiguous) {
      aliasText = `可能称呼：${title}`
      if (aliases.length) aliasText += `；口语也叫 ${aliases.slice(0, 4).join('、')}`
    } else if (aliases.length) {
      aliasText = `地方 / 口语也叫：${aliases.join('、')}`
    }
    return {
      title,
      aliases,
      aliasText,
      tip,
      empty: false,
      reducedKeys: usedKeys.slice(),
      folded,
      ambiguous,
      continueFrom,
      shareText: `【好算生活】这段亲戚应叫「${title}」`
    }
  }

  return {
    title: '暂未收录',
    aliases: [],
    aliasText: '',
    tip: `${folded ? tip : niceChain}。这对组合暂无标准简表，可改选近亲路径。`,
    empty: false,
    reducedKeys: lookupKeys.slice(),
    folded,
    ambiguous: false,
    continueFrom: '',
    shareText: '【好算生活】亲戚称呼计算'
  }
}


/** 兼容旧引用 */
const OPTION_GROUPS = [
  {
    id: 'parents',
    title: '父母长辈',
    desc: '爸爸、妈妈',
    icon: './icons/cat-parents.png',
    items: OPTION_DEFS.filter((i) => i.group === '父母')
  },
  {
    id: 'spouse',
    title: '配偶',
    desc: '丈夫、妻子',
    icon: './icons/cat-spouse.png',
    items: OPTION_DEFS.filter((i) => i.group === '配偶')
  },
  {
    id: 'siblings',
    title: '兄弟姐妹',
    desc: '兄姐弟妹',
    icon: './icons/cat-sibling.png',
    items: OPTION_DEFS.filter((i) => i.group === '同胞')
  },
  {
    id: 'children',
    title: '子女晚辈',
    desc: '儿子、女儿',
    icon: './icons/cat-child.png',
    items: OPTION_DEFS.filter((i) => i.group === '子女')
  }
]

const OPTIONS = OPTION_DEFS.slice()

module.exports = {
  EDGE,
  MAP,
  ALIASES,
  OPTIONS,
  OPTION_DEFS,
  OPTION_GROUPS,
  REDUCE_PAIR,
  sexAtPath,
  filterOptionsBySex,
  getCandidateGroups,
  pathLabels,
  progressiveLabels,
  lookupTitle,
  normalizePathKeys,
  reducePath,
  calcRelative
}
