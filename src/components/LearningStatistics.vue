<script setup>
import { computed } from 'vue'
import { localDate } from '../lib/recommendations.js'
import { learningStatistics } from '../lib/statistics.js'
const props=defineProps({sessions:{type:Array,default:()=>[]},today:{type:String,default:()=>localDate()}})
const stats=computed(()=>learningStatistics(props.sessions, props.today))
</script>
<template>
<section class="learning-stats" aria-labelledby="stats-title"><h2 id="stats-title">学习统计</h2>
<div class="stats-grid"><article><strong>{{ stats.total }}</strong><span>累计训练次数</span></article><article><strong>{{ stats.practiced }}</strong><span>已练题目</span></article><article><strong>{{ stats.independent }}</strong><span>独立 AC 题目</span></article></div>
<p class="stats-explanation">同题多次训练只计一题；独立 AC 仅计独立完成且自报 AC 的题目。</p><p v-if="!stats.total" class="stats-empty">还没有训练记录。练习后记录一次训练，这里就会显示你的学习积累。</p>
<article class="stats-panel"><h3>专题训练进度</h3><p class="stats-explanation">按当前题库计算已练覆盖率；同题可属于多个专题，各专题不相加。覆盖率不代表掌握度。</p><div v-for="topic in stats.topics" :key="topic.id" class="topic-progress"><div><strong>{{ topic.name }}</strong><span>{{ topic.total ? Math.round(topic.practiced/topic.total*100)+'%' : '暂未收录' }}</span></div><progress :value="topic.practiced" :max="topic.total || 1" :aria-label="topic.name+'已练覆盖率'" /><small>{{ topic.practiced }} 题已练 · {{ topic.independent }} 题独立 AC</small></div></article>

</section>
</template>
<style scoped>
.learning-stats h2{font-size:19px;margin:24px 0 16px}.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats-grid article{display:flex;flex-direction:column;gap:12px;padding:22px 12px;background:#FFFFFF;border-radius:20px}.stats-grid strong{font-size:30px}.stats-grid span{font-size:11px;color:#68768D}.stats-explanation{font-size:11px;line-height:1.9;color:#68768D}.stats-empty{font-size:13px;line-height:1.9;color:#68768D;padding:18px;background:#F4F7FD;border-radius:18px}.stats-panel{padding:22px;margin:18px 0;border:1px solid #79618d55;border-radius:22px;background:#FFFFFF}.stats-panel h3{font-size:15px;margin:0 0 14px}.topic-progress{margin-top:20px}.topic-progress>div{display:flex;justify-content:space-between;font-size:12px;gap:10px}.topic-progress span,.topic-progress small{color:#68768D}.topic-progress small{font-size:10px}.topic-progress progress{display:block;width:100%;height:9px;margin:10px 0;appearance:none;border:0;border-radius:99px;overflow:hidden;background:#E8ECF4}.topic-progress progress::-webkit-progress-bar{background:#E8ECF4;border-radius:99px}.topic-progress progress::-webkit-progress-value{background:#6658DB;border-radius:99px}.topic-progress progress::-moz-progress-bar{background:#6658DB}</style>
