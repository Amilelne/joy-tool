<template>
  <div class="tooltip__wrp">
    <div ref="target">
      <slot name="target"></slot>
    </div>
    <transition name="tooltip__fade">
      <span
        v-show="isShow"
        ref="main"
        :class="['tooltip', 'tooltip__' + position]"
      >
        <slot v-if="$slots.content" name="content"></slot>
        <slot v-else>{{ content }}</slot>
      </span>
    </transition>
  </div>
</template>

<script>
const Tooltip = {
  name: 'mp-tooltip',
  props: {
    trigger: {
      type: String,
      default: 'hover',
      validator: (value) =>
        ['click', 'hover', 'manual', 'custom'].indexOf(value) > -1,
    },
    content: {
      type: String,
      default: '',
    },
    // 箭头的位置
    /*
    up-left     | up-center     | up-right
    down-left   | down-center   | down-right
    left-top    | left-center   | left-bottom
    right-top   | right-center  | right-bottom
    */
    position: {
      type: String,
      default: 'down-center',
    },
    delay: {
      type: Number,
      default: 200,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShow: this.value,
    };
  },
  watch: {
    value(val) {
      if (val !== this.isShow) {
        this.show(val);
      }
    },
  },
  mounted() {
    if (this.$slots && this.$slots.target) {
      this.target = this.$refs.target;
      this.main = this.$refs.main;
      if (this.trigger === 'click') {
        this.target.addEventListener('click', this.doClick);
        document.addEventListener('click', this.handleDocumentClick);
      }
    }
  },
  beforeDestroy() {
    if (this.$slots && this.$slots.target) {
      if (this.trigger === 'click') {
        this.target.removeListener('click', this.doClick);
        document.removeEventListener('click', this.handleDocumentClick);
      }
    }
  },
  methods: {
    show(val) {
      this.isShow = val;
      val ? this.$emit('show') : this.$emit('hide');
      this.$emit('change', val);
      setTimeout(() => {
        this.isShow = false;
      }, 1000);
    },
    doClick(e) {
      e.stopPropagation();
      this.show(true);
      return false;
    },
    handleDocumentClick(e) {
      if (this.target && this.$el) {
        if (!this.$el.contains(e.target) && !this.target.contains(e.target)) {
          this.show(false);
        }
      }
    },
  },
};

typeof Tooltip.template === 'function' && Tooltip.template(Tooltip);
Tooltip.install = (Vue) => {
  console.log('xxxx');
  Vue.component(Tooltip.name, Tooltip);
};
export default Tooltip;
</script>

<style scope>
.tooltip__wrp {
  position: relative;
}
.tooltip {
  background-color: white;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 1;
  visibility: visible;
  z-index: 50000;
  transition: all 0.2s 0.2s;
}
.tooltip__down-center {
  left: 50%;
}
</style>
