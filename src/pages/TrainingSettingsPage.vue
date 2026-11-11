<script setup>
import { computed, ref, nextTick } from 'vue'
import BottomSheet from '../components/BottomSheet.vue'
import { topicGroups, topics, topicPath, difficulties } from '../data/problems.js'
import topicIcon from '../assets/categories/basic.svg'
import chevron from '../assets/categories/chevron.svg'
import bookmark from '../assets/categories/bookmark.svg'
const props = defineProps({ settings: { type: Object, required: true }, message: String })
const emit = defineEmits(['update:settings', 'confirm', 'back'])
const sheet = ref(''), path = ref([]), options = ref(null)
const level = computed(() => { let node = null, nodes = topicGroups; for (const id of path.value) { node = nodes.find(n => n.id === id); nodes = node?.children ?? [] } return { node, nodes } })
const selectedTopic = computed(() => topics.find(t => t.id === props.settings.topicId))
const difficultyNotes = { 基础: '巩固基本概念与常见题型', 进阶: '练习方法组合与思路拓展', 挑战: '尝试更有挑战的算法问题' }
function openTopic() { path.value = []; sheet.value = 'topic' }
function chooseTopic(id) { emit('update:settings', { ...props.settings, topicId: id }); sheet.value = '' }
function chooseDifficulty(difficulty) { emit('update:settings', { ...props.settings, difficulty }); sheet.value = '' }
function focusOptions() { nextTick(() => options.value?.querySelector('button')?.focus()) }
function enter(node) { if (node.children?.length) { path.value.push(node.id); focusOptions() } else chooseTopic(node.id) }
function backLevel() { path.value.pop(); focusOptions() }
</script>
<template>
<section class="training-settings-view" aria-labelledby="training-settings-title">
  <button class="settings-back" @click="emit('back')"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6" /></svg>返回今日</button>
  <header class="settings-heading"><h1 id="training-settings-title">训练设置</h1><p>选好方向，让每天的练习更有积累。</p></header>
  <p class="group-caption">每日训练</p>
  <div class="settings-group">
    <button class="setting-row" aria-label="学习专题" aria-haspopup="dialog" :aria-expanded="sheet === 'topic'" @click="openTopic"><span class="setting-icon topic-icon"><img :src="topicIcon" alt="" /></span><span class="setting-copy"><strong>学习专题</strong><span>{{ topicPath(settings.topicId) }}</span></span><img class="row-chevron" :src="chevron" alt="" /></button>
    <button class="setting-row" aria-label="学习难度" aria-haspopup="dialog" :aria-expanded="sheet === 'difficulty'" @click="sheet = 'difficulty'"><span class="setting-icon difficulty-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17v3M12 11v9M19 4v16" /></svg></span><span class="setting-copy"><strong>学习难度</strong><span>{{ settings.difficulty }}</span></span><img class="row-chevron" :src="chevron" alt="" /></button>
  </div>
  <p class="group-footnote">点选设置项进行调整，确认后才会生效。</p>
  <div class="settings-policy"><img :src="bookmark" alt="" /><p>每天按确认的专题与难度推荐，<br />直到你主动切换。</p></div>
  <button class="confirm-training" @click="emit('confirm')">确认训练</button>
  <p v-if="message" class="settings-message" role="status">{{ message }}</p>
  <p class="confirm-footnote">确认后更新今日推荐，并保存为长期训练设置。</p>
  <BottomSheet v-if="sheet" :title="sheet === 'topic' ? '选择学习专题' : '选择学习难度'" @close="sheet = ''">
    <template v-if="sheet === 'topic'">
      <div class="topic-level-heading"><button v-if="path.length" class="sheet-back" @click="backLevel"><span aria-hidden="true">‹</span> 上一级</button><span>{{ level.node?.name ?? '全部大类' }}</span></div>
      <button v-if="level.node" class="whole-topic" @click="chooseTopic(level.node.id)"><span>选择整个「{{ level.node.name }}」</span><span v-if="settings.topicId === level.node.id" class="selection-check" aria-hidden="true">✓</span></button>
      <div ref="options" class="sheet-options"><button v-for="node in level.nodes" :key="node.id" class="sheet-option" :class="{ chosen: settings.topicId === node.id }" @click="enter(node)"><span>{{ node.name }}</span><span v-if="settings.topicId === node.id" class="selection-check" aria-hidden="true">✓</span><img v-else-if="node.children?.length" :src="chevron" alt="" /><span v-else-if="selectedTopic?.ancestorIds.includes(node.id)" class="selection-check" aria-hidden="true">•</span></button></div>
    </template>
    <div v-else class="sheet-options difficulty-options"><button v-for="difficulty in difficulties" :key="difficulty" class="sheet-option" :class="{ chosen: settings.difficulty === difficulty }" :aria-pressed="settings.difficulty === difficulty" @click="chooseDifficulty(difficulty)"><span class="difficulty-copy"><strong>{{ difficulty }}</strong><small>{{ difficultyNotes[difficulty] }}</small></span><span v-if="settings.difficulty === difficulty" class="selection-check" aria-hidden="true">✓</span></button><p class="grading-note">难度为 AlgoFlow 题库自定分级。</p></div>
  </BottomSheet>
</section>
</template>
<style scoped>
.training-settings-view{padding-top:20px;color:#202B3F}.settings-back{display:flex;align-items:center;gap:3px;min-height:44px;padding:0;border:0;background:transparent;color:#6658DB;font-size:14px}.settings-back svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.settings-heading{margin:14px 0 26px}.settings-heading h1{font-size:28px;line-height:1.35;letter-spacing:-.6px;font-weight:700;margin:0}.settings-heading p{font-size:13px;line-height:1.7;color:#8390A4;margin:8px 0 0}.group-caption{margin:0 0 9px 14px;font-size:12px;color:#8390A4;line-height:1.6}.settings-group{background:#fff;border:1px solid #E8ECF4;border-radius:20px;overflow:hidden;box-shadow:0 2px 12px #202b3f04}.setting-row{position:relative;display:flex;align-items:center;gap:13px;width:100%;min-height:86px;padding:18px 16px;background:transparent;border:0;text-align:left;color:#202B3F}.setting-row+.setting-row:before{content:'';position:absolute;top:0;left:65px;right:16px;height:1px;background:#F0F2F7}.setting-row:active{background:#F7F5FF}.setting-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;flex-shrink:0}.topic-icon{background:#F0EDFF}.difficulty-icon{background:#ECF2FF;color:#6588CF}.difficulty-icon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.setting-copy{display:grid;gap:5px;min-width:0;flex:1}.setting-copy strong{font-size:15px;line-height:1.5;font-weight:600}.setting-copy>span{font-size:13px;line-height:1.6;color:#8390A4;overflow-wrap:anywhere}.row-chevron{flex-shrink:0}.group-footnote{font-size:11px;line-height:1.7;color:#919BAE;margin:10px 14px 0}.settings-policy{display:flex;align-items:flex-start;gap:9px;margin:25px 14px 24px}.settings-policy img{margin-top:2px;flex-shrink:0;opacity:.8}.settings-policy p{font-size:12px;line-height:1.8;color:#8390A4;margin:0}.confirm-training{width:100%;min-height:52px;border:0;border-radius:16px;background:#6658DB;color:#fff;font-size:16px;font-weight:600;box-shadow:0 4px 12px #6658db1a}.confirm-training:active{background:#594CC7}.confirm-footnote{text-align:center;color:#9AA6B8;font-size:11px;line-height:1.8;margin:12px 12px 0}.settings-message{color:#A66B12;font-size:12px;line-height:1.8;padding:12px 14px;background:#FDF3E1;border-radius:12px}.topic-level-heading{display:flex;align-items:center;gap:12px;margin-bottom:12px;color:#8A95A7;font-size:12px;min-height:28px}.sheet-back{min-height:36px;padding:0 8px 0 0;border:0;background:transparent;color:#6658DB;font-size:13px}.sheet-back span{font-size:21px;vertical-align:-1px}.whole-topic{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:48px;padding:12px 15px;background:#F0EDFF;border:0;border-radius:13px;margin-bottom:12px;color:#6658DB;font-size:13px;text-align:left}.sheet-options{border:1px solid #EEF0F6;border-radius:16px;overflow:hidden}.sheet-option{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:52px;padding:14px 15px;border:0;background:#fff;color:#202B3F;font-size:14px;text-align:left}.sheet-option+.sheet-option{border-top:1px solid #F0F2F7}.sheet-option:active{background:#F7F5FF}.sheet-option>span:first-child{min-width:0;overflow-wrap:anywhere}.sheet-option img{flex-shrink:0}.sheet-option.chosen{color:#6658DB;background:#FBFAFF}.selection-check{font-size:18px;color:#6658DB;font-weight:600;flex-shrink:0}.difficulty-copy{display:grid;gap:5px}.difficulty-copy strong{font-size:15px;font-weight:600}.difficulty-copy small{font-size:12px;color:#8A95A7;line-height:1.6}.grading-note{font-size:11px;color:#9AA6B8;text-align:center;background:#FAFBFD;margin:0;padding:12px;line-height:1.8}.setting-row:focus-visible,.confirm-training:focus-visible,.sheet-option:focus-visible,.whole-topic:focus-visible,.settings-back:focus-visible,.sheet-back:focus-visible{outline:3px solid #B8ADF0;outline-offset:-3px}
</style>
