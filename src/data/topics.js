// 分类参考：https://algotemplate.site/blue_bridge_cup/all/dp.html
// 按算法知识组织；赛事、语言与奖项不作为算法专题。
export const topicGroups = [
  { id: 'basics', name: '基础算法', children: [
    { id: 'enumeration', name: '枚举' }, { id: 'sorting', name: '排序' },
    { id: 'simulation', name: '模拟' }, { id: 'base-conversion', name: '进制转换' },
    { id: 'bitwise', name: '位运算' },
    { id: 'prefix-sum', name: '前缀和与差分', children: [
      { id: 'prefix-1d', name: '一维前缀和' }, { id: 'difference-1d', name: '一维差分' },
      { id: 'prefix-2d', name: '二维前缀和' }, { id: 'difference-2d', name: '二维差分' },
    ] },
    { id: 'binary-search', name: '二分' }, { id: 'two-pointers', name: '双指针' },
    { id: 'discretization', name: '离散化' }, { id: 'big-integer', name: '高精度' },
  ] },
  { id: 'data-structures', name: '数据结构', children: [
    { id: 'stack', name: '栈' }, { id: 'queue', name: '队列' }, { id: 'linked-list', name: '链表' },
    { id: 'hash-table', name: '哈希表' }, { id: 'heap', name: '堆' },
    { id: 'union-find', name: '并查集' }, { id: 'segment-tree', name: '线段树' },
  ] },
  { id: 'search', name: '搜索', children: [
    { id: 'recursion', name: '递归' },
    { id: 'backtracking', name: '回溯', children: [
      { id: 'permutations', name: '全排列' }, { id: 'subsets', name: '子集枚举' },
      { id: 'combinations', name: '组合枚举' },
    ] },
    { id: 'bfs', name: '广度优先搜索（BFS）' },
  ] },
  { id: 'dp', name: '动态规划', children: [
    { id: 'memoization', name: '记忆化搜索' },
    { id: 'knapsack', name: '背包问题', children: [{ id: 'knapsack-01', name: '01 背包' }] },
    { id: 'linear-dp', name: '线性动态规划', children: [{ id: 'lis', name: '最长上升子序列' }] },
    { id: 'state-compression-dp', name: '状态压缩 DP' },
    { id: 'digit-dp', name: '数位 DP' }, { id: 'dp-optimization', name: '动态规划优化' },
  ] },
  { id: 'math', name: '数学', children: [
    { id: 'fast-power', name: '快速幂' },
    { id: 'number-theory', name: '数论', children: [
      { id: 'congruence', name: '整除与同余' }, { id: 'divisors', name: '约数' },
      { id: 'primes', name: '素数' }, { id: 'sieve', name: '埃氏筛' },
      { id: 'factorization', name: '分解质因数' }, { id: 'gcd-lcm', name: '最大公约数与最小公倍数' },
    ] },
  ] },
  { id: 'strings', name: '字符串', children: [
    { id: 'string-hash', name: '字符串哈希' }, { id: 'trie', name: '字典树' },
  ] },
  { id: 'graph', name: '图论', children: [
    { id: 'shortest-path', name: '最短路', children: [{ id: 'dijkstra', name: 'Dijkstra 算法' }] },
  ] },
  { id: 'greedy', name: '贪心与思维', children: [] },
]
export const topics = []
function flatten(nodes, ancestors = []) {
  for (const node of nodes) {
    topics.push({ id: node.id, name: node.name, ancestorIds: ancestors, depth: ancestors.length })
    flatten(node.children ?? [], [...ancestors, node.id])
  }
}
flatten(topicGroups)
export const topicName = id => topics.find(t => t.id === id)?.name ?? id
export const topicPath = id => {
  const topic = topics.find(t => t.id === id)
  return topic ? [...topic.ancestorIds, id].map(topicName).join(' / ') : id
}
export function withAncestors(ids) {
  return [...new Set(ids.flatMap(id => [...(topics.find(t => t.id === id)?.ancestorIds ?? []), id]))]
}
