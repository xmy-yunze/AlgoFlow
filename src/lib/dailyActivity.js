import { localDate } from './recommendations.js'

// 只从现有训练记录派生日期状态，不增加或迁移存储数据。
export function dailyActivity(sessions = [], today = localDate()) {
  const dates = new Map(), todayProblems = new Set(), latestToday = new Map()
  for (const session of sessions) {
    const time = new Date(session.recordedAt)
    if (Number.isNaN(time.getTime())) continue
    const key = localDate(time)
    dates.set(key, (dates.get(key) ?? 0) + 1)
    if (key !== today) continue
    todayProblems.add(session.problemId)
    const previous = latestToday.get(session.problemId)
    if (!previous || time.getTime() >= new Date(previous.recordedAt).getTime()) latestToday.set(session.problemId, session)
  }
  // 今日尚未训练时接续昨天的连续记录，整日中断后归零。
  const cursor = new Date(`${today}T12:00:00`)
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (dates.has(localDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return { dates, todayTotal: dates.get(today) ?? 0, todayPracticed: todayProblems.size, streak,
    completedIds: [...latestToday.values()].filter(s => s.verdict === 'AC').map(s => s.problemId) }
}
