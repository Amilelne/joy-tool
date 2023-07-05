<template>
  <div
    :class="['menu_wrapper', menuShow ? 'menu_wrapper_active' : '']"
    :style="customStyle"
    v-click-outside="onClickOutside"
  >
    <div class="menu" @click="handleClick" :style="customStyle">
      <div class="select_value">
        <span v-if="modelValue">{{ modelValue }}</span>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <img class="select_arrow" src="../assets/downArrow.svg" alt="" />
    </div>
    <div class="options_panel" v-show="menuShow" :style="optionsPanelStyle">
      <div
        class="option"
        v-for="item in menu"
        :key="item.id"
        :data-value="item.value"
        @click="onSelectOption"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const emit = defineEmits(['update:modelValue']); // v-model数据更新事件
const props = defineProps({
  menu: {
    type: Object, // 选项数组
    value: [],
  },
  modelValue: {
    // v-model传递的值
    type: String,
    default: null,
  },
  customStyle: {
    // 自定义选项样式
    type: Object,
  },
  placeholder: {
    // select的placeholder
    type: String,
    default: '请选择',
  },
});

let menuShow = ref(false); // 是否显示选项面板

// 计算选项面板的样式，宽度跟select一致
let optionsPanelStyle = computed(() => {
  if (props.customStyle && props.customStyle.width) {
    return {
      width: props.customStyle.width,
    };
  }
  return {};
});

function handleClick() {
  // 点击选择框，切换选项面板的显示/隐藏状态
  menuShow.value = !menuShow.value;
}

const onSelectOption = (e) => {
  // 点击选项时，关闭选项面板并更新v-model的值
  menuShow.value = !menuShow.value;
  emit('update:modelValue', e.target.dataset.value);
};
const onClickOutside = () => {
  menuShow.value = false;
};
</script>

<style scope>
.menu_wrapper {
  display: block;
  font-size: 18px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-family: monospace;
}
.menu {
  min-width: 50px;
  min-height: 24px;

  padding: 8px 16px;
  display: flex;
  align-items: center;
}
.menu_wrapper:hover {
  border-color: #4096ff;
}
.menu_wrapper_active {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
}
.select_value {
  flex-grow: 1;
  text-align: left;
}
.placeholder {
  color: rgba(0, 0, 0, 0.3);
}
.select_arrow {
  width: 24px;
}
.options_panel {
  position: absolute;
  background-color: white;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.35);
  border-radius: 5px;
  z-index: 100;
}
.option {
  padding: 8px 16px;
}
.option:hover {
  background-color: #e6f4ff;
}
</style>
