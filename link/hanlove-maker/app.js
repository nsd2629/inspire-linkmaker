const $ = (s, el=document)=>el.querySelector(s);

const builtin = {
  ko: [
    "괜찮아. 오늘도 네 속도대로 가자.",
    "고마워. 너로 인해 하루가 따뜻해졌어.",
    "사랑해. 있는 그대로의 너라서 좋아."
  ],
  en: [
    "It's okay. Go at your own pace.",
    "Thank you. You warmed my day.",
    "I love you—just as you are."
  ],
  ja: [
    "大丈夫。君のペースで行こう。",
    "ありがとう。あなたのおかげで一日が温かい。",
    "愛してる。ありのままの君が好き。"
  ]
};

const state = { lang:"ko", messages:[], source:"builtin", idx:0 };

async function loadMessages(lang) {
  const url = `/data/hanlove/messages/${lang}.json?v=${Date.now()}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("empty");
    state.messages = arr;
    state.source = "file";
  } catch {
    state.messages = builtin[lang] || builtin.ko;
    state.source = "builtin";
  }
  state.idx = 0;
}

function show() {
  const msg = state.messages[state.idx % state.messages.length] || "메시지가 없습니다.";
  $("#preview").textContent = msg;
  $("#sourceNote").textContent =
    state.source === "file"
      ? `소스: /data/hanlove/messages/${state.lang}.json`
      : `소스: 내장 샘플 (파일 미존재 시 자동 대체)`;
}

$("#lang").addEventListener("change", async (e)=>{
  state.lang = e.target.value;
  await loadMessages(state.lang);
  show();
});
$("#btnRandom").addEventListener("click", ()=>{
  state.idx = Math.floor(Math.random() * state.messages.length);
  show();
});
$("#btnNext").addEventListener("click", ()=>{
  state.idx = (state.idx + 1) % state.messages.length;
  show();
});

(async ()=>{
  await loadMessages(state.lang);
  show();
})();
