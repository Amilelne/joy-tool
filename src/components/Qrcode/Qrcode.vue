<template>
  <div class="qrcode_wrp">
    <div class="generate_qrcode_wrp">
      <h2>生成二维码</h2>
      <div>
        <div class="inputText_wrp">
          <input
            ref="generateInput"
            type="text"
            placeholder="请输入文字或链接"
            class="inputText"
          />
          <button class="btn generate_btn" @click="onGenerate">生成</button>
        </div>
        <div class="generate_result_wrp" v-if="generateText">
          <div class="generate_result">
            <div><vue-qr ref="qrCode" :text="generateText" /></div>
            <button class="btn btn_default" @click="onDownload">下载</button>
          </div>
        </div>
      </div>
    </div>
    <div class="analysis_qrcode_wrp">
      <h2>解析二维码</h2>
      <div class="input_wrp">
        <div>
          <input
            type="file"
            name="inputImage"
            id="inputImage"
            accept="image/*"
            @change="onUploadImage"
          />
        </div>
        <div class="pasteImage">
          <img
            v-if="imgUrl"
            :src="imgUrl"
            alt="img"
            class="paste_img"
            ref="qrcodeImg"
          />
        </div>
      </div>
      <div class="btn_wrp">
        <button class="btn" @click="onDetect">识别</button>
      </div>
      <div class="result_wrp" v-if="result">
        <p>识别结果</p>
        <p>{{ result }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import vueQr from 'vue-qr/src/packages/vue-qr.vue';
let barcodeDetector;
if ('BarcodeDetector' in window) {
  barcodeDetector = new window.BarcodeDetector({
    formats: ['qr_code'],
  });
}
const reader = new FileReader();
export default {
  name: 'joy-qrcode',
  components: { vueQr },
  data() {
    return {
      result: '',
      imgUrl: '',
      generateText: '',
    };
  },
  mounted() {
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      let file;
      if (items && items.length) {
        for (let item of items) {
          if (item.type.indexOf('image') !== -1) {
            file = item.getAsFile();
            break;
          }
        }
      }
      if (file) {
        const _t = this;
        reader.onload = function () {
          _t.imgUrl = this.result;
          console.log('protoText:', _t.imgUrl);
        };
        reader.readAsDataURL(file);
      }
    });
  },
  methods: {
    onGenerate() {
      this.generateText = this.$refs.generateInput.value;
    },
    onDownload() {
      const a = document.createElement('a');
      a.download = 'qrcode';
      a.href = this.$refs.qrCode.$el.src;
      a.click()
    },
    onUploadImage(e) {
      const files = e.target.files;
      const _t = this;
      if (files.length) {
        let file = files[0];
        reader.onload = function () {
          _t.imgUrl = this.result;
        };
        reader.readAsDataURL(file);
      }
    },
    onDetect() {
      if (!barcodeDetector) {
        this.$message({
          msg: '浏览器不支持',
          type: 'error',
        });
        return;
      }
      barcodeDetector
        .detect(this.$refs.qrcodeImg)
        .then((barcodes) => {
          barcodes.forEach((barcode) => {
            console.log('xxx', barcode);
            this.result = barcode.rawValue;
          });
        })
        .catch((err) => {
          this.result = '二维码解析错误: ' + err;
        });
    },
  },
};
</script>

<style scope>
.generate_qrcode_wrp {
  padding: 32px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.35);
}
.analysis_qrcode_wrp {
  min-height: 600px;
}
.pasteImage {
  min-height: 200px;
  min-width: 200px;
  border: 1px dashed skyblue;
  background-color: white;
  flex: 1;
  display: grid;
  place-items: center;
}
.pasteImage:empty::before {
  content: '或粘贴图片到这里';
  color: gray;
}
.input_wrp {
  display: flex;
  align-items: center;
  background-color: #f0f3f9;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.35);
  padding: 32px;
  margin: 32px;
}
.btn_wrp {
  margin-top: 32px;
}
.paste_img {
  max-height: 160px;
  max-width: 90%;
  object-fit: contain;
}
.result_wrp {
  border: 1px dashed lightskyblue;
  margin: 32px;
  padding: 32px;
}
.generate_result_wrp {
  display: flex;
  align-items: center;
  justify-content: center;
}
.generate_result {
  border: 1px dashed lightskyblue;
  padding: 32px;
}
.inputText_wrp {
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.inputText {
  padding: 16px;
  width: 300px;
}
.generate_btn {
  margin-left: 32px;
  height: 50px !important;
}

@media screen and (max-width: 500px) {
  .inputText_wrp {
    padding: 8px;
  }
  .input_wrp {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
