export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const qs = $;
export const qsm = $;

export const el = (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs);

export const dom = (map, root = document) => {
  const out = {};
  for (const [k, sel] of Object.entries(map)) out[k] = $(sel, root);
  return out;
};

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const hashStr = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h >>> 0);
};

export const chooseDaily = (arr, seed = "") => {
  if (!arr || !arr.length) return null;
  const h = hashStr(`${todayKey()}|${seed}|${arr.length}`);
  return arr[h % arr.length];
};

export const jsonFetch = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`jsonFetch failed: ${res.status}`);
  return res.json();
};

export default { $, $$, qs, qsm, el, dom, sleep, todayKey, hashStr, chooseDaily, jsonFetch };
