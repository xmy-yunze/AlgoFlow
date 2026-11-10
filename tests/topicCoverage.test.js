import test from 'node:test'
import assert from 'node:assert/strict'
import { problems } from '../src/data/problems.js'
import { topicGroups } from '../src/data/topics.js'
function terminal(nodes) { return nodes.flatMap(n => n.children?.length ? terminal(n.children) : [n]) }
test('每个末级专题至少五道不同题目', () => {
  for (const topic of terminal(topicGroups)) {
    const ids = new Set(problems.filter(p => p.topicIds.includes(topic.id)).map(p => p.id))
    assert(ids.size >= 5, `${topic.name}仅有${ids.size}道`)
  }
})
