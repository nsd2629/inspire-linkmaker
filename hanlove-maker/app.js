
import { nsKey, get, set, getJSON, setJSON } from "/core/storage.js?v=dev";
import { dom } from "/core/util.js?v=dev";
const NS = "lm:hanlove";

const $id   = dom("#cardId");
const $list = dom("#listName");
const $mode = dom("#mode");
const $font = dom("#fontCredit");
const $msgs = dom("#msgList");
const $pv   = dom("#preview");

const state = {
  id:   get(nsKey(NS,"id"), ""),
  list: get(nsKey(NS,"list"), "default"),
  mode: get(nsKey(NS,"mode"), "fixed"),
  messages: getJSON(nsKey(NS,"messages"), []),
  fontCredit: get(nsKey(NS,"fontCredit"), ""),
};

function persist(){
  set(nsKey(NS,"id"), state.id);
  set(nsKey(NS,"list"), state.list);
  set(nsKey(NS,"mode"), state.mode);
  setJSON(nsKey(NS,"messages"), state.messages);
  set(nsKey(NS,"fontCredit"), state.fontCredit);
}
function renderMsgs(){
  $msgs.innerHTML = "";
  state.messages.forEach((m,i)=>{
    const li = document.createElement("li");
    li.innerHTML = `
      <textarea data-i="${i}">${m.text||""}</textarea>
      <button data-del="${i}">삭제</button>
    `;
    $msgs.appendChild(li);
  });
}
function updatePreview(){
  const u = new URL("/link/", location.origin);
  u.searchParams.set("card","hanlove");
  u.searchParams.set("id", state.id || "HL-000");
  u.searchParams.set("list", state.list || "default");
  u.searchParams.set("mode", state.mode || "fixed");
  u.searchParams.set("v", window.APP_VERSION || "dev");
  $pv.src = u.toString();
}

// init
$id.value   = state.id;
$list.value = state.list;
$mode.value = state.mode;
$font.value = state.fontCredit;

$id.oninput   = e=>{ state.id=e.target.value; persist(); updatePreview(); };
$list.oninput = e=>{ state.list=e.target.value; persist(); updatePreview(); };
$mode.onchange= e=>{ state.mode=e.target.value; persist(); updatePreview(); };
$font.oninput = e=>{ state.fontCredit=e.target.value; persist(); };

dom("#btnAddMsg").onclick = ()=>{ state.messages.push({text:""}); persist(); renderMsgs(); };
$msgs.addEventListener("input", (e)=>{
  if(e.target.matches("textarea")){
    const i=+e.target.dataset.i; state.messages[i].text = e.target.value; persist();
  }
});
$msgs.addEventListener("click", (e)=>{
  if(e.target.dataset.del){
    const i=+e.target.dataset.del; state.messages.splice(i,1); persist(); renderMsgs();
  }
});
dom("#btnSave").onclick = ()=>{ alert("임시 저장됨 (localStorage)"); };
dom("#btnPreview").onclick = updatePreview;

dom("#btnLoadStore").onclick = ()=>{
  alert("저장소 불러오기(한글사랑) — 저장소 연동 훅 자리입니다.");
};

renderMsgs();
updatePreview();
