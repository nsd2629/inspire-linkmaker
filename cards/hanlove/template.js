import { pickItem } from '../../lib/utils.js';

export function render({ data, params }){
  const mode = params.get('mode') || 'shuffle';
  const showCredit = (params.get('showCredit')||'false') === 'true';
  const id = params.get('id');
  const item = pickItem(data.items, {mode, id, namespace:'hanlove'});

  const root = document.createElement('div');
  root.className = 'hanlove-card card';
  root.innerHTML = `
    <main class="typo">${item.text}</main>
    ${showCredit ? `<footer class="credit">${data.meta?.credit||''}</footer>` : ''}
  `;
  return root;
}
