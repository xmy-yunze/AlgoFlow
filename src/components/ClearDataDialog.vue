<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
defineProps({ error: String })
const emit=defineEmits(['cancel','confirm'])
const dialog=ref(null),cancel=ref(null)
let previous
onMounted(()=>{previous=document.activeElement;dialog.value.showModal();cancel.value.focus()})
onUnmounted(()=>{dialog.value?.close();if(previous?.isConnected)previous.focus()})
</script>
<template><Teleport to="body"><dialog ref="dialog" class="clear-dialog" aria-labelledby="clear-title" aria-describedby="clear-description" @cancel.prevent="emit('cancel')"><h2 id="clear-title">确认清空全部数据？</h2><p id="clear-description">这会删除当前浏览器、当前地址下的全部 AlgoFlow 训练记录、完成标记、学习设置、推荐选择和庆祝状态。统计也会归零，无法直接撤销。</p><p>建议先取消并导出 JSON 备份。此操作不会删除题库、已下载的备份或其他设备的数据。</p><p v-if="error" role="alert" class="clear-error">{{ error }}</p><div class="clear-actions"><button ref="cancel" class="secondary-button" @click="emit('cancel')">取消，保留数据</button><button class="danger-button" @click="emit('confirm')">确认清空</button></div></dialog></Teleport></template>
<style scoped>
.clear-dialog{max-width:430px;width:calc(100% - 40px);padding:26px;border:1px solid #E8ECF4;border-radius:24px;background:#fff;color:#202B3F;box-shadow:0 18px 60px #202b3f22}.clear-dialog::backdrop{background:#202b3f55;backdrop-filter:blur(5px)}.clear-dialog h2{font-size:21px;margin:0 0 16px}.clear-dialog p{font-size:13px;line-height:1.9;color:#68768D}.clear-actions{display:flex;flex-direction:column;gap:10px;margin-top:22px}.clear-actions .secondary-button{margin:0}.clear-error{color:#8F1D2C!important}
</style>
