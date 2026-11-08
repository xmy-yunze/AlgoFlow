<script setup>
import { computed, ref, watch } from 'vue'
import { problems, topicGroups, topicName, difficulties } from '../data/problems.js'
import TopicPicker from './TopicPicker.vue'
import SmoothSelect from './SmoothSelect.vue'
defineProps({ completedIds: { type:Array, default:()=>[] } })
defineEmits(['open'])
const categoryPath=ref([])
const showingProblems=ref(false)
const currentCategory=computed(()=>{let node=null;let nodes=topicGroups;for(const id of categoryPath.value){node=nodes.find(n=>n.id===id);nodes=node?.children ?? []}return {node,nodes}})
function enterCategory(node){categoryPath.value.push(node.id);topic.value=node.id;query.value='';difficulty.value='';platform.value='';showingProblems.value=!node.children?.length}
function categoryBack(){if(showingProblems.value){showingProblems.value=false;if(!currentCategory.value.nodes.length)categoryPath.value.pop()}else categoryPath.value.pop();topic.value=currentCategory.value.node?.id ?? '';query.value=''}
const topic=ref(''),difficulty=ref(''),query=ref(''),platform=ref(''),limit=ref(30)
const filtered=computed(()=>problems.filter(p=>(!topic.value || p.topicIds.includes(topic.value)) && (!difficulty.value || p.difficulty===difficulty.value) && (!platform.value || p.platform===platform.value) && `${p.title} ${p.id} ${p.externalId}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const visible=computed(()=>filtered.value.slice(0,limit.value))
// 多专题题目在全部列表仅出现一次，按首个所属大类放置；细分筛选仍匹配全部标签。
const groups=computed(()=>topicGroups.map(group=>({...group,items:visible.value.filter(p=>topicGroups.find(g=>p.topicIds.includes(g.id))?.id===group.id)})).filter(g=>g.items.length))
watch([topic,difficulty,query,platform],()=>limit.value=30)
</script>
<template>
<section class="problem-library" aria-labelledby="library-title"><h2 id="library-title">题库分类</h2><p class="library-help">先选专题，再选一道题开始练习。</p>
<div class="category-panel"><div class="category-heading"><button v-if="categoryPath.length" class="category-back" @click="categoryBack">‹ 上一级</button><h3>{{ currentCategory.node?.name ?? '选择大类' }}</h3></div>
<template v-if="!showingProblems"><div class="category-grid"><button v-for="node in currentCategory.nodes" :key="node.id" @click="enterCategory(node)">{{ node.name }}<span aria-hidden="true">›</span></button></div><button v-if="currentCategory.node && currentCategory.nodes.length" class="secondary-button" @click="topic=currentCategory.node.id;showingProblems=true">查看本专题题目</button></template>
<div v-else>
<label class="library-search">搜索题目<input v-model="query" type="search" placeholder="输入题目名称或题号" /></label>
<div class="filter-grid"><SmoothSelect v-model="difficulty" label="题库难度" :options="[{value:'',label:'全部难度'},...difficulties]" /></div><SmoothSelect v-model="platform" label="来源平台" :options="[{value:'',label:'全部平台'},'LeetCode','洛谷']" />
<div v-for="group in groups" :key="group.id" class="library-group"><h3>{{ group.name }}</h3><button v-for="problem in group.items" :key="problem.id" class="library-item" @click="$emit('open',problem)"><div class="library-item-top"><strong>{{ problem.title }}</strong><span v-if="completedIds.includes(problem.id)" class="library-completed">已完成</span></div><span class="library-meta">{{ problem.platform }} {{ problem.externalId }} · {{ problem.difficulty }}</span><span class="library-tags">{{ problem.leafTopicIds.map(topicName).join(' / ') }}</span></button></div>
<p v-if="!filtered.length" class="notice" role="status">没有符合条件的题目，试试其他专题、难度或关键词。</p><button v-if="visible.length < filtered.length" class="secondary-button" @click="limit += 30">继续查看题目</button>
</div></div></section>
</template>
<style scoped>
.problem-library{margin-top:30px;padding-top:24px;border-top:1px solid #79618d44}.problem-library h2{font-size:20px;margin:0 0 12px}.library-help{font-size:12px;line-height:1.8;color:#BCAAC9}.library-search{display:flex;flex-direction:column;gap:10px;font-size:12px;color:#BCAAC9;margin:18px 0}.library-search input{width:100%;min-height:46px;padding:12px 14px;border:1px solid #79618d;border-radius:16px;background:#26212E;color:#F3F0FA;font:inherit;font-size:16px}.library-group h3{font-size:15px;color:#d3b6e7;margin:24px 0 12px}.library-item{display:flex;flex-direction:column;width:100%;gap:10px;margin:10px 0;padding:18px;text-align:left;border:1px solid #79618d55;border-radius:20px;background:#1F1927;color:#F3F0FA}.library-item-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.library-item strong{font-size:15px;line-height:1.7;overflow-wrap:anywhere}.library-meta,.library-tags{font-size:11px;line-height:1.7;color:#BCAAC9}.library-completed{flex-shrink:0;color:#bc96df;font-size:10px;padding:5px 8px;border-radius:12px;background:#ae73ea18}

.category-panel{margin-top:20px;padding:18px;border:1px solid #79618d88;border-radius:24px;background:#1F1927}.category-heading{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px}.category-heading h3{margin:0;font-size:16px}.category-back{border:0;min-height:44px;background:transparent;color:#c7a2e6;font-size:12px}.category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.category-grid button{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:68px;padding:16px;text-align:left;border:1px solid #79618d66;border-radius:18px;background:#30243c;color:#F3F0FA;font:inherit;font-size:14px}.category-grid button:hover{background:#49305d}.category-grid span{color:#bf99db;font-size:22px}

/* Light category palette, coordinated with UI 2.0. */
.problem-library{border-color:#E8ECF4}.library-help,.library-search,.library-meta,.library-tags{color:#68768D}.library-search input{background:#F4F7FD;color:#3B285C;border-color:#DCE2EF}.library-group h3{color:#3B285C}.library-item{background:#FFFFFF;color:#202B3F;border-color:#E8ECF4}.library-completed{color:#237A45;background:#DDF6E5}
.category-panel{background:#FFFFFF;border-color:#E8ECF4;box-shadow:0 6px 22px #202b3f05}.category-heading h3{color:#3B285C}.category-back{color:#6658DB}
.category-grid button{background:var(--category-bg,#F0EDFF);border-color:var(--category-border,#E2DDF3);color:var(--category-ink,#503B78)}
.category-grid button:nth-child(8n+1){--category-bg:#F0EDFF;--category-border:#E2DDF8;--category-ink:#58459A}
.category-grid button:nth-child(8n+2){--category-bg:#EAF3FF;--category-border:#D8E8FA;--category-ink:#34618D}
.category-grid button:nth-child(8n+3){--category-bg:#E8F7F0;--category-border:#D3EDE0;--category-ink:#346F58}
.category-grid button:nth-child(8n+4){--category-bg:#FFF1E7;--category-border:#F6E0CE;--category-ink:#93592E}
.category-grid button:nth-child(8n+5){--category-bg:#FFF8DF;--category-border:#F0E7BE;--category-ink:#806921}
.category-grid button:nth-child(8n+6){--category-bg:#FCECF3;--category-border:#F2DCE7;--category-ink:#964D70}
.category-grid button:nth-child(8n+7){--category-bg:#E8F6F8;--category-border:#CFE9ED;--category-ink:#2F707A}
.category-grid button:nth-child(8n+8){--category-bg:#EEF0FC;--category-border:#DDE2F5;--category-ink:#535F95}
.category-grid button:hover{background:var(--category-bg);box-shadow:inset 0 0 0 1px var(--category-ink)}.category-grid button:active{filter:brightness(.98)}.category-grid span{color:inherit;opacity:.65}
</style>
