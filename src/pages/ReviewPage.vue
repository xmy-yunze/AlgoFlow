<script setup>
import { computed, ref } from 'vue'
import { problems, topicName } from '../data/problems.js'
import { trainingLog } from '../lib/trainingLog.js'
const props = defineProps({ sessions: { type: Array, default: () => [] } })
defineEmits(['open'])
const filter = ref('all')
const filters = [{id:'all',name:'全部'},{id:'passed',name:'已通过'},{id:'pending',name:'待解决'},{id:'review',name:'待复习'}]
const rows = computed(() => trainingLog(props.sessions))
const visible = computed(() => rows.value.filter(r => filter.value==='all' || (filter.value==='passed' && r.passed) || (filter.value==='pending' && !r.passed) || (filter.value==='review' && r.review)))
const problemFor = id => problems.find(p => p.id===id)
const assistance = value => ({INDEPENDENT:'独立完成 / 尝试',HINT:'提示后完成 / 尝试',SOLUTION:'参考题解后完成 / 尝试'})[value] ?? '未记录'
</script>
<template>
<section class="training-log">
<header class="log-heading"><div><p>ALGOFLOW · TRAINING LOG</p><h1>训练记录</h1></div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 4H5v18h14V4h-3M9 2h6v4H9zM8 11h8M8 15h3" /></svg></header>
<div class="log-stats"><div><strong>{{ rows.length }}</strong><span>已练题目</span></div><div><strong>{{ rows.filter(r=>r.passed).length }}</strong><span>已通过</span></div><div><strong>{{ rows.filter(r=>!r.passed || r.review).length }}</strong><span>待巩固</span></div></div>
<div class="log-filters" role="group" aria-label="训练记录筛选"><button v-for="item in filters" :key="item.id" :aria-pressed="filter===item.id" :class="{selected:filter===item.id}" @click="filter=item.id">{{ item.name }}</button></div>
<div class="log-list"><button v-for="row in visible" :key="row.problemId" class="log-item" @click="$emit('open',problemFor(row.problemId))"><div class="log-item-heading"><strong>{{ problemFor(row.problemId)?.title ?? row.problemId }}</strong><span class="verdict" :class="{passed:row.passed}">{{ row.latest.verdict==='UNFINISHED'?'未完成':row.latest.verdict }}</span></div><p>{{ problemFor(row.problemId)?.leafTopicIds.map(topicName).join(' / ') || '专题未记录' }}</p><p>{{ assistance(row.latest.assistanceLevel) }} · {{ row.latest.durationSeconds==null?'耗时未填写':row.latest.durationSeconds/60+' 分钟' }} · 掌握 {{ row.mastery }}%</p><span class="log-action">查看训练详情 <span aria-hidden="true">›</span></span></button></div>
<p v-if="!visible.length" class="log-empty">{{ rows.length ? '当前筛选下没有训练题目，可切换其他分类。' : '还没有训练记录。完成练习后，在题目详情中记录一次训练。' }}</p>
<p class="log-footnote">按最近一次训练归类，每题只显示一次。待复习：已通过但掌握不足 80%，或借助提示、题解完成。所有结果均为手动自报。</p>
</section>
</template>
<style scoped>
.training-log{padding-top:26px}.log-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.log-heading p{font-size:11px;color:#68768D;margin:0 0 10px}.log-heading h1{font-size:29px;margin:0}.log-heading svg{width:28px;height:28px;color:#6658DB}.log-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.log-stats>div{padding:22px 16px;background:#FFFFFF;border-radius:20px;display:flex;flex-direction:column;gap:12px}.log-stats strong{font-size:34px;font-weight:600}.log-stats span{font-size:12px;color:#68768D}.log-filters{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0}.log-filters button{border:0;border-radius:999px;min-height:44px;background:transparent;color:#68768D;font:inherit;font-size:13px}.log-filters .selected{background:#F0EDFF;color:#202B3F}.log-list{display:grid;gap:16px}.log-item{width:100%;padding:22px;text-align:left;border:1px solid #79618d88;background:#F7F9FD;color:#202B3F;border-radius:20px}.log-item-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.log-item-heading strong{font-size:17px;line-height:1.6;font-weight:600}.verdict{flex-shrink:0;font-size:12px;border-radius:999px;background:#48251c;color:#ff9b65;padding:6px 10px}.verdict.passed{background:#112d1f;color:#40d989}.log-item p{font-size:12px;line-height:1.9;color:#68768D;margin:10px 0}.log-action{display:flex;justify-content:flex-end;align-items:center;gap:10px;font-size:13px;color:#6658DB;margin-top:22px}.log-action>span{font-size:24px}.log-footnote,.log-empty{font-size:11px;line-height:1.9;color:#68768D;margin-top:20px}.log-empty{padding:22px;border:1px solid #79618d55;border-radius:20px}@media(max-width:400px){.log-stats>div{padding:18px 12px}.log-stats strong{font-size:29px}.log-item{padding:18px}}
</style>
