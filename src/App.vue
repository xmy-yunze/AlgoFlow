<script setup>
import { restoreRandomSnapshot } from './lib/randomSnapshot.js'
import BackupImport from './components/BackupImport.vue'
import { planImport } from './lib/backupImport.js'
import CompletionCelebration from './components/CompletionCelebration.vue'
import { learningStatistics } from './lib/statistics.js'
import LearningStatistics from './components/LearningStatistics.vue'
import AppShell from './components/AppShell.vue'
import TodayPage from './pages/TodayPage.vue'
import ProblemLibrary from './components/ProblemLibrary.vue'
import PracticePage from './pages/PracticePage.vue'
import ReviewPage from './pages/ReviewPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import PracticeForm from './components/PracticeForm.vue'
import { appendSession, editSession, deleteSession } from './lib/practice.js'
import SmoothSelect from './components/SmoothSelect.vue'
import TopicPicker from './components/TopicPicker.vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { problems, topics, topicGroups, difficulties, topicName, topicPath } from './data/problems.js'
import { candidates, drawRandom, ensureDaily, loadState, localDate, saveState, toggleCompleted } from './lib/recommendations.js'

// 使用适配器，浏览器禁用 localStorage 时也能正常显示页面。
const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) }
const loaded = loadState(storage)
const state = ref(loaded.state)
const warning = ref(loaded.warning)
const date = ref(localDate())
const panel = ref('')
const randomTopic = ref('')
const randomDifficulty = ref('')
const randomProblem = ref(null)
const randomAttempted = ref(false)
const randomRestoreMessage = ref('')
const randomResultFilters = ref(null)
const draftSettings = ref({ ...state.value.settings })
const training = ref(null)
const trainingMessage = ref('')
try {
  const saved = JSON.parse(storage.getItem('algoflow:v1:training-choice'))
  if (saved?.date === localDate() && problems.some(p => p.id === saved.problemId)) training.value = saved
} catch {}
function saveTraining() {
  try { storage.setItem('algoflow:v1:training-choice', JSON.stringify(training.value)) }
  catch { warning.value = '训练选择保存失败，刷新后可能丢失。' }
}
function ensureTraining() {
  if (training.value?.date === localDate()) return
  const problem = drawRandom({}, state.value.completedIds)
  training.value = { date: localDate(), problemId: problem?.id ?? null, confirmed: false }
  saveTraining()
}
function confirmTraining() {
  const problem = drawRandom(draftSettings.value, state.value.completedIds)
  if (!problem) { trainingMessage.value = '没有符合条件的未完成题目，请调整后再确定。'; return }
  state.value.settings = { ...draftSettings.value }
  training.value = { date: localDate(), problemId: problem.id, confirmed: true, ...draftSettings.value }
  trainingMessage.value = '已确定训练，下方题目已更新。'
  persist(); saveTraining()
}
const trainingReason = computed(() => training.value?.confirmed
  ? `按你确认的「${topicPath(training.value.topicId)} / ${training.value.difficulty}」推荐。`
  : '尚未确定专题训练，从全部未完成题目中随机推荐。')
const dailyProblem = computed(() => problems.find(p => p.id === training.value?.problemId))
const selectedProblem = computed(() => panel.value === 'daily' ? dailyProblem.value : randomProblem.value)
const groupedOptions = topicGroups.map(group => ({
  ...group, options: topics.filter(t => t.id === group.id || t.ancestorIds.includes(group.id)),
}))
const topicCount = id => problems.filter(p => p.topicIds.includes(id)).length
const optionLabel = topic => `${'　'.repeat(Math.max(0, topic.depth - 1))}${topic.depth === 0 ? '全部' + topic.name : topic.name}`
const remaining = computed(() => candidates({ topicId: randomTopic.value, difficulty: randomDifficulty.value }, state.value.completedIds).length)
const todayLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(`${date.value}T12:00:00`)))
const isCompleted = p => p && state.value.completedIds.includes(p.id)
function persist() {
  const error = saveState(storage, state.value)
  if (error) warning.value = error
}
function refreshDay() {
  ensureTraining()
  date.value = localDate()
  state.value = ensureDaily(state.value, date.value)
  persist()
}
function updateSettings() { refreshDay() }
function openPanel(value) { refreshDay(); panel.value = value }
function randomDraw() {
  randomRestoreMessage.value = ''
  refreshDay()
  randomProblem.value = drawRandom({ topicId: randomTopic.value, difficulty: randomDifficulty.value }, state.value.completedIds, randomProblem.value?.id)
  randomResultFilters.value = { topicId: randomTopic.value, difficulty: randomDifficulty.value }
  randomAttempted.value = true
}
function resetRandomResult() { randomRestoreMessage.value = ''; randomProblem.value = null; randomAttempted.value = false }
function complete(problem) { refreshDay(); state.value = toggleCompleted(state.value, problem.id); persist() }
const reason = computed(() => {
  if (!selectedProblem.value) return ''
  if (panel.value === 'daily') return `${trainingReason.value}${selectedProblem.value.focus}`
  const filter = randomResultFilters.value
  return `从「${filter?.topicId ? topicPath(filter.topicId) : '全部专题'} / ${filter?.difficulty || '全部难度'}」的未完成题目中随机抽取，不改变每日推荐。${selectedProblem.value.focus}`
})
const recording = ref(false)
const editingSession = ref(null)
const viewingSession = ref(null)
const pendingDelete = ref(null)
const recordError = ref('')
const recordNotice = ref('')
const celebrate = ref(false)
let lastCelebrationDay = ''
try { lastCelebrationDay = storage.getItem('algoflow:celebration-day') ?? '' } catch {}
function celebrateDailyCompletion() {
  const today = localDate()
  if (!dailyProblem.value || !isCompleted(dailyProblem.value) || lastCelebrationDay === today) return
  lastCelebrationDay = today
  try { storage.setItem('algoflow:celebration-day', today) } catch {}
  celebrate.value = true
}
watch(() => [dailyProblem.value?.id, isCompleted(dailyProblem.value), date.value], celebrateDailyCompletion, { immediate: true })
function savePractice(form) {
  try {
    const next = editingSession.value ? editSession(state.value, editingSession.value.id, form) : appendSession(state.value, detail.value.problem.id, form, crypto.randomUUID(), new Date().toISOString())
    const error = saveState(storage, next)
    if (error) { recordError.value = error; return }
    state.value = next; formDirty.value = false; closeRecording(); recordError.value = ''; recordNotice.value = '已保存，可在「记录」中查看。'
    celebrateDailyCompletion()
  } catch (error) { recordError.value = error.message }
}
const detailSessions = computed(() => (state.value.sessions ?? []).filter(s => s.problemId === detail.value?.problem.id).slice().reverse())
function removeRecord() {
  const next = deleteSession(state.value, pendingDelete.value.id)
  const error = saveState(storage, next)
  if (error) { warning.value = error; recordNotice.value = error; return }
  state.value = next; pendingDelete.value = null; viewingSession.value = null; recordNotice.value = '记录已删除。'
}
const assistanceName = value => ({ INDEPENDENT: '独立完成 / 尝试', HINT: '查看提示', SOLUTION: '参考题解' })[value] ?? value
const importNotice = ref('')
function confirmBackupImport(backup) {
  const plan = planImport(state.value, backup)
  const error = saveState(storage, plan.next)
  if (error) { importNotice.value = error; return }
  state.value = plan.next
  importNotice.value = `导入完成：新增 ${plan.added} 条，重复跳过 ${plan.duplicates} 条，冲突保留本地 ${plan.conflicts.length} 条。`
}
function exportArchive() {
  const data = { schemaVersion: 1, exportedAt: new Date().toISOString(), learning: state.value, trainingChoice: training.value }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a'); a.href = url; a.download = `AlgoFlow-${localDate()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const todayOverview = computed(() => learningStatistics(state.value.sessions ?? []))
const detail = ref(null)
const activeTab = ref('today')
const formDirty = ref(false)
const routeBase = () => `#/${activeTab.value}`
function routeFor(view = 'root', session = null) {
  const params = new URLSearchParams()
  if (detail.value) { params.set('problem', detail.value.problem.id); params.set('source', detail.value.source); params.set('reason', detail.value.explanation) }
  if (session) params.set('session', session.id)
  return view === 'root' ? routeBase() : `${routeBase()}/${view}?${params}`
}
function rememberUI() {
  window.history.replaceState({ ...window.history.state, ui: { randomTopic:randomTopic.value, randomDifficulty:randomDifficulty.value, randomId:randomProblem.value?.id, randomAttempted:randomAttempted.value, randomResultFilters:randomResultFilters.value ? { ...randomResultFilters.value } : null, scroll:window.scrollY } }, '', window.location.href)
}
let restoringUI = false
function restoreUI() {
  const ui = window.history.state?.ui
  if (!ui) return
  restoringUI = true
  const restored = restoreRandomSnapshot(ui, state.value.completedIds)
  randomTopic.value=restored.topicId; randomDifficulty.value=restored.difficulty
  randomProblem.value=restored.problem; randomAttempted.value=restored.attempted
  randomResultFilters.value=restored.resultFilters; randomRestoreMessage.value=restored.message
  restoringUI = false
}
let acceptedUrl = window.location.hash
let acceptedState = window.history.state
function applyRoute() {
  const [path, query=''] = window.location.hash.replace(/^#\/?/,'').split('?')
  const [tab,view] = path.split('/')
  activeTab.value=['today','practice','review','profile'].includes(tab)?tab:'today'
  panel.value=activeTab.value==='practice'?'random':''
  const params=new URLSearchParams(query)
  const problem=problems.find(p=>p.id===params.get('problem'))
  detail.value=problem && ['problem','record'].includes(view) ? {problem,source:params.get('source') || 'daily',explanation:params.get('reason') || problem.focus}:null
  editingSession.value=(state.value.sessions ?? []).find(s=>s.id===params.get('session')) ?? null
  recording.value=!!detail.value && view==='record'
  formDirty.value=false; pendingDelete.value=null
  restoreUI()
  acceptedUrl=window.location.hash; acceptedState=window.history.state
  nextTick(()=>window.scrollTo(0,window.history.state?.ui?.scroll ?? 0))
}
watch(() => [randomTopic.value, randomDifficulty.value, randomProblem.value?.id, randomAttempted.value, JSON.stringify(randomResultFilters.value)], () => {
  if (!restoringUI) rememberUI()
}, { flush: 'sync' })
function mayLeave() { return !formDirty.value || window.confirm('训练记录尚未保存，确定放弃修改？') }
function navigate(url) {
  if (!mayLeave()) return
  rememberUI(); window.history.pushState({ui:window.history.state?.ui},'',url); applyRoute(); window.scrollTo(0,0)
}
function switchTab(tab) { if(tab!==activeTab.value) navigate(`#/${tab}`) }
function showDetail(problem,source) {
  if(!problem)return
  detail.value={problem,source,explanation:source==='daily'?trainingReason.value+problem.focus:['profile','review','library'].includes(source)?problem.focus:reason.value}
  recordNotice.value=''; recordError.value=''
  navigate(routeFor('problem'))
}
function openRecording(session=null) { recordError.value=''; navigate(routeFor('record',session)) }
function closeRecording() { navigate(routeFor('problem')) }
function closeDetail() { navigate(routeBase()) }
function onNavigation() {
  if (!mayLeave()) { window.history.pushState(acceptedState,'',acceptedUrl); return }
  applyRoute()
}
function beforeUnload(event) { if(formDirty.value){event.preventDefault();event.returnValue=''} }
onMounted(()=>{applyRoute();window.addEventListener('popstate',onNavigation);window.addEventListener('beforeunload',beforeUnload)})
onUnmounted(()=>{window.removeEventListener('popstate',onNavigation);window.removeEventListener('beforeunload',beforeUnload)})
refreshDay()
let timer
function onVisible() { if (document.visibilityState === 'visible') refreshDay() }
onMounted(() => { timer = window.setInterval(refreshDay, 60000); window.addEventListener('focus', refreshDay); document.addEventListener('visibilitychange', onVisible) })
onUnmounted(() => { clearInterval(timer); window.removeEventListener('focus', refreshDay); document.removeEventListener('visibilitychange', onVisible) })
</script>

<template>
  <CompletionCelebration v-if="celebrate" @close="celebrate = false" /><AppShell :active="activeTab" :secondary="!!detail" @navigate="switchTab"><div class="page-shell">
    <header class="brand-row"><a class="brand" :href="routeBase()" @click.prevent="navigate(routeBase())" aria-label="AlgoFlow 首页"><span class="brand-icon"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M8 14c8 0 10-2 10-6"/></svg></span>AlgoFlow</a><span class="date-pill">{{ todayLabel }}</span></header>
    <main v-if="recording && detail" class="detail-page">
      <button class="secondary-button back-button" @click="closeRecording">← 返回题目详情</button>
      <p class="problem-id">{{ detail.problem.externalId }} · {{ detail.problem.title }}</p>
      <PracticeForm :session="editingSession" :error="recordError" @dirty="formDirty = $event" @save="savePractice" @cancel="closeRecording" />
    </main>
    <main v-if="detail" v-show="!recording" class="detail-page">
      <button class="secondary-button back-button" @click="closeDetail">← 返回{{ {today: '今日', practice: '刷题', review: '记录', profile: '我的'}[activeTab] }}</button>
      <article class="preview">
        <p class="problem-id">{{ detail.problem.id }} · {{ detail.source === 'library' ? '题库选题' : detail.source === 'daily' ? '每日推荐' : ['review','profile'].includes(detail.source) ? '训练档案' : '随机刷题' }}</p>
        <h1 id="detail-title" tabindex="-1">{{ detail.problem.title }}</h1>
        <div class="tags"><span>来源：{{ detail.problem.platform }}</span><span>{{ detail.problem.difficulty }} · 自定分级</span><span v-for="id in detail.problem.leafTopicIds" :key="id">{{ topicPath(id) }}</span></div>
        <h2>推荐理由</h2><p>{{ detail.explanation }}</p><section class="ai-placeholder"><h2>AI 解题教练</h2><p>后续提供思路提示与解题引导，本版本尚未接入。</p></section>
        <a class="primary-button problem-link" :href="detail.problem.url" target="_blank" rel="noopener noreferrer">查看完整题目 </a>
        <button class="secondary-button" @click="openRecording()">{{ detailSessions.length ? '重新训练' : '记录训练' }}</button>
        <p v-if="recordNotice" role="status">{{ recordNotice }}</p>
        <section v-if="detailSessions.length && ['review', 'profile'].includes(detail.source)"><h2>训练历史 · {{ detailSessions.length }} 次</h2>
          <article v-for="session in detailSessions" :key="session.id" class="history-record">
            <p>{{ new Date(session.recordedAt).toLocaleString('zh-CN') }} · {{ session.verdict === 'UNFINISHED' ? '未完成' : session.verdict }}（手动自报）· 掌握 {{ session.masteryPercent ?? session.selfRating * 20 }}%</p>
            <div class="record-actions"><button @click="viewingSession = viewingSession?.id === session.id ? null : session">{{ viewingSession?.id === session.id ? '收起' : '查看' }}</button><button @click="openRecording(session)">编辑</button><button @click="pendingDelete = session">删除</button></div>
            <div v-if="viewingSession?.id === session.id"><p>完成方式：{{ assistanceName(session.assistanceLevel) }}</p><p>耗时：{{ session.durationSeconds == null ? '未填写' : session.durationSeconds / 60 + ' 分钟' }}</p><p>错因：{{ session.errorTypes?.join('、') || '未填写' }}</p><p class="record-note">笔记：{{ session.note || '未填写' }}</p><section class="ai-placeholder"><h3>AI 复盘分析</h3><p>后续用于分析本次训练与错因，本版本尚未接入。</p></section></div>
          </article>
        </section>
        <div v-if="pendingDelete" class="notice" role="alert"><p>确定删除 {{ new Date(pendingDelete.recordedAt).toLocaleString('zh-CN') }} 的训练记录？删除后无法恢复。</p><div class="record-actions"><button @click="removeRecord">确认删除</button><button @click="pendingDelete = null">取消删除</button></div></div>
        <p v-if="['review', 'profile'].includes(detail.source)">已完成以最近一次训练结果为准：AC 计为完成；其他结果重新进入未完成候选。尚无训练记录的题目保留旧版手动标记。</p>
      </article>
    </main>
    <main v-show="!detail">
      <TodayPage v-show="activeTab === 'today'">
      <section class="greeting today-welcome"><h1>今天，也来一道题。</h1><p class="intro">保持思考的节奏，积累算法能力。</p></section>
      <p v-if="warning" class="notice" role="alert">{{ warning }}</p>
      <section class="daily-card clickable-card" aria-labelledby="daily-title" :tabindex="dailyProblem ? 0 : undefined" :role="dailyProblem ? 'link' : undefined" @click="showDetail(dailyProblem, 'daily', $event)" @keydown.enter.self.prevent="showDetail(dailyProblem, 'daily', $event)"><div class="card-top"><span class="label"><span class="small-dot"></span>今日推荐</span><span class="sample-tag">{{ isCompleted(dailyProblem) ? '已手动完成' : (training?.confirmed ? '已确定训练' : '随机推荐') }}</span></div>
        <template v-if="dailyProblem"><div v-if="isCompleted(dailyProblem)" class="daily-congrats" role="status"><strong>✦ 今日挑战已完成，真棒！</strong><span>每一次认真思考，都在让你更进一步。</span></div><div class="topic-line">{{ dailyProblem.platform }} · {{ dailyProblem.externalId }}</div><h2 id="daily-title">{{ dailyProblem.title }}</h2><p class="daily-description">{{ dailyProblem.focus }}</p><div class="tags"><span v-for="id in dailyProblem.leafTopicIds" :key="id">{{ topicName(id) }}</span><span>{{ dailyProblem.difficulty }}</span></div><button class="primary-button" @click.stop="showDetail(dailyProblem, 'daily', $event)">开始今日训练 </button><p class="card-footnote">{{ date }} · 刷新保留 · 确定训练可更换题目</p></template>
        <template v-else><h2 id="daily-title">当前没有可推荐的新题</h2><p class="daily-description">当前专题与难度下没有未完成题目。请调整学习设置，或到随机模式选择其他范围。</p></template>
      </section>
      <section class="today-overview"><div class="overview-heading"><h2>学习概览</h2><span>真实训练档案</span></div><div class="overview-grid"><article><span class="overview-symbol" aria-hidden="true">✓</span><strong>{{ todayOverview.practiced }}<small>题</small></strong><p>累计已练题目</p><span>同题多次训练只计一次</span></article><article><span class="overview-symbol" aria-hidden="true">◎</span><strong>{{ todayOverview.independent }}<small>题</small></strong><p>独立 AC 题目</p><span>仅统计独立完成的自报结果</span></article></div></section>
      <button class="archive-entry" @click="switchTab('review')"><span class="archive-symbol" aria-hidden="true">▤</span><span><strong>我的训练档案</strong><small>回顾练过的题目和训练结果</small></span><span aria-hidden="true">›</span></button>
      <details class="settings-card"><summary>调整学习专题与难度</summary><div class="filter-grid"><TopicPicker v-model="draftSettings.topicId" label="学习专题" /><SmoothSelect v-model="draftSettings.difficulty" label="学习难度" :options="difficulties" /></div><button class="primary-button" @click="confirmTraining">确定训练 </button><p v-if="trainingMessage" role="status">{{ trainingMessage }}</p><p>选择专题与难度后，点击确定训练，下方立即推荐对应题目。未确定时默认随机推荐。</p></details>
      </TodayPage>
      <PracticePage v-show="activeTab === 'practice'"><section class="greeting"><h1>刷题</h1><p class="intro">选择范围，随机练习。</p></section>
      <section v-if="panel" id="practice-panel" class="preview" aria-labelledby="panel-title"><div class="preview-top"><span>{{ panel === 'random' ? '随机刷题' : panel === 'daily' ? '今日训练' : '独立错题复习' }}</span><button @click="panel = ''" aria-label="收起练习面板">收起 ×</button></div>
        <template v-if="panel === 'review'"><h2 id="panel-title">复习功能将在下一步加入</h2><p>本轮只保存简单的手动完成标记，还没有训练结果、错因与复习记录。</p></template>
        <template v-else>
          <template v-if="panel === 'random'"><h2 id="panel-title">这次想练什么？</h2><div class="filter-grid"><TopicPicker v-model="randomTopic" label="专题" allow-all @change="resetRandomResult" /><SmoothSelect v-model="randomDifficulty" label="难度" :options="[{ value: '', label: '全部难度' }, ...difficulties]" @change="resetRandomResult" /></div><p>按所选专题与难度抽取未完成的题目。</p><button class="primary-button" @click="randomDraw">{{ randomAttempted ? '再抽一道' : '随机抽题' }} <span aria-hidden="true">⤨</span></button><p v-if="randomRestoreMessage" class="notice" role="status">{{ randomRestoreMessage }}</p><p v-else-if="randomAttempted && !randomProblem" class="notice" role="status">没有符合条件的未完成题目，请更换专题或难度。</p></template>
          <h2 v-else id="panel-title">题目详情</h2>
          <button v-if="selectedProblem" class="result-card" @click="showDetail(selectedProblem, panel, $event)"><span class="problem-id">{{ selectedProblem.id }}</span><strong>{{ selectedProblem.title }}</strong><span>{{ selectedProblem.difficulty }} · {{ selectedProblem.platform }}</span><span class="result-action">查看题目详情</span></button>
        </template>
      </section>
      <ProblemLibrary :completed-ids="state.completedIds" @open="problem => showDetail(problem, 'library')" />
      </PracticePage>
      <ReviewPage v-show="activeTab === 'review'" :sessions="state.sessions ?? []" @open="problem => showDetail(problem, 'review')" />
      <ProfilePage v-show="activeTab === 'profile'"><section class="greeting"><h1>我的</h1><p class="intro">你的学习档案</p></section><LearningStatistics :sessions="state.sessions ?? []" /><article class="preview"><h2>数据管理</h2><button class="secondary-button" @click="exportArchive">导出训练档案 JSON</button><BackupImport :state="state" @confirm="confirmBackupImport" /><p v-if="importNotice" role="status">{{ importNotice }}</p><p>数据只保存在当前浏览器和当前地址，可通过 JSON 备份手动迁移。手动结果不代表 OJ 官方判题。</p></article><section class="more-section"><button class="secondary-button" @click="switchTab('review')">查看训练档案</button></section></ProfilePage>
    </main>
  </div></AppShell>
</template>
