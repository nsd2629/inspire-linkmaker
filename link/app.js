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
          <ul class="flow">
            <li>한글사랑 저장소 (EN 디폴트 기준, 타 언어=번역 필드만)</li>
            <li>힐링메세지 저장소 (그룹: healing/bible30/today30…)</li>
            <li>배경 이미지 저장소 (그룹별 썸네일 그리드)</li>
          </ul>
          <div class="actions">
            <a class="btn" href="/">← 대시보드</a>
          </div>
        </section>
      `);
      break;

    default:
      // 대시보드 기본 카드(index.html) 그대로 사용
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
