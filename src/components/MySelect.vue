<template>
  <div
    class="menu_wrapper"
    :style="customStyle"
    v-click-outside="onClickOutside"
  >
    <div class="menu" @click="handleClick" :style="customStyle">
      <span v-if="defaultValue">{{ defaultValue }}</span>
      <span v-else>{{ placeholder }}</span>
    </div>
    <div class="options_panel" v-show="menuShow">
      <div
        class="option"
        v-for="item in menu"
        :key="item.id"
        data-value="item.value"
      >
        {{ item.name }}
      </div>
      <div class="mask"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
defineProps({
  menu: {
    type: Object,
    value: [],
  },
  defaultValue: {
    type: String,
    value: '',
  },
  customStyle: {
    type: Object,
  },
  placeholder: {
    type: String,
    value: '请选择',
  },
});
let menuShow = ref(false);
function handleClick() {
  console.log('click');
  console.log(menuShow.value);
  menuShow.value = !menuShow.value;
  console.log(menuShow.value);
}

const vClickOutside = {
  mounted(el, binding) {
    function eventHandler(e) {
      if (el.contains(e.target)) {
        return false;
      }
      if (binding.value && typeof binding.value === 'function') {
        binding.value(e);
      }
    }
    el.__click_outside__ = eventHandler;
    document.addEventListener('click', el.__click_outside__);
  },
  beforeUnmount() {
    // document.removeEventListener('click', el.__click_outside__);
    // delete el.__click_outside__;
  },
};

const onClickOutside = () => {
  menuShow.value = false;
};
</script>

<style scope>
.menu_wrapper {
  display: block;
  font-size: 18px;
}
.menu {
  min-width: 50px;
  min-height: 24px;
  border: 2px solid lightgray;
  border-radius: 4px;
}
.options_panel {
  position: relative;
  background-color: white;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.35);
  border-radius: 5px;
  z-index: 100;
}
.option {
  padding: 8px 4px;
}
.option:hover {
  background-color: lightgray;
}
</style>
