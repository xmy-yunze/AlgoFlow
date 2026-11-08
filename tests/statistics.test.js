import test from 'node:test'
import assert from 'node:assert/strict'
import {learningStatistics} from '../src/lib/statistics.js'
test('统计真实次数、题目去重与独立AC，不把提示AC算独立',()=>{
 const sessions=[{problemId:'LUOGU:P2249',verdict:'WA',recordedAt:'2026-11-08T01:00:00Z'},{problemId:'LUOGU:P2249',verdict:'AC',assistanceLevel:'INDEPENDENT',recordedAt:'2026-11-08T02:00:00Z'},{problemId:'LUOGU:P2249',verdict:'AC',assistanceLevel:'INDEPENDENT',recordedAt:'2026-11-08T03:00:00Z'},{problemId:'LUOGU:P1102',verdict:'AC',assistanceLevel:'HINT',recordedAt:'2026-11-08T04:00:00Z'}]
 const s=learningStatistics(sessions);assert.equal(s.total,4);assert.equal(s.practiced,2);assert.equal(s.independent,1);assert.equal([...s.dates.values()][0],4)
 assert.equal(s.topics.find(t=>t.id==='basics').practiced,2)
 assert.equal(learningStatistics([]).total,0)
 assert.equal(learningStatistics(sessions.filter(s=>s.assistanceLevel!=='INDEPENDENT')).independent,0)
})
