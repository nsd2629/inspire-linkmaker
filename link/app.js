// link/app.js
/* Inspire Link Maker - Split Dashboard + Save Demo */

import {
  loadSlugs,
  isSlugTaken,
  makeSlug,
  exportOrderJSONL,
} from './lib/data.js';
import { chooseDaily } from './lib/random.js';

const qs = (s, el = document) => el.querySelector(s);

/** 저장(데모): 슬러그 중복검사 → JSONL 1줄 다운로드 */
async function handleSave({ type }) {
  const slugs = await loadSlugs();
  const base = type === 'hanlove' ? 'its-okay' : 'healing-custom';
  const slug = makeSlug(base);

  if (isSlugTaken(slugs, slug)) {
    alert(`슬러그 중복: ${slug}\n다른 이름을 사용하세요.`);
    return;
  }

  const record = {
    dt: new Date().toISOString(),
    slug,
    url: `/link/?card=${type}&v=1`,
    customer: 'demo',
    meta: { channel: 'dashboard', type },
  };

  exportOrderJSONL(record); // 임시 기록: JSONL 1줄 다운로드
  alert(`주문 JSONL 1줄 저장됨: ${slug}`);
}

/** 라우팅 */
function route() {
  const p = location.pathname.replace(/\/+$/, '') || '/';
  const $main = qs('#app');
  if (!$main) return;
  const render = (html) => {
    $main.innerHTML = html;
  };

  switch (p) {
    /** 한글사랑 */
    case '/hanlove-maker':
      render(`
        <section class="panel">
          <h2>한글사랑 링크메이커</h2>
          <ol class="flow">
            <li>언어 선택 (EN 디폴트 기준)</li>
            <li>메시지 선택 → 프리뷰(영어 의미 / 한글 / 발음)</li>
            <li>저장 → 단축URL 생성 → 배포(노션)</li>
          </ol>
          <div class="actions">
            <button id="save-hanlove" class="btn">저장(데모) & JSONL</button>
            <a class="btn" href="/">← 대시보드</a>
          </div>
        </section>
      `);
      qs('#save-hanlove')?.addEventListener('click', () =>
        handleSave({ type: 'hanlove' }),
      );
      break;

    /** 힐링메세지 */
    case '/healing-maker':
      render(`
        <section class="panel">
          <h2>힐링메세지 링크메이커</h2>
          <ol class="flow">
            <li>수령인 이름 입력</li>
            <li>메시지 선택 or 커스텀 입력(단문/장문)</li>
            <li>배경 선택(그룹) / 이미지 업로드(고정)</li>
            <li>프리뷰(저장소=매일 랜덤 / 업로드=고정)</li>
            <li>저장 → 단축URL 생성 → 배포(노션)</li>
          </ol>

          <div style="display:flex; gap:12px; flex-wrap:wrap; margin:12px 0;">
            <select id="bg-group">
              <option value="healing">healing</option>
            </select>
            <button id="btn-daily" class="btn">저장소(매일 랜덤) 프리뷰</button>
            <label class="btn" style="cursor:pointer;">
              업로드(고정) <input id="file-up" type="file" accept="image/*" hidden />
            </label>
          </div>

          <div id="preview" style="border:1px solid #2a303b;border-radius:12px;min-height:220px;display:flex;align-items:center;justify-content:center;overflow:hidden">
            <em>프리뷰 영역</em>
          </div>

          <div class="actions" style="margin-top:12px;">
            <button id="save-healing" class="btn">저장(데모) & JSONL</button>
            <a class="btn" href="/">← 대시보드</a>
          </div>
        </section>
      `);

      // ---- 프리뷰 상태 & 로직 ----
      let fixedUpload = null; // 업로드(고정) dataURL
      let dailyPick = null; // 저장소(오늘의) file URL

      async function loadBackgrounds(group) {
        const res = await fetch(
          `/link/data/backgrounds/${group}/index.json`,
          { cache: 'no-store' },
        );
        try {
          return await res.json(); // [{ file, thumb, ... }]
        } catch {
          return [];
        }
      }

      function paintPreview() {
        const el = qs('#preview');
        if (!el) return;
        el.innerHTML = '';
        const img = new Image();
        img.style.maxWidth = '100%';
        img.style.maxHeight = '360px';
        img.alt = 'preview';
        if (fixedUpload) {
          img.src = fixedUpload; // 업로드=고정
        } else if (dailyPick) {
          img.src = dailyPick; // 저장소=오늘의
        } else {
          el.innerHTML = '<em>프리뷰 영역</em>';
          return;
        }
        el.appendChild(img);
      }

      // 저장소(그룹)에서 "오늘의" 이미지
      qs('#btn-daily')?.addEventListener('click', async () => {
        const group = qs('#bg-group').value || 'healing';
        const list = await loadBackgrounds(group);
        const pick = chooseDaily(list);
        dailyPick = pick ? pick.file : null;
        fixedUpload = null; // 저장소 선택 시 업로드 해제
        paintPreview();
      });

      // 업로드 = 고정
      qs('#file-up')?.addEventListener('change', (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          fixedUpload = r.result; // data URL
          dailyPick = null; // 업로드 선택 시 저장소 해제
          paintPreview();
        };
        r.readAsDataURL(f);
      });

      // 저장(JSONL)은 기존 handleSave 재사용
      qs('#save-healing')?.addEventListener('click', () =>
        handleSave({ type: 'healing' }),
      );
      break;

    /** 저장소 설명 */
    case '/storage':
  render(`
    <section class="panel">
      <h2>저장소</h2>

      <div style="display:flex;gap:12px;align-items:center;margin:12px 0 16px;">
        <label>배경 그룹</label>
        <select id="st-group">
          <option value="healing">healing</option>
          <option value="bible30">bible30</option>
          <option value="today30">today30</option>
        </select>
        <span id="st-count" style="opacity:.8"></span>
        <a class="btn" href="/">← 대시보드</a>
      </div>

      <div id="st-grid"
           style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
                  gap:12px;align-items:start;"></div>
    </section>
  `);

  async function loadList(group){
    const res = await fetch(`/link/data/backgrounds/${group}/index.json`, { cache: 'no-store' });
    try { return await res.json(); } catch { return []; }
  }
  function cardHtml(it){
    const src = it.thumb || it.file;
    const title = it.title || '';
    return `
      <figure style="border:1px solid #2a303b;border-radius:12px;overflow:hidden;background:#0f1115">
        <img src="${src}" alt="${title}" style="display:block;width:100%;height:140px;object-fit:cover"/>
        <figcaption style="padding:8px 10px;font-size:.9rem;opacity:.9">${title || it.file}</figcaption>
      </figure>
    `;
  }
  async function renderGrid(group){
    const grid = document.querySelector('#st-grid');
    const cnt  = document.querySelector('#st-count');
    grid.innerHTML = `<div style="opacity:.7">로딩 중…</div>`;
    const list = await loadList(group);
    cnt.textContent = list.length ? `총 ${list.length}장` : '이미지 없음';
    grid.innerHTML = list.map(cardHtml).join('') || `<div style="opacity:.7">목록이 비었습니다.</div>`;
  }

  const sel = document.querySelector('#st-group');
  sel.addEventListener('change', () => renderGrid(sel.value));
  renderGrid(sel.value);
  break;

  }
}

/** SPA 내비게이션 */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/"]');
  if (!a) return;
  const url = new URL(a.href, location.origin);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  history.pushState({}, '', url.pathname);
  route();
});
window.addEventListener('popstate', route);
document.addEventListener('DOMContentLoaded', route);
