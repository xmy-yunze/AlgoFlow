import catalog from './problem-catalog.json' with { type: 'json' }
export { topics, topicGroups, topicName, topicPath } from './topics.js'
export const difficulties = ['基础', '进阶', '挑战']
// 题库数据与读取接口分离；现有稳定 ID、排列和专题导出保持兼容。
export const problems = catalog
