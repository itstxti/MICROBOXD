/* Animaciones extra: entrada de contenido por pestaña, barras, progreso, estrellas, likes, seguir y barra inferior */
(function(){
  const RM=matchMedia("(prefers-reduced-motion:reduce)");
  const $=id=>document.getElementById(id);
  const find=(list,sel)=>{const r=[];list.forEach(n=>{if(n.nodeType!==1)return;if(n.matches(sel))r.push(n);n.querySelectorAll(sel).forEach(x=>r.push(x))});return r};
  const h2=l=>{const e=find(l,".hd2 h2")[0];return e?e.textContent:null};
  const pop=el=>{if(!el||RM.matches)return;el.classList.remove("mbxp");void el.getBoundingClientRect();el.classList.add("mbxp");setTimeout(()=>el.classList.remove("mbxp"),450)};
  let lastKey=null,tmM=0,tmD=0;

  /* 1) Contenido principal: aparece al cambiar de pestaña o de sub-pestaña (no en cada render).
        Si la pantalla empieza con "Cargando…", se espera al contenido real y se anima una sola vez.
        Las clases van en los elementos que existen en ese momento, así un repintado posterior no repite la animación. */
  let pend=false,animT=0;
  function mainKey(){const tb=[...document.querySelectorAll("#tb button")],t=tb.findIndex(b=>b.classList.contains("on")),s=document.querySelector("#hd .seg button.on");return t+"|"+(s?s.textContent.trim():"")}
  const CL=["mbx-f","mbx-s","mbx-gy","mbx-gx"];
  /* Aplica la animación a lo que hay ahora en pantalla. Si es un repintado a mitad de animación
     (p. ej. llegan datos nuevos justo después de enseñar los de caché), continúa desde el mismo punto. */
  function play(mn,el){
    clearTimeout(tmM);
    const kids=[...mn.children],it=[...mn.querySelectorAll(".hp,.grid>*,.row,.act,.de,.logrow,.lrw,.lst2,.mrow")].slice(0,12),
      gy=[...mn.querySelectorAll(".bars u")],gx=[...mn.querySelectorAll(".stb>u i")],d=n=>(n-el)+"ms";
    kids.forEach(e=>{e.classList.add("mbx-f");if(el)e.style.animationDelay=d(0)});
    it.forEach((e,n)=>{e.style.animationDelay=d(n*20);e.classList.add("mbx-s")});
    gy.forEach((e,n)=>{e.style.animationDelay=d(n%10*30);e.classList.add("mbx-gy")});
    gx.forEach(e=>{e.classList.add("mbx-gx");if(el)e.style.animationDelay=d(0)});
    tmM=setTimeout(()=>{animT=0;[...kids,...it,...gy,...gx].forEach(e=>{e.classList.remove(...CL);e.style.animationDelay=""})},Math.max(60,900-el));
  }
  function onMain(){
    const k=mainKey(),first=lastKey===null,fresh=!first&&k!==lastKey;lastKey=k;
    const mn=$("mn");if(!mn||RM.matches)return;
    if(mn.querySelector("#sr")){pend=false;animT=0;return}
    const loading=!!mn.querySelector(".ld");
    if(fresh){pend=true;animT=0}
    if(loading)return;
    if(pend){pend=false;animT=performance.now();play(mn,0);return}
    const el=animT?performance.now()-animT:0;
    if(animT&&el<700)play(mn,el)
  }

  /* 2) Detalle de serie: las barras crecen al abrir; al puntuar pasan del valor antiguo al nuevo */
  function onDet(m){
    const d=$("det");if(!d||RM.matches)return;
    const oldT=h2(m.removedNodes),newT=h2(m.addedNodes);
    if(newT===null)return;
    const same=oldT!==null&&oldT===newT;
    clearTimeout(tmD);
    if(!same){d.classList.add("fr");tmD=setTimeout(()=>d.classList.remove("fr"),900);return}
    d.classList.remove("fr");
    [[".sx b","width"],[".bars u","height"]].forEach(([sel,prop])=>{
      const o=find(m.removedNodes,sel),n=find(m.addedNodes,sel);
      if(!n.length||o.length!==n.length)return;
      const to=n.map(e=>e.style[prop]);let any=false;
      n.forEach((e,k)=>{const ov=o[k].style[prop];if(ov&&ov!==to[k]){e.style[prop]=ov;any=true}});
      if(!any)return;
      void d.offsetWidth;
      requestAnimationFrame(()=>n.forEach((e,k)=>{e.style[prop]=to[k]}));
    });
  }

  /* 3) Rebote al dar like / seguir / cambiar de pestaña inferior */
  function onPop(m){
    if(RM.matches)return;
    const t=m.target;
    if(t.nodeType===1&&t.classList&&t.classList.contains("mfl")&&t.classList.contains("on")){pop(t.querySelector("svg"));return}
    const on=find(m.addedNodes,".hb2.on"),old=find(m.removedNodes,".hb2");
    if(on.length&&old.length===on.length)on.forEach((e,k)=>{if(!old[k].classList.contains("on"))pop(e.querySelector("svg"))});
    if(t.id==="tb"){
      const idx=l=>l.findIndex(b=>b.classList.contains("on")),ob=find(m.removedNodes,"button"),nb=find(m.addedNodes,"button"),a=idx(ob),b=idx(nb);
      if(a>=0&&b>=0&&a!==b)pop(nb[b].querySelector("svg"));
    }
  }

  new MutationObserver(ms=>{
    for(const m of ms){
      if(m.type!=="childList")continue;
      const t=m.target;
      if(t.id==="mn")onMain();
      else if(t.id==="det")onDet(m);
      onPop(m);
    }
  }).observe(document.body,{childList:true,subtree:true});
})();
