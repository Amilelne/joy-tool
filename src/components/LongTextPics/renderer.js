import { CANVAS_WIDTH, CANVAS_HEIGHT } from './templates.js'

/**
 * 标题展示样式列表。
 */
export const TITLE_STYLES = [
  { id: 'accent-line', name: '强调短线' },
  { id: 'plain', name: '极简' },
  { id: 'left-bar', name: '左侧竖线' },
  { id: 'underline', name: '底部横线' },
  { id: 'badge', name: '色块徽章' },
  { id: 'box', name: '描边框线' },
  { id: 'gradient', name: '渐变文字' }
]

/* ============================ 工具函数 ============================ */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * 把十六进制颜色转成带透明度的 rgba。
 */
function hexToRgba(hex, alpha) {
  let h = String(hex || '').replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return `rgba(0,0,0,${alpha})`
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * 根据配置生成纯色或线性渐变填充。
 * gradient 形如 [[0,'#aaa'],[1,'#bbb']]，从上到下。
 */
function makeFill(ctx, solid, gradient, x, y, w, h) {
  if (gradient && gradient.length) {
    const g = ctx.createLinearGradient(x, y, x, y + h)
    for (const [offset, color] of gradient) g.addColorStop(offset, color)
    return g
  }
  return solid
}

/**
 * 根据字号与样式构造 canvas 字体字符串。
 * 顺序需为：font-style font-weight font-size font-family。
 */
function fontFor(style, size, { bold = false, italic = false, code = false } = {}) {
  const family = code
    ? '"SF Mono", "Menlo", "Consolas", "Courier New", monospace'
    : style.fontFamily
  const weight = bold ? 'bold' : ''
  const slant = italic ? 'italic' : ''
  const pieces = [slant, weight, `${size}px`, family].filter(Boolean)
  return pieces.join(' ')
}

/* ============================ Markdown 解析 ============================ */

/**
 * 行内富文本解析：加粗 / 斜体 / 行内代码 / 删除线 / 链接。
 * 返回 segments 数组，每项 { text, bold, italic, code, strike, link }。
 */
const INLINE_RE = /(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)|(~~([^~]+)~~)|(\[([^\]]+)\]\(([^)\s]+)\))/g

function parseInline(text) {
  const segments = []
  let last = 0
  let m
  INLINE_RE.lastIndex = 0
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) {
      segments.push({ text: text.slice(last, m.index), bold: false, italic: false, code: false, strike: false, link: '' })
    }
    if (m[2] != null) segments.push({ text: m[2], bold: true, italic: false, code: false, strike: false, link: '' })
    else if (m[4] != null) segments.push({ text: m[4], bold: true, italic: false, code: false, strike: false, link: '' })
    else if (m[6] != null) segments.push({ text: m[6], bold: false, italic: true, code: false, strike: false, link: '' })
    else if (m[8] != null) segments.push({ text: m[8], bold: false, italic: true, code: false, strike: false, link: '' })
    else if (m[10] != null) segments.push({ text: m[10], bold: false, italic: false, code: true, strike: false, link: '' })
    else if (m[12] != null) segments.push({ text: m[12], bold: false, italic: false, code: false, strike: true, link: '' })
    else if (m[14] != null) segments.push({ text: m[14], bold: false, italic: false, code: false, strike: false, link: m[15] })
    last = INLINE_RE.lastIndex
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), bold: false, italic: false, code: false, strike: false, link: '' })
  }
  return segments
}

/**
 * 块级解析：把原始文本拆成块。
 * 支持：代码块（```）、标题、无序/有序列表、引用、分隔线、段落、空行（间隔）。
 */
function parseBlocks(text) {
  const blocks = []
  const lines = text.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // 代码块
    if (trimmed.startsWith('```')) {
      const code = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i++
      }
      i++ // 跳过结束的 ```
      blocks.push({ type: 'code', lines: code })
      continue
    }

    // 空行 -> 段落间隔
    if (trimmed === '') {
      blocks.push({ type: 'gap' })
      i++
      continue
    }

    // 分隔线
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // 标题
    const hm = /^(#{1,6})\s+(.*)$/.exec(line)
    if (hm) {
      blocks.push({ type: 'heading', level: hm[1].length, text: hm[2] })
      i++
      continue
    }

    // 无序列表
    const bm = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (bm) {
      blocks.push({ type: 'bullet', text: bm[1] })
      i++
      continue
    }

    // 有序列表
    const om = /^\s*(\d+)[.)]\s+(.*)$/.exec(line)
    if (om) {
      blocks.push({ type: 'ordered', num: om[1], text: om[2] })
      i++
      continue
    }

    // 引用
    if (/^\s*>/.test(line)) {
      blocks.push({ type: 'quote', text: line.replace(/^\s*>\s?/, '') })
      i++
      continue
    }

    // 普通段落
    blocks.push({ type: 'paragraph', text: line })
    i++
  }
  return blocks
}

/**
 * 各级标题的字号缩放。
 */
function headingFontSize(style, level) {
  const scale = [0, 1.5, 1.3, 1.15, 1.05, 1.0, 0.95][level] || 1.0
  return Math.round(style.fontSize * scale)
}

/**
 * 把带样式的 segments 展开成「字符-样式」流，按可用宽度换行。
 * 返回若干行，每行是字符数组。
 */
function wrapRich(ctx, segments, maxWidth, style, size) {
  const chars = []
  for (const seg of segments) {
    for (const ch of seg.text) {
      chars.push({ ch, bold: seg.bold, italic: seg.italic, code: seg.code, strike: seg.strike, link: seg.link })
    }
  }

  const rows = []
  let cur = []
  let curW = 0
  const measureW = c => {
    ctx.font = fontFor(style, size, c)
    return ctx.measureText(c.ch).width
  }
  for (const c of chars) {
    const w = measureW(c)
    if (curW + w > maxWidth && cur.length > 0) {
      rows.push(cur)
      cur = []
      curW = 0
    }
    cur.push(c)
    curW += w
  }
  if (cur.length > 0) rows.push(cur)
  return rows
}

/**
 * 合并相邻同样式字符，得到可整体绘制的 segments。
 */
function mergeChars(chars) {
  const segs = []
  for (const c of chars) {
    const last = segs[segs.length - 1]
    if (last && last.bold === c.bold && last.italic === c.italic && last.code === c.code && last.strike === c.strike && last.link === c.link) {
      last.text += c.ch
    } else {
      segs.push({ text: c.ch, bold: c.bold, italic: c.italic, code: c.code, strike: c.strike, link: c.link })
    }
  }
  return segs
}

/**
 * 把块列表排版成「渲染行」数组。
 * 渲染行结构：
 *   { kind:'gap' }
 *   { kind:'hr' }
 *   { kind:'code', raw }
 *   { kind:'text', segments, level, prefix, prefixW, indent, quote }
 */
function layoutLines(ctx, text, style, contentWidth) {
  const blocks = parseBlocks(text)
  const rows = []

  for (const b of blocks) {
    if (b.type === 'gap') {
      rows.push({ kind: 'gap' })
      continue
    }
    if (b.type === 'hr') {
      rows.push({ kind: 'hr' })
      continue
    }
    if (b.type === 'code') {
      for (const c of b.lines) rows.push({ kind: 'code', raw: c })
      continue
    }

    // 文本类块
    const isHeading = b.type === 'heading'
    const size = isHeading ? headingFontSize(style, b.level) : style.fontSize
    const segments = parseInline(b.text)

    let indent = 0
    let prefix = null
    let prefixW = 0
    let quote = false

    if (b.type === 'bullet' || b.type === 'ordered') {
      indent = 28
      prefix = b.type === 'bullet' ? '• ' : `${b.num}. `
      ctx.font = fontFor(style, size, {})
      prefixW = ctx.measureText(prefix).width
    } else if (b.type === 'quote') {
      indent = 28
      quote = true
    }

    const maxW = contentWidth - indent - prefixW
    const wrapped = wrapRich(ctx, segments, maxW, style, size)

    wrapped.forEach((chars, idx) => {
      let segs = mergeChars(chars)
      if (isHeading) segs = segs.map(s => ({ ...s, bold: true }))
      rows.push({
        kind: 'text',
        level: isHeading ? b.level : 0,
        segments: segs,
        prefix: idx === 0 ? prefix : null,
        prefixW,
        indent,
        quote
      })
    })
  }

  return rows
}

/**
 * 单个渲染行占用的高度。
 */
function lineHeightOf(line, style) {
  if (line.kind === 'gap') return style.paragraphGap ?? Math.round(style.lineHeight * 0.5)
  if (line.kind === 'hr') return 40
  if (line.kind === 'code') return style.lineHeight
  if (line.level) return Math.round(headingFontSize(style, line.level) * 1.4)
  return style.lineHeight
}

/* ============================ 标题 ============================ */

/**
 * 每种标题样式带来的装饰占位。
 */
function titleDecors(style) {
  switch (style.titleStyle) {
    case 'accent-line': return { top: 0, bottom: 16, left: 0 }
    case 'left-bar': return { top: 0, bottom: 0, left: 26 }
    case 'underline': return { top: 0, bottom: 12, left: 0 }
    case 'badge': return { top: 16, bottom: 16, left: 24 }
    case 'box': return { top: 18, bottom: 18, left: 26 }
    case 'gradient':
    case 'plain':
    default: return { top: 0, bottom: 0, left: 0 }
  }
}

/**
 * 标题相关尺寸。
 */
function titleMetrics(style) {
  const titleFontSize = style.titleFontSize || Math.round(style.fontSize * 1.5)
  const titleLineHeight = Math.round(titleFontSize * 1.35)
  const titleMarginBottom = Math.round(style.lineHeight * 0.8)
  return { titleFontSize, titleLineHeight, titleMarginBottom }
}

/**
 * 把标题按可用宽度换行成多行。
 */
function wrapTitleLines(style, title) {
  if (!title) return []
  const { titleFontSize } = titleMetrics(style)
  const titleFontFamily = style.titleFontFamily || style.fontFamily
  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `bold ${titleFontSize}px ${titleFontFamily}`
  const contentWidth = CANVAS_WIDTH - style.margin * 2 - style.padding * 2
  const lines = []
  for (const para of title.split('\n')) {
    let current = ''
    for (const ch of para) {
      const test = current + ch
      if (measure.measureText(test).width > contentWidth && current !== '') {
        lines.push(current)
        current = ch
      } else {
        current = test
      }
    }
    if (current !== '') lines.push(current)
  }
  return lines
}

/**
 * 计算标题整块占用的高度（含下方留白）。无标题返回 0。
 */
function titleBlockHeight(style, title) {
  const lines = wrapTitleLines(style, title)
  if (lines.length === 0) return 0
  const { titleLineHeight, titleMarginBottom } = titleMetrics(style)
  const d = titleDecors(style)
  return d.top + lines.length * titleLineHeight + d.bottom + titleMarginBottom
}

/* ============================ 分页 ============================ */

/**
 * 按固定高度自动分页：根据每行实际高度累积，排满一页就换页。
 * 标题只占用首页顶部，故首页可用高度减去标题块高度。
 * 返回 [{lines: [...]}, ...]
 */
export function paginate(text, style, title = '') {
  const measure = document.createElement('canvas').getContext('2d')

  const contentWidth = CANVAS_WIDTH - style.margin * 2 - style.padding * 2
  const contentHeight = CANVAS_HEIGHT - style.margin * 2 - style.padding * 2
  const firstPageTitleH = titleBlockHeight(style, title)

  const allLines = layoutLines(measure, text, style, contentWidth)

  const pages = []
  let cur = []
  let used = 0
  let pageLimit = contentHeight - firstPageTitleH
  for (const line of allLines) {
    const h = lineHeightOf(line, style)
    // 间隔不出现在页首（避免顶部空白）
    if (line.kind === 'gap' && cur.length === 0) continue
    if (used + h > pageLimit && cur.length > 0) {
      pages.push({ lines: cur })
      cur = []
      used = 0
      pageLimit = contentHeight // 从第二页起没有标题占位
      if (line.kind === 'gap') continue // 换页后不以间隔开头
    }
    cur.push(line)
    used += h
  }
  if (cur.length > 0) pages.push({ lines: cur })
  if (pages.length === 0) pages.push({ lines: [] })
  return pages
}

/* ============================ 绘制 ============================ */

/**
 * 在卡片区域内绘制装饰花纹。
 */
function drawPattern(ctx, type, color, x, y, w, h, radius) {
  if (!type || type === 'none') return
  ctx.save()
  roundRect(ctx, x, y, w, h, radius)
  ctx.clip()
  ctx.fillStyle = color
  ctx.strokeStyle = color

  switch (type) {
    case 'dots': {
      const gap = 60
      for (let py = y + 30; py < y + h; py += gap) {
        for (let px = x + 30; px < x + w; px += gap) {
          ctx.beginPath()
          ctx.arc(px, py, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    }
    case 'grid': {
      const gap = 70
      ctx.lineWidth = 1.5
      for (let px = x; px < x + w; px += gap) {
        ctx.beginPath()
        ctx.moveTo(px, y)
        ctx.lineTo(px, y + h)
        ctx.stroke()
      }
      for (let py = y; py < y + h; py += gap) {
        ctx.beginPath()
        ctx.moveTo(x, py)
        ctx.lineTo(x + w, py)
        ctx.stroke()
      }
      break
    }
    case 'diagonal': {
      const gap = 48
      ctx.lineWidth = 6
      for (let d = -h; d < w; d += gap) {
        ctx.beginPath()
        ctx.moveTo(x + d, y)
        ctx.lineTo(x + d + h, y + h)
        ctx.stroke()
      }
      break
    }
    case 'wave': {
      const gap = 90
      const amp = 14
      ctx.lineWidth = 4
      for (let py = y + 40; py < y + h; py += gap) {
        ctx.beginPath()
        for (let px = x; px <= x + w; px += 8) {
          const yy = py + Math.sin((px - x) / 40) * amp
          if (px === x) ctx.moveTo(px, yy)
          else ctx.lineTo(px, yy)
        }
        ctx.stroke()
      }
      break
    }
    case 'circles': {
      const spots = [
        [0.15, 0.2, 90], [0.8, 0.15, 60], [0.7, 0.55, 120],
        [0.2, 0.7, 70], [0.5, 0.9, 100], [0.9, 0.85, 50]
      ]
      ctx.lineWidth = 8
      for (const [rx, ry, r] of spots) {
        ctx.beginPath()
        ctx.arc(x + w * rx, y + h * ry, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      break
    }
    case 'confetti': {
      let seed = 42
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }
      for (let i = 0; i < 90; i++) {
        const px = x + rand() * w
        const py = y + rand() * h
        const s = 6 + rand() * 10
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(rand() * Math.PI)
        if (rand() > 0.5) {
          ctx.fillRect(-s / 2, -s / 2, s, s * 0.5)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      break
    }
    case 'corner': {
      const drawArcs = (cx, cy, start, end) => {
        ctx.lineWidth = 8
        for (let r = 60; r <= 200; r += 40) {
          ctx.beginPath()
          ctx.arc(cx, cy, r, start, end)
          ctx.stroke()
        }
      }
      drawArcs(x, y, 0, Math.PI / 2)
      drawArcs(x + w, y + h, Math.PI, Math.PI * 1.5)
      break
    }
  }
  ctx.restore()
}

/**
 * 在整张画布上斜向平铺半透明水印文字。
 */
function drawWatermark(ctx, text) {
  if (!text) return
  ctx.save()
  ctx.font = '34px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
  ctx.rotate((-30 * Math.PI) / 180)

  const gapX = 300
  const gapY = 180
  const range = Math.ceil(Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2))
  for (let y = -range; y < range; y += gapY) {
    for (let x = -range; x < range; x += gapX) {
      ctx.fillText(text, x, y)
    }
  }
  ctx.restore()
}

/**
 * 绘制一个富文本行（正文段落 / 标题 / 列表 / 引用）。
 */
function drawRichLine(ctx, line, x, y, style, textColor) {
  ctx.textBaseline = 'top'
  const baseSize = line.level ? headingFontSize(style, line.level) : style.fontSize
  let cx = x + (line.indent || 0)

  // 引用竖线
  if (line.quote) {
    const barH = line.level ? baseSize : style.lineHeight
    ctx.fillStyle = hexToRgba(style.accent, 0.5)
    ctx.fillRect(x, y, 4, barH)
  }

  // 列表前缀符号
  if (line.prefix) {
    ctx.font = fontFor(style, baseSize, { bold: !!line.level })
    ctx.fillStyle = style.accent
    ctx.fillText(line.prefix, cx, y)
    cx += line.prefixW
  }

  // 逐个片段绘制
  for (const seg of line.segments) {
    const font = fontFor(style, baseSize, {
      bold: seg.bold || !!line.level,
      italic: seg.italic,
      code: seg.code
    })
    ctx.font = font
    const w = ctx.measureText(seg.text).width

    // 行内代码背景
    if (seg.code) {
      ctx.fillStyle = hexToRgba(style.accent, 0.10)
      ctx.fillRect(cx - 1, y, w + 2, baseSize + 4)
    }

    ctx.fillStyle = seg.link ? style.accent : textColor
    ctx.fillText(seg.text, cx, y)

    // 删除线
    if (seg.strike) {
      ctx.fillStyle = seg.link ? style.accent : textColor
      ctx.fillRect(cx, y + baseSize / 2, w, 2)
    }
    // 链接下划线
    if (seg.link) {
      ctx.fillStyle = style.accent
      ctx.fillRect(cx, y + baseSize + 2, w, 2)
    }
    cx += w
  }
}

/**
 * 绘制一行代码块。
 */
function drawCodeLine(ctx, line, x, y, style, textColor, contentWidth) {
  const size = Math.round(style.fontSize * 0.85)
  ctx.fillStyle = 'rgba(0,0,0,0.05)'
  ctx.fillRect(x, y, contentWidth, style.lineHeight)
  ctx.font = fontFor(style, size, { code: true })
  ctx.fillStyle = textColor
  ctx.textBaseline = 'top'
  ctx.fillText(line.raw, x + 12, y + (style.lineHeight - size) / 2)
}

/**
 * 绘制分隔线。
 */
function drawHr(ctx, x, y, w, color) {
  ctx.strokeStyle = hexToRgba(color, 0.35)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y + 18)
  ctx.lineTo(x + w, y + 18)
  ctx.stroke()
}

/**
 * 将一页内容渲染到指定 canvas。
 * options: { style, pageIndex, totalPages, textColor, watermark, title, titleColor }
 */
export function renderPage(canvas, page, options) {
  const { style, pageIndex, totalPages, textColor, watermark, title, titleColor } = options
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')

  // 外层背景（支持渐变）
  ctx.fillStyle = makeFill(ctx, style.bg, style.bgGradient, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 卡片
  const cardX = style.margin
  const cardY = style.margin
  const cardW = CANVAS_WIDTH - style.margin * 2
  const cardH = CANVAS_HEIGHT - style.margin * 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.08)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 10
  ctx.fillStyle = makeFill(ctx, style.card, style.cardGradient, cardX, cardY, cardW, cardH)
  roundRect(ctx, cardX, cardY, cardW, cardH, style.radius)
  ctx.fill()
  ctx.restore()

  // 卡片装饰花纹（在正文下方）
  drawPattern(ctx, style.pattern, style.patternColor, cardX, cardY, cardW, cardH, style.radius)

  // 卡片描边（可选）
  if (style.border) {
    ctx.save()
    ctx.strokeStyle = style.border
    ctx.lineWidth = 2
    roundRect(ctx, cardX + 1, cardY + 1, cardW - 2, cardH - 2, style.radius)
    ctx.stroke()
    ctx.restore()
  }

  // 文本基础设置
  ctx.textBaseline = 'top'
  const startX = cardX + style.padding
  const contentW = cardW - style.padding * 2
  const paragraphGap = style.paragraphGap ?? Math.round(style.lineHeight * 0.5)
  let y = cardY + style.padding + 20

  // 标题：仅首页绘制
  if (pageIndex === 0 && title) {
    const titleLines = wrapTitleLines(style, title)
    const { titleFontSize, titleLineHeight, titleMarginBottom } = titleMetrics(style)
    const titleFontFamily = style.titleFontFamily || style.fontFamily
    const titleStyle = style.titleStyle || 'accent-line'
    const d = titleDecors(style)
    const textH = titleLines.length * titleLineHeight

    ctx.font = `bold ${titleFontSize}px ${titleFontFamily}`
    let maxW = 0
    for (const tline of titleLines) maxW = Math.max(maxW, ctx.measureText(tline).width)

    const textX = startX + d.left
    const textY = y + d.top

    // 块状背景装饰（色块徽章 / 描边框线）
    if (titleStyle === 'badge' || titleStyle === 'box') {
      const blockX = startX
      const blockY = y
      const blockW = maxW + d.left + 24
      const blockH = textH + d.top + d.bottom
      if (titleStyle === 'badge') {
        ctx.fillStyle = hexToRgba(style.accent, 0.16)
        roundRect(ctx, blockX, blockY, blockW, blockH, 16)
        ctx.fill()
      } else {
        ctx.strokeStyle = style.accent
        ctx.lineWidth = 3
        roundRect(ctx, blockX, blockY, blockW, blockH, 16)
        ctx.stroke()
      }
    }

    // 左侧竖线（高度匹配文字实际高度，与标题垂直居中）
    if (titleStyle === 'left-bar') {
      const barH = (titleLines.length - 1) * titleLineHeight + titleFontSize
      ctx.fillStyle = style.accent
      ctx.fillRect(startX, textY, 8, barH)
    }

    // 标题文字（渐变或纯色）
    if (titleStyle === 'gradient') {
      const g = ctx.createLinearGradient(textX, textY, textX, textY + textH)
      g.addColorStop(0, style.accent)
      g.addColorStop(1, titleColor || style.titleColor)
      ctx.fillStyle = g
    } else {
      ctx.fillStyle = titleColor || style.titleColor
    }
    ctx.font = `bold ${titleFontSize}px ${titleFontFamily}`
    for (let k = 0; k < titleLines.length; k++) {
      ctx.fillText(titleLines[k], textX, textY + k * titleLineHeight)
    }

    // 底部装饰（强调短线 / 底部横线）
    if (titleStyle === 'accent-line') {
      ctx.fillStyle = style.accent
      ctx.fillRect(textX, textY + textH + 10, Math.min(80, maxW), 6)
    } else if (titleStyle === 'underline') {
      ctx.fillStyle = style.accent
      ctx.fillRect(textX, textY + textH + 8, maxW, 3)
    }

    y = textY + textH + d.bottom + titleMarginBottom
  }

  // 正文
  for (const line of page.lines) {
    if (line.kind === 'gap') {
      y += paragraphGap
    } else if (line.kind === 'hr') {
      drawHr(ctx, startX, y, contentW, textColor || style.textColor)
      y += lineHeightOf(line, style)
    } else if (line.kind === 'code') {
      drawCodeLine(ctx, line, startX, y, style, textColor || style.textColor, contentW)
      y += style.lineHeight
    } else {
      drawRichLine(ctx, line, startX, y, style, textColor || style.textColor)
      y += lineHeightOf(line, style)
    }
  }

  // 页码
  if (totalPages > 1) {
    ctx.fillStyle = style.accent
    ctx.font = `28px ${style.fontFamily}`
    ctx.textAlign = 'right'
    ctx.fillText(
      `${pageIndex + 1} / ${totalPages}`,
      cardX + cardW - style.padding,
      cardY + cardH - style.padding
    )
    ctx.textAlign = 'left'
  }

  // 水印（绘制在最上层）
  drawWatermark(ctx, watermark)
}
