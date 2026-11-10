import test from 'node:test'
import assert from 'node:assert/strict'
import { problems } from '../src/data/problems.js'
import { STORAGE_KEY, candidates, drawRandom, ensureDaily, initialState, loadState, localDate, saveState, toggleCompleted } from '../src/lib/recommendations.js'

const memory = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }
test('多平台题库稳定 ID 唯一、原题域名正确', () => {
  assert.equal(new Set(problems.map(p => p.id)).size, problems.length)
  for (const p of problems) {
    assert(p.leafTopicIds.length && p.focus)
    if (p.platform === '洛谷') assert.equal(p.url, `https://www.luogu.com.cn/problem/${p.externalId}`)
    else { assert.equal(new URL(p.url).hostname, 'leetcode.cn'); assert(p.id.startsWith('LEETCODE:')) }
  }
})
test('每日推荐保存后重载保持不变，修改设置与完成标记也不替换当天题目', () => {
  const storage = memory()
  let state = ensureDaily(initialState(), '2026-11-07')
  const first = state.daily.problemId
  assert.equal(saveState(storage, state), '')
  state = loadState(storage).state
  state.settings = { topicId: 'dp', difficulty: '挑战' }
  state = toggleCompleted(state, first)
  assert.equal(ensureDaily(state, '2026-11-07').daily.problemId, first)
  const nextDay = ensureDaily(state, '2026-11-08')
  assert.equal(nextDay.daily.topicId, 'dp')
  assert.notEqual(nextDay.daily.problemId, first)
})
test('已完成题被过滤，完成标记可撤销并持久化', () => {
  let state = initialState()
  const id = problems[0].id
  state = toggleCompleted(state, id)
  assert(!candidates({}, state.completedIds).some(p => p.id === id))
  const storage = memory(); saveState(storage, state)
  assert.deepEqual(loadState(storage).state.completedIds, [id])
  assert.deepEqual(toggleCompleted(state, id).completedIds, [])
})
test('随机专题难度筛选，不修改每日推荐；多候选不连续重复', () => {
  const state = ensureDaily(initialState(), '2026-11-07')
  const snapshot = JSON.stringify(state)
  const filters = { topicId: 'binary-search', difficulty: '基础' }
  const first = drawRandom(filters, [], '', () => 0)
  const next = drawRandom(filters, [], first.id, () => 0)
  assert(first.topicIds.includes(filters.topicId)); assert.equal(first.difficulty, filters.difficulty)
  assert.notEqual(first.id, next.id)
  assert.equal(JSON.stringify(state), snapshot)
})
test('无候选和候选全部完成均安全返回空；单候选允许重复', () => {
  assert.equal(drawRandom({}, [], '', Math.random, []), null)
  const state = initialState(); state.completedIds = problems.map(p => p.id)
  assert.equal(ensureDaily(state, '2026-11-07').daily, null)
  assert.equal(drawRandom({}, state.completedIds), null)
  const one = drawRandom({ topicId: 'union-find', difficulty: '基础' }, [])
  assert.equal(drawRandom({ topicId: 'union-find', difficulty: '基础' }, [], one.id).id, one.id)
})
test('本地日期使用设备日历日期，跨月和跨年无 UTC 偏移', () => {
  assert.equal(localDate(new Date(2026, 0, 1, 0, 1)), '2026-01-01')
  assert.equal(localDate(new Date(2026, 11, 31, 23, 59)), '2026-12-31')
})
test('损坏存储、错误 schema、禁止读写均不崩溃并提供提示', () => {
  const storage = memory()
  for (const value of ['{broken', 'null', '{"version":2}', '{"version":1,"settings":{},"completedIds":[]}']) {
    storage.setItem(STORAGE_KEY, value)
    assert(loadState(storage).warning)
  }
  const blocked = { getItem() { throw Error() }, setItem() { throw Error() } }
  assert(loadState(blocked).warning); assert(saveState(blocked, initialState()))
})
test('失效题目记录重建，过期推荐按最新设置生成', () => {
  const state = initialState(); state.daily = { date: '2026-11-07', problemId: 'gone' }
  assert(problems.some(p => p.id === ensureDaily(state, '2026-11-07').daily.problemId))
  state.daily = { date: '2026-11-06', problemId: problems[0].id }
  state.completedIds = [problems[0].id]
  assert.notEqual(ensureDaily(state, '2026-11-07').daily.problemId, problems[0].id)
})

test('分层专题聚合不重复，细分筛选正确，多标签题出现在各自分类', () => {
  const dp = candidates({ topicId: 'dp' })
  assert(dp.some(p => p.id === 'LUOGU:P1048'))
  assert.equal(new Set(dp.map(p => p.id)).size, dp.length)
  assert(candidates({ topicId: 'knapsack-01' }).some(p => p.externalId === 'P1048'))
  assert(candidates({ topicId: 'bfs' }).some(p => p.externalId === 'P1443'))
  assert(candidates({ topicId: 'bfs' }).some(p => p.externalId === 'P1135'))
  assert(candidates({ topicId: 'difference-2d' }).some(p => p.externalId === 'P3397'))
  assert(candidates({ topicId: 'data-structures' }).some(p => p.externalId === 'P3367'))
  assert(!candidates({ topicId: 'graph' }).some(p => p.externalId === 'P3367'))
  assert(candidates({ topicId: 'digit-dp' }).every(p => p.topicIds.includes('dp')))
})
test('旧版专题与推荐 ID 仍可读取，包括重新分类的并查集', () => {
  const storage = memory()
  const state = initialState()
  state.settings = { topicId: 'graph', difficulty: '基础' }
  state.daily = { date: '2026-11-07', problemId: 'LUOGU:P3367', ...state.settings }
  state.completedIds = ['LUOGU:P3367']
  saveState(storage, state)
  const loaded = loadState(storage)
  assert.equal(loaded.warning, '')
  assert.equal(ensureDaily(loaded.state, '2026-11-07').daily.problemId, 'LUOGU:P3367')
  assert.deepEqual(loaded.state.completedIds, state.completedIds)
})
