/* Inspire Link Maker — Dashboard + Save Demo + Healing Form + Storage Actions */

import {
  loadSlugs,
  isSlugTaken,
  makeSlug,
  exportOrderJSONL,
} from './lib/data.js';
import { chooseDaily } from './lib/random.js';

const qs = (s, el = document) => el.querySelector(s);

// 작은 유틸
const debounce = (fn, ms=200) => {
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
};

/* =========================
   공통: 저장(데모) → JSONL
   ========================= */
async function handleSave({ type, payload = {} }) {
  const slugs = await loadSlugs();
  // 기본 베이스
  let base = type === 'hanlove' ? 'its-okay' : 'healing-custom';
  // 폼에서 들어온 슬러그가 있으면 우선
  if (payload.slug) base = payload.slug;
  const slug = makeSlug(base);

  if (isSlugTaken(slugs, slug)) {
    alert(`슬러그 중복: ${slug}\n다른 이름을 사용하세요.`);
    return;
  }

  const record = {
    dt: new Date().toISOString(),
    slug,
    url: `/link/?card=${type}&v=1`,
    customer: payload.recipient || 'demo',
    meta: {
      channel: 'dashboard',
      type,
      recipient: payload.recipient || null,
      messageType: payload.msgType || null,      // 'custom' | 'preset'
      message: payload.message || null,
      bg: payload.bg || null,                    // 선택된 배경 경로(있으면)
      upload: !!payload.upload,                  // 업로드 사용여부
    },
  };

  exportOrderJSONL(record);
  alert(`주문 JSONL 1줄 저장됨: ${slug}`);
}

/* =========================
   라우터
   ========================= */
function route() {
  const p = location.pathname.replace(/\/+$/, '') || '/';
  const $main = qs('#app');
  if (!$main) return;
  const render = (html) => { $main.innerHTML = html; };

  switch (p) {
    /* ---------- 한글사랑 ---------- */
    case '/hanlove-maker': {
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
      qs('#save-hanlove')?.addEventListener('click', () => handleSave({ type: 'hanlove' }));
      break;
    }

    /* ---------- 힐링메세지: 입력폼/프리뷰/슬러그 즉시검사 ---------- */
    case '/healing-maker': {
      render(`
        <section class="panel">
          <h2>힐링메세지 링크메이커</h2>
          <ol class="flow">
            <li>수령인 이름</li>
            <li>메시지(선택 또는 커스텀)</li>
            <li>배경(저장소=매일 랜덤 or 업로드=고정)</li>
            <li>슬러그 입력(즉시 중복검사)</li>
            <li>저장 → 단축URL 생성 → 배포</li>
          </ol>

          <div style="display:grid;gap:12px;margin:16px 0;">
            <div>
              <label>수령인 이름</label><br/>
              <input id="recip" placeholder="예: 김OO" style="width:320px;padding:8px;border-radius:8px;border:1px solid #2a303b;background:#0f1115;color:#e6e8eb"/>
            </div>

            <div>
              <details>
                <summary>메시지 선택(간단 프리셋) 또는 커스텀</summary>
                <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;">
                  <select id="msg-preset">
                    <option value="">(선택 안 함)</option>
                    <option value="오늘도 평안하길">오늘도 평안하길</option>
                    <option value="당신의 하루가 환하게 빛나길">당신의 하루가 환하게 빛나길</option>
                    <option value="힘들 땐 잠시 쉬어가요">힘들 땐 잠시 쉬어가요</option>
                  </select>
                  <textarea id="msg-custom" placeholder="직접 메시지를 적어주세요" rows="3" style="min-width:380px;padding:8px;border-radius:8px;border:1px solid #2a303b;background:#0f1115;color:#e6e8eb"></textarea>
                </div>
              </details>
            </div>

            <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
              <select id="bg-group">
                <option value="healing">healing</option>
              </select>
              <button id="btn-daily" class="btn">저장소(매일 랜덤) 프리뷰</button>
              <label class="btn" style="cursor:pointer;">
                업로드(고정) <input id="file-up" type="file" accept="image/*" hidden />
              </label>
              <a class="btn" href="/storage">저장소 열기</a>
            </div>

            <div>
              <label>슬러그</label>
              <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
                <input id="slug" placeholder="예: healing-custom" style="width:320px;padding:8px;border-radius:8px;border:1px solid #2a303b;background:#0f1115;color:#e6e8eb"/>
                <span id="slug-pill" style="padding:6px 10px;border-radius:999px;border:1px solid #2a303b;opacity:.9">대기중</span>
                <button id="btn-make-slug" class="btn">자동 생성</button>
              </div>
              <small style="opacity:.75">영문/숫자/하이픈만, 최대 48자</small>
            </div>
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

      // 스타일(슬러그 pill 색)
      if (!document.querySelector('#pill-style')) {
        const css = document.createElement('style'); css.id = 'pill-style';
        css.textContent = `
          .pill-ok  { background:#102a16; color:#b6f0b8; border-color:#224d29; }
          .pill-bad { background:#2a1111; color:#ffb3b3; border-color:#5a2020; }
        `; document.head.appendChild(css);
      }

      // ---- 프리뷰 상태 & 로직 ----
      let fixedUpload = null;   // 업로드(고정) dataURL
      let dailyPick   = null;   // 저장소(오늘의) file URL

      async function loadBackgrounds(group){
        // Vite root=link → URL은 /data/... 로 접근
        const res = await fetch(`/data/backgrounds/${group}/index.json`, { cache:'no-store' });
        try { return await res.json(); } catch { return []; }
      }

      function paintPreview(){
        const el = qs('#preview');
        if (!el) return;
        el.innerHTML = '';
        const img = new Image();
        img.style.maxWidth = '100%';
        img.style.maxHeight = '360px';
        img.alt = 'preview';
        if (fixedUpload)      img.src = fixedUpload; // 업로드=고정
        else if (dailyPick)   img.src = dailyPick;   // 저장소=오늘의
        else { el.innerHTML = '<em>프리뷰 영역</em>'; return; }
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
          dailyPick = null;       // 업로드 선택 시 저장소 해제
          paintPreview();
        };
        r.readAsDataURL(f);
      });

      // storage에서 보낸 고정 프리뷰(파일 URL) 반영
      const passed = localStorage.getItem('lm:healing:previewFixed');
      if (passed) {
        fixedUpload = null;
        dailyPick   = passed;
        paintPreview();
        localStorage.removeItem('lm:healing:previewFixed');
      }

      // ---- 슬러그 즉시검사 ----
      const $slug = qs('#slug');
      const $pill = qs('#slug-pill');
      const pillSet = (ok, text) => {
        $pill.textContent = text || (ok ? '사용 가능' : '사용 불가');
        $pill.classList.remove('pill-ok','pill-bad');
        $pill.classList.add(ok ? 'pill-ok' : 'pill-bad');
      };
      const checkSlug = debounce(async ()=>{
        const raw = $slug.value;
        const normalized = makeSlug(raw);
        if (normalized !== raw) $slug.value = normalized;
        if (!normalized) { $pill.classList.remove('pill-ok','pill-bad'); $pill.textContent='대기중'; return; }
        const slugs = await loadSlugs();
        pillSet(!isSlugTaken(slugs, normalized));
      }, 250);
      $slug.addEventListener('input', checkSlug);

      // 자동 생성: 수령인+메시지 기반
      qs('#btn-make-slug')?.addEventListener('click', ()=>{
        const recip = (qs('#recip')?.value || '').trim();
        const msg   = (qs('#msg-custom')?.value || qs('#msg-preset')?.value || '').trim();
        const base  = recip ? `${recip}-${msg || 'healing'}` : (msg || 'healing-custom');
        $slug.value = makeSlug(base);
        $slug.dispatchEvent(new Event('input'));
      });

      // 저장(JSONL) — 폼 메타 포함
      qs('#save-healing')?.addEventListener('click', () => {
        const recip = (qs('#recip')?.value || '').trim();
        const msgPreset = (qs('#msg-preset')?.value || '').trim();
        const msgCustom = (qs('#msg-custom')?.value || '').trim();
        const msgType = msgCustom ? 'custom' : (msgPreset ? 'preset' : 'none');
        const message = msgCustom || msgPreset || '';
        const slugIn  = (qs('#slug')?.value || '').trim();

        if (!recip) { alert('수령인 이름을 입력해주세요.'); return; }
        if (!message) { alert('메시지를 선택하거나 입력해주세요.'); return; }
        if (!slugIn) { alert('슬러그를 입력/생성해주세요.'); return; }

        handleSave({
          type: 'healing',
          payload: {
            recipient: recip,
            msgType,
            message,
            slug: slugIn,
            bg: dailyPick || null,
            upload: !!fixedUpload,
          }
        });
      });
      break;
    }

    /* ---------- 저장소(썸네일 + 액션) ---------- */
    case '/storage': {
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
            <span id="st-count" style="opacity:.8">이미지 없음</span>
            <a class="btn" href="/">← 대시보드</a>
          </div>

          <div id="st-grid"
               style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;align-items:start;"></div>
        </section>
      `);

      // 1) 스타일(한 번만 삽입)
      if (!document.querySelector('#st-style')) {
        const css = document.createElement('style');
        css.id = 'st-style';
        css.textContent = `
          .st-card{position:relative;border:1px solid #2a303b;border-radius:12px;overflow:hidden;background:#0f1115}
          .st-card img{display:block;width:100%;height:140px;object-fit:cover}
          .st-card figcaption{padding:8px 10px;font-size:.9rem;opacity:.9}
          .st-actions{position:absolute;left:8px;right:8px;bottom:8px;display:flex;gap:8px;justify-content:flex-end}
          .btn-mini{padding:6px 8px;border:1px solid #2a303b;border-radius:8px;background:#151821;color:#e6e8eb}
          .btn-mini:hover{background:#1b1f29}
        `;
        document.head.appendChild(css);
      }

      // 2) 데이터 로더
      async function loadList(group){
        const res = await fetch(`/data/backgrounds/${group}/index.json`, { cache: 'no-store' });
        try { return await res.json(); } catch { return []; }
      }

      // 3) 카드 + 액션
      function cardHtml(it){
        const src = it.thumb || it.file;
        const title = it.title || '';
        return `
          <figure class="st-card" data-file="${it.file}">
            <img src="${src}" alt="${title}" />
            <figcaption>${title || it.file}</figcaption>
            <div class="st-actions">
              <button class="btn btn-mini act-preview">프리뷰로 보내기</button>
              <button class="btn btn-mini act-copy">경로 복사</button>
            </div>
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

        // 액션 동작
        grid.querySelectorAll('.st-card').forEach($card=>{
          $card.querySelector('.act-preview').addEventListener('click', ()=>{
            const file = $card.dataset.file;
            // 힐링 프리뷰로 넘기기 (로컬스토리지 전달)
            localStorage.setItem('lm:healing:previewFixed', file);
            location.href = '/healing-maker';
          });
          $card.querySelector('.act-copy').addEventListener('click', async ()=>{
            const file = $card.dataset.file;
            try { await navigator.clipboard.writeText(file); alert('경로 복사됨'); }
            catch { alert(file); }
          });
        });
      }

      const sel = document.querySelector('#st-group');
      sel.addEventListener('change', () => renderGrid(sel.value));
      renderGrid(sel.value);
      break;
    }

    default:
      // 대시보드(index.html) 고정
      break;
  }
}

/* =========================
   SPA 내비게이션
   ========================= */
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

