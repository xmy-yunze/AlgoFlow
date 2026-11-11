<script setup>
import { computed, ref, watch } from 'vue'
import { dailyActivity } from '../lib/dailyActivity.js'
const props=defineProps({sessions:{type:Array,default:()=>[]},today:{type:String,required:true}})
const stats=computed(()=>dailyActivity(props.sessions, props.today))
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
<template><article class="calendar-panel"><div class="calendar-heading"><button aria-label="上个月" @click="changeMonth(-1)">‹</button><h3>{{ monthLabel }}</h3><button aria-label="下个月" @click="changeMonth(1)">›</button></div><div class="training-calendar"><span v-for="day in ['一','二','三','四','五','六','日']" :key="day" class="weekday">{{ day }}</span><span v-for="(cell,index) in cells" :key="index" class="calendar-day" :class="{trained:cell && stats.dates.has(cell.key)}" :aria-label="cell ? cell.key+'，'+(stats.dates.get(cell.key)??0)+' 次训练' : undefined">{{ cell?.day }}<i v-if="cell && stats.dates.has(cell.key)" /></span></div><p class="stats-explanation">紫色日期表示有训练记录，按设备本地日期显示。今日 {{ stats.todayPracticed }} 题，连续 {{ stats.streak }} 天；当天保存任意结果算一次打卡，今日尚未训练时接续昨日连续天数。</p></article></template>
<style scoped>
.calendar-panel{color:#202B3F}.calendar-heading h3{font-size:16px}.stats-explanation{font-size:11px;line-height:1.9;color:#68768D;margin-bottom:0}
.calendar-heading{display:flex;justify-content:space-between;align-items:center}.calendar-heading h3{margin:0}.calendar-heading button{border:0;border-radius:14px;background:#F0EDFF;color:#6658DB;min-width:44px;min-height:44px;font-size:25px}.training-calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:18px 0}.weekday{text-align:center;font-size:11px;color:#68768D;padding:8px 0}.calendar-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;font-size:12px}.calendar-day.trained{background:#6658DB30;color:#6658DB}.calendar-day i{width:4px;height:4px;border-radius:50%;background:#6658DB}

</style>
