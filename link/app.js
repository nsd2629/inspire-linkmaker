
import { qs, qsm, dom, todayKey, hashStr, chooseDaily } from "/core/util.js?v=dev";
import { nsKey, get, getJSON } from "/core/storage.js?v=dev";

const card  = qs('card','hanlove');
const id    = qs('id','HL-000');
const list  = qs('list','default');
const owner = qs('owner','') || get(nsKey('lm:healing','owner'),''); // healing 전용 기본
const group = qs('group','') || get(nsKey('lm:healing','group'),'');
const mode  = qs('mode', (card==='healing'?'daily':'fixed'));

const title   = dom('#title');
const msgBox  = dom('#message');
const meta = {
  card:  dom('#metaCard'),
  id:    dom('#metaId'),
  owner: dom('#metaOwner'),
  group: dom('#metaGroup'),
  mode:  dom('#metaMode'),
  list:  dom('#metaList')
};
const creditWrap = dom('#creditWrap');

// Load messages from localStorage namespaces (fallbacks)
let messages = [];
if(card==='healing'){
  messages = getJSON(nsKey('lm:healing','messages'), []);
} else {
  messages = getJSON(nsKey('lm:hanlove','messages'), []);
}
// Also allow passing ?msg=... multiple times
const msgParams = qsm('msg');
if (msgParams.length) {
  messages = msgParams.map(t=>({text:t}));
}

function pickMessage(){
  if (!messages.length) return '메세지가 비어있습니다.';
  if (mode === 'daily'){
    const seed = hashStr(todayKey()+id+card);
    return chooseDaily(messages.map(m=>m.text||''), seed) || messages[0].text || '';
  }
  return messages[0].text || '';
}

function loadCredit(){
  const c = (card==='healing')
    ? get(nsKey('lm:healing','fontCredit'),'')
    : get(nsKey('lm:hanlove','fontCredit'),'');
  return qs('credit','') || c || '';
}

function speak(text){
  if(!('speechSynthesis' in window)) return alert('이 브라우저는 TTS를 지원하지 않습니다.');
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  window.speechSynthesis.speak(u);
}

function openSelf(){
  // 버튼: 현재 URL 새창
  window.open(location.href, '_blank');
}

function render(){
  title.textContent = (card==='healing') ? '힐링메세지 카드' : '한글사랑 카드';
  msgBox.textContent = pickMessage();

  meta.card.textContent = card;
  meta.id.textContent   = id;
  meta.owner.textContent= owner || '-';
  meta.group.textContent= group || '-';
  meta.mode.textContent = mode;
  meta.list.textContent = (card==='hanlove') ? list : '-';

  const credit = loadCredit();
  if(credit){
    creditWrap.style.display = 'block';
    creditWrap.textContent = 'Font credit: ' + credit;
  } else {
    creditWrap.style.display = 'none';
  }
}

dom("#btnTTS").onclick = ()=> speak(msgBox.textContent||'');
dom("#btnOpen").onclick = openSelf;

render();
