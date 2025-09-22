/* Inspire Link Maker - Split Dashboard + Save Demo */
import { loadSlugs, isSlugTaken, makeSlug, exportOrderJSONL } from './lib/data.js';

const qs = (s, el=document) => el.querySelector(s);

// 저장(데모): 슬러그 중복검사 → JSONL 1줄 다운로드
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
    meta: { channel: 'dashboard', type }
  };

  exportOrderJSONL(record); // 다운로드(임시 기록)
  alert(`주문 JSONL 1줄 저장됨: ${slug}`);
}

function route() {
  const p = location.pathname.replace(/\/+$/, '') || '/';
  const $main = qs('#app');
  if (!$main) return;
  const render = (html) => { $main.innerHTML = html; };

  switch (p) {
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
      qs('#save-hanlove')?.addEventListener('click', () => handleSave({ type: 'hanlove' }));
      break;

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
          <div class="actions">
            <button id="save-healing" class="btn">저장(데모) & JSONL</button>
            <a class="btn" href="/">← 대시보드</a>
          </div>
        </section>
      `);
      qs('#save-healing')?.addEventListener('click', () => handleSave({ type: 'healing' }));
      break;

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
      // 대시보드 기본 카드 그대로 유지
      break;
  }
}

// SPA 내비게이션
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
