<script setup>
import { ref, watch, getCurrentInstance } from 'vue'

const fileInput = ref(null)
const canvasRef = ref(null)
const img = ref(null)               // 已加载的 HTMLImageElement
const imageInfo = ref(null)         // { name, width, height }

// 水印参数（字号/间距单位为相对原图尺寸的 px）
const watermarkText = ref('内部资料 · 请勿外传')
const fontSize = ref(28)            // 字号
const color = ref('#909399')        // 水印颜色
const opacity = ref(0.5)            // 水印透明度
const gapX = ref(100)               // 水平间距（相邻水印文字之间的空隙）
const gapY = ref(60)                // 垂直间距（相邻两行之间的空隙）
const rotate = ref(-30)             // 倾斜角度（度）

const PREVIEW_MAX = 1000            // 预览画布最长边；导出时始终使用原始尺寸

const instance = getCurrentInstance()
const $message = (instance && instance.proxy && instance.proxy.$message) || ((opts) => alert(opts.msg))

/* ==================== 文件选择 ==================== */

function pickFile() {
  if (fileInput.value) fileInput.value.click()
}

function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = '' // 允许再次选择同一张图片
  if (file) loadImage(file)
}

function onDrop(e) {
  const file = e.dataTransfer.files && e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
}

function loadImage(file) {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => {
    img.value = image
    imageInfo.value = { name: file.name, width: image.naturalWidth, height: image.naturalHeight }
    URL.revokeObjectURL(url)
    render()
  }
  image.onerror = () => {
    URL.revokeObjectURL(url)
    $message({ msg: '图片加载失败，请换一张试试', type: 'error' })
  }
  image.src = url
}

/* ==================== 绘制 ==================== */

function hexToRgb(hex) {
  let v = hex.replace('#', '')
  if (v.length === 3) v = v.split('').map((c) => c + c).join('')
  const n = parseInt(v, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

// 把图片 + 水印绘制到 canvas；scale 为等比缩放比例（预览时缩小，导出时为 1）
function renderTo(canvas, scale) {
  const image = img.value
  const w = Math.max(1, Math.round(image.naturalWidth * scale))
  const h = Math.max(1, Math.round(image.naturalHeight * scale))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(image, 0, 0, w, h)
  drawWatermark(ctx, w, h, scale)
}

// 斜向平铺水印：把单个水印文字画成 tile，用 pattern 整体旋转后平铺，铺满整张图片
function drawWatermark(ctx, width, height, scale) {
  const text = watermarkText.value.trim()
  if (!text) return

  // 预览画布缩放时，字号与间距等比缩放，保证预览与导出视觉一致
  const size = Math.max(1, fontSize.value * scale)
  const gx = Math.max(0, gapX.value * scale)
  const gy = Math.max(0, gapY.value * scale)
  const font = `600 ${size}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`

  // 单个水印 tile：文字 + 右侧/下方留出的间距
  const tile = document.createElement('canvas')
  const tctx = tile.getContext('2d')
  tctx.font = font
  const tileW = Math.max(1, Math.ceil(tctx.measureText(text).width) + gx)
  const tileH = Math.max(1, Math.ceil(size * 1.3) + gy)
  tile.width = tileW
  tile.height = tileH
  tctx.font = font // 设置 canvas 尺寸会重置绘图状态，需重新设置
  const { r, g, b } = hexToRgb(color.value)
  tctx.fillStyle = `rgb(${r}, ${g}, ${b})`
  tctx.textBaseline = 'middle'
  tctx.fillText(text, 0, tileH / 2)

  const pattern = ctx.createPattern(tile, 'repeat')
  if (!pattern) return

  ctx.save()
  ctx.globalAlpha = opacity.value
  // 以图片中心为轴旋转，pattern 跟随变换，实现斜向平铺
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotate.value * Math.PI) / 180)
  ctx.fillStyle = pattern
  // 用对角线长度的矩形覆盖，保证旋转后铺满整张图
  const diag = Math.ceil(Math.sqrt(width * width + height * height))
  ctx.fillRect(-diag, -diag, diag * 2, diag * 2)
  ctx.restore()
}

function render() {
  if (!img.value || !imageInfo.value || !canvasRef.value) return
  const { width, height } = imageInfo.value
  const scale = Math.min(1, PREVIEW_MAX / Math.max(width, height))
  renderTo(canvasRef.value, scale)
}

// 图片或任意水印参数变化都实时重绘
watch([img, watermarkText, fontSize, color, opacity, gapX, gapY, rotate], render)

/* ==================== 导出 ==================== */

function download() {
  if (!img.value) {
    $message({ msg: '请先上传图片', type: 'error' })
    return
  }
  const canvas = document.createElement('canvas')
  renderTo(canvas, 1) // 按原始尺寸导出，水印大小与预览视觉一致
  const link = document.createElement('a')
  const base = ((imageInfo.value && imageInfo.value.name) || 'image').replace(/\.[^.]+$/, '')
  link.download = `${base}_水印.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  $message({ msg: '已生成并下载水印图片', type: 'success' })
}
</script>

<template>
  <div class="image-watermark">
    <header class="topbar">
      <div class="topbar-left">
        <h1>图片水印</h1>
        <span class="subtitle">上传图片，添加斜向平铺的文字水印</span>
      </div>
    </header>

    <div class="layout">
      <!-- 左侧：上传 + 水印设置 -->
      <section class="panel">
        <label class="field-label">上传图片</label>
        <div class="upload" @click="pickFile" @dragover.prevent @drop.prevent="onDrop">
          <template v-if="imageInfo">
            <div class="upload-name">{{ imageInfo.name }}</div>
            <div class="upload-meta">{{ imageInfo.width }} × {{ imageInfo.height }} px · 点击更换</div>
          </template>
          <template v-else>
            <div class="upload-icon">＋</div>
            <div class="upload-hint">点击或拖拽图片到这里</div>
            <div class="upload-meta">支持 PNG / JPG / WebP 等格式</div>
          </template>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="file-input"
          @change="onFileChange"
        />

        <label class="field-label">水印内容</label>
        <input
          v-model="watermarkText"
          class="text-input"
          type="text"
          placeholder="输入水印文字，留空则不显示"
        />

        <label class="field-label">水印样式</label>
        <div class="slider-row">
          <span class="slider-label">字号</span>
          <input
            type="range" min="12" max="120" step="1"
            v-model.number="fontSize"
          />
          <span class="slider-val">{{ fontSize }}px</span>
        </div>
        <div class="slider-row">
          <span class="slider-label">颜色</span>
          <input type="color" v-model="color" class="color-input" />
          <span class="slider-val">{{ color }}</span>
        </div>
        <div class="slider-row">
          <span class="slider-label">透明度</span>
          <input
            type="range" min="0.05" max="1" step="0.05"
            v-model.number="opacity"
          />
          <span class="slider-val">{{ Math.round(opacity * 100) }}%</span>
        </div>

        <label class="field-label">水印间距与角度</label>
        <div class="slider-row">
          <span class="slider-label">水平间距</span>
          <input
            type="range" min="0" max="400" step="2"
            v-model.number="gapX"
          />
          <span class="slider-val">{{ gapX }}px</span>
        </div>
        <div class="slider-row">
          <span class="slider-label">垂直间距</span>
          <input
            type="range" min="0" max="400" step="2"
            v-model.number="gapY"
          />
          <span class="slider-val">{{ gapY }}px</span>
        </div>
        <div class="slider-row">
          <span class="slider-label">倾斜角度</span>
          <input
            type="range" min="-90" max="90" step="1"
            v-model.number="rotate"
          />
          <span class="slider-val">{{ rotate }}°</span>
        </div>

        <button class="btn-primary" @click="download">下载水印图片（原始尺寸）</button>
      </section>

      <!-- 右侧：实时预览 -->
      <section class="preview">
        <div
          v-if="!imageInfo"
          class="preview-empty"
          @click="pickFile"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          上传图片后，这里会实时预览水印效果
        </div>
        <canvas v-show="imageInfo" ref="canvasRef" class="canvas"></canvas>
      </section>
    </div>
  </div>
</template>

<style>
.image-watermark {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text);
  text-align: left;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background 0.25s, color 0.25s;
}

.image-watermark,
.image-watermark * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 顶栏 */
.image-watermark .topbar {
  padding: 20px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  transition: background 0.25s;
}
.image-watermark .topbar-left {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.image-watermark .topbar h1 {
  font-size: 22px;
  color: var(--accent);
}
.image-watermark .subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.image-watermark .layout {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px 32px;
  align-items: flex-start;
}

/* 左侧面板 */
.image-watermark .panel {
  width: 360px;
  flex-shrink: 0;
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow);
  position: sticky;
  top: 24px;
  transition: background 0.25s;
}
.image-watermark .field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 18px 0 8px;
}
.image-watermark .field-label:first-child {
  margin-top: 0;
}

/* 上传区域 */
.image-watermark .upload {
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  padding: 22px 16px;
  text-align: center;
  cursor: pointer;
  background: var(--surface-2);
  transition: border-color 0.2s, background 0.25s;
}
.image-watermark .upload:hover {
  border-color: var(--accent);
}
.image-watermark .upload-icon {
  font-size: 28px;
  line-height: 1;
  color: var(--text-faint);
  margin-bottom: 8px;
}
.image-watermark .upload-hint {
  font-size: 14px;
  color: var(--text-secondary);
}
.image-watermark .upload-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  word-break: break-all;
}
.image-watermark .upload-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}
.image-watermark .file-input {
  display: none;
}

.image-watermark .text-input {
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
.image-watermark .text-input:focus {
  border-color: var(--accent);
}

/* 滑块行 */
.image-watermark .slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.image-watermark .slider-row:last-of-type {
  margin-bottom: 0;
}
.image-watermark .slider-label {
  width: 62px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-secondary);
}
.image-watermark .slider-row input[type='range'] {
  flex: 1;
  accent-color: var(--accent);
  cursor: pointer;
}
.image-watermark .slider-val {
  min-width: 52px;
  flex-shrink: 0;
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.image-watermark .color-input {
  flex: 1;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  background: var(--surface-2);
}

/* 主按钮 */
.image-watermark .btn-primary {
  width: 100%;
  margin-top: 22px;
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
.image-watermark .btn-primary:hover {
  background: var(--accent-strong);
}

/* 右侧预览 */
.image-watermark .preview {
  flex: 1;
  min-width: 0;
}
.image-watermark .preview-empty {
  border: 1.5px dashed var(--border);
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
  color: var(--text-faint);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.image-watermark .preview-empty:hover {
  border-color: var(--accent);
}
.image-watermark .canvas {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--shadow-lg);
  background: #fff;
}

@media (max-width: 860px) {
  .image-watermark .layout {
    flex-direction: column;
  }
  .image-watermark .panel {
    width: 100%;
    position: static;
  }
}
</style>
