import test from 'node:test'
import assert from 'node:assert/strict'
import {trainingLog} from '../src/lib/trainingLog.js'
test('训练档案按题去重，最近结果分类与低掌握度复习均来自记录',()=>{
 const rows=trainingLog([{problemId:'a',verdict:'WA'},{problemId:'a',verdict:'AC',masteryPercent:90,assistanceLevel:'INDEPENDENT'},{problemId:'b',verdict:'AC',selfRating:3,assistanceLevel:'HINT'},{problemId:'c',verdict:'TLE',masteryPercent:20}])
 assert.equal(rows.length,3);assert.equal(rows.filter(r=>r.passed).length,2);assert.equal(rows.filter(r=>r.review).length,1);assert.equal(rows.find(r=>r.problemId==='a').count,2);assert.deepEqual(trainingLog([]),[])
})
