export const APP_DATA_KEYS=['algoflow:v1:learning','algoflow:v1:training-choice','algoflow:celebration-day']
export function clearAppData(storage){
 const previous=APP_DATA_KEYS.map(key=>[key,storage.getItem(key)])
 try{for(const key of APP_DATA_KEYS)storage.removeItem(key);for(const key of APP_DATA_KEYS)if(storage.getItem(key)!==null)throw Error('删除未成功')}
 catch(error){for(const [key,value]of previous){try{if(value!==null)storage.setItem(key,value)}catch{}}throw Error('清空失败，请检查浏览器存储权限；请先导出备份后重试。')}
}
