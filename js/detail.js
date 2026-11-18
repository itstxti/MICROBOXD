const myHist=()=>{const b=Array(10).fill(0);items.forEach(i=>{if(i.rating){const j=Math.round(i.rating*2)-1;if(j>=0&&j<10)b[j]++}});const m=Math.max(1,...b);return `<div class="lbl">Valoraciones</div><div class="mh"><span>★</span><div class="bars">${b.map(n=>`<u title="${n}" style="height:${Math.max(4,n/m*100)}%"></u>`).join("")}</div><span>★★★★★</span></div>`};
const setNh=()=>document.documentElement.style.setProperty("--nh",Math.max(0,innerHeight-$("tb").getBoundingClientRect().top)+"px");addEventListener("resize",setNh);
function setSeg(k){seg[tab]=k;FEED=INC=HR=null;render();$("mn").scrollTop=0}
function go(t){if(t==="add"){openAdd();return}if(t==="act")MYACTs=1;sf=0;if(t==="search"&&tab==="search"){br=[];q=""}$("det").classList.remove("open");$("lst").classList.remove("open");$("sub").classList.remove("open");tab=t;if(t==="act")FEED=INC=null;if(t==="home")HR=null;render();$("mn").scrollTop=0}

let dtab="cast",castAll=false;
const castList=i=>i.cast&&i.cast.length?i.cast.map(c=>[c.a,c.p,c.ph||""]):(i.castTxt||"").split(",").map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(.*?)\s*\((.*)\)$/);return m?[m[1],m[2]]:[x,""]});
const pc=i=>Math.round(i.watched/i.eps*100);
function hist(i){const cv=com[key(i)],v=cv&&cv.length?cv:(i.rating?[i.rating]:[]),b=Array(10).fill(0);v.forEach(x=>{const j=Math.round(x*2)-1;if(j>=0&&j<10)b[j]++});
  const m=Math.max(1,...b),k=i.rating?Math.round(i.rating*2)-1:-1,avg=v.length?(v.reduce((a,x)=>a+x,0)/v.length).toFixed(1):"–";
  return `<div class="panel"><div class="pl">Valoraciones de la comunidad</div><div class="hist${v.length?"":" e"}"><span class="hs">★</span><div class="bars">${b.map((n,j)=>`<u title="${n}" class="${j===k?"me":""}" style="height:${Math.max(4,n/m*100)}%"></u>`).join("")}</div><div class="avc" title="${v.length} ${v.length===1?"nota":"notas"}"><div class="avg">${avg}</div><span class="hs">★★★★★</span></div></div></div>`}
function dt(i){
  if(dtab==="cast"){const c=castList(i),sh=castAll?c:c.slice(0,10),ph=i.castPh||{};
    const rows=sh.map(([a,p,im0])=>{const k=a.trim().toLowerCase(),im=im0||ph[k],h=hue(a);return `<div class="cr"><div class="cav" style="${im?`background-image:url(${im})`:`background:linear-gradient(160deg,hsl(${h},55%,40%),hsl(${(h+50)%360},60%,22%))`}">${im?"":esc(a.trim().charAt(0).toUpperCase())}</div><div><b>${esc(a)}</b>${p?`<small>${esc(p)}</small>`:""}</div></div>`}).join("");
    return (c.length?rows+(c.length>10&&!castAll?`<div class="cmore" onclick="castAll=true;show(${i.id},true)">Mostrar ${c.length-10} más <span>⌄</span></div>`:""):EMP("users",L2("Aún no hay personajes","No characters yet"),L2("El reparto aparecerá aquí.","The cast will show up here."),"","","sm"))}
  if(dtab==="inf")return [["App",i.app],["Episodios",i.eps],...(i.epm?[[L2("Duración","Duration"),Math.floor(i.epm/60)?Math.floor(i.epm/60)+" h"+(Math.round(i.epm%60)?" "+Math.round(i.epm%60)+" min":""):Math.round(i.epm)+" min"]]:[])].map(([a,b])=>`<div class="dr"><span>${a}</span><b>${esc(b)}</b></div>`).join("");
  return i.tropes.length?i.tropes.map(t=>`<div class="br" data-q="${esc(t)}" onclick="goQ(this.dataset.q)">${esc(t)}<span>›</span></div>`).join(""):EMP("tag",L2("Sin temas","No themes"),L2("Esta serie no tiene temas.","This series has no themes."),"","","sm");
}
const simList=i=>items.filter(x=>x.id!==i.id).map(x=>({x,s:x.tropes.filter(t=>hasT(i,t)).length*2+(x.app===i.app?1:0)})).filter(o=>o.s).sort((a,b)=>b.s-a.s).map(o=>o.x); function openSim(id){const i=get(id);if(!i)return;subOpen(subBar("Series parecidas")+`<div style="padding:0 14px 20px">${grid(simList(i))}</div>`)} const simSec=i=>{const sim=simList(i);return sim.length?`<div class="simh" style="cursor:pointer" onclick="openSim(${i.id})">Series parecidas<span>›</span></div><div style="margin:0 -14px"><div class="hrow">${sim.map(i=>`<div class="hp">${poster(i)}<div class="ss">${S(i.rating)}</div></div>`).join("")}</div></div>`:""};
const lstSec=i=>{const ls=lists.filter(l=>l.ids.includes(i.id));return ls.length?`<h3 class="sec" style="margin-left:0;margin-right:0">En tus listas</h3>`+ls.map(l=>`<div class="br" style="padding-left:0;padding-right:0" onclick="$('det').classList.remove('open');openList(${l.id})">${esc(l.name)}<span>›</span></div>`).join(""):""};
function trAnim(w,h1,h2){if(matchMedia("(prefers-reduced-motion:reduce)").matches||h1===h2)return;
  clearTimeout(w._tt);w.style.overflow="hidden";w.style.height=h1+"px";w.style.transition="none";void w.offsetHeight;
  w.style.transition="height .32s cubic-bezier(.2,.7,.2,1)";w.style.height=h2+"px";
  w._tt=setTimeout(()=>{w.style.transition=w.style.height=w.style.overflow=""},360)}
function fitTr(d,anim){const w=d.querySelector(".tpr"),po=d.querySelector(".hd2 .poster");if(!w||!po)return;
  const h1=w.offsetHeight,rm=matchMedia("(prefers-reduced-motion:reduce)").matches;clearTimeout(w._tt);w.style.transition=w.style.height=w.style.overflow="";
  w.querySelectorAll(".tmore").forEach(x=>x.remove());
  const b=[...w.querySelectorAll("button.tag")];b.forEach(x=>{x.style.display="";x.classList.remove("tin")});
  const lim=()=>po.getBoundingClientRect().bottom+0.5,over=()=>w.getBoundingClientRect().bottom>lim();
  if(!over())return;
  let hid=0;const m=document.createElement("button");m.className="tag tmore";
  const set=()=>{m.textContent="+"+hid;m.setAttribute("aria-label",L2("Mostrar todos los temas","Show all themes"));m.onclick=()=>{
      const c=w.offsetHeight;b.forEach((x,k)=>{if(x.style.display==="none"){x.style.display="";if(!rm){x.classList.add("tin");x.style.animationDelay=Math.min(k*25,200)+"ms"}}});
      m.textContent="−";m.setAttribute("aria-label",L2("Mostrar menos","Show fewer"));m.onclick=()=>fitTr(d,1);
      trAnim(w,c,w.scrollHeight)}};
  w.appendChild(m);set();
  for(let k=b.length-1;k>0&&over();k--){b[k].style.display="none";hid++;set()}
  if(anim)trAnim(w,h1,w.offsetHeight)}
function show(id,keep){
  const i=get(id);if(!i)return;curDet=id;const h=hue(i.title),d=$("det"),y=d.scrollTop;if(!keep)d.style.zIndex=$("sub").classList.contains("open")?"27":"";if(!keep){dtab="cast";castAll=false}
  const bg=i.cover?`url(${i.cover})`:`linear-gradient(160deg,hsl(${h},60%,38%),hsl(${(h+50)%360},65%,16%))`;
  d.innerHTML=`<div class="top"><button class="rb ${DSK()?"rbd":""}" aria-label="Volver" onclick="closeDet()">${DSK()?`<span>‹ ${L2("Atrás","Back")}</span>`:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3 6 13l10 10"/></svg>`}</button><span class="tpt">${esc(short(i.title))}</span><div style="display:flex">${canEdit(i)&&!DSK()?`<button class="rb" aria-label="Editar serie" onclick="fmEdit(${i.id})"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>`:""}${DSK()?"":`<button class="rb" aria-label="Más" onclick="opts(${i.id})"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2"><circle cx="4" cy="13" r="2.6"/><circle cx="13" cy="13" r="2.6"/><circle cx="22" cy="13" r="2.6"/></svg></button>`}</div></div>
  <div class="dbk"><i style="background-image:${bg}"></i></div><div class="in2"><div class="hd2"><div class="tt"><h2>${esc(i.title)}</h2><div class="meta">${esc(i.app)} · ${i.eps} ${i.eps===1?"episodio":"episodios"}</div>${i.tropes.length?`<div class="tpr">${i.tropes.map(t=>`<button class="tag" data-q="${esc(t)}" onclick="goQ(this.dataset.q)">${esc(t)}</button>`).join("")}</div>`:""}</div><div class="pcol">${poster(i).replace(/onclick="[^"]*"/,"")}${pst(i)}</div></div>
  <p class="syn" onclick="synTog(this)">${esc(i.syn)||"Sin sinopsis todavía."}</p>
  <div class="dsd">${pnl(i)}${hist(i)}
  <div class="lgw"><div class="logrow" onclick="opts(${i.id})"><div class="av" style="width:32px;height:32px;font-size:14px;flex:none">${ini()}</div><span>${lt(i)}</span><span class="more">•••</span></div></div>
  ${wbSec(i)}${wwSec(i)}</div>
  ${revsSec(i)}
  <div class="seg d">${[["cast","Reparto"],["inf","Detalles"],["trp","Temas"]].map(([k,l])=>`<button class="${dtab===k?"on":""}" onclick="setDt('${k}',${i.id})">${l}</button>`).join("")}</div>
  ${dt(i)}${simSec(i)}${lstSec(i)}</div>`;
  d.classList.add("open");d.scrollTop=keep?y:0;detSc();{const q=d.querySelector(".syn");if(q&&q.scrollHeight>q.clientHeight+2){q.style.transition="none";q.classList.add("cl");void q.offsetHeight;q.style.transition=""}}fitTr(d);loadStat(i);loadRevs(i);loadWb(i);
}
const detSc=()=>{const t=document.querySelector('#det .top');if(t)t.classList.toggle('sc',$('det').scrollTop>150)};$('det').addEventListener('scroll',detSc);
const setDt=(k,id)=>{dtab=k;show(id,true)};
const wwSec=i=>{const h=hue(i.app),nm=i._m!=null?i._m:(i.status==="done"?1:0),rv=i._rv!=null?i._rv:(i.review?1:0),ls=i._ls!=null?i._ls:lists.filter(l=>l.ids.includes(i.id)).length;
  return `<div class="tiles"><div class="tile g" onclick="openMem(${i.id})" style="cursor:pointer">${svg(EYE,24)}<b>Miembros</b>${nm}</div><div class="tile m" onclick="openRevs(${i.id})" style="cursor:pointer">${svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',24)}<b>Reseñas</b>${rv}</div><div class="tile bl" onclick="openLsts(${i.id})" style="cursor:pointer">${svg('<rect x="5" y="3" width="11" height="18" rx="2"/><path d="M19 6v12"/>',24)}<b>Listas</b>${ls}</div></div>`};
const pst=i=>{const nm=i._m!=null?i._m:(i.status==="done"?1:0),rv=i._rv!=null?i._rv:(i.review?1:0),ls=i._ls!=null?i._ls:lists.filter(l=>l.ids.includes(i.id)).length;
  return `<div class="pst"><span class="e" title="${L2("Miembros","Members")}" onclick="openMem(${i.id})">${AXI.e}${kfmt(nm)}</span><span class="r" title="${L2("Reseñas","Reviews")}" onclick="openRevs(${i.id})"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z"/></svg>${kfmt(rv)}</span><span class="b" title="${L2("Listas","Lists")}" onclick="openLsts(${i.id})">${AXI.l}${kfmt(ls)}</span></div>`};
const pnl=(i,x)=>{x=x||{};const id=i.id,dn=i.status==="done",log_=!!(i.watchedOn||i.deid);
  return `<div class="pnl"><div class="pn3"><button class="kv ${dn?"on":""}" onclick="qv(${id},'v',1)">${svg((i.dcount||0)>1?EYEN(i.dcount):EYE,38)}${dn?(log_?L2("Registrada","Logged"):L2("Vista","Watched")):L2("Ver","Watch")}</button><button class="kl ${i.liked?"on":""}" onclick="qv(${id},'l',1)">${svg(HEART,38)}${i.liked?L2("Te gustó","Liked"):L2("Me gusta","Like")}</button><button class="kw ${inWl(i)?"on":""}" onclick="qv(${id},'w',1)">${svg(inWl(i)?CLOCKC:CLOCKP,38)}Watchlist</button></div>
  <div class="pnr"><div>${i.rating?L2("Puntuada","Rated"):L2("Puntúa","Rate")}</div><div class="sr big5" data-s="qr:${id}">${sx(i.rating,v=>`qr(${id},${v})`)}</div></div>
  ${(i.dcount>0||log_)?`<button class="pnb" onclick="showAct(${id},'${U.id}')">${L2("Mostrar tu actividad","Show your activity")}</button>`:""}
  ${x.ed?`<button class="pnb" onclick="openLog(${id},0,1,'${x.ed}')">${L2("Editar o eliminar reseña…","Edit or delete review…")}</button>`:""}<button class="pnb" onclick="openLog(${id})">${log_?L2("Reseñar o registrar otra vez…","Review or log again…"):L2("Reseñar o registrar…","Review or log…")}</button><button class="pnb" onclick="pickList(${id})">${L2("Añadir a listas…","Add to lists…")}</button><button class="pnb" onclick="shr(${id})">${x.rv?L2("Compartir esta reseña","Share this review"):L2("Compartir","Share")}</button>${DSK()&&!x.rv&&canEdit(i)?`<button class="pnb" onclick="fmEdit(${id})">${L2("Editar serie…","Edit series…")}</button>`:""}</div>`};
const wbSec=i=>{
  const wt=inWl(i)?`<div class="wbs"><div class="wbh"><span>Quieren verla</span></div><div class="wbr"><div class="wbp"><div class="av2 me">${ini()}</div><small></small></div></div></div>`:"";
  const W=WB[i.sid];if(W){const seen=new Set(),ps=[];W.forEach(x=>{if(seen.has(x.uid)||ps.length>=14)return;seen.add(x.uid);ps.push(`<div class="wbp" ${x.id?`onclick="event.stopPropagation();openReview('${x.id}')"`:""}><div class="av2" style="${avs(x.ap).slice(1)}">${x.t||x.sp?'<span class="wbb">☰</span>':""}</div><small>${x.r?S(x.r):""}</small></div>`)});return (ps.length?`<div class="wbs"><div class="wbh" onclick="openMem(${i.id},'fr')" style="cursor:pointer"><span>Visto por</span><span class="wbc">›</span></div><div class="wbr">${ps.join("")}</div></div>`:"")+wt}
  return wt};
const revSec=i=>{if(!i.review)return"";return `<div class="rvs"><div class="seg d">${[["pop","Populares"],["fr","Amigos"]].map(([k,t])=>`<button class="${k==="pop"?"on":""}" disabled>${t}</button>`).join("")}</div><div class="rvlb">Reseñas populares</div><div class="rvi" onclick="openLog(${i.id})"><div class="rvh"><span class="rvst">${i.rating?S(i.rating):""}${i.liked?' <i class="rvhe">♥</i>':""}</span><span class="rvu">${esc(uname())}<div class="av" style="width:25px;height:25px;font-size:12px">${ini()}</div></span></div>${i.spoil?'<div class="rvsp">⚠ Esta reseña puede contener spoilers</div>':`<p class="rvt">${esc(i.review)}</p>`}</div></div>`};
const EYE='<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',HEART='<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',WARN='<path d="M12 3L2 20h20z"/><path d="M12 10v5M12 18v.5"/>';
const lt=i=>{const st=i.rating?` <span style="color:var(--mute);letter-spacing:1px">${S(i.rating)}</span>`:"";if(i.watchedOn||i.deid||(i.dcount||0)>0)return "Has registrado esta serie"+st;if(i.status==="done"||i.rating)return "Has visto esta serie"+st;if(inWl(i))return "Esta serie está en tu watchlist";return "Puntúa, registra, reseña, añade a una lista + más"};
const sx=(r,cb)=>[1,2,3,4,5].map(n=>`<span class="sx"><b style="width:${r>=n?100:r>=n-.5?50:0}%">★</b>★<button class="hl" onclick="${cb(n-.5)}"></button><button class="hr" onclick="${cb(n)}"></button></span>`).join("");
const refresh=id=>{if($("det").classList.contains("open"))show(id,true);if(curRv&&pgLive("rv"+curRv)){const r=RX[curRv];if(r&&idOf(r.sid)===id)openReview(curRv,1)}};
new MutationObserver(()=>{if(!POP)return;const b=$("ov").querySelector(".k"+POP);POP="";if(b)b.classList.add("pop")}).observe($("ov"),{childList:true});
const closeOv=()=>{$("ov").classList.remove("open");$("ov").style.removeProperty("--bgi")};
const CLOCKP='<circle class="cf" cx="11" cy="11" r="8"/><path class="ch" d="M11 6.5V11l3 1.8"/><circle class="bd" cx="18.5" cy="18.5" r="4.4"/><path class="bx" d="M16.5 18.5h4M18.5 16.5v4"/>',CLOCKC='<circle class="cf" cx="11" cy="11" r="8"/><path class="ch" d="M11 6.5V11l3 1.8"/><circle class="bd" cx="18.5" cy="18.5" r="4.4"/><path class="bx" d="M16.5 18.5h4"/>',EYEN=n=>EYE+'<circle class="bd" cx="18.5" cy="18.5" r="4.6"/><text class="bt" x="18.5" y="'+(n>9?20.8:21)+'" text-anchor="middle" font-size="'+(n>9?5.4:6.8)+'" font-weight="700" stroke="none">'+(n>99?"99":n)+'</text>';
function opts(id){const i=get(id),dn=i.status==="done",log_=!!(i.watchedOn||i.deid);
  {const h=hue(i.app);$("ov").style.setProperty("--bgi",i.cover?`url(${i.cover})`:`linear-gradient(160deg,hsl(${h},60%,38%),hsl(${(h+50)%360},65%,16%))`)}
  $("ov").innerHTML=`<div class="otl"><b>${esc(short(i.title))}</b><span>${esc(i.app)} · ${i.eps} ${i.eps===1?"episodio":"episodios"}</span></div><div class="card">
  <div class="qa"><button class="kv ${dn?"on":""}" onclick="qv(${id},'v')">${svg((i.dcount||0)>1?EYEN(i.dcount):EYE,34)}${dn?(log_?"Registrada":"Vista"):"Ver"}</button><button class="kl ${i.liked?"on":""}" onclick="qv(${id},'l')">${svg(HEART,34)}${i.liked?"Te gustó":"Me gusta"}</button><button class="kw ${inWl(i)?"on":""}" onclick="qv(${id},'w')">${svg(inWl(i)?CLOCKC:CLOCKP,34)}Watchlist</button></div>
  <div class="rt" style="border-top:1px solid var(--bg)"><div class="pl">${i.rating?"Puntuada":"Puntúa"}</div><div class="sr big5" data-s="qr:${id}" style="justify-content:center">${sx(i.rating,v=>`qr(${id},${v})`)}</div></div>
  ${(i.dcount>0||log_)?`<button class="oi" onclick="showAct(${id},'${U.id}')">Mostrar tu actividad</button>`:""}
  <button class="oi" onclick="openLog(${id})">${log_?"Reseñar o registrar otra vez":"Reseñar o registrar"}</button><button class="oi" onclick="pickList(${id})">Añadir a listas</button><button class="oi" onclick="shr(${id})">Compartir</button></div><button class="card" onclick="closeOv()">Hecho</button>`;$("ov").classList.add("open")}
const optsR=id=>{if($("ov").classList.contains("open"))opts(id)};
const lk=i=>!!(i.rating||i.review||i.liked||i.watchedOn);
const inWl=i=>i.status==="want"||!!i.wl;
const hasAct=i=>!!(i.rating||i.review||i.watchedOn||i.deid||(i.dcount||0)>0);
function drop(id){const d=get(id);if(d)comRate(d,0);items=items.filter(i=>i.id!==id);if(d){Object.assign(d,{status:"",watched:0,rating:0,liked:false,wl:false});d._b=iState(d);cache[id]=d}lists.forEach(l=>l.ids=l.ids.filter(x=>x!==id));log=log.filter(e=>e.id!==id)}
