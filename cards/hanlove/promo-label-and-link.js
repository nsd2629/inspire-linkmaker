
// cards/hanlove/promo-label-and-link.js
// Purpose: Read ?promo= & ?btn= and apply to the 'Open Healing Message' button on the hanlove card.

(function(){
  const params = new URLSearchParams(location.search);
  const promo = params.get('promo') || '';
  const label = params.get('btn') || '';

  // Try to find the target button robustly
  function findButton(){
    // 1) data-role attribute (preferred)
    let btn = document.querySelector('[data-role="open-healing"]');
    if (btn) return btn;
    // 2) id
    btn = document.querySelector('#btnOpen');
    if (btn) return btn;
    // 3) class
    btn = document.querySelector('.open-healing, .btn-open-healing');
    if (btn) return btn;
    // 4) fallback: a button whose text contains 'Open Healing' (case-insensitive)
    const candidates = Array.from(document.querySelectorAll('button, a'));
    return candidates.find(el => /open\s+healing/i.test((el.textContent||'').trim())) || null;
  }

  function apply(){
    const btn = findButton();
    if (!btn) return false;
    // label text
    if (label) {
      btn.textContent = label;
    }
    // link action
    if (promo) {
      // If it's an anchor link use href, else attach click
      if (btn.tagName === 'A') {
        btn.setAttribute('href', promo);
        btn.setAttribute('rel','noopener');
        btn.setAttribute('target','_blank');
      } else {
        btn.onclick = ()=> { location.href = promo; };
      }
    }
    return true;
  }

  // Wait until the card finished rendering
  const start = Date.now();
  const timer = setInterval(()=>{
    if (apply()) { clearInterval(timer); }
    // timeout after 5s to avoid infinite polling
    if (Date.now() - start > 5000) clearInterval(timer);
  }, 120);
})();
