<script setup>
defineProps({ active: String, secondary: Boolean })
defineEmits(['navigate'])
const tabs = [
 { id:'today', name:'今日', caption:'每日推荐', path:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10' },
 { id:'practice', name:'刷题', caption:'随机模式', path:'M12 5v16M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2' },
 { id:'review', name:'记录', caption:'训练档案', path:'M8 4H5v18h14V4h-3M9 2h6v4H9zM8 11h8M8 15h5' },
 { id:'profile', name:'我的', caption:'学习档案', path:'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 22v-3a8 8 0 0 1 16 0v3' },
]
</script>
<template><div class="app-shell" :class="{ 'secondary-shell': secondary }"><slot /><nav v-if="!secondary" class="tabbar" aria-label="底部导航"><button v-for="tab in tabs" :key="tab.id" :aria-current="active === tab.id ? 'page' : undefined" :class="{ active: active === tab.id }" @click="$emit('navigate',tab.id)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="tab.path" /></svg><strong>{{ tab.name }}</strong><small>{{ tab.caption }}</small></button></nav></div></template>
