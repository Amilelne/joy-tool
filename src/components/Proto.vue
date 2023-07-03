<template>
  <h2>proto转TS或QQMail语法</h2>
  <div class="proto_wrp">
    <div class="form">
      <div>
        <input type="file" @change="onChange" class="fileUpload" />
        <textarea
          id="protoInput"
          v-model="protos"
          class="inputField protoInput"
          placeholder="proto: 上传文件或手动输入"
        ></textarea>
      </div>
      <div>
        <input
          class="inputField mainInput"
          id="main"
          type="text"
          v-model="mainField"
          placeholder="main字段"
        />
      </div>
      <div class="transformType">
        <label for="transformType" class="transformTypeLabel">转换类型:</label>
        <select
          name="transformType"
          id="transformType"
          class="transformTypeSelect"
          v-model="selectType"
        >
          <option value="0">Typescript</option>
          <option value="1">QQMail</option>
        </select>
      </div>
      <div class="submitBtn">
        <button @click="onSubmit" class="btn">提交</button>
      </div>
      <div class="result">
        <div class="result_header">
          <span class="result_title">返回结果:</span>
          <div>
            <button
              class="btn btn_default copy_btn"
              data-clipboard-target="#displayResult"
              @click="copyResult"
            >
              复制
            </button>
          </div>
        </div>
        <textarea
          v-model="transformed"
          class="displayField"
          placeholder="返回结果"
          ref="result"
          id="displayResult"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<script>
import ClipboardJS from 'clipboard';
import protoTransform from '../utils/proto/index';

export default {
  name: 'ProtoType',
  data() {
    return {
      protos: '',
      mainField: '',
      transformed: '',
      selectType: 0,
      validateRules: {
        required: ['mainField', 'protos'],
      },
    };
  },
  mounted() {
    this.clipboard = new ClipboardJS('.copy_btn');
  },
  unmounted() {
    // 销毁Clipboard实例，避免在其它页面或组件中实例化Clipboard后造成再次监听，产生重复回调
    this.clipboard.destroy();
  },
  methods: {
    async onChange(e) {
      const files = e.target.files;
      const _t = this;
      if (files.length) {
        let file = files[0];
        let reader = new FileReader();
        reader.onload = async function () {
          const protoText = this.result;
          _t.protos = protoText;
          _t.protoTransform();
        };
        reader.readAsText(file);
      }
    },
    protoTransform() {
      const { error, main, code } = protoTransform({
        proto: this.protos,
        main: this.mainField,
        type: Number(this.selectType),
      });
      if (error) {
        this.$message({
          msg: error,
          type: 'error',
          duration: 5000
        });
        console.error(error);
      } else {
        if (!this.mainField) {
          this.mainField = main;
        }
        this.transformed = code;
      }
    },
    async onSubmit() {
      if (!this.protos || !this.mainField) {
        this.$message({
          msg: '有字段为空',
          type: 'error',
        });
        return;
      }
      this.protoTransform();
    },
    copyResult() {
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
  },
};
</script>

<style scope>
.proto_wrp {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
.form {
  width: 500px;
}
.label {
  text-align: left;
  font-size: 16px;
}
.mainInput {
  margin-bottom: 32px;
  height: 24px;
}
.flex-row {
  display: flex;
  gap: 10px;
}
.inputField {
  width: 450px;
  border: 1px solid black;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
}
.protoInput {
  height: 200px;
  margin-bottom: 24px;
}
.result {
  margin-top: 32px;
}
.displayField {
  width: 450px;
  border: 1px dashed gray;
  border-radius: 8px;
  padding: 16px;
  height: 200px;
}
.submitBtn {
  display: flex;
  justify-content: center;
}
.btn {
  font-size: 18px;
  color: #fff;
  background-color: #1677ff;
  box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);
  padding: 4px 15px;
  border: none;
  border-radius: 6px;
  height: 32px;
  cursor: pointer;
  width: 100px;
}
.btn_default {
  background-color: #fff;
  border-color: #d9d9d9;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.88);
  border: 1px solid #d9d9d9;
}
.fileUpload {
  margin-bottom: 16px;
}
.result_header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 24px;
}
.result_title {
  margin-right: auto;
}
.transformType {
  margin-bottom: 32px;
  text-align: left;
  padding-left: 24px;
}
.transformTypeLabel {
  margin-right: 8px;
  font-size: 16px;
}
.transformTypeSelect {
  padding: 8px 16px;
}
</style>
