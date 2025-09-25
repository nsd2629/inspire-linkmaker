
import { nsKey, get, set, getJSON, setJSON } from "/core/storage.js?v=dev";
import { dom } from "/core/util.js?v=dev";
const NS = "lm:healing";

const $owner = dom("#owner");
const $gSearch = dom("#groupSearch");
const $gVal = dom("#groupValue");
const $mode = dom("#mode");
const $id = dom("#cardId");
const $font = dom("#fontCredit");
const $msgs = dom("#msgList");
const $pv = dom("#preview");

const state = {
  owner: get(nsKey(NS,"owner"), ""),
  group: get(nsKey(NS,"group"), ""),
  mode:  get(nsKey(NS,"mode"), "daily"),
  id:    get(nsKey(NS,"id"), ""),
  messages: getJSON(nsKey(NS,"messages"), []),
  fontCredit: get(nsKey(NS,"fontCredit"), ""),
};

function persist(){
  set(nsKey(NS,"owner"), state.owner);
  set(nsKey(NS,"group"), state.group);
  set(nsKey(NS,"mode"), state.mode);
  set(nsKey(NS,"id"), state.id);
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
  u.searchParams.set("card","healing");
  u.searchParams.set("id", state.id || "HL-000");
  u.searchParams.set("owner", state.owner || "");
  u.searchParams.set("group", state.group || "");
  u.searchParams.set("mode", state.mode || "daily");
  u.searchParams.set("v", window.APP_VERSION || "dev");
  $pv.src = u.toString();
}

// init values
$owner.value = state.owner;
$gVal.value = state.group;
$mode.value = state.mode;
$id.value = state.id;
$font.value = state.fontCredit;

$owner.oninput = e=>{ state.owner=e.target.value; persist(); };
$gSearch.oninput = e=>{ /* TODO: hook to repo search */ };
$gVal.oninput = e=>{ state.group=e.target.value; persist(); updatePreview(); };
$mode.onchange = e=>{ state.mode=e.target.value; persist(); updatePreview(); };
$id.oninput = e=>{ state.id=e.target.value; persist(); updatePreview(); };
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
  alert("저장소 불러오기(힐링) — 저장소 연동 훅 자리입니다.");
};

renderMsgs();
updatePreview();
