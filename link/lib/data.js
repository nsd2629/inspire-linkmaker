// link/lib/data.js
// 중복검사 + 슬러그 유틸 + 주문 JSONL 다운로드

export async function loadSlugs() {
  const res = await fetch('./data/slugs.json', { cache: 'no-store' });
  try { return await res.json(); } catch { return {}; }
}

export function isSlugTaken(slugs, slug) {
  if (!slug) return true;
  return Object.prototype.hasOwnProperty.call(slugs, slug);
}

export function makeSlug(s) {
  return String(s || '')
    .trim().toLowerCase()
    .replace(/[^a-z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
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
