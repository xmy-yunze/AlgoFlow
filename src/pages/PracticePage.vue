<script setup>
import { computed } from 'vue'
import { dailyActivity } from '../lib/dailyActivity.js'
import { topicName, topics, topicGroups, difficulties } from '../data/problems.js'
const props = defineProps({ topic: String, difficulty: String, problem: Object, attempted: Boolean, message: String, sessions: { type: Array, default: () => [] }, date: String })
const emit = defineEmits(['update:topic', 'update:difficulty', 'draw', 'open', 'browse-library'])
const quickTopics = [{ id: '', name: '全部' }, ...topicGroups]
const isSelected = id => topic.value === id || !!topics.find(t => t.id === props.topic)?.ancestorIds.includes(id)
const topic = computed(() => props.topic)
const topicLevels = computed(() => {
  const levels = []
  let node = topicGroups.find(n => n.id === props.topic || topics.find(t => t.id === props.topic)?.ancestorIds.includes(n.id))
  while (node?.children?.length) {
    levels.push({ id: node.id, name: node.name, children: node.children })
    node = node.children.find(n => n.id === props.topic || topics.find(t => t.id === props.topic)?.ancestorIds.includes(n.id))
  }
  return levels
})
const activity = computed(() => dailyActivity(props.sessions, props.date))
const conditions = computed(() => `${props.topic ? topicName(props.topic) : '全部专题'} · ${props.difficulty || '全部难度'}`)
</script>
<template>
<section class="training-page" aria-labelledby="training-title">
  <header class="training-heading"><h1 id="training-title">算法训练</h1><p>选择专题，开启今天的练习</p></header>
  <div class="training-controls">
    <div class="topic-chips" role="group" aria-label="专题筛选">
      <button v-for="item in quickTopics" :key="item.id" :aria-pressed="isSelected(item.id)" :class="{ selected: isSelected(item.id) }" @click="emit('update:topic', item.id)">{{ item.name }}</button>
    </div>
    <div v-for="level in topicLevels" :key="level.id" class="subtopic-level">
      <span class="subtopic-label">{{ level.name }}</span>
      <div class="topic-chips" role="group" :aria-label="level.name + '子专题'">
        <button :aria-pressed="topic === level.id" :class="{ selected: topic === level.id }" @click="emit('update:topic', level.id)">全部{{ level.name }}</button>
        <button v-for="child in level.children" :key="child.id" :aria-pressed="isSelected(child.id)" :class="{ selected: isSelected(child.id) }" @click="emit('update:topic', child.id)">{{ child.name }}</button>
      </div>
    </div>
    <div class="difficulty-segment" role="group" aria-label="难度筛选"><button v-for="value in ['', ...difficulties]" :key="value" :aria-pressed="difficulty === value" :class="{ selected: difficulty === value }" @click="emit('update:difficulty', value)">{{ value || '全部' }}</button></div>
    <button class="draw-button" @click="emit('draw')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h3c5 0 6 12 11 12h4m-4-4 4 4-4 4M3 18h3c2 0 3-2 4-4m4-4c1-2 2-4 4-4h3m-4-4 4 4-4 4" /></svg>随机抽取一道题</button>
  </div>
  <p v-if="message" class="training-notice" role="status">{{ message }}</p>
  <template v-if="problem">
    <div class="result-heading"><h2>本次抽取结果</h2><span>按当前条件随机抽取</span></div>
    <article class="draw-result" aria-labelledby="draw-result-title" role="link" tabindex="0" @click="emit('open', problem)" @keydown.enter.self.prevent="emit('open', problem)">
      <div class="result-meta"><span><span class="platform-mark">{{ problem.platform === '洛谷' ? 'LG' : 'OJ' }}</span>{{ problem.platform }} <small>{{ problem.externalId }}</small></span><span class="difficulty-badge">{{ problem.difficulty }}</span></div>
      <h3 id="draw-result-title">{{ problem.title }}</h3><p class="problem-focus">{{ problem.focus }}</p>
      <div class="result-tags"><span v-for="id in problem.leafTopicIds" :key="id">{{ topicName(id) }}</span></div>
      <div class="result-status"><span>按专题与难度筛选</span><span>未完成</span></div>
      <button class="details-button" @click.stop="emit('open', problem)">查看题目详情</button>
      <button class="redraw-button" @click.stop="emit('draw')"><span aria-hidden="true">⟳</span> 重新抽题</button>
    </article>
  </template>
  <section v-else class="training-empty" :class="{ 'no-candidates': attempted }" aria-labelledby="training-empty-title" :role="attempted && !message ? 'status' : undefined">
    <div class="empty-orbit" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m13 6 2.5 8.5L24 17l-8.5 2.5L13 28l-2.5-8.5L2 17l8.5-2.5L13 6Zm12-3 1.5 4.5L31 9l-4.5 1.5L25 15l-1.5-4.5L19 9l4.5-1.5L25 3Z" /></svg></div>
    <h2 id="training-empty-title">{{ attempted ? '当前没有符合条件的题目' : '还没有抽取题目' }}</h2>
    <p>{{ attempted ? '请更换专题或难度，再重新抽题。已完成的题目会自动排除。' : '设置好专题与难度后，点击上方按钮，为你从题库中随机抽取一道练习题。' }}</p>
    <span class="current-conditions">当前条件：{{ conditions }}</span>
  </section>
  <aside class="study-tip"><span class="tip-icon" aria-hidden="true">◎</span><div><strong>今日已练习 {{ activity.todayPracticed }} 道 · 连续 {{ activity.streak }} 天</strong><p>保持节奏，认真理解每一道题。</p></div></aside>
  <button class="library-entry" @click="emit('browse-library')"><span>按分类浏览题库</span><span aria-hidden="true">›</span></button>
</section>
</template>
<style scoped>
.training-controls>*{min-width:0}.subtopic-level{min-width:0}.subtopic-label{display:block;font-size:12px;color:#68768D;margin-bottom:8px}.training-page{color:#202B3F;min-width:0;padding-top:30px}.training-heading{margin-bottom:24px}.training-heading h1{font-size:28px;line-height:1.3;font-weight:750;letter-spacing:-.6px}.training-heading p{font-size:13.5px;color:#68768D;margin:7px 0 0;line-height:1.6}.training-controls{display:grid;gap:18px}.topic-chips{display:flex;overflow-x:auto;gap:8px;padding:2px 1px 5px;scrollbar-width:thin}.topic-chips button{flex-shrink:0;min-height:36px;white-space:nowrap;padding:7px 16px;border:1px solid #E8ECF4;border-radius:24px;background:white;color:#68768D;font-size:13px}.topic-chips button.selected{background:#F0EDFF;border-color:#F0EDFF;color:#6658DB;font-weight:650}.difficulty-segment{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:4px;border:1px solid #E8ECF4;border-radius:12px;background:#fff}.difficulty-segment button{min-height:34px;border:0;border-radius:9px;background:transparent;color:#68768D;font-size:13px}.difficulty-segment button.selected{background:#F0EDFF;color:#6658DB;font-weight:650}.draw-button,.details-button,.redraw-button{width:100%;display:flex;justify-content:center;align-items:center;gap:10px;border:0;background:#6658DB;color:white;border-radius:16px;min-height:54px;font-size:16px;font-weight:650}.draw-button{box-shadow:0 6px 16px #6658db33}.draw-button svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.training-empty{margin-top:18px;min-height:300px;background:white;border:1px solid #E8ECF4;border-radius:20px;padding:30px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center}.empty-orbit{width:104px;height:104px;flex-shrink:0;border:17px solid #F0EDFF;border-radius:50%;display:grid;place-items:center;position:relative}.empty-orbit:after{content:'';position:absolute;width:6px;height:6px;background:#C8BFFF;border-radius:50%;right:-10px;top:12px}.empty-orbit svg{width:32px;height:32px;fill:none;stroke:#6658DB;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.training-empty h2{font-size:16.5px;line-height:1.5;margin:0}.training-empty p{font-size:13px;line-height:1.8;color:#68768D;margin:0;max-width:380px}.current-conditions{font-size:11.5px;line-height:1.6;color:#68768D;border-radius:10px;background:#F7F9FD;padding:6px 10px;max-width:100%;overflow-wrap:anywhere}.study-tip{display:flex;align-items:center;gap:12px;border:1px solid #E8ECF4;border-radius:16px;background:white;padding:14px 16px;margin-top:18px}.tip-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#F0EDFF;color:#6658DB;font-size:24px;flex-shrink:0}.study-tip strong{font-size:12.5px}.study-tip p{font-size:11.5px;color:#68768D;line-height:1.6;margin:3px 0 0}.result-heading{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:18px 0 14px}.result-heading h2{font-size:13.5px;margin:0}.result-heading>span{color:#68768D;font-size:11.5px}.draw-result{border:1px solid #E8ECF4;background:#fff;border-radius:20px;box-shadow:0 6px 20px #202b3f16;padding:18px;display:grid;gap:14px}.result-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;color:#68768D}.result-meta>span:first-child{display:flex;align-items:center;flex-wrap:wrap;gap:7px}.platform-mark{font-size:10px;background:#202B3F;color:#fff;border-radius:4px;padding:4px}.result-meta small{font-size:11px;color:#8391A7}.difficulty-badge{background:#FDF3E1;color:#A66B12;font-size:11px;border-radius:6px;padding:4px 8px;white-space:nowrap}.draw-result h3{font-size:21px;line-height:1.45;margin:0;overflow-wrap:anywhere}.problem-focus{font-size:13px;color:#68768D;line-height:1.7;margin:0}.result-tags{display:flex;flex-wrap:wrap;gap:6px}.result-tags span{font-size:11px;line-height:1.5;background:#F7F9FD;color:#68768D;border-radius:12px;padding:4px 9px}.result-status{display:flex;justify-content:space-between;gap:8px;border-top:1px solid #E8ECF4;padding-top:14px;font-size:11.5px;color:#68768D}.result-status span:last-child{color:#6658DB}.details-button,.redraw-button{min-height:46px;font-size:13.5px;border-radius:14px}.redraw-button{background:#F0EDFF;color:#6658DB}.redraw-button span{font-size:18px}.training-notice{background:#FDF3E1;color:#946411;padding:12px 14px;border-radius:12px;font-size:12px;line-height:1.7}.library-entry{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:54px;margin-top:22px;padding:14px 18px;border:1px solid #E2DDF8;border-radius:16px;background:#F0EDFF;color:#6658DB;font-size:14px;font-weight:600;text-align:left}.library-entry>span:last-child{font-size:23px;line-height:1}.training-page :is(button,summary){scroll-margin-block:110px}.draw-result:focus-visible{outline:3px solid #9C8EED;outline-offset:3px}.training-page button:focus-visible{outline:3px solid #9C8EED;outline-offset:3px}@media(prefers-reduced-motion:reduce){.training-page *{scroll-behavior:auto}}@media(max-width:350px){.training-empty{padding:24px 16px}.topic-chips button{padding-inline:13px}}
</style>
