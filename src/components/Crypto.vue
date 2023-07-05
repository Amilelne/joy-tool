<template>
  <div class="wrapper">
    <header>
      <h1>加解密算法</h1>
    </header>
    <div class="main">
      <div class="options">
        <span class="algo_label">选择算法: </span>
        <my-select
          v-model="algorithm"
          :menu="menu"
          :custom-style="{ width: '200px' }"
        ></my-select>
        <!-- <select name="cyptoAlgorithm" id="cyptoAlgorithm" v-model="algorithm">
          <option value="base64">base64</option>
          <option value="md5">md5</option>
        </select> -->
      </div>
      <div class="fpanel">
        <div>
          <textarea
            v-model="inputValue"
            name="encode"
            id="encode"
            cols="30"
            rows="10"
          ></textarea>
        </div>
        <div class="middle">
          <button class="btn btn-transfer" @click="encodeInput">加密</button>
          <button class="btn btn_default btn-transfer" @click="decodeInput">
            解密
          </button>
        </div>
        <div>
          <textarea
            v-model="cryptoValue"
            name="decode"
            id="decode"
            cols="30"
            rows="10"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js';

const menu = [
  {
    name: 'base64',
    value: 'base64',
  },
  {
    name: 'md5',
    value: 'md5',
  },
];
export default {
  name: 'CryptoValue',
  data() {
    return {
      inputValue: '',
      cryptoValue: '',
      algorithm: 'base64',
      menu,
    };
  },
  watch: {},
  methods: {
    encodeInput() {
      if (!this.inputValue) {
        this.$message({
          msg: '需要加密的内容为空',
          type: 'error',
        });
      }
      if (this.algorithm === 'base64') {
        this.cryptoValue = btoa(this.inputValue);
      } else if (this.algorithm === 'md5') {
        this.cryptoValue = CryptoJS.MD5(this.inputValue);
      }
    },
    decodeInput() {
      if (!this.cryptoValue) {
        this.$message({
          msg: '需要解密的内容为空',
          type: 'error',
        });
      }
      if (this.algorithm === 'base64') {
        this.inputValue = atob(this.cryptoValue);
      } else if (this.algorithm === 'md5') {
        this.inputValue = CryptoJS.MD5(this.cryptoValue);
      }
    },
    onTransfer() {
      if (this.inputValue) {
        this.encodeInput();
      } else {
        this.decodeInput();
      }
    },
  },
};
</script>

<style scope>
.main {
  margin-top: 48px;
}
.options {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}
.algo_label {
  margin-right: 12px;
}
.fpanel {
  display: flex;
  gap: 24px;
  margin-top: 36px;
}
.middle {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 500px) {
  .fpanel {
    flex-direction: column;
    margin-left: 10px;
    margin-right: 10px;
  }
  .main {
    margin-top: 24px;
  }
}
</style>
