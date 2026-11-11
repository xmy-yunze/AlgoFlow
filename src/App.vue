<script setup>
import { dailyActivity } from './lib/dailyActivity.js'
import { ensureTrainingChoice } from './lib/trainingChoice.js'
import { restoreRandomSnapshot } from './lib/randomSnapshot.js'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ClearDataDialog from './components/ClearDataDialog.vue'
import { clearAppData } from './lib/clearData.js'
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
const libraryView = ref(null)
const browsingLibrary = ref(false)
const trainingSettingsOpen = ref(false)
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
  training.value = saved
} catch {}
function saveTraining() {
  try { storage.setItem('algoflow:v1:training-choice', JSON.stringify(training.value)) }
  catch { warning.value = '训练选择保存失败，刷新后可能丢失。' }
}
function ensureTraining() {
  const next = ensureTrainingChoice(training.value, localDate(), state.value.completedIds)
  if (next === training.value) return
  training.value = next
  saveTraining()
}
function confirmTraining() {
  refreshDay()
  const problem = drawRandom(draftSettings.value, state.value.completedIds)
  if (!problem) { trainingMessage.value = '没有符合条件的未完成题目，请调整后再确定。'; return false }
  state.value.settings = { ...draftSettings.value }
  training.value = { date: localDate(), problemId: problem.id, confirmed: true, ...draftSettings.value }
  trainingMessage.value = '已确定训练：以后每天继续按此专题与难度推荐，直到你主动切换。'
  persist(); saveTraining()
  return true
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
const activity = computed(() => dailyActivity(state.value.sessions ?? [], date.value))
const isTodayCompleted = p => !!p && training.value?.date === date.value && activity.value.completedIds.includes(p.id)
function persist() {
  const error = saveState(storage, state.value)
  if (error) warning.value = error
}
function syncStoredState() {
  const saved = loadState(storage)
  if (saved.warning) { warning.value = saved.warning; return }
  state.value = saved.state
  try { training.value = JSON.parse(storage.getItem('algoflow:v1:training-choice')) } catch {}
}
function refreshDay() {
  const today = localDate()
  if (today !== date.value) {
    syncStoredState()
    date.value = today
    celebrate.value = false
    trainingMessage.value = ''
  }
  ensureTraining()
  state.value = ensureDaily(state.value, date.value)
  persist()
}
function resumeDay() { syncStoredState(); refreshDay() }
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
const deleteError = ref('')
const deletingRecord = ref(false)
const detailBackButton = ref(null)
const deleteFocusFallback = () => detailBackButton.value
function requestRecordDelete(session) { deleteError.value = ''; recordNotice.value = ''; pendingDelete.value = session }
const recordError = ref('')
const recordNotice = ref('')
let recordNoticeTimer
onUnmounted(() => clearTimeout(recordNoticeTimer))
const celebrate = ref(false)
let lastCelebrationDay = ''
try { lastCelebrationDay = storage.getItem('algoflow:celebration-day') ?? '' } catch {}
function celebrateDailyCompletion() {
  const today = localDate()
  if (!dailyProblem.value || !isTodayCompleted(dailyProblem.value) || lastCelebrationDay === today) return
  lastCelebrationDay = today
  try { storage.setItem('algoflow:celebration-day', today) } catch {}
  celebrate.value = true
}
watch(() => [dailyProblem.value?.id, isTodayCompleted(dailyProblem.value), date.value], celebrateDailyCompletion, { immediate: true })
function savePractice(form) {
  try {
    refreshDay()
    const next = editingSession.value ? editSession(state.value, editingSession.value.id, form) : appendSession(state.value, detail.value.problem.id, form, crypto.randomUUID(), new Date().toISOString())
    const error = saveState(storage, next)
    if (error) { recordError.value = error; return }
    state.value = next; formDirty.value = false; closeRecording(); recordError.value = ''; recordNotice.value = '已保存，可在「记录」中查看。'
    celebrateDailyCompletion()
  } catch (error) { recordError.value = error.message }
}
const detailSessions = computed(() => (state.value.sessions ?? []).filter(s => s.problemId === detail.value?.problem.id).slice().reverse())
function removeRecord() {
  if (!pendingDelete.value || deletingRecord.value) return
  deletingRecord.value = true
  deleteError.value = ''
  try {
    if (!(state.value.sessions ?? []).some(s => s.id === pendingDelete.value.id)) throw new Error('这条记录已不存在，请取消后重新查看。')
    const next = deleteSession(state.value, pendingDelete.value.id)
    const error = saveState(storage, next)
    if (error) { deleteError.value = '删除失败，记录尚未更改。请检查浏览器存储权限后重试。'; return }
    state.value = next; pendingDelete.value = null; viewingSession.value = null; recordNotice.value = '记录已删除。'
    clearTimeout(recordNoticeTimer)
    recordNoticeTimer = setTimeout(() => { if (recordNotice.value === '记录已删除。') recordNotice.value = '' }, 3000)
  } catch (error) { deleteError.value = error.message || '删除失败，请重试。' }
  finally { deletingRecord.value = false }
}
const assistanceName = value => ({ INDEPENDENT: '独立完成 / 尝试', HINT: '查看提示', SOLUTION: '参考题解' })[value] ?? value
const clearingData = ref(false)
const clearError = ref('')
function confirmClearData() {
  try {
    clearAppData(window.localStorage)
    window.history.replaceState(null, '', '#/profile')
    window.location.reload()
  } catch (error) { clearError.value = error.message }
}
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
const todayOverview = computed(() => learningStatistics(state.value.sessions ?? [], date.value))
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
  window.history.replaceState({ ...window.history.state, ui: { libraryView: libraryView.value ? JSON.parse(JSON.stringify(libraryView.value)) : null, randomTopic:randomTopic.value, randomDifficulty:randomDifficulty.value, randomId:randomProblem.value?.id, randomAttempted:randomAttempted.value, randomResultFilters:randomResultFilters.value ? { ...randomResultFilters.value } : null, scroll:window.scrollY } }, '', window.location.href)
}
let restoringUI = false
function restoreUI() {
  const ui = window.history.state?.ui
  if (!ui) return
  restoringUI = true
  libraryView.value = ui.libraryView ?? null
  const restored = restoreRandomSnapshot(ui, state.value.completedIds)
  randomTopic.value=restored.topicId; randomDifficulty.value=restored.difficulty
  randomProblem.value=restored.problem; randomAttempted.value=restored.attempted
  randomResultFilters.value=restored.resultFilters; randomRestoreMessage.value=restored.message
  restoringUI = false
}
let acceptedUrl = window.location.hash
let acceptedState = window.history.state
function applyRoute() {
  refreshDay()
  const [path, query=''] = window.location.hash.replace(/^#\/?/,'').split('?')
  const [tab,view] = path.split('/')
  activeTab.value=['today','practice','review','profile'].includes(tab)?tab:'today'
  browsingLibrary.value=activeTab.value==='practice' && view==='library'
  trainingSettingsOpen.value=activeTab.value==='today' && view==='settings'
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
watch(() => [randomTopic.value, randomDifficulty.value, randomProblem.value?.id, randomAttempted.value, JSON.stringify(randomResultFilters.value), JSON.stringify(libraryView.value)], () => {
  if (!restoringUI) rememberUI()
}, { flush: 'sync' })
function mayLeave() { return !formDirty.value || window.confirm('训练记录尚未保存，确定放弃修改？') }
function navigate(url) {
  if (!mayLeave()) return
  rememberUI(); window.history.pushState({ui:window.history.state?.ui},'',url); applyRoute(); window.scrollTo(0,0)
}
function switchTab(tab) { if(tab!==activeTab.value || browsingLibrary.value || trainingSettingsOpen.value) navigate(`#/${tab}`) }
function showDetail(problem,source) {
  if(!problem)return
  detail.value={problem,source,explanation:source==='daily'?trainingReason.value+problem.focus:['profile','review','library'].includes(source)?problem.focus:reason.value}
  recordNotice.value=''; recordError.value=''
  navigate(routeFor('problem'))
}
function openRecording(session=null) { recordError.value=''; navigate(routeFor('record',session)) }
function closeRecording() { navigate(routeFor('problem')) }
function closeDetail() { navigate(detail.value?.source === 'library' ? '#/practice/library' : routeBase()) }
function onNavigation() {
  if (!mayLeave()) { window.history.pushState(acceptedState,'',acceptedUrl); return }
  applyRoute()
}
function beforeUnload(event) { if(formDirty.value){event.preventDefault();event.returnValue=''} }
onMounted(()=>{applyRoute();window.addEventListener('popstate',onNavigation);window.addEventListener('beforeunload',beforeUnload)})
onUnmounted(()=>{window.removeEventListener('popstate',onNavigation);window.removeEventListener('beforeunload',beforeUnload)})
refreshDay()
let timer
function onVisible() { if (document.visibilityState === 'visible') resumeDay() }
function onStorage(event) { if (event.key === null || ['algoflow:v1:learning', 'algoflow:v1:training-choice'].includes(event.key)) resumeDay() }
onMounted(() => { timer = window.setInterval(refreshDay, 60000); window.addEventListener('focus', resumeDay); window.addEventListener('pageshow', resumeDay); window.addEventListener('storage', onStorage); document.addEventListener('visibilitychange', onVisible) })
onUnmounted(() => { clearInterval(timer); window.removeEventListener('focus', resumeDay); window.removeEventListener('pageshow', resumeDay); window.removeEventListener('storage', onStorage); document.removeEventListener('visibilitychange', onVisible) })
</script>

<template>
  <ConfirmDialog v-if="pendingDelete" title="删除训练记录？" description="删除后无法恢复，确定要删除这条记录吗？" confirm-label="删除" danger :error="deleteError" :busy="deletingRecord" :fallback-focus="deleteFocusFallback" @cancel="pendingDelete = null" @confirm="removeRecord" />
  <ClearDataDialog v-if="clearingData" :error="clearError" @cancel="clearingData = false" @confirm="confirmClearData" /><CompletionCelebration v-if="celebrate" @close="celebrate = false" /><AppShell :active="activeTab" :secondary="!!detail" @navigate="switchTab"><div class="page-shell">
    <header class="brand-row"><a class="brand" :href="routeBase()" @click.prevent="navigate(routeBase())" aria-label="AlgoFlow 首页"><span class="brand-icon"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M8 14c8 0 10-2 10-6"/></svg></span>AlgoFlow</a><span class="date-pill">{{ todayLabel }}</span></header>
    <main v-if="recording && detail" class="detail-page">
      <button class="secondary-button back-button" @click="closeRecording">← 返回题目详情</button>
      <p class="problem-id">{{ detail.problem.externalId }} · {{ detail.problem.title }}</p>
      <PracticeForm :session="editingSession" :error="recordError" @dirty="formDirty = $event" @save="savePractice" @cancel="closeRecording" />
    </main>
    <main v-if="detail" v-show="!recording" class="detail-page">
      <button ref="detailBackButton" class="secondary-button back-button" @click="closeDetail">← 返回{{ detail.source === 'library' ? '题库' : {today: '今日', practice: '刷题', review: '记录', profile: '我的'}[activeTab] }}</button>
      <article class="preview">
        <p class="problem-id">{{ detail.problem.id }} · {{ detail.source === 'library' ? '题库选题' : detail.source === 'daily' ? '每日推荐' : ['review','profile'].includes(detail.source) ? '训练档案' : '随机刷题' }}</p>
        <h1 id="detail-title" tabindex="-1">{{ detail.problem.title }}</h1>
        <div class="tags"><span>来源：{{ detail.problem.platform }}</span><span>{{ detail.problem.difficulty }} · 自定分级</span><span v-for="id in detail.problem.leafTopicIds" :key="id">{{ topicPath(id) }}</span></div>
        <h2>推荐理由</h2><p>{{ detail.explanation }}</p><section class="ai-placeholder"><h2>AI 解题教练</h2><p>后续提供思路提示与解题引导，本版本尚未接入。</p></section>
        <a class="primary-button problem-link" :href="detail.problem.url" target="_blank" rel="noopener noreferrer">查看完整题目 </a>
        <button class="secondary-button" @click="openRecording()">{{ detailSessions.length ? '重新训练' : '记录训练' }}</button>
        <p v-if="recordNotice" class="record-feedback" role="status">{{ recordNotice }}</p>
        <section v-if="detailSessions.length && ['review', 'profile'].includes(detail.source)"><h2>训练历史 · {{ detailSessions.length }} 次</h2>
          <article v-for="session in detailSessions" :key="session.id" class="history-record">
            <p>{{ new Date(session.recordedAt).toLocaleString('zh-CN') }} · {{ session.verdict === 'UNFINISHED' ? '未完成' : session.verdict }}（手动自报）· 掌握 {{ session.masteryPercent ?? session.selfRating * 20 }}%</p>
            <div class="record-actions"><button @click="viewingSession = viewingSession?.id === session.id ? null : session">{{ viewingSession?.id === session.id ? '收起' : '查看' }}</button><button @click="openRecording(session)">编辑</button><button @click="requestRecordDelete(session)">删除</button></div>
            <div v-if="viewingSession?.id === session.id"><p>完成方式：{{ assistanceName(session.assistanceLevel) }}</p><p>耗时：{{ session.durationSeconds == null ? '未填写' : session.durationSeconds / 60 + ' 分钟' }}</p><p>错因：{{ session.errorTypes?.join('、') || '未填写' }}</p><p class="record-note">笔记：{{ session.note || '未填写' }}</p><section class="ai-placeholder"><h3>AI 复盘分析</h3><p>后续用于分析本次训练与错因，本版本尚未接入。</p></section></div>
          </article>
        </section>
        <p v-if="['review', 'profile'].includes(detail.source)">已完成以最近一次训练结果为准：AC 计为完成；其他结果重新进入未完成候选。尚无训练记录的题目保留旧版手动标记。</p>
      </article>
    </main>
    <main v-show="!detail">
      <TodayPage v-show="activeTab === 'today' && !trainingSettingsOpen">
      <section class="greeting today-welcome"><h1>今天，也来一道题。</h1><p class="intro">保持思考的节奏，积累算法能力。</p></section>
      <p v-if="warning" class="notice" role="alert">{{ warning }}</p>
      <section class="daily-card today-result clickable-card" aria-labelledby="daily-title" :tabindex="dailyProblem ? 0 : undefined" :role="dailyProblem ? 'link' : undefined" @click="showDetail(dailyProblem, 'daily', $event)" @keydown.enter.self.prevent="showDetail(dailyProblem, 'daily', $event)"><div class="card-top"><span class="label"><span class="small-dot"></span>今日推荐</span><span v-if="isTodayCompleted(dailyProblem)" class="today-completed" role="status" aria-label="今日训练已完成">✅ 已完成</span><span v-else class="sample-tag">{{ training?.confirmed ? '已确定训练' : '随机推荐' }}</span></div>
        <template v-if="dailyProblem"><div v-if="isTodayCompleted(dailyProblem)" class="daily-congrats" role="status"><strong>✦ 今日挑战已完成，真棒！</strong><span>每一次认真思考，都在让你更进一步。</span></div><div class="today-result-meta"><span><span class="today-platform-mark">{{ dailyProblem.platform === '洛谷' ? 'LG' : 'OJ' }}</span>{{ dailyProblem.platform }} <small>{{ dailyProblem.externalId }}</small></span><span class="today-difficulty">{{ dailyProblem.difficulty }}</span></div><h2 id="daily-title">{{ dailyProblem.title }}</h2><p class="daily-description">{{ dailyProblem.focus }}</p><div class="tags"><span v-for="id in dailyProblem.leafTopicIds" :key="id">{{ topicName(id) }}</span></div><div class="today-result-status"><span>{{ training?.confirmed ? '按确认的专题与难度推荐' : '全部专题随机推荐' }}</span><span>{{ isTodayCompleted(dailyProblem) ? '已完成' : '未完成' }}</span></div><button class="primary-button" @click.stop="showDetail(dailyProblem, 'daily', $event)">开始今日训练 </button><p class="card-footnote">{{ date }} · 刷新保留 · 确定训练可更换题目</p></template>
        <template v-else><h2 id="daily-title">当前没有可推荐的新题</h2><p class="daily-description">当前训练范围内没有未完成题目。已保留你的专题设置，请切换专题或难度，或前往刷题页练习。</p></template>
      </section>
      <section class="today-overview"><div class="overview-heading"><h2>学习概览</h2><span>真实训练档案</span></div><div class="overview-grid"><article><span class="overview-symbol" aria-hidden="true">✓</span><strong>{{ todayOverview.practiced }}<small>题</small></strong><p>累计已练题目</p><span>同题多次训练只计一次</span></article><article><span class="overview-symbol" aria-hidden="true">◎</span><strong>{{ todayOverview.independent }}<small>题</small></strong><p>独立 AC 题目</p><span>仅统计独立完成的自报结果</span></article></div></section>
      <button class="training-settings-entry" @click="navigate('#/today/settings')"><span>调整学习专题与难度</span><span aria-hidden="true">›</span></button>
      </TodayPage>
      <section v-show="activeTab === 'today' && trainingSettingsOpen" class="training-settings-page" aria-labelledby="training-settings-title"><button class="library-return" @click="navigate('#/today')">← 返回今日</button><h1 id="training-settings-title">训练设置</h1><article class="settings-card"><h2>学习专题与难度</h2><div class="filter-grid"><TopicPicker v-model="draftSettings.topicId" label="学习专题" /><SmoothSelect v-model="draftSettings.difficulty" label="学习难度" :options="difficulties" /></div><button class="primary-button" @click="confirmTraining() && navigate('#/today')">确定训练</button><p v-if="trainingMessage" role="status">{{ trainingMessage }}</p><p>确认后每天持续按所选专题与难度推荐，直到你主动切换。只调整选项或返回不会更改当前训练。</p></article></section>
      <PracticePage @browse-library="navigate('#/practice/library')" v-show="activeTab === 'practice' && !browsingLibrary" :topic="randomTopic" :difficulty="randomDifficulty" :problem="randomProblem" :attempted="randomAttempted" :message="randomRestoreMessage" :sessions="state.sessions ?? []" :date="date" @update:topic="value => { randomTopic = value; resetRandomResult() }" @update:difficulty="value => { randomDifficulty = value; resetRandomResult() }" @draw="randomDraw" @open="problem => showDetail(problem, 'random')" />
      <section v-show="activeTab === 'practice' && browsingLibrary" class="library-page"><button class="library-return" @click="navigate('#/practice')">← 返回刷题</button>
        <ProblemLibrary v-model:view="libraryView" :completed-ids="state.completedIds" @open="problem => showDetail(problem, 'library')" />
      </section>
      <ReviewPage v-show="activeTab === 'review'" :sessions="state.sessions ?? []" @open="problem => showDetail(problem, 'review')" />
      <ProfilePage v-show="activeTab === 'profile'"><section class="greeting"><h1>我的</h1><p class="intro">你的学习档案</p></section><LearningStatistics :sessions="state.sessions ?? []" :today="date" /><article class="preview"><h2>数据管理</h2><button class="secondary-button" @click="exportArchive">导出训练档案 JSON</button><BackupImport :state="state" @confirm="confirmBackupImport" /><button class="danger-button clear-data-entry" @click="clearError = ''; clearingData = true">清空全部数据</button><p v-if="importNotice" role="status">{{ importNotice }}</p><p>数据只保存在当前浏览器和当前地址，可通过 JSON 备份手动迁移。手动结果不代表 OJ 官方判题。</p></article><section class="more-section"><button class="secondary-button" @click="switchTab('review')">查看训练档案</button></section></ProfilePage>
    </main>
  </div></AppShell>
</template>

<style scoped>
.detail-page .record-feedback{position:fixed;z-index:40;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);width:max-content;max-width:calc(100vw - 40px);margin:0;padding:12px 18px;border:1px solid #D3EDE0;border-radius:14px;background:#E8F7F0;color:#237A45;box-shadow:0 4px 18px #202b3f15;font-size:13px;line-height:1.6;text-align:center}

.training-settings-entry{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:54px;margin-top:22px;padding:14px 18px;border:1px solid #E2DDF8;border-radius:16px;background:#F0EDFF;color:#6658DB;font-size:14px;font-weight:600;text-align:left}.training-settings-entry>span:last-child{font-size:23px;line-height:1}.training-settings-page{padding-top:24px}.training-settings-page h1{font-size:28px;margin:16px 0 24px}.training-settings-page h2{font-size:16px;margin:0 0 18px}.training-settings-page .primary-button{width:100%;justify-content:center}

.library-page{padding-top:24px}.library-return{min-height:44px;padding:0;border:0;background:transparent;color:#202B3F;font-size:14px}.library-page :deep(.problem-library){margin-top:0;padding-top:16px;border-top:0}

.daily-card.today-result{padding:18px;display:grid;gap:14px;border:1px solid #E8ECF4;border-radius:20px;background:#fff;box-shadow:0 6px 20px #202b3f16;color:#202B3F}
.today-result .card-top{margin:0;padding:0;background:transparent;border:0;min-height:0;font-size:12px;gap:12px}.today-result .card-top .label{font-size:12px;color:#6658DB;gap:7px}.today-result .small-dot{width:5px;height:5px}.today-result .sample-tag{padding:0;border:0;background:transparent;color:#68768D;font-size:11.5px}
.today-completed{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:12px;background:#DCF7E5;color:#23834B;font-size:12px;font-weight:650;white-space:nowrap}.today-result-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;color:#68768D}.today-result-meta>span:first-child{display:flex;align-items:center;flex-wrap:wrap;gap:7px}.today-platform-mark{font-size:10px;background:#202B3F;color:white;border-radius:4px;padding:4px}.today-result-meta small{font-size:11px;color:#8391A7}.today-difficulty{background:#FDF3E1;color:#A66B12;font-size:11px;border-radius:6px;padding:4px 8px;white-space:nowrap}
.today-result h2{font-size:21px;line-height:1.45;margin:0;overflow-wrap:anywhere}.today-result .daily-description{font-size:13px;color:#68768D;line-height:1.7;margin:0}.today-result .tags{margin:0;gap:6px}.today-result .tags span{font-size:11px;line-height:1.5;background:#F7F9FD;color:#68768D;border:0;border-radius:12px;padding:4px 9px}
.today-result-status{display:flex;justify-content:space-between;gap:8px;border-top:1px solid #E8ECF4;padding-top:14px;font-size:11.5px;color:#68768D}.today-result-status span:last-child{color:#6658DB}.today-result .primary-button{width:100%;margin:0;min-height:46px;padding:12px;border:0;border-radius:14px;background:#6658DB;box-shadow:none;font-size:13.5px;line-height:1.6;justify-content:center;text-align:center}.today-result .card-footnote{margin:0;padding:0;font-size:11px;line-height:1.7;color:#8391A7}.today-result .daily-congrats{margin:0}
</style>
