<template>
  <div class="mainWrp">
    <div ref="typing" class="typing"></div>
    <div class="avatar">
        <img class="avatar_img" src="../assets/avatar.png" alt="avatar">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Typed from 'typed.js';

const typing = ref(null);

onMounted(() => {
  new Typed(typing.value, {
    strings: [
      '<span class="neon">欢迎来到这个神奇的网站!</span>',
      '<span class="neon">猪猪同学，把鼠标放到头像上</span>',
      '<span class="neon">好玩吗?</span>',
    ],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
});
</script>

<script>
export default {
  name: 'MainPage',
  data() {
    return {};
  },
};
</script>

<style scope>
.mainWrp {
  display: flex;
  justify-content: center;
  height: 100vh;
  background: url('../assets/cover1.jpg') center 0 no-repeat;
  background-size: cover;
}
.typing {
  font-weight: 600;
  font-size: 36px;
  color: white;
  margin-top: 200px;
}
.neon {
  color: #cce7f8;
  font-size: 2.5rem;
  -webkit-animation: shining 0.5s alternate infinite;
  animation: shining 0.5s alternate infinite;
}
@keyframes shining {
  from {
    text-shadow: 0 0 10px lightblue, 0 0 20px lightblue, 0 0 30px lightblue,
      0 0 40px skyblue, 0 0 50px skyblue, 0 0 60px skyblue;
  }
  to {
    text-shadow: 0 0 5px lightblue, 0 0 10px lightblue, 0 0 15px lightblue,
      0 0 20px skyblue, 0 0 25px skyblue, 0 0 30px skyblue;
  }
}
.avatar {
    position: absolute;
    top: 400px;
}
.avatar_img {
    width: 200px;
    height: 200px;
}
.avatar_img:hover {
    animation: spining 1s alternate infinite;
}
@keyframes spining {
    from {
        transform: rotate(0deg)  scale(0.8);
    }
    to{
        transform: rotate(360deg) scale(1.2);
    }
}
</style>
