import { qs, pickItem } from '../../lib/utils.js';

export function render({ data, params }){
  const mode = params.get('mode') || 'daily';
  const showCredit = (params.get('showCredit')||'true') === 'true';
  const item = pickItem(data.items, {mode, id: params.get('id'), namespace:'healing'});

  const root = document.createElement('div');
  root.className = 'healing-card card';
  root.innerHTML = `
    <h1 class="msg">${item.text}</h1>
    <div class="actions">
      <button id="tts" class="btn-lg">Play TTS</button>
      <a id="open" class="btn-sm" href="#">Open Healing</a>
    </div>
    ${showCredit ? `<div class="credit">${data.meta?.credit||''}</div>` : ''}
  `;
  root.querySelector('#tts').onclick = () => speakKo(item.text);
  root.querySelector('#open').onclick = (e)=>{ e.preventDefault(); alert('Healing 페이지는 v1에서 연결됩니다.'); };
  return root;
}

function speakKo(text){
  const u = new SpeechSynthesisUtterance(text); u.lang='ko-KR';
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}
