<template>
  <nav>
    <a
      href="#/long-text-pics"
      :class="[
        'navLink',
        currentPath === '/' || currentPath === '#/' || currentPath === '#/long-text-pics'
          ? 'navLink_active'
          : '',
      ]"
      >长文转图</a
    >
    <a
      href="#/proto"
      :class="[
        'navLink',
        currentPath === '#/proto'
          ? 'navLink_active'
          : '',
      ]"
      >Proto</a
    >
    <a
      href="#/qrcode"
      :class="['navLink', currentPath === '#/qrcode' ? 'navLink_active' : '']"
      >Qrcode</a
    >
    <a
      href="#/svg"
      :class="['navLink', currentPath === '#/svg' ? 'navLink_active' : '']"
      >SVG</a
    >
    <a
      href="#/crypto"
      :class="['navLink', currentPath === '#/crypto' ? 'navLink_active' : '']"
      >Crypto</a
    >
    <a
      href="#/bazi"
      :class="['navLink', currentPath === '#/bazi' ? 'navLink_active' : '']"
      >八字</a
    >
    <a
      href="#/watermark"
      :class="['navLink', currentPath === '#/watermark' ? 'navLink_active' : '']"
      >图片水印</a
    >
    <button class="theme-toggle" type="button" @click="toggleTheme">
      {{ dark ? '亮色模式' : '暗色模式' }}
    </button>
  </nav>
  <div class="content">
    <component :is="currentView" />
  </div>
</template>

<script>
import Proto from './components/Proto.vue';
import Qrcode from './components/Qrcode/Qrcode.vue';
import UrlEncoder from './components/UrlEncoder.vue';
import Crypto from './components/Crypto.vue';
import Bazi from './components/Bazi/Bazi.vue';
import LongTextPics from './components/LongTextPics/LongTextPics.vue';
import ImageWatermark from './components/ImageWatermark/ImageWatermark.vue';

const routes = {
  '/': LongTextPics,
  '/proto': Proto,
  '/qrcode': Qrcode,
  '/svg': UrlEncoder,
  '/crypto': Crypto,
  '/bazi': Bazi,
  '/long-text-pics': LongTextPics,
  '/watermark': ImageWatermark
};

export default {
  name: 'App',
  components: {
    Proto,
  },
  data() {
    console.log("xxxx", window.location.hash);
    return {
      currentPath: window.location.hash || '/',
      dark: false,
    };
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || LongTextPics;
    },
  },
  watch: {
    dark: {
      immediate: true,
      handler(val) {
        document.documentElement.classList.toggle('dark', val);
      },
    },
  },
  created() {
    // 主题初始化：优先读取用户上次的选择，否则跟随系统偏好
    const saved = localStorage.getItem('theme');
    this.dark = saved
      ? saved === 'dark'
      : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash;
    });
    // 用户没有手动选择过主题时，跟随系统实时切换
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && mq.addEventListener) {
      mq.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) this.dark = e.matches;
      });
    }
  },
  methods: {
    toggleTheme() {
      this.dark = !this.dark;
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    },
  },
};
</script>

<style>
:root {
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
  --accent: #1677ff;
  --accent-strong: #0958d9;
  --shadow: rgba(0, 0, 0, 0.04);
  --shadow-md: rgba(0, 0, 0, 0.06);
  --shadow-lg: rgba(0, 0, 0, 0.1);
}
html.dark {
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
  --accent: #4d9fff;
  --accent-strong: #1677ff;
  --shadow: rgba(0, 0, 0, 0.28);
  --shadow-md: rgba(0, 0, 0, 0.35);
  --shadow-lg: rgba(0, 0, 0, 0.5);
}
body {
  margin: 0;
  background: var(--bg);
  transition: background 0.25s;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  min-height: 100vh;
}
nav {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  box-shadow: 0 3px 10px 0 var(--shadow-lg);
}
.navLink {
  color: var(--text);
  font-size: 24px;
  text-decoration: none;
  font-weight: 600;
  position: relative;
}
.navLink_active::after {
  content: '';
  position: absolute;
  width: 60px;
  margin: auto;
  height: 4px;
  left: 0;
  right: 0;
  top: 48px;
  background-image: linear-gradient(270deg, rgba(0, 141, 252, 0.3), #008dfc);
}
.navLink:hover {
  color: var(--accent);
}
.theme-toggle {
  margin-left: auto;
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
.theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.content {
  text-align: center;
}
.btn {
  font-size: 18px;
  color: #fff;
  background-color: #1677ff;
  box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);
  padding: 4px 15px;
  border: none;
  border-radius: 6px;
  height: 32px;
  cursor: pointer;
  width: 100px;
}
.btn_default {
  background-color: var(--surface);
  border-color: var(--border);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn_link {
  padding: 0;
  border: 0;
  border-bottom: 1px dashed;
  background: transparent;
  align-self: center;
  font: inherit;
  line-height: 1;
  font-size: 14px;
  color: steelblue;
  cursor: pointer;
}
input[type='file']::file-selector-button {
  height: 2.5rem;
  font-size: 1rem;
  color: #fff;
  border: 1px solid #2a80eb;
  padding: 0.5rem 1rem;
  background-color: #2a80eb;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 5px;
}
@media screen and (max-width: 500px) {
  .navLink {
    font-size: 16px;
  }
  .navLink_active::after {
    top: 30px;
    width: 30px;
  }
}
</style>
