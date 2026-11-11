<script setup>
import { computed } from 'vue'
import { dailyActivity } from '../lib/dailyActivity.js'
const props = defineProps({ sessions: { type: Array, default: () => [] }, date: String })
const activity = computed(() => dailyActivity(props.sessions, props.date))
</script>
<template>
<aside class="study-tip"><span class="tip-icon" aria-hidden="true">◎</span><div><strong>今日已练习 {{ activity.todayPracticed }} 道 · 连续 {{ activity.streak }} 天</strong><p>保持节奏，认真理解每一道题。</p></div></aside>
</template>
<style scoped>
.study-tip{display:flex;align-items:center;gap:12px;border:1px solid #E8ECF4;border-radius:16px;background:white;padding:14px 16px;margin:0 0 18px}.tip-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#F0EDFF;color:#6658DB;font-size:24px;flex-shrink:0}.study-tip strong{font-size:12.5px}.study-tip p{font-size:11.5px;color:#68768D;line-height:1.6;margin:3px 0 0}
</style>
