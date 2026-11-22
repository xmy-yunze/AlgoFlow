<script setup>
import { computed, ref, watch, nextTick, useId, onMounted, onUnmounted } from 'vue'
import { dailySolvedCounts, heatLevel } from '../lib/trainingHeatmap.js'
const props=defineProps({sessions:{type:Array,default:()=>[]},today:{type:String,required:true}})
const panel=ref(null), tooltip=ref(null), selected=ref(null), position=ref({}), tooltipId=useId()
const solved=computed(()=>dailySolvedCounts(props.sessions))
async function selectDay(cell,event){
 if(cell.key>props.today) return
 if(selected.value?.key===cell.key){selected.value=null;return}
 selected.value=cell
 const target=event.currentTarget
 await nextTick()
 if(!tooltip.value) return
 const bounds=panel.value.getBoundingClientRect(), anchor=target.getBoundingClientRect(), bubble=tooltip.value.getBoundingClientRect()
 const left=Math.max(0,Math.min(anchor.left-bounds.left+anchor.width/2-bubble.width/2,bounds.width-bubble.width))
 const above=anchor.top-bounds.top-bubble.height-9
 position.value={left:`${left}px`,top:`${above>=0?above:anchor.bottom-bounds.top+9}px`}
}
function dismiss(event){if(!panel.value?.contains(event.target) || !event.target.closest('.calendar-day, .calendar-tooltip')) selected.value=null}
function dismissOnScroll(){selected.value=null}
onMounted(()=>{document.addEventListener('pointerdown',dismiss);window.addEventListener('resize',dismissOnScroll);document.addEventListener('scroll',dismissOnScroll,true)})
onUnmounted(()=>{document.removeEventListener('pointerdown',dismiss);window.removeEventListener('resize',dismissOnScroll);document.removeEventListener('scroll',dismissOnScroll,true)})
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
watch(month,()=>{selected.value=null})
watch(() => props.today,()=>{selected.value=null})
function changeMonth(delta){month.value=new Date(month.value.getFullYear(),month.value.getMonth()+delta,1)}
</script>
<template><article ref="panel" class="calendar-panel" @keydown.esc.stop="selected = null"><div class="calendar-heading"><button aria-label="上个月" @click="changeMonth(-1)">‹</button><h3>{{ monthLabel }}</h3><button aria-label="下个月" @click="changeMonth(1)">›</button></div><div class="training-calendar"><span v-for="day in ['一','二','三','四','五','六','日']" :key="day" class="weekday">{{ day }}</span><template v-for="(cell,index) in cells" :key="index"><button v-if="cell" type="button" class="calendar-day" :class="[cell.key <= today ? 'heat-'+heatLevel(solved.get(cell.key)) : 'future-day', {selected:selected?.key===cell.key}]" :disabled="cell.key > today" :aria-pressed="selected?.key===cell.key" :aria-label="cell.key > today ? cell.key+'，尚未到来' : cell.key+'，解决 '+(solved.get(cell.key)??0)+' 题'" :aria-describedby="selected?.key===cell.key ? tooltipId : undefined" @click.stop="selectDay(cell,$event)">{{ cell.day }}</button><span v-else aria-hidden="true" /></template></div><div class="heat-legend" aria-label="完成题数颜色图例：0题、1题、2题、3题、4题、5题、6题及以上"><span>少</span><span aria-hidden="true">→</span><i v-for="(label,index) in ['0题','1题','2题','3题','4题','5题','6题及以上']" :key="label" :class="'heat-'+index" :title="label" /><span>多</span></div><div v-if="selected" :id="tooltipId" ref="tooltip" role="tooltip" class="calendar-tooltip" :style="position"><span>{{ Number(selected.key.slice(5,7)) }}月{{ selected.day }}日</span><strong>解决 {{ solved.get(selected.key)??0 }} 题</strong></div></article></template>
<style scoped>
.calendar-panel{position:relative;color:#202B3F}.calendar-heading h3{font-size:16px}
.calendar-heading{display:flex;justify-content:space-between;align-items:center}.calendar-heading h3{margin:0}.calendar-heading button{border:0;border-radius:14px;background:#F0EDFF;color:#6658DB;min-width:44px;min-height:44px;font-size:25px}.training-calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:18px 0}.weekday{text-align:center;font-size:11px;color:#68768D;padding:8px 0}.calendar-day{border:0;background:transparent;color:inherit;padding:0;width:100%;min-width:0;touch-action:manipulation;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;font-size:12px}.calendar-day.future-day{background:transparent;color:#ADB5C4;cursor:default}.heat-0{background:#F0F2F6;color:#68768D}.heat-1{background:#EDE6FA;color:#513782}.heat-2{background:#D5C3EF;color:#493075}.heat-3{background:#B69ADD;color:#38225B}.heat-4{background:#8860BD;color:#fff}.heat-5{background:#7047A6;color:#fff}.heat-6{background:#58318B;color:#fff}.calendar-day.selected{outline:2px solid #302048;outline-offset:2px}.heat-legend{display:flex;align-items:center;justify-content:flex-end;gap:6px;color:#68768D;font-size:10px;margin:4px 0 12px}.heat-legend i{display:block;width:13px;height:13px;border-radius:4px;border:1px solid #202B3F08}
.calendar-day:focus-visible{outline:2px solid #9C8EED;outline-offset:2px}.calendar-tooltip{position:absolute;z-index:2;pointer-events:none;box-sizing:border-box;width:124px;padding:10px 14px;border-radius:10px;background:#252832;color:#fff;box-shadow:0 4px 14px #202b3f30;display:grid;gap:4px;text-align:center;font-size:12px;line-height:1.5}.calendar-tooltip span{color:#D6D9E2;font-size:11px}.calendar-tooltip strong{font-weight:600}
</style>
