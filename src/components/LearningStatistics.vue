<script setup>
import { computed, ref, watch } from 'vue'
import { localDate } from '../lib/recommendations.js'
import { learningStatistics } from '../lib/statistics.js'
const props=defineProps({sessions:{type:Array,default:()=>[]},today:{type:String,default:()=>localDate()}})
const stats=computed(()=>learningStatistics(props.sessions, props.today))
const now=new Date(`${props.today}T12:00:00`)
const month=ref(new Date(now.getFullYear(),now.getMonth(),1))
watch(() => props.today, (today, previous) => {
 if (previous && month.value.getFullYear() === Number(previous.slice(0,4)) && month.value.getMonth() === Number(previous.slice(5,7))-1) {
   const current = new Date(`${today}T12:00:00`)
   month.value = new Date(current.getFullYear(), current.getMonth(), 1)
 }
})
const monthLabel=computed(()=>`${month.value.getFullYear()}年${month.value.getMonth()+1}月`)
const cells=computed(()=>{
 const year=month.value.getFullYear(),m=month.value.getMonth(),offset=(new Date(year,m,1).getDay()+6)%7
 return [...Array(offset).fill(null),...Array.from({length:new Date(year,m+1,0).getDate()},(_,i)=>({day:i+1,key:`${year}-${String(m+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`}))]
})
function changeMonth(delta){month.value=new Date(month.value.getFullYear(),month.value.getMonth()+delta,1)}
</script>
<template>
<section class="learning-stats" aria-labelledby="stats-title"><h2 id="stats-title">学习统计</h2>
<div class="stats-grid"><article><strong>{{ stats.total }}</strong><span>累计训练次数</span></article><article><strong>{{ stats.practiced }}</strong><span>已练题目</span></article><article><strong>{{ stats.independent }}</strong><span>独立 AC 题目</span></article></div>
<p class="stats-explanation">同题多次训练只计一题；独立 AC 仅计独立完成且自报 AC 的题目。</p><p v-if="!stats.total" class="stats-empty">还没有训练记录。练习后记录一次训练，这里就会显示你的学习积累。</p>
<article class="stats-panel"><h3>专题训练进度</h3><p class="stats-explanation">按当前题库计算已练覆盖率；同题可属于多个专题，各专题不相加。覆盖率不代表掌握度。</p><div v-for="topic in stats.topics" :key="topic.id" class="topic-progress"><div><strong>{{ topic.name }}</strong><span>{{ topic.total ? Math.round(topic.practiced/topic.total*100)+'%' : '暂未收录' }}</span></div><progress :value="topic.practiced" :max="topic.total || 1" :aria-label="topic.name+'已练覆盖率'" /><small>{{ topic.practiced }} 题已练 · {{ topic.independent }} 题独立 AC</small></div></article>
<article class="stats-panel"><div class="calendar-heading"><button aria-label="上个月" @click="changeMonth(-1)">‹</button><h3>{{ monthLabel }}</h3><button aria-label="下个月" @click="changeMonth(1)">›</button></div><div class="training-calendar"><span v-for="day in ['一','二','三','四','五','六','日']" :key="day" class="weekday">{{ day }}</span><span v-for="(cell,index) in cells" :key="index" class="calendar-day" :class="{trained:cell && stats.dates.has(cell.key)}" :aria-label="cell ? cell.key+'，'+(stats.dates.get(cell.key)??0)+' 次训练' : undefined">{{ cell?.day }}<i v-if="cell && stats.dates.has(cell.key)" /></span></div><p class="stats-explanation">紫色日期表示有训练记录，按设备本地日期显示。今日 {{ stats.todayPracticed }} 题，连续 {{ stats.streak }} 天；当天保存任意结果算一次打卡，今日尚未训练时接续昨日连续天数。</p></article>
</section>
</template>
<style scoped>
.learning-stats h2{font-size:19px;margin:24px 0 16px}.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats-grid article{display:flex;flex-direction:column;gap:12px;padding:22px 12px;background:#FFFFFF;border-radius:20px}.stats-grid strong{font-size:30px}.stats-grid span{font-size:11px;color:#68768D}.stats-explanation{font-size:11px;line-height:1.9;color:#68768D}.stats-empty{font-size:13px;line-height:1.9;color:#68768D;padding:18px;background:#F4F7FD;border-radius:18px}.stats-panel{padding:22px;margin:18px 0;border:1px solid #79618d55;border-radius:22px;background:#FFFFFF}.stats-panel h3{font-size:15px;margin:0 0 14px}.topic-progress{margin-top:20px}.topic-progress>div{display:flex;justify-content:space-between;font-size:12px;gap:10px}.topic-progress span,.topic-progress small{color:#68768D}.topic-progress small{font-size:10px}.topic-progress progress{display:block;width:100%;height:9px;margin:10px 0;appearance:none;border:0;border-radius:99px;overflow:hidden;background:#E8ECF4}.topic-progress progress::-webkit-progress-bar{background:#E8ECF4;border-radius:99px}.topic-progress progress::-webkit-progress-value{background:#6658DB;border-radius:99px}.topic-progress progress::-moz-progress-bar{background:#6658DB}.calendar-heading{display:flex;justify-content:space-between;align-items:center}.calendar-heading h3{margin:0}.calendar-heading button{border:0;border-radius:14px;background:#F0EDFF;color:#6658DB;min-width:44px;min-height:44px;font-size:25px}.training-calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:18px 0}.weekday{text-align:center;font-size:11px;color:#68768D;padding:8px 0}.calendar-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;font-size:12px}.calendar-day.trained{background:#6658DB30;color:#6658DB}.calendar-day i{width:4px;height:4px;border-radius:50%;background:#6658DB}
</style>
