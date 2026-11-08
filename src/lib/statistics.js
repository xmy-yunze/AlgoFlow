import { problems, topicGroups } from '../data/problems.js'
export function learningStatistics(sessions = []) {
  const practiced = new Set(sessions.map(s=>s.problemId))
  const independent = new Set(sessions.filter(s=>s.verdict==='AC' && s.assistanceLevel==='INDEPENDENT').map(s=>s.problemId))
  const dates = new Map()
  for(const session of sessions) {
    const date=new Date(session.recordedAt)
    if(Number.isNaN(date.getTime())) continue
    const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    dates.set(key,(dates.get(key)??0)+1)
  }
  return { total:sessions.length, practiced:practiced.size, independent:independent.size, dates,
    topics:topicGroups.map(topic=>{
      const bank=problems.filter(p=>p.topicIds.includes(topic.id))
      return {...topic,total:bank.length,practiced:bank.filter(p=>practiced.has(p.id)).length,independent:bank.filter(p=>independent.has(p.id)).length}
    }) }
}
