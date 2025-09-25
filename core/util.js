
export const ABS  = (p)=> p.startsWith('/') ? p : ('/'+p);
export const qs   = (k, def='') => new URLSearchParams(location.search).get(k) ?? def;
export const qsm  = (k) => new URLSearchParams(location.search).getAll(k);
export const dom  = (q)=> document.querySelector(q);
export const todayKey = ()=> new Date().toISOString().slice(0,10); // YYYY-MM-DD
export const hashStr = (s)=>{
  let h=0; for(let i=0;i<s.length;i++){ h=(Math.imul(31,h)+s.charCodeAt(i))|0; } return Math.abs(h);
};
export const chooseDaily = (arr, seed)=> (arr.length? arr[ seed % arr.length ] : '');
export const commit = (typeof window!=='undefined' && window.APP_VERSION) ? window.APP_VERSION : 'dev';
