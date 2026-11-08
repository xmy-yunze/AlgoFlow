import test from 'node:test'
import assert from 'node:assert/strict'
import { restoreRandomSnapshot } from '../src/lib/randomSnapshot.js'
const snapshot={randomTopic:'binary-search',randomDifficulty:'基础',randomId:'LUOGU:P2249',randomAttempted:true}
test('快照恢复保留有效筛选和题目',()=>{assert.equal(restoreRandomSnapshot(snapshot,[]).problem.id,snapshot.randomId)})
test('不存在、已完成、专题难度不匹配的旧结果被拒绝且不自动抽题',()=>{
 for(const ui of [{...snapshot,randomId:'gone'},{...snapshot,randomTopic:'dp'},{...snapshot,randomDifficulty:'挑战'}]){const r=restoreRandomSnapshot(ui,[]);assert.equal(r.problem,null);assert(r.message)}
 assert.equal(restoreRandomSnapshot(snapshot,['LUOGU:P2249']).problem,null)
})
test('筛选修改清空结果及无候选刷新不复活旧题',()=>{
 const r=restoreRandomSnapshot({...snapshot,randomId:null,randomAttempted:true},[])
 assert.equal(r.problem,null);assert.equal(r.attempted,true)
 assert.equal(restoreRandomSnapshot({...snapshot,randomId:null,randomAttempted:false},[]).attempted,false)
})
