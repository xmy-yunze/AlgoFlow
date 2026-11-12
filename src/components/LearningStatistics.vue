<script setup>
import { computed } from 'vue'
import { localDate } from '../lib/recommendations.js'
import { problems, topicPath } from '../data/problems.js'
import { learningStatistics } from '../lib/statistics.js'
const props=defineProps({allTopics:Boolean, currentTopic:String, sessions:{type:Array,default:()=>[]},today:{type:String,default:()=>localDate()}})
const stats=computed(()=>learningStatistics(props.sessions, props.today))
const emit=defineEmits(['view-all','settings'])
const current=computed(()=>{
 if(!props.currentTopic) return null
 const bank=problems.filter(p=>p.topicIds.includes(props.currentTopic))
 const practiced=new Set(props.sessions.map(s=>s.problemId))
 const independent=new Set(props.sessions.filter(s=>s.verdict==='AC' && s.assistanceLevel==='INDEPENDENT').map(s=>s.problemId))
 return {name:topicPath(props.currentTopic), total:bank.length, practiced:bank.filter(p=>practiced.has(p.id)).length, independent:bank.filter(p=>independent.has(p.id)).length}
})
</script>
<template>
<section class="learning-stats" :aria-label="allTopics ? '专题训练统计' : '专题训练进度'">
<article v-if="!allTopics" class="topic-summary"><header><h3>专题训练进度</h3><button @click="emit('view-all')">查看全部</button></header><template v-if="current"><div class="summary-title"><strong>{{ current.name }}</strong><span>{{ current.total ? Math.round(current.practiced/current.total*100)+'%' : '暂未收录' }}</span></div><progress :value="current.practiced" :max="current.total || 1" aria-label="当前专题题库覆盖率" /><p>{{ current.practiced }} 题已练 · {{ current.independent }} 题独立 AC <small>题库覆盖率</small></p></template><template v-else><p class="summary-empty">尚未确认长期训练专题</p><button class="settings-link" @click="emit('settings')">前往训练设置</button></template></article>
<article v-else class="stats-panel"><h3>全部专题</h3><p class="stats-explanation">按当前题库计算已练覆盖率；同题可属于多个专题，各专题不相加。覆盖率不代表掌握度。</p><div v-for="topic in stats.topics" :key="topic.id" class="topic-progress"><div><strong>{{ topic.name }}</strong><span>{{ topic.total ? Math.round(topic.practiced/topic.total*100)+'%' : '暂未收录' }}</span></div><progress :value="topic.practiced" :max="topic.total || 1" :aria-label="topic.name+'已练覆盖率'" /><small>{{ topic.practiced }} 题已练 · {{ topic.independent }} 题独立 AC</small></div></article>

</section>
</template>
<style scoped>
.stats-explanation{font-size:11px;line-height:1.9;color:#68768D}.stats-panel{padding:22px;margin:18px 0;border:1px solid #79618d55;border-radius:22px;background:#FFFFFF}.stats-panel h3{font-size:15px;margin:0 0 14px}.topic-progress{margin-top:20px}.topic-progress>div{display:flex;justify-content:space-between;font-size:12px;gap:10px}.topic-progress span,.topic-progress small{color:#68768D}.topic-progress small{font-size:10px}.topic-progress progress{display:block;width:100%;height:9px;margin:10px 0;appearance:none;border:0;border-radius:99px;overflow:hidden;background:#E8ECF4}.topic-progress progress::-webkit-progress-bar{background:#E8ECF4;border-radius:99px}.topic-progress progress::-webkit-progress-value{background:#6658DB;border-radius:99px}.topic-progress progress::-moz-progress-bar{background:#6658DB}.topic-summary{box-sizing:border-box;min-height:170px;margin:18px 0;padding:20px;border:1px solid #E8ECF4;border-radius:20px;background:#fff}.topic-summary header,.summary-title{display:flex;align-items:center;justify-content:space-between;gap:12px}.topic-summary h3{margin:0;font-size:15px}.topic-summary button{border:0;background:none;color:#6658DB;padding:4px 0;font-size:12px;min-height:32px}.summary-title{margin-top:14px;font-size:13px}.summary-title strong{overflow-wrap:anywhere}.summary-title span{color:#68768D;white-space:nowrap}.topic-summary progress{display:block;width:100%;height:8px;margin:12px 0;appearance:none;border:0;border-radius:9px;overflow:hidden;background:#E8ECF4}.topic-summary progress::-webkit-progress-bar{background:#E8ECF4}.topic-summary progress::-webkit-progress-value{background:#6658DB}.topic-summary progress::-moz-progress-bar{background:#6658DB}.topic-summary p{margin:0;font-size:11px;color:#68768D}.topic-summary small{float:right;font-size:10px}.topic-summary .summary-empty{margin-top:18px}.topic-summary .settings-link{margin-top:8px}
</style>
