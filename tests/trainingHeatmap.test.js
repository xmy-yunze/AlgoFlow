import test from 'node:test'
import assert from 'node:assert/strict'
import { dailySolvedCounts, heatLevel } from '../src/lib/trainingHeatmap.js'
import { appendSession, editSession, deleteSession } from '../src/lib/practice.js'
test('热力按本地日期去重AC，重复、WA及无日期旧标记不虚增',()=>{
 const rows=[{problemId:'a',verdict:'AC',recordedAt:'2026-11-22T10:00:00'},{problemId:'a',verdict:'AC',recordedAt:'2026-11-22T11:00:00'},{problemId:'a',verdict:'WA',recordedAt:'2026-11-22T12:00:00'},{problemId:'b',verdict:'WA',recordedAt:'2026-11-22T13:00:00'},{problemId:'c',verdict:'AC',recordedAt:'2026-11-23T00:01:00'},{problemId:'d',verdict:'AC',recordedAt:'invalid'}]
 assert.deepEqual([...dailySolvedCounts(rows)], [['2026-11-22',1],['2026-11-23',1]])
 assert.deepEqual([0,1,2,3,4,5,6,9].map(heatLevel),[0,1,2,2,3,3,4,4])
})
test('沿用现有编辑删除逻辑后重新派生热力，旧完成标记不丢失',()=>{
 const form={verdict:'AC',assistanceLevel:'INDEPENDENT',selfRating:3,minutes:'',errorTypes:[],note:''}
 let state=appendSession({completedIds:['legacy']},'a',form,'1','2026-11-22T10:00:00')
 assert.equal(dailySolvedCounts(state.sessions).get('2026-11-22'),1)
 state=editSession(state,'1',{...form,verdict:'WA'})
 assert.equal(dailySolvedCounts(state.sessions).size,0)
 state=deleteSession(state,'1')
 assert.deepEqual(state.completedIds,['legacy'])
 assert.equal(dailySolvedCounts(state.sessions).size,0)
})
