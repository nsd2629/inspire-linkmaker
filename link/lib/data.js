// link/lib/data.js
// 중복검사 + 슬러그 유틸 + 주문 JSONL 다운로드 (슬러그 캐시 포함)

let _slugCache = null;
let _slugLoadedAt = 0;

export async function loadSlugs(force = false) {
  const now = Date.now();
  // 30초 캐시
  if (!force && _slugCache && now - _slugLoadedAt < 30_000) return _slugCache;
  try {
    const res = await fetch('/data/slugs.json', { cache: 'no-store' });
    _slugCache = await res.json();
    _slugLoadedAt = now;
  } catch {
    _slugCache = {};
    _slugLoadedAt = now;
  }
  return _slugCache;
}
export function isSlugTaken(slugs, slug) {
  if (!slug) return true;
  return Object.prototype.hasOwnProperty.call(slugs, slug);
}
export function makeSlug(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .trim().toLowerCase()
    .replace(/[^a-z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}
export function exportOrderJSONL(record) {
  const line = JSON.stringify(record);
  const y = new Date();
  const ym = `${y.getFullYear()}${String(y.getMonth()+1).padStart(2,'0')}`;
  const blob = new Blob([line + '\n'], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `orders_${ym}.jsonl`;
  document.body.appendChild(a); a.click(); a.remove();
}
