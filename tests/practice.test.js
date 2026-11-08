import test from 'node:test'
import assert from 'node:assert/strict'
import { appendSession, completedFromPractice } from '../src/lib/practice.js'
const form={verdict:'AC',assistanceLevel:'INDEPENDENT',selfRating:3,minutes:'',errorTypes:[],note:''}
test('旧标记兼容，重复训练独立保存，最近结果优先且不改原状态',()=>{
 const state={completedIds:['old','p']}
 const first=appendSession(state,'p',form,'1','2026-11-08T01:00:00Z')
 const next=appendSession(first,'p',{...form,verdict:'WA'},'2','2026-11-08T02:00:00Z')
 assert.deepEqual(completedFromPractice(next),['old']);assert.equal(next.sessions.length,2)
 assert.equal(first.sessions.length,1);assert.equal(next.sessions[0].source,'MANUAL')
 assert.equal(next.sessions[0].durationSeconds,null)
})
test('必填与耗时校验',()=>{
 assert.throws(()=>appendSession({completedIds:[]},'p',{...form,verdict:''},'1','now'))
 assert.throws(()=>appendSession({completedIds:[]},'p',{...form,minutes:-2},'1','now'))
})

test('编辑保留 ID 与训练顺序，删除后恢复之前结果或旧标记',async()=>{
 const {editSession,deleteSession}=await import('../src/lib/practice.js')
 let state=appendSession({completedIds:[]},'p',form,'1','2026-11-08T01:00:00Z')
 state=appendSession(state,'p',{...form,verdict:'WA'},'2','2026-11-08T02:00:00Z')
 const edited=editSession(state,'1',{...form,verdict:'TLE'})
 assert.equal(edited.sessions.length,2);assert.equal(edited.sessions[0].id,'1');assert.equal(edited.sessions[0].recordedAt,state.sessions[0].recordedAt)
 assert.deepEqual(edited.completedIds,[])
 const restored=deleteSession(state,'2');assert.deepEqual(restored.completedIds,['p'])
 assert.deepEqual(deleteSession(restored,'1').completedIds,[])
 const legacy=appendSession({completedIds:['p']},'p',{...form,verdict:'WA'},'3','now')
 assert.deepEqual(deleteSession(legacy,'3').completedIds,['p'])
})
