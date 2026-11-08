// 仅维护题目元信息，不复制原题正文。难度为 AlgoFlow 学习分级。
// 来源：每道题的 url；2026-11-07 核实原题页面。
import { withAncestors } from './topics.js'
export { topics, topicGroups, topicName, topicPath } from './topics.js'
export const difficulties = ['基础', '进阶', '挑战']
const rows = [
  ['P2249', '【深基13.例1】查找', 'binary-search', '基础', '练习有序序列查找与左边界处理。'],
  ['P1102', 'A-B 数对', 'binary-search', '基础', '练习排序后的范围查找与重复元素计数。'],
  ['P1873', '[COCI 2011/2012 #5] EKO / 砍树', 'binary-search', '进阶', '练习二分答案与单调可行性判断。'],
  ['P1182', '数列分段 Section II', 'binary-search', '进阶', '练习将最小化最大值转为可行性判断。'],
  ['P2678', '[NOIP 2015 提高组] 跳石头', 'binary-search', '挑战', '练习二分答案与贪心检查的组合。'],
  ['P2440', '木材加工', 'binary-search', '进阶', '练习整数二分与无可行解的边界。'],
  ['P8218', '【深进1.例1】求区间和', 'prefix-sum', '基础', '练习一维前缀和与区间下标。'],
  ['P2367', '语文成绩', 'prefix-sum', '进阶', '练习差分数组处理批量区间修改。'],
  ['P1719', '最大加权矩形', 'prefix-sum', '挑战', '练习矩阵区间和与最大子段和的组合。'],
  ['P3397', '地毯', 'prefix-sum', '进阶', '练习二维差分与覆盖次数还原。'],
  ['P1223', '排队接水', 'greedy', '基础', '练习排序策略与平均等待时间。'],
  ['P1803', '凌乱的yyy / 线段覆盖', 'greedy', '基础', '练习按结束时间选择不重叠区间。'],
  ['P1090', '[NOIP 2004 提高组] 合并果子', 'greedy', '进阶', '练习最小堆与最优合并策略。'],
  ['P1208', '[USACO1.3] 混合牛奶 Mixing Milk', 'greedy', '基础', '练习按单位代价选择资源。'],
  ['P1036', '[NOIP 2002 普及组] 选数', 'search', '基础', '练习组合枚举与素数判断。'],
  ['P1605', '迷宫', 'search', '基础', '练习深度优先搜索与回溯。'],
  ['P1443', '马的遍历', 'search', '进阶', '练习广度优先搜索求最少步数。'],
  ['P1135', '奇怪的电梯', 'search', '进阶', '练习状态建模、BFS 与不可达判断。'],
  ['P1048', '[NOIP 2005 普及组] 采药', 'dp', '基础', '练习 0/1 背包的状态与转移顺序。'],
  ['P1216', '[IOI 1994 / USACO1.5] 数字三角形 Number Triangles', 'dp', '基础', '练习路径型动态规划与边界初始化。'],
  ['P1115', '最大子段和', 'dp', '基础', '练习以当前位置结尾的最优状态。'],
  ['P1020', '[NOIP 1999 提高组] 导弹拦截', 'dp', '挑战', '练习子序列模型与多问问题分析。'],
  ['P3367', '【模板】并查集', 'graph', '基础', '练习连通关系的合并与查询。'],
  ['P3371', '【模板】单源最短路径（弱化版）', 'graph', '进阶', '练习有向带权图的单源最短路。'],
]
// 一个题目可以关联多个知识点；上级分类由树自动展开。
const specificTopics = {
  P8218: ['prefix-1d'], P2367: ['difference-1d'],
  P1719: ['prefix-2d', 'linear-dp'], P3397: ['difference-2d'],
  P1090: ['greedy', 'heap'], P1036: ['combinations', 'primes'],
  P1605: ['backtracking'], P1443: ['bfs'], P1135: ['bfs'],
  P1048: ['knapsack-01'], P1216: ['linear-dp'], P1115: ['linear-dp'],
  P1020: ['lis', 'greedy'], P3367: ['union-find'], P3371: ['shortest-path'],
}
export const problems = rows.map(([externalId, title, topicId, difficulty, focus]) => {
  const leafTopicIds = specificTopics[externalId] ?? [topicId]
  return {
    id: `LUOGU:${externalId}`, platform: '洛谷', externalId, title,
    leafTopicIds, topicIds: withAncestors(leafTopicIds), difficulty, focus,
    url: `https://www.luogu.com.cn/problem/${externalId}`,
  }
})
