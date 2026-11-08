import { candidates } from './recommendations.js'
import { topics, difficulties } from '../data/problems.js'
export function restoreRandomSnapshot(ui, completedIds) {
  const topic = typeof ui?.randomTopic === 'string' ? ui.randomTopic : ''
  const difficulty = typeof ui?.randomDifficulty === 'string' ? ui.randomDifficulty : ''
  const filtersValid = (!topic || topics.some(t=>t.id===topic)) && (!difficulty || difficulties.includes(difficulty))
  const filters = { topicId: filtersValid ? topic : '', difficulty: filtersValid ? difficulty : '' }
  const problem = filtersValid && ui?.randomId ? candidates(filters, completedIds).find(p=>p.id===ui.randomId) ?? null : null
  const invalid = !filtersValid || (!!ui?.randomId && !problem)
  return { ...filters, problem, attempted: !!ui?.randomAttempted || invalid, resultFilters: problem ? filters : null,
    message: invalid ? '之前的抽题结果已失效或不符合当前条件，请重新抽题。' : '' }
}
