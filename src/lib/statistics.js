import { problems, topicGroups } from '../data/problems.js'
import { dailyActivity } from './dailyActivity.js'
export function learningStatistics(sessions = [], today) {
  const practiced = new Set(sessions.map(s=>s.problemId))
  const independent = new Set(sessions.filter(s=>s.verdict==='AC' && s.assistanceLevel==='INDEPENDENT').map(s=>s.problemId))
  const activity = dailyActivity(sessions, today)
  return { total:sessions.length, practiced:practiced.size, independent:independent.size, ...activity,
    topics:topicGroups.map(topic=>{
      const bank=problems.filter(p=>p.topicIds.includes(topic.id))
      return {...topic,total:bank.length,practiced:bank.filter(p=>practiced.has(p.id)).length,independent:bank.filter(p=>independent.has(p.id)).length}
    }) }
}
