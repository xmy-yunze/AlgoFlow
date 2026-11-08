import { problems } from '../data/problems.js'
import { completedFromPractice } from './practice.js'
const object = v => v && typeof v === 'object' && !Array.isArray(v)
const known = new Set(problems.map(p=>p.id))
const validDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v))
const text = (v,max=10000) => typeof v==='string' && v.length<=max
function fail(message){throw Error(message)}
function validateSession(s,index){
 const prefix=`第 ${index+1} 条训练记录：`
 if(!object(s)||!text(s.id,200)||!s.id.trim()||!text(s.problemId,200)||!known.has(s.problemId))fail(prefix+'记录 ID 无效或题目 ID 不在当前题库，请更新题库后再导入。')
 if(!validDate(s.recordedAt)||(s.updatedAt!==undefined&&!validDate(s.updatedAt)))fail(prefix+'时间格式无效。')
 if(s.source!=='MANUAL'||!['AC','WA','TLE','UNFINISHED'].includes(s.verdict)||!['INDEPENDENT','HINT','SOLUTION'].includes(s.assistanceLevel))fail(prefix+'结果、来源或完成方式无效。')
 if(!Number.isInteger(s.selfRating)||s.selfRating<1||s.selfRating>5)fail(prefix+'掌握等级无效。')
 if(s.masteryPercent!==undefined&&(!Number.isInteger(s.masteryPercent)||s.masteryPercent<0||s.masteryPercent>100))fail(prefix+'掌握百分比无效。')
 if(s.durationSeconds!==null&&(!Number.isInteger(s.durationSeconds)||s.durationSeconds<0||s.durationSeconds>604800))fail(prefix+'耗时无效。')
 if(!Array.isArray(s.errorTypes)||s.errorTypes.length>30||s.errorTypes.some(v=>!text(v,100))||!text(s.note))fail(prefix+'错因或笔记无效。')
 return {id:s.id,problemId:s.problemId,recordedAt:s.recordedAt,source:s.source,verdict:s.verdict,assistanceLevel:s.assistanceLevel,selfRating:s.selfRating,...(s.masteryPercent===undefined?{}:{masteryPercent:s.masteryPercent}),durationSeconds:s.durationSeconds,errorTypes:[...s.errorTypes],note:s.note,...(s.updatedAt===undefined?{}:{updatedAt:s.updatedAt})}
}
export function parseBackup(raw){
 if(raw.length>5*1024*1024)fail('备份文件超过 5 MB。')
 let value;try{value=JSON.parse(raw)}catch{fail('无法解析 JSON，请选择 AlgoFlow 导出的备份文件。')}
 if(!object(value)||value.schemaVersion!==1||!object(value.learning)||value.learning.version!==1)fail('不支持的备份结构或版本，仅支持版本 1。')
 const l=value.learning
 if(!Array.isArray(l.completedIds)||!Array.isArray(l.sessions??[])||(l.sessions?.length??0)>20000)fail('训练记录或完成列表结构无效。')
 const legacy=l.legacyCompletedIds??l.completedIds
 if(!Array.isArray(legacy)||[...l.completedIds,...legacy].some(id=>!text(id,200)||!known.has(id)))fail('完成列表包含无效或未知题目 ID。')
 return {sessions:(l.sessions??[]).map(validateSession),legacyCompletedIds:[...new Set(legacy)]}
}
const stable=v=>JSON.stringify(v,(_,value)=>object(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value)
export function planImport(local,backup){
 const sessions=[...(local.sessions??[])],byId=new Map(sessions.map(s=>[s.id,s]))
 let duplicates=0;const conflicts=[],additions=[]
 for(const s of backup.sessions){const old=byId.get(s.id);if(old){if(stable(old)===stable(s))duplicates++;else conflicts.push(s.id)}else{byId.set(s.id,s);additions.push(s)}}
 // Only insert new rows; preserve the relative order and contents of every existing row.
 for(const s of additions.sort((a,b)=>Date.parse(a.recordedAt)-Date.parse(b.recordedAt))){const index=sessions.findIndex(old=>Date.parse(old.recordedAt)>Date.parse(s.recordedAt));if(index<0)sessions.push(s);else sessions.splice(index,0,s)}
 const legacy=[...new Set([...(local.legacyCompletedIds??local.completedIds??[]),...backup.legacyCompletedIds])]
 const next={...local,sessions,legacyCompletedIds:legacy};next.completedIds=completedFromPractice(next)
 return {next,total:backup.sessions.length,added:additions.length,duplicates,conflicts,legacyAdded:legacy.length-new Set(local.legacyCompletedIds??local.completedIds??[]).size}
}
