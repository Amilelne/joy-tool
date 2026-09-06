<script setup>
import { ref, computed, watch, nextTick, getCurrentInstance } from 'vue'
import { templates, getTemplate } from './templates.js'
import { paginate, renderPage, TITLE_STYLES } from './renderer.js'

const sampleText = `在这里粘贴你的长文。

程序会自动把文字按图片高度分成多张卡片，无需手动操作。你可以在右侧切换不同的模板风格，也可以自定义正文和标题的字体颜色。

段落之间的空行会被保留，排版更自然。写完后点击下方按钮即可导出全部图片。`

const text = ref(sampleText)
const title = ref('')                // 标题，仅渲染在首张图片
const titleFontSize = ref(60)        // 标题字号
const titleFontFamily = ref('')      // 标题字体类型（空 = 跟随正文）
const titleStyle = ref('accent-line') // 标题展示样式

// 可选的标题字体类型
const titleFontOptions = [
  { label: '跟随正文', value: '' },
  { label: '苹方', value: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { label: '黑体', value: '"SimHei", "PingFang SC", sans-serif' },
  { label: '微软雅黑', value: '"Microsoft YaHei", "PingFang SC", sans-serif' },
  { label: '楷体', value: '"STKaiti", "KaiTi", "Kaiti SC", serif' },
  { label: '宋体', value: '"SimSun", "STSong", "Songti SC", serif' },
  { label: '圆体', value: '"Yuanti SC", "YouYuan", sans-serif' },
  { label: '衬线体', value: 'Georgia, "Songti SC", serif' }
]

const currentTemplateId = ref('warm')
const customTextColor = ref('')      // 空表示用模板默认色
const useCustomColor = ref(false)
const watermark = ref('')            // 水印文字，默认空（不显示）

// 可自定义的排版参数（不勾选自定义时用模板默认值）
const useCustomLayout = ref(false)
const fontSize = ref(40)             // 字号
const lineSpacing = ref(66)          // 行间距（行高）
const paragraphGap = ref(40)         // 段落间距（空行的额外高度）

const canvasRefs = ref([])           // 每页对应的 canvas 元素

// 当前模板
const template = computed(() => getTemplate(currentTemplateId.value))

// 合并模板默认值与用户自定义排版，得到实际生效样式
const style = computed(() => {
  const t = template.value
  const base = useCustomLayout.value
    ? { ...t, fontSize: fontSize.value, lineHeight: lineSpacing.value, paragraphGap: paragraphGap.value }
    : t
  return {
    ...base,
    titleFontSize: titleFontSize.value,
    titleFontFamily: titleFontFamily.value || base.fontFamily,
    titleStyle: titleStyle.value
  }
})

// 实际生效的文字颜色
const effectiveTextColor = computed(() =>
  useCustomColor.value && customTextColor.value ? customTextColor.value : style.value.textColor
)

// 分页结果
const pages = computed(() => paginate(text.value, style.value, title.value))

// 重新渲染所有页
async function renderAll() {
  await nextTick()
  pages.value.forEach((page, i) => {
    const canvas = canvasRefs.value[i]
    if (canvas) {
      renderPage(canvas, page, {
        style: style.value,
        pageIndex: i,
        totalPages: pages.value.length,
        textColor: effectiveTextColor.value,
        watermark: watermark.value,
        title: title.value
      })
    }
  })
}

function setCanvasRef(el, i) {
  if (el) canvasRefs.value[i] = el
}

// 模板选择器的背景：优先展示背景渐变，否则用卡片色
function tplBg(t) {
  const g = t.bgGradient || t.cardGradient
  if (g && g.length) {
    const stops = g.map(([o, c]) => `${c} ${Math.round(o * 100)}%`).join(', ')
    return `linear-gradient(135deg, ${stops})`
  }
  return t.card
}

// 任意依赖变化都重绘
watch(
  [text, title, currentTemplateId, effectiveTextColor, watermark, style],
  renderAll,
  { immediate: true, deep: true }
)

// 勾选自定义排版时，用当前模板的默认值初始化滑块
watch(useCustomLayout, on => {
  if (on) {
    fontSize.value = template.value.fontSize
    lineSpacing.value = template.value.lineHeight
    paragraphGap.value = template.value.paragraphGap ?? 40
  }
})

// 切换模板时，如果没自定义颜色，把颜色选择器同步到模板默认色
watch(currentTemplateId, () => {
  if (!useCustomColor.value) customTextColor.value = template.value.textColor
})

function downloadOne(i) {
  const canvas = canvasRefs.value[i]
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `长文图片_${i + 1}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const instance = getCurrentInstance()
const $message = (instance && instance.proxy && instance.proxy.$message) || ((opts) => alert(opts.msg))

// 同步获取 PNG dataURL（toDataURL 在 webview 中稳定可用，toBlob 可能不触发回调）
function canvasToPngDataURL(canvas) {
  return canvas.toDataURL('image/png')
}

// dataURL -> Uint8Array（同步，用 atob 解码 base64）
function dataURLToBytes(dataURL) {
  const base64 = dataURL.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// dataURL -> Blob（供目录写入使用）
function dataURLToBlob(dataURL) {
  const mime = (dataURL.match(/^data:(.*?);/) || [])[1] || 'image/png'
  return new Blob([dataURLToBytes(dataURL)], { type: mime })
}

// Uint8Array -> base64 字符串
function bytesToBase64(bytes) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// 用 data URL 触发下载（blob URL 在部分内嵌浏览器/webview 里会被静默拦截）
function downloadBytes(bytes, filename, mime) {
  const link = document.createElement('a')
  link.href = `data:${mime};base64,${bytesToBase64(bytes)}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/* ==================== 零依赖 ZIP 打包（STORE 模式） ==================== */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * 把多个文件打包成 zip（不压缩，PNG 本身已是压缩格式）。
 * files: [{ name, data: Uint8Array }]
 */
function buildZip(files) {
  const encoder = new TextEncoder()
  const now = new Date()
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()

  const parts = []
  const centralParts = []
  let offset = 0

  for (const f of files) {
    const nameBytes = encoder.encode(f.name)
    const data = f.data
    const crc = crc32(data)

    // Local file header
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // UTF-8 文件名
    local.setUint16(8, 0, true) // STORE
    local.setUint16(10, dosTime, true)
    local.setUint16(12, dosDate, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, data.length, true)
    local.setUint32(22, data.length, true)
    local.setUint16(26, nameBytes.length, true)
    local.setUint16(28, 0, true)
    parts.push(local.buffer, nameBytes, data)

    // Central directory header
    const cen = new DataView(new ArrayBuffer(46))
    cen.setUint32(0, 0x02014b50, true)
    cen.setUint16(4, 20, true)
    cen.setUint16(6, 20, true)
    cen.setUint16(8, 0x0800, true)
    cen.setUint16(10, 0, true)
    cen.setUint16(12, dosTime, true)
    cen.setUint16(14, dosDate, true)
    cen.setUint32(16, crc, true)
    cen.setUint32(20, data.length, true)
    cen.setUint32(24, data.length, true)
    cen.setUint16(28, nameBytes.length, true)
    cen.setUint16(30, 0, true)
    cen.setUint16(32, 0, true)
    cen.setUint16(34, 0, true)
    cen.setUint16(36, 0, true)
    cen.setUint32(38, 0, true)
    cen.setUint32(42, offset, true)
    centralParts.push(cen.buffer, nameBytes)

    offset += 30 + nameBytes.length + data.length
  }

  const centralSize = centralParts.reduce((s, p) => s + p.byteLength, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(4, 0, true)
  end.setUint16(6, 0, true)
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  end.setUint16(20, 0, true)

  // 合并所有分片为单个 Uint8Array
  const all = [...parts, ...centralParts, end.buffer]
  const total = all.reduce((s, p) => s + p.byteLength, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const p of all) {
    out.set(p instanceof ArrayBuffer ? new Uint8Array(p) : p, pos)
    pos += p.byteLength
  }
  return out
}

// 把所有图片打包成一个 zip 并下载（一次下载，不依赖目录选择 API）
function downloadAllAsZip() {
  try {
    const n = pages.value.length
    const files = []
    for (let i = 0; i < n; i++) {
      const canvas = canvasRefs.value[i]
      if (!canvas) continue
      const dataURL = canvasToPngDataURL(canvas)
      files.push({ name: `长文图片_${i + 1}.png`, data: dataURLToBytes(dataURL) })
    }
    if (files.length === 0) {
      $message({ msg: '暂无可导出的图片', type: 'error' })
      return
    }
    downloadBytes(buildZip(files), '长文图片.zip', 'application/zip')
    $message({ msg: `已打包 ${files.length} 张图片并下载（长文图片.zip）`, type: 'success' })
  } catch (e) {
    console.error('[长文转图] zip 导出失败', e)
    $message({ msg: '导出失败：' + (e && e.message ? e.message : e), type: 'error' })
  }
}

// 选择目录后批量导出；浏览器不支持或写入失败时自动降级为 zip 打包下载
async function exportAllToDirectory() {
  const n = pages.value.length
  if (n === 0) {
    $message({ msg: '暂无可导出的图片', type: 'error' })
    return
  }

  // 优先：Chrome/Edge 支持选择目录直接写入
  if (window.showDirectoryPicker) {
    let dirHandle
    try {
      dirHandle = await window.showDirectoryPicker()
    } catch (e) {
      if (e && e.name === 'AbortError') return // 用户取消选择目录
      console.error('[长文转图] 选择目录失败，降级 zip', e)
      downloadAllAsZip()
      return
    }

    try {
      for (let i = 0; i < n; i++) {
        const canvas = canvasRefs.value[i]
        if (!canvas) continue
        const blob = dataURLToBlob(canvasToPngDataURL(canvas))
        const fileHandle = await dirHandle.getFileHandle(`长文图片_${i + 1}.png`, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
      }
      $message({ msg: `已导出 ${n} 张图片到所选目录`, type: 'success' })
    } catch (e) {
      console.error('[长文转图] 写入目录失败，降级 zip', e)
      $message({ msg: '目录写入失败，已改为 zip 打包下载', type: 'error' })
      downloadAllAsZip()
    }
    return
  }

  // 不支持选择目录（Safari/Firefox/内嵌浏览器）：打包成 zip 一次下载
  downloadAllAsZip()
}

// 支持 Ctrl+A / Cmd+A 全选（macOS 上 Ctrl+A 默认是光标移到行首，需手动处理）
function handleEditorKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault()
    e.target.select()
  }
}
</script>

<template>
  <div class="long-text-pics">
    <header class="topbar">
      <div class="topbar-left">
        <h1>长文转图片</h1>
        <span class="subtitle">粘贴长文，自动生成小红书风分享图</span>
      </div>
    </header>

    <div class="layout">
      <!-- 左侧：输入 + 控制 -->
      <section class="panel">
        <label class="field-label">长文内容</label>
        <textarea
          v-model="text"
          class="editor"
          placeholder="在这里粘贴你的长文…"
          @keydown="handleEditorKeydown"
        ></textarea>

        <label class="field-label">标题（可选，仅首图显示）</label>
        <input
          v-model="title"
          class="text-input"
          type="text"
          placeholder="输入标题，留空则不显示"
        />

        <div class="title-settings">
          <div class="slider-row">
            <span class="slider-label">标题字号</span>
            <input
              type="range" min="32" max="120" step="1"
              v-model.number="titleFontSize"
            />
            <span class="slider-val">{{ titleFontSize }}px</span>
          </div>
          <div class="slider-row">
            <span class="slider-label">标题字体</span>
            <select v-model="titleFontFamily" class="font-select">
              <option v-for="f in titleFontOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </div>
          <div class="title-style-row">
            <span class="slider-label">标题样式</span>
            <div class="title-styles">
              <button
                v-for="s in TITLE_STYLES"
                :key="s.id"
                type="button"
                class="title-style-btn"
                :class="{ active: titleStyle === s.id }"
                @click="titleStyle = s.id"
              >{{ s.name }}</button>
            </div>
          </div>
        </div>

        <label class="field-label">选择模板</label>
        <div class="templates">
          <button
            v-for="t in templates"
            :key="t.id"
            class="tpl-item"
            :class="{ active: currentTemplateId === t.id }"
            :style="{ background: tplBg(t), borderColor: currentTemplateId === t.id ? t.accent : 'var(--border)' }"
            @click="currentTemplateId = t.id"
          >
            <span class="tpl-dot" :style="{ background: t.accent }"></span>
            <span class="tpl-name" :style="{ color: t.textColor }">{{ t.name }}</span>
          </button>
        </div>

        <label class="field-label">字体颜色</label>
        <div class="color-row">
          <label class="checkbox">
            <input type="checkbox" v-model="useCustomColor" />
            自定义颜色
          </label>
          <input
            type="color"
            v-model="customTextColor"
            :disabled="!useCustomColor"
            class="color-input"
          />
          <span class="color-hint" v-if="!useCustomColor">当前使用模板默认色</span>
        </div>

        <label class="field-label">排版设置</label>
        <label class="checkbox">
          <input type="checkbox" v-model="useCustomLayout" />
          自定义字号与间距
        </label>
        <div class="sliders" :class="{ disabled: !useCustomLayout }">
          <div class="slider-row">
            <span class="slider-label">字号</span>
            <input
              type="range" min="24" max="72" step="1"
              v-model.number="fontSize" :disabled="!useCustomLayout"
            />
            <span class="slider-val">{{ fontSize }}px</span>
          </div>
          <div class="slider-row">
            <span class="slider-label">行间距</span>
            <input
              type="range" min="40" max="110" step="1"
              v-model.number="lineSpacing" :disabled="!useCustomLayout"
            />
            <span class="slider-val">{{ lineSpacing }}px</span>
          </div>
          <div class="slider-row">
            <span class="slider-label">段落间距</span>
            <input
              type="range" min="0" max="120" step="1"
              v-model.number="paragraphGap" :disabled="!useCustomLayout"
            />
            <span class="slider-val">{{ paragraphGap }}px</span>
          </div>
        </div>

        <div class="stat">共 {{ pages.length }} 张图片</div>

        <label class="field-label">水印文字</label>
        <input
          v-model="watermark"
          class="watermark-input"
          type="text"
          placeholder="留空则不显示水印"
        />

        <button class="btn-primary" @click="exportAllToDirectory">导出全部图片（选择目录）</button>
      </section>

      <!-- 右侧：预览 -->
      <section class="preview">
        <div v-if="pages.length === 0" class="empty">暂无内容</div>
        <div class="preview-list">
          <div v-for="(page, i) in pages" :key="i" class="preview-card">
            <canvas
              :ref="el => setCanvasRef(el, i)"
              class="canvas"
            ></canvas>
            <button class="btn-download" @click="downloadOne(i)">下载第 {{ i + 1 }} 张</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.long-text-pics {
  --accent: #ff2e4d;
  --accent-strong: #e61e3c;

  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text);
  text-align: left;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background 0.25s, color 0.25s;
}

/* 暗色主题由全局 html.dark 控制，这里仅覆盖页面特色主色以保证对比度 */
html.dark .long-text-pics {
  --accent: #ff5c72;
  --accent-strong: #ff3f58;
}

.long-text-pics,
.long-text-pics * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.long-text-pics .topbar {
  padding: 20px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  transition: background 0.25s;
}
.long-text-pics .topbar-left {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.long-text-pics .topbar h1 {
  font-size: 22px;
  color: var(--accent);
}
.long-text-pics .subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.long-text-pics .layout {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px 32px;
  align-items: flex-start;
}

/* 左侧面板 */
.long-text-pics .panel {
  width: 380px;
  flex-shrink: 0;
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow);
  position: sticky;
  top: 24px;
  transition: background 0.25s;
}
.long-text-pics .field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 18px 0 8px;
}
.long-text-pics .field-label:first-child {
  margin-top: 0;
}
.long-text-pics .editor {
  width: 100%;
  height: 200px;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  line-height: 1.7;
  font-family: inherit;
  background: var(--surface-2);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, background 0.25s, color 0.25s;
}
.long-text-pics .editor:focus {
  border-color: var(--accent);
}

.long-text-pics .text-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  background: var(--surface-2);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, background 0.25s, color 0.25s;
}
.long-text-pics .text-input:focus {
  border-color: var(--accent);
}

.long-text-pics .title-settings {
  margin-top: 12px;
}

.long-text-pics .font-select {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-secondary);
  background: var(--surface-2);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, background 0.25s;
}

.long-text-pics .title-style-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.long-text-pics .title-styles {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.long-text-pics .title-style-btn {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.long-text-pics .title-style-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.long-text-pics .title-style-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.long-text-pics .templates {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.long-text-pics .tpl-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.long-text-pics .tpl-item.active {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px var(--shadow-md);
}
.long-text-pics .tpl-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.long-text-pics .tpl-name {
  font-size: 14px;
  font-weight: 500;
}

.long-text-pics .color-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.long-text-pics .checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
}
.long-text-pics .color-input {
  width: 44px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  background: var(--surface-2);
}
.long-text-pics .color-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.long-text-pics .color-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.long-text-pics .stat {
  margin: 20px 0 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.long-text-pics .watermark-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  background: var(--surface-2);
  color: var(--text);
  outline: none;
  margin-bottom: 20px;
  transition: border-color 0.2s, background 0.25s, color 0.25s;
}
.long-text-pics .watermark-input:focus {
  border-color: var(--accent);
}

.long-text-pics .sliders {
  margin-top: 12px;
  transition: opacity 0.2s;
}
.long-text-pics .sliders.disabled {
  opacity: 0.4;
}
.long-text-pics .slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.long-text-pics .slider-label {
  width: 62px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-secondary);
}
.long-text-pics .slider-row input[type='range'] {
  flex: 1;
  accent-color: var(--accent);
  cursor: pointer;
}
.long-text-pics .slider-row input[type='range']:disabled {
  cursor: not-allowed;
}
.long-text-pics .slider-val {
  width: 46px;
  flex-shrink: 0;
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
}

.long-text-pics .btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.long-text-pics .btn-primary:hover {
  background: var(--accent-strong);
}

/* 右侧预览 */
.long-text-pics .preview {
  flex: 1;
  min-width: 0;
}
.long-text-pics .preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.long-text-pics .preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.long-text-pics .canvas {
  width: 270px;
  height: 360px;
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--shadow-lg);
  background: #fff;
}
.long-text-pics .btn-download {
  padding: 8px 16px;
  background: var(--surface);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.long-text-pics .btn-download:hover {
  background: var(--accent);
  color: #fff;
}

.long-text-pics .empty {
  color: var(--text-faint);
  font-size: 14px;
  padding: 40px;
  text-align: center;
}

@media (max-width: 860px) {
  .long-text-pics .layout {
    flex-direction: column;
  }
  .long-text-pics .panel {
    width: 100%;
    position: static;
  }
}
</style>
