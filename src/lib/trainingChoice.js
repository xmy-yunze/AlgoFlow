import { problems, topics, difficulties } from '../data/problems.js'
import { drawRandom } from './recommendations.js'

// 确认标记和筛选继续使用原有训练选择，不增加另一份设置。
export function ensureTrainingChoice(saved, date, completedIds, rng = Math.random) {
  const confirmed = saved?.confirmed === true && topics.some(t => t.id === saved.topicId) && difficulties.includes(saved.difficulty)
  const filters = confirmed ? { topicId: saved.topicId, difficulty: saved.difficulty } : {}
  const validProblem = saved?.problemId == null || problems.some(p => p.id === saved.problemId)
  if (saved?.date === date && validProblem && (confirmed || saved.confirmed === false)) return saved
  const problem = drawRandom(filters, completedIds, saved?.date !== date ? saved?.problemId ?? '' : '', rng)
  return { date, problemId: problem?.id ?? null, confirmed, ...filters }
}
