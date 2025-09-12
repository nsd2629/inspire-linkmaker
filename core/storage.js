
export const nsKey = (ns, k) => `${ns}:${k}`;
export const get    = (k, def='') => localStorage.getItem(k) ?? def;
export const set    = (k, v) => localStorage.setItem(k, typeof v==='string' ? v : JSON.stringify(v));
export const getJSON = (k, def=null) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? def; } catch { return def; } };
export const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const clearNS = (prefix) => Object.keys(localStorage).forEach(k=>{ if(k.startsWith(prefix)) localStorage.removeItem(k); });
