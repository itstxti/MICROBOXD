/* Tema: oscuro (por defecto) | claro | sistema. Se carga en <head>, antes del CSS, para evitar parpadeos. */
(function(){
  const K="microboxd:theme",mq=matchMedia("(prefers-color-scheme: light)");
  const get=()=>{try{const v=localStorage.getItem(K);return v==="light"||v==="system"?v:"dark"}catch(e){return"dark"}};
  function apply(){
    const m=get(),r=m==="system"?(mq.matches?"light":"dark"):m;
    document.documentElement.dataset.theme=r;
    const tc=document.querySelector('meta[name="theme-color"]'),cs=document.querySelector('meta[name="color-scheme"]');
    if(tc)tc.content=r==="light"?"#2b2521":"#000000";
    if(cs)cs.content=r;
  }
  window.mbThemeMode=get;
  window.mbTheme=m=>{try{localStorage.setItem(K,m)}catch(e){}apply()};
  apply();
  if(mq.addEventListener)mq.addEventListener("change",apply);else if(mq.addListener)mq.addListener(apply);
  document.addEventListener("DOMContentLoaded",apply);
})();
