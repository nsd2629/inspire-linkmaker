const cards = [
  { title: "Link Maker",  desc: "카드/리스트/모드로 URL 생성 · 미리보기 · QR", href: "./link" },  // /admin/link 로 진입
  { title: "저장소",      desc: "카드별 JSON 보기 및 검증(읽기)",               href: "./data" },
  { title: "카드 프리뷰", desc: "UI/테마/크레딧 토글",                         href: "./cards.html" },
];

const $ = (sel) => document.querySelector(sel);
const wrap = document.querySelector("#cards");
wrap.innerHTML = cards.map(c => `
  <div class="card">
    <h2>${c.title}</h2>
    <p>${c.desc}</p>
    <a href="${c.href}">열기</a>
  </div>
`).join("");
