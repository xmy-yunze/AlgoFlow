<script setup>
import { ref, computed } from 'vue'
import { parseBackup, planImport } from '../lib/backupImport.js'
const props=defineProps({state:Object})
const emit=defineEmits(['confirm'])
const backup=ref(null),error=ref(''),fileName=ref('')
const plan=computed(()=>backup.value?planImport(props.state,backup.value):null)
let sequence=0
async function selectFile(event){const ticket=++sequence;backup.value=null;error.value='';const file=event.target.files?.[0];event.target.value='';if(!file)return;fileName.value=file.name;try{if(file.size>5*1024*1024)throw Error('备份文件超过 5 MB。');const parsed=parseBackup(await file.text());if(ticket===sequence)backup.value=parsed}catch(e){if(ticket===sequence)error.value=e.message}}
function cancel(){sequence++;backup.value=null;error.value=''}
function confirm(){emit('confirm',backup.value);cancel()}
</script>
<template><section class="backup-import"><label class="secondary-button import-file">选择 JSON 备份<input type="file" accept=".json,application/json" aria-label="选择 JSON 备份" @change="selectFile" /></label><p v-if="error" role="alert">{{ error }}</p><div v-if="plan" class="import-preview"><h3>导入预览</h3><p>{{ fileName }}</p><ul><li>文件内训练记录：{{ plan.total }}</li><li>新增：{{ plan.added }} · 重复跳过：{{ plan.duplicates }}</li><li>冲突保留本地：{{ plan.conflicts.length }}</li><li>新增旧完成标记：{{ plan.legacyAdded }}</li></ul><details v-if="plan.conflicts.length"><summary>查看冲突记录 ID</summary><p v-for="(id,index) in plan.conflicts" :key="index">{{ id }}</p></details><p>按记录 ID 合并；冲突不覆盖本地，重复导入不会新增记录。学习设置和今日推荐保持本机选择。</p><button class="primary-button" @click="confirm">确认合并导入</button><button class="secondary-button" @click="cancel">取消导入</button></div></section></template>
<style scoped>
.backup-import{margin-top:14px}.import-file{display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;overflow:hidden}.import-file input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer}.import-file:focus-within{outline:3px solid #9c8eed;outline-offset:3px}.import-preview{padding:18px;margin-top:16px;border:1px solid #E8ECF4;border-radius:18px;background:#F7F9FD}.import-preview h3{font-size:15px}.import-preview p,.import-preview li{font-size:12px;line-height:1.9;color:#68768D;overflow-wrap:anywhere}.import-preview ul{padding-left:18px}.import-preview summary{font-size:12px;color:#6658DB;cursor:pointer}.import-preview .primary-button{font-size:14px}
</style>
