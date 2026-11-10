import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureTrainingChoice } from '../src/lib/trainingChoice.js'
import { problems } from '../src/data/problems.js'
const chosen = { date: '2026-11-09', problemId: 'LUOGU:P1102', confirmed: true, topicId: 'binary-search', difficulty: '基础' }
test('跨日和重新加载持续保留确认专题与难度，过滤已完成题', () => {
 const next = ensureTrainingChoice(JSON.parse(JSON.stringify(chosen)), '2026-11-10', [chosen.problemId], () => 0)
 assert.equal(next.confirmed, true); assert.equal(next.topicId, chosen.topicId); assert.equal(next.difficulty, chosen.difficulty)
 const p = problems.find(p => p.id === next.problemId)
 assert(p.topicIds.includes(chosen.topicId)); assert.equal(p.difficulty, chosen.difficulty); assert.notEqual(p.id, chosen.problemId)
 assert.strictEqual(ensureTrainingChoice(next, '2026-11-10', [next.problemId], () => 1), next)
 const after = ensureTrainingChoice(next, '2026-11-11', [], () => 0)
 assert.equal(after.topicId, chosen.topicId)
})
test('无候选不回退其他专题，空状态和确认范围跨日保留', () => {
 const all = problems.map(p => p.id)
 const empty = ensureTrainingChoice(chosen, '2026-11-10', all)
 assert.equal(empty.problemId, null); assert.equal(empty.confirmed, true); assert.equal(empty.topicId, chosen.topicId)
 assert.strictEqual(ensureTrainingChoice(empty, '2026-11-10', all), empty)
 const next = ensureTrainingChoice(empty, '2026-11-11', all)
 assert.equal(next.problemId, null); assert.equal(next.topicId, chosen.topicId)
})
test('首次及未确认仍全范围随机，主动切换后沿用新范围', () => {
 assert.equal(ensureTrainingChoice(null, '2026-11-10', []).confirmed, false)
 assert.equal(ensureTrainingChoice({ ...chosen, confirmed: false }, '2026-11-10', []).confirmed, false)
 const switched = ensureTrainingChoice({ ...chosen, topicId: 'dp', difficulty: '进阶' }, '2026-11-10', [])
 assert.equal(switched.topicId, 'dp'); assert.equal(switched.difficulty, '进阶')
 assert.equal(ensureTrainingChoice({ ...chosen, topicId: 'invalid' }, '2026-11-10', []).confirmed, false)
})
