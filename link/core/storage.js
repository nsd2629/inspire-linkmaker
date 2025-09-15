const NS = "inspire-linkmaker:";

export const nsKey = (k) => `${NS}${k}`;

export const get = (k, def = null) => {
  try {
    const v = localStorage.getItem(nsKey(k));
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

export const set = (k, v) => {
  try { localStorage.setItem(nsKey(k), JSON.stringify(v)); } catch {}
};

export const remove = (k) => {
  try { localStorage.removeItem(nsKey(k)); } catch {}
};

export const getJSON = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`getJSON failed: ${res.status}`);
  return res.json();
};

export default { nsKey, get, set, remove, getJSON };
