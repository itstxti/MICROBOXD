/* Animación del indicador al cambiar de pestaña (.seg) */
(function(){
  const pos=new Map(),DUR=280;let tap=0;
  addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest(".seg button"))tap=Date.now()},true);
  addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.closest&&e.target.closest(".seg button"))tap=Date.now()},true);
  const key=seg=>[...seg.children].filter(b=>b.tagName==="BUTTON").map(b=>b.textContent.trim()).join("|");
  function upd(seg){
    const on=seg.querySelector(":scope>button.on");if(!on||!seg.offsetWidth)return;
    let ind=seg.querySelector(":scope>.segi");
    if(!ind){ind=document.createElement("i");ind.className="segi";seg.insertBefore(ind,seg.firstChild)}
    const k=key(seg),x=on.offsetLeft,w=on.offsetWidth,prev=pos.get(k),set=(l,wd)=>{ind.style.transform="translateX("+l+"px)";ind.style.width=wd+"px"};
    if(ind.dataset.l!==undefined&&(+ind.dataset.l===x)&&(+ind.dataset.w===w)){return}
    const fresh=ind.dataset.l===undefined,now=Date.now(),
      cont=fresh&&prev&&prev.an&&prev.x===x&&prev.w===w&&now-prev.an.t<DUR,
      fromPrev=fresh&&prev&&(prev.x!==x||prev.w!==w)&&now-tap<900;
    let an=null;
    if(fresh){ind.classList.remove("go");ind.style.transitionDuration="";
      if(cont){/* la pestaña se volvió a pintar a mitad de animación: continúa desde donde iba */
        const el=now-prev.an.t,p=Math.min(1,el/DUR),e=1-Math.pow(1-p,3),cx=prev.an.fx+(x-prev.an.fx)*e,cw=prev.an.fw+(w-prev.an.fw)*e;
        set(cx,cw);void ind.offsetWidth;an=prev.an;
        requestAnimationFrame(()=>{ind.classList.add("go");ind.style.transitionDuration=Math.max(30,DUR-el)+"ms";set(x,w)})}
      else if(fromPrev){set(prev.x,prev.w);void ind.offsetWidth;an={t:now,fx:prev.x,fw:prev.w};
        requestAnimationFrame(()=>{ind.classList.add("go");set(x,w)})}
      else set(x,w)}
    else{an={t:now,fx:+ind.dataset.l,fw:+ind.dataset.w};ind.classList.add("go");ind.style.transitionDuration="";set(x,w)}
    ind.dataset.l=x;ind.dataset.w=w;pos.set(k,{x,w,an});
    const cur=seg.querySelector(":scope>button.on");if(cur&&seg.scrollWidth>seg.clientWidth)cur.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"})
  }
  function scan(root){(root.matches&&root.matches(".seg")?[root]:[]).concat([...(root.querySelectorAll?root.querySelectorAll(".seg"):[])]).forEach(upd)}
  const mo=new MutationObserver(ms=>{
    const segs=new Set();
    ms.forEach(m=>{
      if(m.type==="attributes"){const sg=m.target.closest&&m.target.closest(".seg");if(sg)segs.add(sg)}
      else m.addedNodes.forEach(n=>{
        if(n.nodeType!==1||n.classList.contains("segi"))return;
        if(n.matches(".seg"))segs.add(n);
        n.querySelectorAll(".seg").forEach(x=>segs.add(x))
      })
    });
    if(!segs.size)return;
    mo.disconnect();segs.forEach(upd);mo.observe(document.body,opt)
  });
  const opt={childList:true,subtree:true,attributes:true,attributeFilter:["class"]};
  mo.observe(document.body,opt);scan(document.body);
  addEventListener("resize",()=>document.querySelectorAll(".seg").forEach(sg=>{const i=sg.querySelector(":scope>.segi");if(i)delete i.dataset.l;upd(sg)}))
})();
