// Common utils (KST seed, query params, safe selection)
export const qs = (k, d=null) => new URLSearchParams(location.search).get(k) ?? d;
export const escapeHTML = (s='') => String(s).replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'
}[c]));

export function nowInKST(){
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

export function getDailySeed(namespace='default'){
  const d = nowInKST();
  const key = `${namespace}-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  let seed = Number(localStorage.getItem(key));
  if (!seed) { seed = Math.floor(Math.random()*1e9); localStorage.setItem(key, String(seed)); }
  return seed;
}

export function pickItem(items, {mode='shuffle', id=null, namespace='default'}={}){
  if (!Array.isArray(items) || items.length===0) return {id:'EMPTY', text:'(empty)'};
  if (mode==='fixed' && id){
    return items.find(x=>x.id===id) || items[0];
  }
  if (mode==='daily'){
    const seed = getDailySeed(namespace);
    return items[seed % items.length];
  }
  // shuffle (weighted)
  const sum = items.reduce((a,b)=> a + (Number(b.weight)||1), 0);
  let r = Math.random()*sum;
  for (const it of items){ r -= (Number(it.weight)||1); if (r<=0) return it; }
  return items[0];
}
