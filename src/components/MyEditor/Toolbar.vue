<template>
<div>
    <div class="toolbar-icon-wrp">
        <img class="toolbar-icon" src="../../assets/header.svg" alt="header" @click="onClickHeader">
    </div>
</div>
</template>

<script>
export default {
    name: 'EditorToolbar',
    methods: {
        onClickHeader(){
            this.$emit('h1');
        }
    }
}
</script>

<style scope>
.toolbar-icon-wrp {
    margin: 0 6px 12px;
}
.toolbar-icon {
    width: 24px;
}
</style>