// cards/hanlove/template.js
export async function render({ data, params }) {
  const urlp = new URLSearchParams(params);
  const mode = (urlp.get('mode') || 'shuffle').toLowerCase();
  const fixedId = urlp.get('id') || null;
  const promo = urlp.get('promo') || '/link?card=healing&list=bible30&mode=daily';

  // 1) APPROVED만, 가중치 포함 선택
  const items = (data.items || []).filter(x => (x.status || 'APPROVED') === 'APPROVED' && x.text);
  const pick = pickItem(items, { mode, id: fixedId });

  const ko = pick.text.trim();
  const en = (pick.en || '').trim();              // 영어 의미(데이터)
  const pron = (pick.pron && pick.pron.trim()) || romanizeKo(ko); // 발음 자동

  // 2) DOM
  const wrap = el('div', 'hl-wrap');
  const card = el('div', 'hl-card');

  // 헤더 캡슐
  const pill = el('div', 'hl-pill', 'Inspire Wood · K-Mood Hangeul Sign');
  card.appendChild(pill);

  // 영어 타이틀(의미)
  const h1 = el('h1', 'hl-en', en || 'K-Mood Hangeul');
  card.appendChild(h1);

  // 한글 본문
  const h2 = el('h2', 'hl-ko', ko);
  card.appendChild(h2);

  // 발음
  const h3 = el('div', 'hl-pron', pron);
  card.appendChild(h3);

  // 영어 설명(있으면 한 줄 설명으로)
  if (en) {
    const desc = el('p', 'hl-desc', `A gentle Korean phrase that says, “${en}.” Give yourself a soft nod today.`);
    card.appendChild(desc);
  }

  // 버튼 영역
  const btnRow = el('div', 'hl-btnrow');
  const ttsBtn = el('button', 'hl-btn', 'Play TTS (KO)');
  ttsBtn.onclick = () => speakKorean(ko);
  const promoBtn = el('a', 'hl-btn ghost', 'Open Healing Message');
  promoBtn.href = promoWithUtm(promo, 'qr', 'hanlove', data?.meta?.list || 'default');
  promoBtn.target = '_blank';
  promoBtn.rel = 'noopener';
  btnRow.append(ttsBtn, promoBtn);
  card.appendChild(btnRow);

  // 하단 크레딧 제거(요청) → 표시 안 함

  // 조립
  wrap.appendChild(card);
  return wrap;
}

/* ---------- helpers ---------- */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function pickItem(items, { mode, id }) {
  if (!items.length) return { id: 'NA', text: '데이터 없음', en: '', pron: '' };
  if (mode === 'fixed' && id) {
    return items.find(x => x.id === id) || items[0];
  }
  const rng = (mode === 'daily') ? seededRandom(getKstDaySeed()) : Math.random;
  // 가중치 합산
  const total = items.reduce((s, x) => s + (Number(x.weight) || 1), 0);
  let r = rng() * total;
  for (const it of items) {
    r -= (Number(it.weight) || 1);
    if (r <= 0) return it;
  }
  return items[0];
}

function getKstDaySeed() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return Math.floor(kst.getTime() / (24 * 60 * 60 * 1000)); // days
}
function seededRandom(seed) {
  // mulberry32
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 간단 개정 로마자 + 받침 규칙 */
function romanizeKo(str = '') {
  const BASE = 0xAC00;
  const CHO = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
  const JUNG = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","we","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
  const JONG = ["","k","k","ks","n","nj","nh","t","l","lk","lm","lb","ls","lt","lp","lt","m","p","ps","t","t","ng","t","t","k","t","p","t"];
  const out = [];
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    if (c < 0xAC00 || c > 0xD7A3) { out.push(ch); continue; }
    const s = c - BASE, cho = Math.floor(s / 588), jung = Math.floor((s % 588) / 28), jong = s % 28;
    out.push((CHO[cho] || '') + (JUNG[jung] || '') + (JONG[jong] || ''));
  }
  return out.join('-').replace(/-+/g, '-');
}

function speakKorean(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function promoWithUtm(url, src, campaign, content) {
  try {
    const u = new URL(url, location.origin);
    const s = u.searchParams;
    if (!s.has('utm_source'))   s.set('utm_source', src);
    if (!s.has('utm_campaign')) s.set('utm_campaign', campaign);
    if (!s.has('utm_content'))  s.set('utm_content', content);
    return u.toString();
  } catch { return url; }
}
