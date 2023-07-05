<template>
  <li>
    <button class="dropdown_btn">
      {{ props.text }}
      <svg
        class="dd-nav-w-5 dd-nav-h-5 dd-nav-ml-1"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        ></path>
      </svg>
    </button>

    <div
      ref="dropdownMenu"
      class="dropdownMenu"
      :style="{
        height: isOpen ? 'unset' : '0px',
        minHeight: isOpen ? `${height}px` : 'unset',
      }"
    >
      <ul>
        <slot></slot>
      </ul>
    </div>
  </li>
</template>

<script setup>
import { ref, computed, onMounted, provide, inject } from 'vue';

const isOpening = ref(false);
const props = withDefaults(
  defineProps({
    text: String,
    closeOthers: Boolean,
  }),
  {
    closeOthers: true,
  }
);

const dropdownMenu = ref();
const dropdownTrigger = ref();
const height = ref(0);

const isOpen = ref(false);
const isRoot = computed(() => {
  const el = dropdownMenu.value?.parentNode?.parentNode?.parentNode;
  return el?.id === 'dropdown-root';
});

const closeAllDropdownMenu = inject('closeAllDropdownMenu');
const toggleDropdownMenu = () => {
  if (dropdownMenu.value) {
    if (props.closeOthers && isRoot.value && !isOpen.value) {
      closeAllDropdownMenu();
    }
    // todo: class toggle
    isOpen.value = !isOpen.value;
  }
};

const closeDropdownMenu = () => {
  if (isOpen.value) {
    toggleDropdownMenu();
  }
};

const openDropdownMenu = () => {
  isOpening.value = true;
  if (dropdownMenu.value && !isOpen.value) {
    isOpen.value = true;
  }
  setTimeout(() => {
    isOpening.value = false;
  });
};

const addCloseDropdownMenuCallback = inject('addCloseDropdownMenuCallback');
addCloseDropdownMenuCallback(() => {
  if (!isOpening.value) {
    closeDropdownMenu();
  }
});

onMounted(() => {
  if (dropdownMenu.value) {
    height.value = dropdownMenu.value.clientHeight;
    dropdownMenu.value.style.height = '0px';
  }
});
defineExpose({
  openDropdownMenu,
  closeDropdownMenu,
});
</script>

<style scope></style>
