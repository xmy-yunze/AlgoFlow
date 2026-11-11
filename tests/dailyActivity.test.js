import test from 'node:test'
import assert from 'node:assert/strict'
import { dailyActivity } from '../src/lib/dailyActivity.js'
import { learningStatistics } from '../src/lib/statistics.js'
import { ensureTrainingChoice } from '../src/lib/trainingChoice.js'
process.env.TZ = 'Asia/Shanghai'
const session = (id, recordedAt, verdict = 'AC') => ({ id, problemId: id, recordedAt, verdict, assistanceLevel: 'INDEPENDENT' })
test('11月10日到11日：昨日AC不冒充今日完成，历史和累计统计保留', () => {
 const sessions = [session('LUOGU:P2249', '2026-11-09T10:00:00+08:00'), session('LUOGU:P1102', '2026-11-10T23:59:00+08:00')]
 const before = JSON.stringify(sessions)
 const stats = learningStatistics(sessions, '2026-11-11')
 assert.equal(stats.todayPracticed, 0); assert.equal(stats.streak, 2); assert.equal(stats.total, 2); assert.equal(stats.independent, 2)
 assert.deepEqual(stats.completedIds, []); assert.equal(JSON.stringify(sessions), before)
 assert.equal(dailyActivity(sessions, '2026-11-12').streak, 0)
})
test('今日按本地日历日期归类，UTC日期不同也不偏移', () => {
 const sessions = [session('a', '2026-11-10T16:05:00Z'), session('b', '2026-11-10T15:59:00Z')]
 const result = dailyActivity(sessions, '2026-11-11')
 assert.equal(result.todayPracticed, 1); assert.deepEqual(result.completedIds, ['a']); assert.equal(result.dates.get('2026-11-10'), 1)
})
test('今日完成按当日最近结果，重复训练去重，编辑删除会重新计算', () => {
 const sessions = [session('a', '2026-11-11T10:00:00+08:00'), session('a', '2026-11-11T11:00:00+08:00', 'WA')]
 assert.equal(dailyActivity(sessions, '2026-11-11').todayPracticed, 1)
 assert.deepEqual(dailyActivity(sessions.slice().reverse(), '2026-11-11').completedIds, [])
 assert.deepEqual(dailyActivity(sessions.slice(0,1), '2026-11-11').completedIds, ['a'])
 assert.equal(dailyActivity([], '2026-11-11').streak, 0)
})
test('跨月、跨年连续打卡与中断，任意记录结果算训练日', () => {
 for (const [before, after] of [['2026-11-30','2026-12-01'],['2026-12-31','2027-01-01']]) {
  const sessions = [session('a', before+'T23:59:00+08:00', 'WA'), session('b', after+'T00:01:00+08:00', 'UNFINISHED')]
  assert.equal(dailyActivity(sessions, after).streak, 2)
  assert.equal(dailyActivity(sessions, after).todayPracticed, 1)
 }
})
test('跨日生成新推荐，存在多个候选时避开昨日题目，锁定范围不变', () => {
 const saved = { date:'2026-11-10', problemId:'LUOGU:P2249', confirmed:true, topicId:'binary-search', difficulty:'基础' }
 const next = ensureTrainingChoice(saved, '2026-11-11', [], () => 0)
 assert.notEqual(next.problemId, saved.problemId); assert.equal(next.topicId, saved.topicId); assert.equal(next.difficulty, saved.difficulty)
 assert.strictEqual(ensureTrainingChoice(next, '2026-11-11', [next.problemId]), next)
})
