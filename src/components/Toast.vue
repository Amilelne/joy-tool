<template>
  <Transition>
    <div class="toast_wrp" v-show="isShow">
      <div :class="['toast_inner', 'toast_inner-' + type]">
        {{ msg }}
      </div>
    </div>
  </Transition>
</template>

<script>
import { createVNode, render } from 'vue';

const Toast = {
  name: 'mp-toast',
  props: {
    msg: {
      // toast 显示的wording
      type: String,
      default: '',
    },
    // 类型, success/error
    type: {
      type: String,
      default: 'success',
    },
  },
  data() {
    return {
      isShow: false,
    };
  },
  mounted() {
    this.isShow = true;
  },
};

// 创建消息提示节点
const div = document.createElement('div');
document.body.appendChild(div);

const Message = ({ msg, type, duration }) => {
  let timer = null;
  // 渲染虚拟节点
  const vnode = createVNode(Toast, { msg, type, duration });
  render(vnode, div);
  clearTimeout(timer);
  // 渲染空节点
  timer = setTimeout(() => {
    render(null, div);
  }, duration || 2000);
};

Toast.install = (app) => {
  // 注册全局属性
  app.config.globalProperties.$message = Message;
};
export default Toast;
</script>

<style scope>
.toast_wrp {
  background-color: white;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 1;
  visibility: visible;
  z-index: 50000;
  transition: all 0.2s 0.2s;
}
.toast_inner {
  padding: 16px 32px;
  color: white;
  font-size: 17px;
  font-weight: 500;
  border-radius: 10px;
  border: 1px solid white;
}
.toast_inner-success {
  background: rgb(240, 249, 235);
  border-color: rgb(225, 243, 216);
  color: #67c23a;
}
.toast_inner-error {
  background: rgb(254, 240, 240);
  border-color: rgb(253, 226, 226);
  color: #f56c6c;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  transform: translate3d(0, -75px, 0);
  opacity: 0;
}
</style>
