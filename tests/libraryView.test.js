import test from 'node:test'
import assert from 'node:assert/strict'
import { restoreLibraryView } from '../src/lib/libraryView.js'

test('分类浏览快照恢复层级、待选、搜索与列表，不混入长期设置', () => {
 const input = {path:['basics','prefix-sum'],selectedTopicId:'prefix-2d',showingProblems:true,query:'P3397',difficulty:'基础',platform:'洛谷',limit:60}
 assert.deepEqual(restoreLibraryView(input),input)
 assert(!('training' in restoreLibraryView({...input,training:{topicId:'dp'}})))
})
test('非法层级和专题安全恢复，旧快照兼容', () => {
 const old = restoreLibraryView(null)
 assert.deepEqual(old.path,[]);assert.equal(old.selectedTopicId,'');assert.equal(old.showingProblems,false)
 const bad = restoreLibraryView({path:['basics','dp'],selectedTopicId:'lis',difficulty:'错误',platform:'错误',showingProblems:true})
 assert.deepEqual(bad.path,['basics']);assert.equal(bad.selectedTopicId,'');assert.equal(bad.difficulty,'');assert.equal(bad.platform,'')
})
