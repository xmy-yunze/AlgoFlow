export function trainingLog(sessions = []) {
  const grouped = new Map()
  for (const session of sessions) grouped.set(session.problemId, { problemId: session.problemId, latest: session, count: (grouped.get(session.problemId)?.count ?? 0) + 1 })
  return [...grouped.values()].reverse().map(row => {
    const mastery = row.latest.masteryPercent ?? row.latest.selfRating * 20
    const passed = row.latest.verdict === 'AC'
    return { ...row, mastery, passed, review: passed && (mastery < 80 || row.latest.assistanceLevel !== 'INDEPENDENT') }
  })
}
