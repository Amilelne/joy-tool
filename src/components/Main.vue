<template>
  <div class="markdown-editor">
    <codemirror
      v-model="code"
      placeholder="请输入"
      :style="{ height: '100vh', width: '50%' }"
      :autofocus="true"
      :indent-with-tab="true"
      :extensions="extensions"
      @change="debounceEditorChange"
    />
    <div class="rendered">
      <div class="rendered_html" v-html="parseHtml"></div>
      <div class="actions">
        <div>
          <img
            class="action_icon"
            src="../assets/mp.svg"
            alt="mp"
            @click="onCopyMp"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { markdownParser } from '../utils/markdowm/parse';
import { debounce } from 'lodash';
import juice from 'juice';
import basicStyle from '../template/basicStyle';

export default {
  name: 'MainPage',
  components: { Codemirror },
  setup() {
    const code = ref('');
    const extensions = [markdown()];
    return {
      code,
      extensions,
    };
  },
  created() {
    this.debounceEditorChange = debounce(this.onEditorChange, 1000);
  },
  data() {
    return {
      parseHtml: '',
    };
  },
  methods: {
    onEditorChange(val) {
      this.parseHtml = markdownParser.render(val);
    },
    onCopyMp() {
      this.$message({
        msg: '复制成功，请粘贴到微信公众号平台',
        type: 'success',
      });
      const htmlText = `<section id="nice">${this.parseHtml}</section>`;
      const styledHtml = juice.inlineContent(htmlText, basicStyle, {
        inlinePseudoElements: true,
        preserveImportant: true,
      });
      navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([styledHtml], { type: 'text/html' }),
        }),
      ]);
    },
  },
};
</script>

<style scope>
.markdown-editor {
  display: flex;
  text-align: left;
}
.rendered {
  background: rgba(0, 0, 0, 0.02);
  height: 100vh;
  width: 50%;
  padding: 20px;
  display: flex;
}
.rendered_html {
  background-color: white;
  overflow-y: auto;
  padding: 25px 20px;
  height: 100%;
  width: 90%;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
}
.actions {
  margin-left: 16px;
  justify-content: center;
  display: flex;
}
.action_icon {
  width: 24px;
}
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
    transform: rotate(0deg) scale(0.8);
  }
  to {
    transform: rotate(360deg) scale(1.2);
  }
}
</style>
