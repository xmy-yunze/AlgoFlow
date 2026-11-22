import { localDate } from './recommendations.js'

// 只派生展示数据；旧完成标记没有日期，不推断其完成时间。
export function dailySolvedCounts(sessions = []) {
  const days = new Map()
  for (const session of sessions) {
    if (session.verdict !== 'AC' || !session.problemId) continue
    const time = new Date(session.recordedAt)
    if (Number.isNaN(time.getTime())) continue
    const key = localDate(time)
    if (!days.has(key)) days.set(key, new Set())
    days.get(key).add(session.problemId)
  }
  return new Map([...days].map(([key, ids]) => [key, ids.size]))
}
export function heatLevel(count = 0) {
  return Math.min(6, Math.max(0, Math.floor(count)))
}
