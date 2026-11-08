<script setup>
import { computed, ref } from 'vue'
import { topicGroups, topics, topicPath } from '../data/topics.js'
const props = defineProps({ modelValue: { type: String, default: '' }, label: { type: String, default: '专题' }, allowAll: Boolean })
const emit = defineEmits(['update:modelValue', 'change'])
const open = ref(false)
const path = ref([])
const current = computed(() => {
  let node = null
  let nodes = topicGroups
  for (const id of path.value) { node = nodes.find(n => n.id === id); nodes = node?.children ?? [] }
  return { node, nodes }
})
function start() {
  open.value = !open.value
  path.value = []
}
function choose(id) { emit('update:modelValue', id); emit('change'); open.value = false }
function enter(node) {
  if (node.children?.length) path.value.push(node.id)
  else choose(node.id)
}
</script>
<template>
  <div class="topic-picker">
    <span class="picker-label">{{ label }}</span>
    <button type="button" class="picker-trigger" :aria-label="label" :aria-expanded="open" @click="start">{{ modelValue ? topicPath(modelValue) : '全部专题' }} <span aria-hidden="true">⌄</span></button>
    <div v-if="open" class="picker-panel">
      <div class="picker-heading"><button v-if="path.length" type="button" @click="path.pop()">← 上一级</button><strong>{{ current.node?.name ?? '选择大类' }}</strong><button type="button" aria-label="关闭专题选择" @click="open = false">×</button></div>
      <button v-if="current.node" type="button" class="picker-all" @click="choose(current.node.id)">全部{{ current.node.name }}</button>
      <button v-else-if="allowAll" type="button" class="picker-all" @click="choose('')">全部专题</button>
      <div class="picker-options"><button v-for="node in current.nodes" :key="node.id" type="button" @click="enter(node)">{{ node.name }}<span v-if="node.children?.length" aria-hidden="true">›</span></button></div>
    </div>
  </div>
</template>
<style scoped>
.topic-picker{min-width:0}.picker-label{display:block;margin-bottom:9px;font-size:12px;color:#68768D}.picker-trigger{width:100%;min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font:inherit;font-size:14px;line-height:1.6;border:1px solid var(--field-border);border-radius:var(--field-radius);background:var(--field-bg);color:#202B3F;padding:10px}.picker-panel{margin-top:10px;padding:12px;background:#FFFFFF;border:1px solid #E8ECF4;border-radius:20px}.picker-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;flex-wrap:wrap}.picker-heading strong{font-size:13px;color:#3B285C}.picker-heading button{border:0;background:transparent;color:#6658DB;min-height:38px}.picker-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.picker-options button,.picker-all{min-height:44px;text-align:left;padding:10px;border:1px solid #E2DDF3;border-radius:14px;background:#F0EDFF;color:#202B3F;font-size:12px;line-height:1.5;display:flex;justify-content:space-between;align-items:center;gap:8px}.picker-options button:hover,.picker-all:hover{background:#E8E3FF}.picker-all{width:100%;margin-bottom:10px;color:#6658DB;background:#F0EDFF}.picker-trigger:focus-visible{outline:3px solid #d6b4ff;outline-offset:3px}
</style>
