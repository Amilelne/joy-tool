<template>
  <div class="bazi-wrapper">
    <header>
      <h1>八字排盘</h1>
    </header>

    <div class="bazi-input">
      <input
        v-model="input"
        class="bazi-text"
        type="text"
        placeholder="输入四柱八字，如：庚戌乙酉丙申己丑"
        @keyup.enter="paiPan"
      />
      <div class="bazi-gender">
        <label><input v-model="gender" type="radio" value="male" />乾造(男)</label>
        <label><input v-model="gender" type="radio" value="female" />坤造(女)</label>
      </div>
      <button class="btn" @click="paiPan">排盘</button>
    </div>

    <p v-if="error" class="bazi-error">{{ error }}</p>

    <div v-if="result" class="bazi-table">
      <table>
        <tbody>
          <tr class="row-head">
            <td class="row-label">日期</td>
            <td v-for="col in result.columns" :key="col.key">{{ col.label }}</td>
          </tr>

          <tr>
            <td class="row-label">主星</td>
            <td v-for="col in result.columns" :key="col.key">{{ col.mainStar }}</td>
          </tr>

          <tr class="row-big">
            <td class="row-label">天干</td>
            <td v-for="col in result.columns" :key="col.key">
              <span class="ganzhi" :class="wxClass(col.ganWx)">
                {{ col.gan }}
                <img
                  v-if="isImgIcon(col.ganWx)"
                  class="wx-icon wx-icon-img"
                  :src="wx(col.ganWx).icon"
                  alt=""
                />
                <span v-else class="wx-icon">{{ wx(col.ganWx).icon }}</span>
              </span>
            </td>
          </tr>

          <tr class="row-big">
            <td class="row-label">地支</td>
            <td v-for="col in result.columns" :key="col.key">
              <span class="ganzhi" :class="wxClass(col.zhiWx)">
                {{ col.zhi }}
                <img
                  v-if="isImgIcon(col.zhiWx)"
                  class="wx-icon wx-icon-img"
                  :src="wx(col.zhiWx).icon"
                  alt=""
                />
                <span v-else class="wx-icon">{{ wx(col.zhiWx).icon }}</span>
              </span>
            </td>
          </tr>

          <tr>
            <td class="row-label">藏干</td>
            <td v-for="col in result.columns" :key="col.key">
              <div
                v-for="(c, i) in col.cangGan"
                :key="i"
                class="cang-item"
                :class="wxClass(c.wx)"
              >
                {{ c.gan }}{{ c.wx }}
              </div>
            </td>
          </tr>

          <tr>
            <td class="row-label">副星</td>
            <td v-for="col in result.columns" :key="col.key">
              <div v-for="(s, i) in col.subStar" :key="i">{{ s }}</div>
            </td>
          </tr>

          <tr>
            <td class="row-label">星运</td>
            <td v-for="col in result.columns" :key="col.key">{{ col.xingYun }}</td>
          </tr>

          <tr>
            <td class="row-label">自坐</td>
            <td v-for="col in result.columns" :key="col.key">{{ col.ziZuo }}</td>
          </tr>

          <tr>
            <td class="row-label">空亡</td>
            <td v-for="col in result.columns" :key="col.key">{{ col.kongWang }}</td>
          </tr>

          <tr>
            <td class="row-label">纳音</td>
            <td v-for="col in result.columns" :key="col.key">{{ col.naYin }}</td>
          </tr>

          <tr>
            <td class="row-label">神煞</td>
            <td v-for="col in result.columns" :key="col.key" class="shensha-cell">
              <div v-for="(s, i) in col.shenSha" :key="i" class="shensha-item">{{ s }}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="bazi-note">
        <div class="note-line">
          <span class="note-label">天干留意：</span>
          <span>{{ result.ganNote.length ? result.ganNote.join('，') : '无' }}</span>
        </div>
        <div class="note-line">
          <span class="note-label">地支留意：</span>
          <span>{{ result.zhiNote.length ? result.zhiNote.join('，') : '无' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseBazi, WUXING_STYLE } from './bazi.js';

export default {
  name: 'BaziPan',
  data() {
    return {
      input: '庚戌乙酉丙申己丑',
      gender: 'male',
      result: null,
      error: '',
    };
  },
  methods: {
    wx(name) {
      return WUXING_STYLE[name] || { color: '#333', icon: '' };
    },
    isImgIcon(name) {
      const icon = this.wx(name).icon;
      return typeof icon === 'string' && icon.startsWith('data:image');
    },
    wxClass(name) {
      const map = { 木: 'wx-wood', 火: 'wx-fire', 土: 'wx-earth', 金: 'wx-metal', 水: 'wx-water' };
      return map[name] || '';
    },
    paiPan() {
      this.error = '';
      try {
        this.result = parseBazi(this.input, this.gender);
      } catch (e) {
        this.result = null;
        this.error = e.message;
      }
    },
  },
  mounted() {
    this.paiPan();
  },
};
</script>

<style scoped>
.bazi-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 12px 40px;
  --bazi-card: #ffffff;
  --bazi-card-alt: #fafafa;
  --bazi-head: #f0f0f0;
  --bazi-border: #eee;
  --bazi-title: #2c3e50;
  --bazi-label: #999;
  --bazi-text: #2c3e50;
  --bazi-head-text: #666;
  --bazi-note-bg: #fafafa;
  --bazi-accent: #c99a2e;
  --bazi-input-bg: #ffffff;
  --bazi-input-border: #d9d9d9;
  --wx-wood: #2ba471;
  --wx-fire: #d9001b;
  --wx-earth: #543e06;
  --wx-metal: #ed9e0a;
  --wx-water: #1677ff;
  color: var(--bazi-text);
}
.bazi-wrapper h1 {
  color: var(--bazi-title);
}
.bazi-input {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.bazi-text {
  width: 280px;
  height: 32px;
  padding: 0 12px;
  font-size: 16px;
  color: var(--bazi-text);
  background: var(--bazi-input-bg);
  border: 1px solid var(--bazi-input-border);
  border-radius: 6px;
  box-sizing: border-box;
}
.bazi-text::placeholder {
  color: var(--bazi-label);
}
.bazi-gender {
  display: flex;
  gap: 16px;
  font-size: 14px;
}
.bazi-gender label {
  cursor: pointer;
}
.bazi-error {
  color: #ff6b6b;
  font-size: 14px;
}
.bazi-table table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border-radius: 10px;
  overflow: hidden;
}
.bazi-table td {
  border-bottom: 1px solid var(--bazi-border);
  padding: 8px 4px;
  text-align: center;
  font-size: 15px;
  vertical-align: middle;
  background: var(--bazi-card);
}
.bazi-table tr:nth-child(odd) td {
  background: var(--bazi-card-alt);
}
.row-label {
  color: var(--bazi-label);
  font-size: 14px;
  width: 64px;
}
.row-head td {
  color: var(--bazi-head-text);
  font-weight: 600;
  background: var(--bazi-head) !important;
}
.row-big .ganzhi {
  font-size: 26px;
  font-weight: 700;
}
.wx-icon {
  font-size: 15px;
}
.wx-icon-img {
  width: 18px;
  height: 18px;
  vertical-align: -3px;
  display: inline-block;
}
.cang-item {
  font-size: 14px;
  line-height: 1.5;
}
.wx-wood { color: var(--wx-wood); }
.wx-fire { color: var(--wx-fire); }
.wx-earth { color: var(--wx-earth); }
.wx-metal { color: var(--wx-metal); }
.wx-water { color: var(--wx-water); }
.shensha-cell {
  vertical-align: top;
}
.shensha-item {
  color: var(--bazi-accent);
  font-size: 13px;
  line-height: 1.6;
}
.bazi-note {
  margin-top: 20px;
  padding: 16px;
  background: var(--bazi-note-bg);
  border-radius: 8px;
  text-align: left;
}
.note-line {
  font-size: 15px;
  line-height: 2;
}
.note-label {
  color: var(--bazi-accent);
}

@media (prefers-color-scheme: dark) {
  .bazi-wrapper {
    --bazi-card: #23232f;
    --bazi-card-alt: #1e1e29;
    --bazi-head: #2c2c3b;
    --bazi-border: #33333f;
    --bazi-title: #e8e8f0;
    --bazi-label: #8a8a99;
    --bazi-text: #e2e2ea;
    --bazi-head-text: #b8b8c6;
    --bazi-note-bg: #23232f;
    --bazi-accent: #e0b84c;
    --bazi-input-bg: #2a2a38;
    --bazi-input-border: #3a3a48;
    --wx-wood: #4ade80;
    --wx-fire: #ff6b6b;
    --wx-earth: #74612c;
    --wx-metal: #f4bd3e;
    --wx-water: #4d9fff;
  }
  .bazi-table table {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  }
}

@media screen and (max-width: 500px) {
  .bazi-text {
    width: 100%;
  }
  .bazi-table td {
    font-size: 13px;
    padding: 6px 2px;
  }
  .row-big .ganzhi {
    font-size: 20px;
  }
  .shensha-item {
    font-size: 12px;
  }
}
</style>
