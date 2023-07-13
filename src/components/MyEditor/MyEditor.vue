<template>
  <div class="editor_wrp">
    <div class="editor_instance" id="editorjs"></div>
    <div class="editor_actions">
      <button class="btn save-btn" @click="onSave">保存</button>
    </div>
    <div class="right_panel">
      <div>
        <img
          class="panel_icon"
          src="../../assets/mp.svg"
          alt="mp"
          @click="onCopyMp"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import EditorJS from '@editorjs/editorjs';
import { reactive, onMounted } from 'vue';

const state = reactive({ editor: null });
function initEditor() {
  destroyEditor();
  state.editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      header: require('@editorjs/header'),
      list: require('@editorjs/list'),
      image: require('@editorjs/image'),
      personality: require('@editorjs/personality'),
      inlineCode: require('@editorjs/inline-code'),
      embed: require('@editorjs/embed'),
      quote: require('@editorjs/quote'),
      marker: require('@editorjs/marker'),
      code: require('@editorjs/code'),
      linkTool: require('@editorjs/link'),
      delimiter: require('@editorjs/delimiter'),
      raw: require('@editorjs/raw'),
      table: require('@editorjs/table'),
      warning: require('@editorjs/warning'),
      paragraph: require('@editorjs/paragraph'),
      checklist: require('@editorjs/checklist'),
    },
    data: {
      blocks: [],
    },
  });
}
function destroyEditor() {
  if (state.editor) {
    state.editor.destroy();
    state.editor = null;
  }
}

onMounted((_) => initEditor());
</script>

<script>
import { parser } from './parser/parser';
import juice from 'juice';
import basicStyle from './template/basicStyle';

export default {
  name: 'MyEditor',
  data() {
    return {
      content: '',
    };
  },
  mounted() {
    const that = this;
    document.addEventListener('keydown', (e) => {
      if (e.metaKey && e.key === 's') {
        e.stopPropagation();
        e.preventDefault();
        that.onSave();
      }else if(e.metaKey && e.key === 'm'){
        e.stopPropagation();
        e.preventDefault();
        that.onCopyMp();
      }
    });
  },
  methods: {
    onSave() {
      return this.state.editor
        .save()
        .then((outputData) => {
          this.content = outputData;
          console.log(outputData);
        })
        .catch((error) => {
          console.log('Saving failed', error);
        });
    },
    onClickH1() {
      console.log('click h1');
    },
    async onCopyMp() {
      await this.onSave();
      this.$message({
        msg: '复制成功，请粘贴到微信公众号平台',
        type: 'success',
      });
      const parsedArr = parser().parse(this.content) || [];
      const htmlText = `<section id="nice">${parsedArr.join('')}</section>`;
      const styledHtml = juice.inlineContent(htmlText, basicStyle, {
        inlinePseudoElements: true,
        preserveImportant: true,
      });
      console.log('styled', styledHtml);
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
.editor_wrp {
  position: relative;
  padding: 32px 48px;
  text-align: start;
  background-color: rgba(0, 0, 0, 0.02);
}
.editor_instance {
  max-width: 800px;
  height: 600px;
  overflow: scroll;
  background-color: white;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.08);
  margin: auto;
}
.editor_actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
.right_panel {
  position: absolute;
  right: 60px;
  top: 30px;
  align-items: center;
  justify-content: center;
  display: flex;
  width: 40px;
  background: white;
  height: 100px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.08);
}
.panel_icon {
  width: 24px;
}
.simple-image {
  padding: 20px 0;
}

.simple-image input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e4e4e4;
  border-radius: 3px;
  outline: none;
  font-size: 14px;
}
.simple-image img {
  max-width: 100%;
  margin-bottom: 15px;
}
.simple-image [contenteditable]:focus-visible {
  outline: none;
}
.simple-image.withBorder img {
  border: 1px solid #e8e8eb;
}

.simple-image.withBackground {
  background: #eff2f5;
  padding: 10px;
}

.simple-image.withBackground img {
  display: block;
  max-width: 60%;
  margin: 0 auto 15px;
}
.save-btn {
  width: 200px !important;
}
</style>
