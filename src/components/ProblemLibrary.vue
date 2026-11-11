<script setup>
import { computed, ref, watch } from 'vue'
import { problems, topicGroups, topics, topicName, difficulties } from '../data/problems.js'
import { restoreLibraryView } from '../lib/libraryView.js'
import SmoothSelect from './SmoothSelect.vue'
import basicIcon from '../assets/categories/basic.svg'
import structureIcon from '../assets/categories/structure.svg'
import searchIcon from '../assets/categories/search.svg'
import dpIcon from '../assets/categories/dp.svg'
import mathIcon from '../assets/categories/math.svg'
import stringIcon from '../assets/categories/string.svg'
import graphIcon from '../assets/categories/graph.svg'
import greedyIcon from '../assets/categories/greedy.svg'
import binaryIcon from '../assets/categories/binary.svg'
import sortingIcon from '../assets/categories/sorting.svg'
import prefixIcon from '../assets/categories/prefix.svg'
import chevron from '../assets/categories/chevron.svg'
import selectedChevron from '../assets/categories/chevron-selected.svg'
import backIcon from '../assets/categories/back.svg'
const props = defineProps({ completedIds: { type: Array, default: () => [] }, view: Object })
const emit = defineEmits(['open', 'update:view'])
const categoryPath = ref([]), selectedTopicId = ref(''), showingProblems = ref(false)
const difficulty = ref(''), query = ref(''), platform = ref(''), limit = ref(30)
const categoryMeta = {
 basics: { icon: basicIcon, color: '#F0EDFF', description: '构建解题基本功', intro: '从经典方法开始，打好解题基础' },
 'data-structures': { icon: structureIcon, color: '#EDF3FF', description: '组织与管理数据' },
 search: { icon: searchIcon, color: '#EDF6F5', description: '探索解空间' },
 dp: { icon: dpIcon, color: '#F0EDFF', description: '拆解状态与转移' },
 math: { icon: mathIcon, color: '#FAF2E9', description: '发现规律与证明' },
 strings: { icon: stringIcon, color: '#EDF3FF', description: '处理文本与匹配' },
 graph: { icon: graphIcon, color: '#EDF6F5', description: '理解连接与路径' },
 greedy: { icon: greedyIcon, color: '#FAEFF3', description: '寻找更优的策略' },
 'binary-search': { icon: binaryIcon, color: '#F0EDFF', description: '在有序空间中高效定位答案' },
 sorting: { icon: sortingIcon, color: '#F3F5F9', description: '理解顺序，掌握常见排序方法' },
 'prefix-sum': { icon: prefixIcon, color: '#F3F5F9', description: '用预处理加速区间计算' },
}
function meta(node) {
 const root = topics.find(t => t.id === node.id)?.ancestorIds[0]
 return categoryMeta[node.id] ?? { ...categoryMeta[root], description: `浏览${node.name}相关题目` }
}
const hasProblems = node => problems.some(p => p.topicIds.includes(node.id))
const currentCategory = computed(() => { let node = null, nodes = topicGroups; for (const id of categoryPath.value) { node = nodes.find(n => n.id === id); nodes = node?.children ?? [] } return { node, nodes } })
const listNodes = computed(() => currentCategory.value.nodes.length ? currentCategory.value.nodes : currentCategory.value.node ? [currentCategory.value.node] : [])
const topic = computed(() => selectedTopicId.value || currentCategory.value.node?.id || '')
function enterCategory(node) { categoryPath.value.push(node.id); selectedTopicId.value = node.children?.length ? '' : node.id; showingProblems.value = !node.children?.length; query.value = ''; difficulty.value = ''; platform.value = '' }
function selectTopic(node) { selectedTopicId.value = node.id; if (node.children?.length) categoryPath.value.push(node.id); showingProblems.value = !node.children?.length; query.value = '' }
function categoryBack() { if (showingProblems.value) { showingProblems.value = false; if (!currentCategory.value.nodes.length) { categoryPath.value.pop(); selectedTopicId.value = '' } } else { categoryPath.value.pop(); selectedTopicId.value = '' } query.value = '' }
const filtered = computed(() => problems.filter(p => (!topic.value || p.topicIds.includes(topic.value)) && (!difficulty.value || p.difficulty === difficulty.value) && (!platform.value || p.platform === platform.value) && `${p.title} ${p.id} ${p.externalId}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const visible = computed(() => filtered.value.slice(0, limit.value))
const groups = computed(() => topicGroups.map(group => ({ ...group, items: visible.value.filter(p => topicGroups.find(g => p.topicIds.includes(g.id))?.id === group.id) })).filter(g => g.items.length))
watch([topic, difficulty, query, platform], () => limit.value = 30)
let restoring = false
watch(() => props.view, raw => {
 restoring = true
 const v = restoreLibraryView(raw)
 categoryPath.value = v.path; selectedTopicId.value = v.selectedTopicId; showingProblems.value = v.showingProblems
 difficulty.value = v.difficulty; platform.value = v.platform; query.value = v.query; limit.value = v.limit
 restoring = false
}, { immediate: true, deep: true, flush: 'sync' })
watch(() => ({ path: [...categoryPath.value], selectedTopicId: selectedTopicId.value, showingProblems: showingProblems.value, difficulty: difficulty.value, platform: platform.value, query: query.value, limit: limit.value }), snapshot => {
 if (!restoring && JSON.stringify(snapshot) !== JSON.stringify(props.view)) emit('update:view', snapshot)
}, { deep: true, flush: 'sync' })
</script>
<template>
<section class="problem-library" aria-labelledby="library-title">
  <button v-if="categoryPath.length" class="category-back" @click="categoryBack"><img :src="backIcon" alt="" />{{ showingProblems ? '返回专题浏览' : categoryPath.length === 1 ? '题库分类' : '上一级' }}</button>
  <header class="library-heading"><h2 id="library-title">{{ showingProblems && selectedTopicId ? topicName(selectedTopicId) : currentCategory.node?.name ?? '题库分类' }}</h2><p>{{ currentCategory.node ? meta(currentCategory.node).intro || meta(currentCategory.node).description : '选择一个方向，开始针对性训练' }}</p></header>
  <div v-if="!categoryPath.length" class="category-grid">
    <button v-for="node in topicGroups" :key="node.id" class="category-card" :disabled="!hasProblems(node)" @click="enterCategory(node)">
      <span class="category-card-top"><span class="category-icon" :style="{ background: meta(node).color }"><img :src="meta(node).icon" alt="" /></span><img class="entry-arrow" :src="chevron" alt="" /></span>
      <span class="category-copy"><strong>{{ node.name }}</strong><small>{{ hasProblems(node) ? meta(node).description : '暂无可练题目' }}</small></span>
    </button>
  </div>
  <template v-else>
    <template v-if="!showingProblems">
      <div class="topic-list"><button v-for="node in listNodes" :key="node.id" class="topic-row" :class="{ selected: selectedTopicId === node.id }" :aria-pressed="selectedTopicId === node.id" :disabled="!hasProblems(node)" @click="selectTopic(node)">
        <span class="category-icon" :style="{ background: selectedTopicId === node.id ? '#F0EDFF' : '#F3F5F9' }"><img :src="meta(node).icon" alt="" /></span><span class="topic-copy"><strong>{{ node.name }}</strong><small>{{ hasProblems(node) ? meta(node).description : '暂无可练题目' }}</small></span><img class="entry-arrow" :src="selectedTopicId === node.id ? selectedChevron : chevron" alt="" />
      </button></div>
    </template>
    <div v-else class="problem-list-view">

<label class="library-search">搜索题目<input v-model="query" type="search" placeholder="输入题目名称或题号" /></label>
<div class="filter-grid"><SmoothSelect v-model="difficulty" label="题库难度" :options="[{value:'',label:'全部难度'},...difficulties]" /></div><SmoothSelect v-model="platform" label="来源平台" :options="[{value:'',label:'全部平台'},'LeetCode','洛谷']" />
<div v-for="group in groups" :key="group.id" class="library-group"><h3>{{ group.name }}</h3><button v-for="problem in group.items" :key="problem.id" class="library-item" @click="$emit('open',problem)"><div class="library-item-top"><strong>{{ problem.title }}</strong><span v-if="completedIds.includes(problem.id)" class="library-completed">已完成</span></div><span class="library-meta">{{ problem.platform }} {{ problem.externalId }} · {{ problem.difficulty }}</span><span class="library-tags">{{ problem.leafTopicIds.map(topicName).join(' / ') }}</span></button></div>
<p v-if="!filtered.length" class="notice" role="status">没有符合条件的题目，试试其他专题、难度或关键词。</p><button v-if="visible.length < filtered.length" class="secondary-button" @click="limit += 30">继续查看题目</button>

    </div>
  </template>
</section>
</template>
<style scoped>
.problem-library{margin-top:24px;padding-top:24px;border-top:1px solid #E8ECF4;color:#202B3F;min-width:0}.library-heading{margin-bottom:20px}.library-heading h2{font-size:28px;line-height:42px;letter-spacing:-.5px;margin:0;font-weight:700}.library-heading p{font-size:14px;line-height:21px;margin:6px 0 0;color:#68768D}.category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.category-card{min-width:0;min-height:134px;padding:16px;border:1px solid #E8ECF4;border-radius:17px;background:white;box-shadow:0 2px 7px #202b3f0a;display:flex;flex-direction:column;gap:10px;text-align:left;color:#202B3F}.category-card-top{display:flex;align-items:center;justify-content:space-between;width:100%;height:36px}.category-icon{width:36px;height:36px;flex-shrink:0;border-radius:10px;display:grid;place-items:center}.category-icon img,.entry-arrow,.category-back img{display:block;flex-shrink:0}.category-copy{display:flex;flex-direction:column;gap:3px;min-width:0}.category-copy strong{font-size:16px;line-height:24px;font-weight:550}.category-copy small{font-size:12px;line-height:18px;color:#68768D}.category-card:hover:not(:disabled),.topic-row:hover:not(:disabled){background:#F7F5FF}.category-card:active:not(:disabled),.topic-row:active:not(:disabled){transform:scale(.98)}.category-card:disabled,.topic-row:disabled{cursor:default;box-shadow:none}.category-card:disabled>*,.topic-row:disabled>*{opacity:.45}.category-back{display:flex;align-items:center;gap:4px;min-height:44px;margin:0 0 12px;padding:0;border:0;background:transparent;color:#202B3F;font-size:14px}.topic-list{display:grid;gap:12px}.topic-row{width:100%;min-width:0;min-height:90px;display:flex;align-items:center;gap:12px;padding:16px;border:1px solid #E8ECF4;border-radius:17px;background:#fff;box-shadow:0 2px 6px #202b3f08;text-align:left;color:#202B3F}.topic-row.selected{border-color:#B8ADF0;color:#6658DB}.topic-row.selected:hover:not(:disabled){background:#fff}.topic-copy{min-width:0;flex:1;display:grid;gap:4px}.topic-copy strong{font-size:16px;line-height:24px;font-weight:550;overflow-wrap:anywhere}.topic-copy small{font-size:12px;line-height:18px;color:#68768D;overflow-wrap:anywhere}.library-search{display:flex;flex-direction:column;gap:10px;font-size:12px;color:#68768D;margin:18px 0}.library-search input{width:100%;min-height:46px;padding:12px 14px;border:1px solid #DCE2EF;border-radius:16px;background:#F4F7FD;color:#3B285C;font:inherit;font-size:16px}.library-group h3{font-size:15px;color:#3B285C;margin:24px 0 12px}.library-item{display:flex;flex-direction:column;width:100%;gap:10px;margin:10px 0;padding:18px;text-align:left;border:1px solid #E8ECF4;border-radius:20px;background:#fff;color:#202B3F}.library-item-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.library-item strong{font-size:15px;line-height:1.7;overflow-wrap:anywhere}.library-meta,.library-tags{font-size:11px;line-height:1.7;color:#68768D}.library-completed{flex-shrink:0;color:#237A45;font-size:10px;padding:5px 8px;border-radius:12px;background:#DDF6E5}.problem-library button{scroll-margin-block:110px}.problem-library button:focus-visible{outline:3px solid #9C8EED;outline-offset:3px}@media(prefers-reduced-motion:reduce){.category-card:active:not(:disabled),.topic-row:active:not(:disabled){transform:none}}
</style>
