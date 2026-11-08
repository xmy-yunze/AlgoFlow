export function completedFromPractice(state) {
  const latest = new Map()
  for (const session of state.sessions ?? []) latest.set(session.problemId, session)
  const ids = new Set(state.legacyCompletedIds ?? state.completedIds ?? [])
  for (const [id, session] of latest) {
    if (session.verdict === 'AC') ids.add(id)
    else ids.delete(id)
  }
  return [...ids]
}
export function appendSession(state, problemId, form, id, recordedAt) {
  if (!['AC', 'WA', 'TLE', 'UNFINISHED'].includes(form.verdict) || !['INDEPENDENT', 'HINT', 'SOLUTION'].includes(form.assistanceLevel) || !Number.isInteger(Number(form.selfRating)) || Number(form.selfRating) < 1 || Number(form.selfRating) > 5) throw Error('请选择结果、完成方式和掌握程度。')
  if (form.masteryPercent !== undefined && (!Number.isInteger(form.masteryPercent) || form.masteryPercent < 0 || form.masteryPercent > 100)) throw Error('掌握程度应为 0～100%。')
  const minutes = form.minutes === '' ? null : Number(form.minutes)
  if (minutes !== null && (!Number.isFinite(minutes) || minutes < 0 || minutes > 10080)) throw Error('耗时请填写 0～10080 分钟，或留空。')
  const session = { id, problemId, recordedAt, verdict: form.verdict, source: 'MANUAL', assistanceLevel: form.assistanceLevel, selfRating: Number(form.selfRating), masteryPercent: form.masteryPercent ?? Number(form.selfRating) * 20, durationSeconds: minutes === null ? null : Math.round(minutes * 60), errorTypes: [...form.errorTypes], note: form.note.trim() }
  const next = { ...state, legacyCompletedIds: state.legacyCompletedIds ?? [...state.completedIds], sessions: [...(state.sessions ?? []), session] }
  return { ...next, completedIds: completedFromPractice(next) }
}
export function editSession(state, id, form) {
  const old = state.sessions.find(s => s.id === id)
  if (!old) throw Error('记录不存在。')
  const validated = appendSession(state, old.problemId, form, old.id, old.recordedAt).sessions.at(-1)
  const next = { ...state, sessions: state.sessions.map(s => s.id === id ? { ...validated, updatedAt: new Date().toISOString() } : s) }
  return { ...next, completedIds: completedFromPractice(next) }
}
export function deleteSession(state, id) {
  const next = { ...state, sessions: state.sessions.filter(s => s.id !== id) }
  return { ...next, completedIds: completedFromPractice(next) }
}
