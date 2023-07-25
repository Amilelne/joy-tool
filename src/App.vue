<template>
  <nav>
    <a
      href="#/"
      :class="['navLink', currentPath === '/' || currentPath === '#/' ? 'navLink_active' : '']"
      >首页</a
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
      href="#/editor"
      :class="['navLink', currentPath === '#/editor' ? 'navLink_active' : '']"
      >Editor</a
    >
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
import Main from './components/Main.vue';
import MyEditor from './components/MyEditor/MyEditor.vue';

const routes = {
  '/': Main,
  '/proto': Proto,
  '/qrcode': Qrcode,
  '/svg': UrlEncoder,
  '/crypto': Crypto,
  '/editor': MyEditor
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
    };
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'];
    },
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash;
    });
  },
};
</script>

<style>
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
nav {
  display: flex;
  gap: 20px;
  padding: 20px;
  color: white;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.08);
}
.navLink {
  color: black;
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
  color: #1677ff;
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
  background-color: #fff;
  border-color: #d9d9d9;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.88);
  border: 1px solid #d9d9d9;
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
