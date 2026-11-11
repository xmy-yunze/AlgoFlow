import { topicGroups, topics, difficulties } from '../data/problems.js'

// 分类浏览快照仅进入浏览器 History，不写入长期训练设置。
export function restoreLibraryView(raw = {}) {
  const path = []
  let nodes = topicGroups, current = null
  for (const id of Array.isArray(raw?.path) ? raw.path : []) {
    const node = nodes.find(n => n.id === id)
    if (!node) break
    path.push(id); current = node; nodes = node.children ?? []
  }
  const selected = topics.find(t => t.id === raw?.selectedTopicId)
  const selectedTopicId = current && selected && (selected.id === current.id || selected.ancestorIds.includes(current.id)) ? selected.id : ''
  return { path, selectedTopicId, showingProblems: !!current && raw?.showingProblems === true,
    difficulty: difficulties.includes(raw?.difficulty) ? raw.difficulty : '',
    platform: ['洛谷', 'LeetCode'].includes(raw?.platform) ? raw.platform : '',
    query: typeof raw?.query === 'string' ? raw.query.slice(0, 200) : '',
    limit: Number.isInteger(raw?.limit) ? Math.min(1000, Math.max(30, raw.limit)) : 30 }
}
