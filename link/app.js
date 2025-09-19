const qs=(s,el=document)=>el.querySelector(s);
function route(){const p=(location.pathname.replace(/\/+$/,'')||'/');const =qs('#app');if(!)return;const R=h=>{.innerHTML=h};
switch(p){
 case '/hanlove-maker':R(<section class="panel"><h2>한글사랑 링크메이커</h2><ol class="flow"><li>언어 선택(EN 디폴트)</li><li>메시지 선택→프리뷰(영어 의미/한글/발음)</li><li>저장→단축URL→배포(노션)</li></ol><a class="btn" href="/">← 대시보드</a></section>);break;
 case '/healing-maker':R(<section class="panel"><h2>힐링메세지 링크메이커</h2><ol class="flow"><li>수령인 이름 입력</li><li>메시지 선택 또는 커스텀(단문/장문)</li><li>배경 선택/이미지 업로드(고정)</li><li>프리뷰(저장소=매일 랜덤/업로드=고정)</li><li>저장→단축URL→배포(노션)</li></ol><a class="btn" href="/">← 대시보드</a></section>);break;
 case '/storage':R(<section class="panel"><h2>저장소</h2><ul class="flow"><li>한글사랑(EN 디폴트, 타 언어=번역만)</li><li>힐링메세지(healing/bible30/today30…)</li><li>배경 이미지(그룹별 썸네일)</li></ul><a class="btn" href="/">← 대시보드</a></section>);break;
 default:break;}}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="/"]');if(!a)return;const u=new URL(a.href,location.origin);if(u.origin!==location.origin)return;e.preventDefault();history.pushState({},'',u.pathname);route();});
window.addEventListener('popstate',route);document.addEventListener('DOMContentLoaded',route);
