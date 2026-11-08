<script setup>
import { ref } from 'vue'
const props = defineProps({ modelValue: [String, Number], label: String, options: Array, placeholder: { type: String, default: '请选择' } })
const emit = defineEmits(['update:modelValue', 'change'])
const open = ref(false)
const valueOf = option => typeof option === 'object' ? option.value : option
const labelOf = option => typeof option === 'object' ? option.label : option
function choose(option) { emit('update:modelValue', valueOf(option)); emit('change'); open.value = false }
</script>
<template>
<div class="smooth-select" @keydown.esc="open = false">
<span class="smooth-label">{{ label }}</span>
<button class="smooth-trigger" type="button" :aria-label="label" :aria-expanded="open" @click="open = !open">{{ labelOf(options.find(o => valueOf(o) === modelValue) ?? '') || placeholder }}<span aria-hidden="true">⌄</span></button>
<div v-if="open" class="smooth-panel"><button v-for="option in options" :key="valueOf(option)" type="button" :class="{ selected: valueOf(option) === modelValue }" @click="choose(option)">{{ labelOf(option) }}<span v-if="valueOf(option) === modelValue" aria-hidden="true">✓</span></button></div>
</div>
</template>
<style scoped>
.smooth-select{min-width:0}.smooth-label{display:block;margin-bottom:9px;font-size:12px;color:#68768D}.smooth-trigger{width:100%;min-height:46px;display:flex;justify-content:space-between;align-items:center;gap:12px;text-align:left;font:inherit;font-size:14px;line-height:1.6;padding:10px 14px;border:1px solid var(--field-border);border-radius:var(--field-radius);background:var(--field-bg);color:#202B3F}.smooth-panel{margin-top:10px;padding:10px;background:#FFFFFF;border:1px solid #654c7b;border-radius:20px;display:grid;gap:7px}.smooth-panel button{display:flex;justify-content:space-between;align-items:center;min-height:44px;padding:12px 14px;border:1px solid transparent;border-radius:14px;background:#F0EDFF;color:#202B3F;font:inherit;font-size:13px;text-align:left}.smooth-panel button:hover,.smooth-panel .selected{background:#E8E3FF;border-color:#9161b0}.smooth-trigger:focus-visible{outline:3px solid #d6b4ff;outline-offset:3px}
</style>
