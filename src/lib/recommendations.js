import { completedFromPractice } from './practice.js'
import { problems, topics, difficulties } from '../data/problems.js'

export const STORAGE_KEY = 'algoflow:v1:learning'
export const defaultSettings = () => ({ topicId: 'binary-search', difficulty: '基础' })
export const localDate = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
export const initialState = () => ({ version: 1, settings: defaultSettings(), completedIds: [], daily: null })
const validSettings = value => value && topics.some(t => t.id === value.topicId) && difficulties.includes(value.difficulty)

export function candidates({ topicId = '', difficulty = '' } = {}, completedIds = [], bank = problems) {
  return bank.filter(p => (!topicId || p.topicIds.includes(topicId)) && (!difficulty || p.difficulty === difficulty) && !completedIds.includes(p.id))
}

// 先读取当天记录，不因设置变动、完成标记或随机抽题而换题。
export function ensureDaily(state, date = localDate(), bank = problems) {
  if (state.daily?.date === date && bank.some(p => p.id === state.daily.problemId)) return state
  const problem = candidates(state.settings, state.completedIds, bank)[0]
  return { ...state, daily: problem ? { date, problemId: problem.id, ...state.settings } : null }
}

export function drawRandom(filters, completedIds, previousId = '', rng = Math.random, bank = problems) {
  const pool = candidates(filters, completedIds, bank)
  if (!pool.length) return null
  const fresh = pool.length > 1 ? pool.filter(p => p.id !== previousId) : pool
  return fresh[Math.floor(rng() * fresh.length)]
}

export function toggleCompleted(state, problemId) {
  if (!problems.some(p => p.id === problemId)) return state
  return { ...state, completedIds: state.completedIds.includes(problemId)
    ? state.completedIds.filter(id => id !== problemId) : [...state.completedIds, problemId] }
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { state: initialState(), warning: '' }
    const value = JSON.parse(raw)
    if (!value || value.version !== 1 || !validSettings(value.settings) || !Array.isArray(value.completedIds)) throw new Error('invalid state')
    const completedIds = [...new Set(value.completedIds.filter(id => problems.some(p => p.id === id)))]
    const daily = value.daily
    const validDaily = daily && /^\d{4}-\d{2}-\d{2}$/.test(daily.date) && validSettings(daily) && problems.some(p => p.id === daily.problemId)
    const sessions = value.sessions ?? []
    if (!Array.isArray(sessions) || sessions.some(s => !s || typeof s.id !== 'string' || typeof s.problemId !== 'string' || !['AC','WA','TLE','UNFINISHED'].includes(s.verdict))) throw new Error('invalid sessions')
    const state = { version: 1, settings: value.settings, completedIds, legacyCompletedIds: value.legacyCompletedIds ?? completedIds, sessions, daily: validDaily ? daily : null }
    state.completedIds = completedFromPractice(state)
    return { state, warning: '' }
  } catch {
    return { state: initialState(), warning: '本地数据无法读取，已使用默认设置。若浏览器禁止存储，刷新后推荐可能无法保留。' }
  }
}

export function saveState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return '' }
  catch { return '本地保存失败：当前仍可练习，但刷新后推荐与完成标记可能丢失。请检查浏览器存储权限。' }
}
