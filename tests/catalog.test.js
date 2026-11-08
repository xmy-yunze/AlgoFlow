import test from 'node:test'
import assert from 'node:assert/strict'
import {problems,topics} from '../src/data/problems.js'
import {candidates,loadState,STORAGE_KEY} from '../src/lib/recommendations.js'
import {learningStatistics} from '../src/lib/statistics.js'
test('新增两平台题目、专题引用及旧档案兼容',()=>{
 const valid=new Set(topics.map(t=>t.id))
 for(const p of problems)assert(p.topicIds.every(id=>valid.has(id)))
 assert(candidates({topicId:'trie'}).some(p=>p.id==='LEETCODE:208'))
 assert(candidates({topicId:'segment-tree'}).some(p=>p.id==='LUOGU:P3372'))
 const data={version:1,settings:{topicId:'binary-search',difficulty:'基础'},completedIds:['LUOGU:P2249'],daily:{date:'2026-11-08',problemId:'LUOGU:P2249',topicId:'binary-search',difficulty:'基础'},sessions:[{id:'old',problemId:'LUOGU:P2249',verdict:'AC',assistanceLevel:'INDEPENDENT',recordedAt:'2026-11-08T01:00:00Z',selfRating:4}]}
 const loaded=loadState({getItem:key=>key===STORAGE_KEY?JSON.stringify(data):null});assert.equal(loaded.warning,'');assert.equal(loaded.state.sessions[0].id,'old');assert.equal(loaded.state.daily.problemId,'LUOGU:P2249');assert.equal(learningStatistics(loaded.state.sessions).independent,1)
})
