// 날짜 기반 "하루에 하나" 고정 랜덤
function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0;}
export function dailyIndex(len, date=new Date()){
  const key = date.toISOString().slice(0,10); // YYYY-MM-DD
  return len ? hash(key) % len : 0;
}
export function chooseDaily(arr, date=new Date()){
  if(!Array.isArray(arr) || arr.length===0) return null;
  return arr[dailyIndex(arr.length, date)];
}
