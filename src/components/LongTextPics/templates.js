/**
 * 图片模板定义（小红书风：圆角卡片 + 留白 + 装饰花纹）
 * 每个模板包含配色、字体、间距、背景渐变、花纹等样式，字体颜色可被用户覆盖。
 *
 * 字段说明：
 * - bg / bgGradient：外层背景纯色 / 渐变（渐变优先，[[offset,color],...]）
 * - card / cardGradient：卡片背景纯色 / 渐变
 * - pattern：卡片内花纹类型，见 renderer.js drawPattern
 *   可选值：'none' | 'dots' | 'grid' | 'diagonal' | 'wave' | 'corner' | 'confetti' | 'circles'
 * - patternColor：花纹颜色（通常为半透明）
 * - border：卡片描边颜色（可选，null 表示不描边）
 */
export const CANVAS_WIDTH = 1080
export const CANVAS_HEIGHT = 1440

const FONT = '"PingFang SC", "Microsoft YaHei", sans-serif'

const base = {
  fontFamily: FONT,
  fontSize: 40,
  lineHeight: 66,
  padding: 90,
  margin: 60,
  radius: 40,
  pattern: 'none',
  border: null
}

export const templates = [
  {
    ...base,
    id: 'warm',
    name: '暖白圆点',
    bg: '#fbeee6',
    card: '#fffdf9',
    textColor: '#3a3a3a',
    titleColor: '#ff2e4d',
    accent: '#ff2e4d',
    pattern: 'dots',
    patternColor: 'rgba(255,46,77,0.06)'
  },
  {
    ...base,
    id: 'fresh',
    name: '清新格纹',
    bg: '#e8f3ec',
    card: '#ffffff',
    textColor: '#2f4f3e',
    titleColor: '#2e9e6b',
    accent: '#2e9e6b',
    pattern: 'grid',
    patternColor: 'rgba(46,158,107,0.07)'
  },
  {
    ...base,
    id: 'sky',
    name: '天空斜纹',
    bg: '#e6eefb',
    card: '#ffffff',
    textColor: '#2c3e57',
    titleColor: '#3a7bd5',
    accent: '#3a7bd5',
    pattern: 'diagonal',
    patternColor: 'rgba(58,123,213,0.06)'
  },
  {
    ...base,
    id: 'pink',
    name: '甜心波浪',
    bg: '#fce4ec',
    card: '#fffafc',
    textColor: '#5a3a45',
    titleColor: '#e84393',
    accent: '#e84393',
    pattern: 'wave',
    patternColor: 'rgba(232,67,147,0.08)'
  },
  {
    ...base,
    id: 'sunset',
    name: '日落渐变',
    bgGradient: [[0, '#ff9a9e'], [1, '#fad0c4']],
    card: '#fffcf7',
    textColor: '#5a3d3d',
    titleColor: '#ff5e62',
    accent: '#ff5e62',
    pattern: 'corner',
    patternColor: 'rgba(255,94,98,0.10)',
    radius: 48
  },
  {
    ...base,
    id: 'ocean',
    name: '海洋渐变',
    bgGradient: [[0, '#89f7fe'], [1, '#66a6ff']],
    card: '#ffffff',
    textColor: '#204056',
    titleColor: '#2b7fc4',
    accent: '#2b7fc4',
    pattern: 'circles',
    patternColor: 'rgba(43,127,196,0.07)',
    radius: 48
  },
  {
    ...base,
    id: 'lavender',
    name: '薰衣草纸屑',
    bgGradient: [[0, '#a18cd1'], [1, '#fbc2eb']],
    card: '#fffbff',
    textColor: '#463a5a',
    titleColor: '#8b5cf6',
    accent: '#8b5cf6',
    pattern: 'confetti',
    patternColor: 'rgba(139,92,246,0.14)',
    radius: 48
  },
  {
    ...base,
    id: 'dark',
    name: '暗夜金线',
    bg: '#1c1f2b',
    cardGradient: [[0, '#2a2e40'], [1, '#20232f']],
    textColor: '#e8e6df',
    titleColor: '#e7c26a',
    accent: '#e7c26a',
    pattern: 'grid',
    patternColor: 'rgba(231,194,106,0.06)',
    border: 'rgba(231,194,106,0.35)',
    radius: 36
  },
  {
    ...base,
    id: 'kraft',
    name: '牛皮纸',
    bg: '#d9c7a8',
    card: '#efe3ca',
    textColor: '#4a3f2e',
    titleColor: '#b06a3b',
    accent: '#b06a3b',
    pattern: 'dots',
    patternColor: 'rgba(74,63,46,0.07)',
    border: 'rgba(74,63,46,0.18)'
  },
  {
    ...base,
    id: 'mint',
    name: '薄荷简约',
    bg: '#d7f0ec',
    card: '#ffffff',
    textColor: '#26514c',
    titleColor: '#12b3a0',
    accent: '#12b3a0',
    pattern: 'confetti',
    patternColor: 'rgba(18,179,160,0.12)'
  }
]

export function getTemplate(id) {
  return templates.find(t => t.id === id) || templates[0]
}
