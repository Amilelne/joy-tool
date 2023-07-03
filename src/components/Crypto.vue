<template>
  <div>
    <select name="cyptoAlgorithm" id="cyptoAlgorithm">
      <option value="base64">base64</option>
    </select>
    <div>
      <input v-model="inputValue" type="text" />
    </div>
    <div v-if="cryptoValue">{{ cryptoValue }}</div>
  </div>
</template>

<script setup></script>

<script>
export default {
  name: 'CryptoValue',
  data() {
    return {
      inputValue: '',
      cryptoValue: '',
    };
  },
};
</script>

<style scope></style>
