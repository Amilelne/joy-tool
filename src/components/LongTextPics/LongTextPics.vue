<script setup>
import { ref, computed, watch, nextTick } from 'vue'
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

// 暗黑模式：默认跟随系统偏好，可在顶栏切换
const prefersDark = typeof window !== 'undefined'
  && window.matchMedia
  && window.matchMedia('(prefers-color-scheme: dark)').matches
const dark = ref(!!prefersDark)

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

async function downloadAll() {
  for (let i = 0; i < pages.value.length; i++) {
    downloadOne(i)
    // 稍作延迟，避免浏览器拦截连续下载
    await new Promise(r => setTimeout(r, 300))
  }
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
  <div class="long-text-pics" :class="{ dark }">
    <header class="topbar">
      <div class="topbar-left">
        <h1>长文转图片</h1>
        <span class="subtitle">粘贴长文，自动生成小红书风分享图</span>
      </div>
      <button class="theme-toggle" type="button" @click="dark = !dark">
        {{ dark ? '亮色模式' : '暗色模式' }}
      </button>
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

        <button class="btn-primary" @click="downloadAll">导出全部图片</button>
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
  color-scheme: light;
  --bg: #f7f7f8;
  --surface: #ffffff;
  --surface-2: #f4f4f5;
  --border: #e5e5e5;
  --border-strong: #eeeeee;
  --text: #333333;
  --text-secondary: #555555;
  --text-muted: #999999;
  --text-faint: #bbbbbb;
  --accent: #ff2e4d;
  --accent-strong: #e61e3c;
  --shadow: rgba(0, 0, 0, 0.04);
  --shadow-md: rgba(0, 0, 0, 0.06);
  --shadow-lg: rgba(0, 0, 0, 0.1);

  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text);
  text-align: left;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background 0.25s, color 0.25s;
}

.long-text-pics.dark {
  color-scheme: dark;
  --bg: #141417;
  --surface: #1f1f24;
  --surface-2: #2a2a31;
  --border: #3a3a43;
  --border-strong: #333339;
  --text: #e8e8ea;
  --text-secondary: #c7c7cc;
  --text-muted: #8f8f96;
  --text-faint: #63636b;
  --accent: #ff5c72;
  --accent-strong: #ff3f58;
  --shadow: rgba(0, 0, 0, 0.28);
  --shadow-md: rgba(0, 0, 0, 0.35);
  --shadow-lg: rgba(0, 0, 0, 0.5);
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
.long-text-pics .theme-toggle {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.long-text-pics .theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
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
