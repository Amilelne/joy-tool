<template>
  <div class="wrapper">
    <header>
      <h1>URL-encoder for SVG</h1>
    </header>
    <div class="panel">
      <div class="quotes">
        <strong>切换引号:</strong>
        <span
          @click="changeQuote"
          id="0"
          :class="['option', activeQuote === 0 ? 'option_active' : '']"
          >单引号</span
        >
        <span>/</span>
        <span
          @click="changeQuote"
          id="1"
          :class="['option', activeQuote === 1 ? 'option_active' : '']"
          >双引号</span
        >
      </div>
      <div class="layer">
        <div class="part">
          <div class="header">
            <span class="name">Insert svg:</span>
            <div class="header_right">
              <div class="url_btn">
                <label for="uploadSvg">上传文件</label>
                <input
                  class="uploadSvg"
                  type="file"
                  id="uploadSvg"
                  @change="onUploadSvg"
                />
              </div>
              <span class="url_btn" @click="setExampleSvg">示例</span>
            </div>
          </div>
          <div>
            <textarea
              v-model="svgValue"
              name="svg"
              id="svg"
              cols="30"
              rows="10"
            ></textarea>
          </div>
        </div>
        <div class="part">
          <div class="header">
            <span class="name">Encoded:</span>
            <div class="header_right">
              <span
                class="url_btn copy_btn"
                @click="onCopy"
                data-clipboard-target="#encoded"
                >复制</span
              >
            </div>
          </div>
          <div>
            <textarea
              v-model="encodedValue"
              name="encoded"
              id="encoded"
              cols="30"
              rows="10"
              @input="onEncodedChange"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="layer">
        <div class="part">
          <div class="header">
            <span class="name">Ready for CSS:</span>
            <div class="header_right">
              <span
                class="url_btn copy_btn"
                @click="onCopy"
                data-clipboard-target="#result"
                >复制</span
              >
            </div>
          </div>
          <div>
            <textarea
              v-model="resultValue"
              name="svg"
              id="result"
              cols="30"
              rows="10"
              @input="onResultChange"
            ></textarea>
          </div>
        </div>
        <div class="part">
          <div class="header">
            <span class="name">Preview:</span>
            <div class="header_right">
              背景色:
              <div class="contrast_buttons" @click="onChangeBackground">
                <button
                  :class="[
                    'contrast_button contrast_button__white',
                    currentBackground === 0 ? 'contrast_button__current' : '',
                  ]"
                  id="0"
                ></button>
                <button
                  :class="[
                    'contrast_button contrast_button__silver',
                    currentBackground === 1 ? 'contrast_button__current' : '',
                  ]"
                  id="1"
                ></button>
                <button
                  :class="[
                    'contrast_button contrast_button__black',
                    currentBackground === 2 ? 'contrast_button__current' : '',
                  ]"
                  id="2"
                ></button>
              </div>
            </div>
          </div>
          <div class="demo-wrapper" ref="demoWrapper">
            <div ref="resultDemo" class="demo"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ClipboardJS from 'clipboard';

const Quotes = {
  single: `'`,
  double: `"`,
};
const Colors = ['white', 'silver', 'black'];
const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g;
export default {
  data() {
    return {
      quote: {
        level1: Quotes.single,
        level2: Quotes.double,
      },
      activeQuote: 0, // 默认单引号
      svgValue: '',
      encodedValue: '',
      resultValue: '',
      currentBackground: 0, // 0白色 1银色 2黑色
    };
  },
  mounted() {
    this.clipboard = new ClipboardJS('.copy_btn');
  },
  unmounted() {
    this.clipboard.destroy();
  },
  watch: {
    svgValue() {
      this.updateTextarea();
    },
    activeQuote(val) {
      if (val) {
        this.quote.level1 = Quotes.double;
        this.quote.level2 = Quotes.single;
      } else {
        this.quote.level1 = Quotes.single;
        this.quote.level2 = Quotes.double;
      }
    },
  },
  methods: {
    setExampleSvg() {
      this.svgValue = `<svg><circle r="50" cx="50" cy="50" fill="tomato"/><circle r="41" cx="47" cy="50" fill="orange"/><circle r="33" cx="48" cy="53" fill="gold"/><circle r="25" cx="49" cy="51" fill="yellowgreen"/><circle r="17" cx="52" cy="50" fill="lightseagreen"/><circle r="9" cx="55" cy="48" fill="teal"/></svg>`;
    },
    onResultChange() {
      const singleQuote = /['"](.*)['"]/;
      const match = singleQuote.exec(this.resultValue);
      if (match && match[1]) {
        const removeType = match[1].split(',')[1];
        if (removeType) {
          this.encodedValue = removeType;
          this.svgValue = decodeURIComponent(removeType);
        }
      }
    },
    onEncodedChange() {
      this.svgValue = decodeURIComponent(this.encodedValue);
    },
    updateTextarea() {
      if (!this.svgValue) {
        this.resultValue = '';
        this.encodedValue = '';
        this.$refs.resultDemo.setAttribute('style', null);
        return;
      }
      const namespaced = this.addNameSpace(this.svgValue);
      const escaped = this.encodedSVG(namespaced);
      this.encodedValue = escaped;
      const resultCss = `background-image: url(${this.quote.level1}data:image/svg+xml,${escaped}${this.quote.level1});`;
      this.resultValue = resultCss;
      this.$refs.resultDemo.setAttribute(`style`, resultCss);
    },
    onUploadSvg(e) {
      const files = e.target.files;
      const _t = this;
      if (files.length) {
        let file = files[0];
        let reader = new FileReader();
        reader.onload = function () {
          _t.svgValue = this.result;
        };
        reader.readAsText(file);
      }
    },
    addNameSpace(data) {
      if (data.indexOf(`http://www.w3.org/2000/svg`) < 0) {
        data = data.replace(
          /<svg/g,
          `<svg xmlns=${this.quote.level2}http://www.w3.org/2000/svg${this.quote.level2}`,
        );
      }
      return data;
    },
    encodedSVG(data) {
      if (this.quote.level1 === Quotes.double) {
        data = data.replace(/"/g, `'`);
      } else {
        data = data.replace(/'/g, `"`);
      }
      return data.replace(symbols, encodeURIComponent);
    },
    changeQuote(e) {
      const quoteId = Number(e.target.id);
      this.activeQuote = quoteId;
      this.updateTextarea();
    },
    onCopy() {
      // 触发Clipboard的监听函数执行后，销毁当前的Clipboard实例并重新实例化
      this.clipboard.on('success', () => {
        this.$message({
          msg: '复制成功',
          type: 'success',
        });
        this.clipboard.destroy();
        this.clipboard = new ClipboardJS('.copy_btn');
      });

      this.clipboard.on('error', () => {
        this.$message({
          msg: '复制失败',
          type: 'error',
        });
      });
    },
    onChangeBackground(e) {
      const id = Number(e.target.id);
      if (id !== undefined && typeof id === 'number') {
        this.currentBackground = id;
        this.$refs.demoWrapper.style.background = Colors[id];
      }
    },
  },
};
</script>

<style scope>
* {
  box-sizing: border-box;
}
.wrapper {
  max-width: 650px;
  margin: 1.5rem auto 4rem;
  font-family: monospace;
}
header {
  border-bottom: 1px solid #ccc;
}
.panel {
  margin-top: 52px;
}
.quotes {
  text-align: left;
  margin: 16px 0;
  font-size: 16px;
}
.layer {
  display: flex;
  gap: 64px;
  margin-bottom: 64px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header_right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.contrast_buttons {
  display: flex;
}
textarea {
  width: 100%;
  height: 180px;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 13px;
  font-family: monospace;
  padding: 8px 16px;
  box-sizing: border-box;
}
.name {
  margin: 0;
  margin-bottom: 0.15em;
  font: 1.3em/1.4 Georgia, serif;
  font-weight: 600;
}
.demo-wrapper {
  width: 100%;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  padding: 8px 16px;
  height: 180px;
}
.demo {
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
}
.part {
  flex: 1;
}
.option {
  cursor: pointer;
}
.option_active {
  padding: 0;
  border: 0;
  border-bottom: 1px dashed;
  background: transparent;
  align-self: center;
  color: steelblue;
}
.uploadSvg {
  display: none;
}
.url_btn {
  font-size: 12px;
  background-color: #fff;
  border-color: #d9d9d9;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.88);
  border: 1px solid #d9d9d9;
  cursor: pointer;
  padding: 4px 15px;
  border-radius: 4px;
}
.contrast_button {
  display: block;
  width: 2em;
  height: 2em;
  margin-left: 5px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.25);
  outline: none;
  cursor: pointer;
}
.contrast_button__current {
  box-shadow: 0 0 0 3px steelblue;
}
.contrast_button__black {
  background-color: black;
}
.contrast_button__white {
  background-color: white;
}
.contrast_button__silver {
  background-color: silver;
}

@media screen and (max-width: 500px) {
  .layer {
    flex-direction: column;
    gap: 16px;
  }
  .panel {
    margin: 52px 10px 0;
  }
}
</style>
