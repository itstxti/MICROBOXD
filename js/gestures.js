let GL=null;
async function loadGL(){try{const{data,error}=await sb.from("lists").select("id,user_id,name,description,ranked,created_at,profiles(username,display_name,avatar_path),list_items(position,series(*))").order("created_at",{ascending:false}).limit(60);if(error)throw error;
 GL=data.map(l=>({id:l.id,uid:l.user_id,u:pname(l.profiles),ap:apOf(l.user_id,l.profiles),name:l.name,desc:l.description,rank:l.ranked,its:(l.list_items||[]).slice().sort((p,q)=>p.position-q.position).map(x=>x.series&&sCache(x.series)).filter(Boolean)}));LSD.__all=GL}catch(e){console.error(e);GL=[]}if(tab==="home"&&seg.home==="lst")render()}
const glH=()=>{if(GL===null){GL=0;loadGL()}if(GL===0)return loadingH;return(GL.length?`<div class="gls">${GL.map(lsRow).join("")}</div>`:EMP("list",L2("Aún no hay listas","No lists yet"),L2("Las listas de otros miembros aparecerán aquí.","Lists from other members will show up here."),L2("Nueva lista","New list"),"editList()"))+(GL.length?'<div style="text-align:center;padding:10px 0 24px"><button class="emb" onclick="editList()">Nueva lista</button></div>':"")};
const actDsk=b=>`<div class="dpv dp2"><div><div class="dpsh"><span>${[["fr","Amigos"],["me","Tú"],["in","Entrantes"]].map(([k,l])=>`<a class="${seg.act===k?"dpon":""}" onclick="setSeg('${k}')">${l}</a>`).join("")}</span></div><div class="dacts">${b}</div></div><div class="dpsd2"><div class="dsh"><span>Siguiendo</span><a onclick="openFol(U.id,'ing')">${FW.size}</a></div><div class="dsh"><span>Seguidores</span><a onclick="openFol(U.id,'fol')">${MYFO||0}</a></div></div></div>`;

/* ===== Arrastrar para puntuar (como Letterboxd) ===== */
let sd0=null,sdDrag=false,sdSwallow=false;
const sdVal=(g,x)=>{const sx=g.querySelectorAll(".sx"),a=sx[0].getBoundingClientRect(),b=sx[1].getBoundingClientRect(),st=b.left-a.left;if(x<a.left-14)return 0;return Math.min(5,Math.max(.5,Math.ceil((x-a.left)/st*2)/2))};
const sdPaint=(g,v)=>g.querySelectorAll(".sx").forEach((el,k)=>{el.querySelector("b").style.width=(v>=k+1?100:v>=k+.5?50:0)+"%"});
document.addEventListener("pointerdown",e=>{const g=e.target.closest&&e.target.closest(".sr[data-s]");if(!g||g.querySelectorAll(".sx").length<2)return;sd0={g,x:e.clientX,id:e.pointerId,v:null};sdDrag=false},true);
document.addEventListener("pointermove",e=>{if(!sd0||e.pointerId!==sd0.id)return;if(!sdDrag&&Math.abs(e.clientX-sd0.x)<8)return;sdDrag=true;try{sd0.g.setPointerCapture(e.pointerId)}catch(_){}
  const v=sdVal(sd0.g,e.clientX);if(v!==sd0.v){sd0.v=v;sdPaint(sd0.g,v);if(navigator.vibrate)navigator.vibrate(6)}},true);
const sdEnd=e=>{if(!sd0||e.pointerId!==sd0.id)return;const o=sd0,drag=sdDrag&&o.v!=null;sd0=null;
  if(drag){sdSwallow=true;setTimeout(()=>sdSwallow=false,0);const[k,id]=o.g.dataset.s.split(":");if(k==="rate")rate(+id,o.v,1);else if(k==="qr")qr(+id,o.v,1);else if(k==="lgr"){lg.r=o.v;drawLog()}}sdDrag=false};
document.addEventListener("pointerup",sdEnd,true);document.addEventListener("pointercancel",e=>{if(sd0&&e.pointerId===sd0.id){const o=sd0;sd0=null;sdDrag=false;if(o.g.isConnected){const[k,id]=o.g.dataset.s.split(":");if(k==="rate")show(+id,true);else if(k==="qr")opts(+id);else drawLog()}}},true);
document.addEventListener("click",e=>{if(sdSwallow){e.stopPropagation();e.preventDefault()}},true);
/* ===== PWA ===== */
let IP=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();IP=e});
const isSA=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone;
const instH=()=>isSA()?"":IP?`<div class="slb">App</div><div class="sgrp"><button class="oi" style="color:var(--b)" onclick="instApp()">Instalar Microboxd en tu móvil</button></div>`:/iphone|ipad|ipod/i.test(navigator.userAgent)?`<div class="slb">App</div><div class="shint" style="padding-top:0">Para tenerla en el inicio: pulsa <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>.</div>`:"";
async function instApp(){if(!IP)return;IP.prompt();try{await IP.userChoice}catch(e){}IP=null;drawSet()}
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
/* ===== Social: reseñas, perfiles, seguir ===== */
let RV={},RVt={},RX={},FW=new Set(),PEND=new Set(),VIS={},REQN=0,rvTab="pop",rsTab="all",FEED=null,INC=null,HR=null,MEM=[],mq=0,memT=0,subH=[];
const RSEL="id,user_id,series_id,watched_on,rating,liked,rewatch,review,spoilers,tags,created_at,profiles!diary_entries_user_id_fkey(username,display_name,avatar_path),review_likes(user_id)";
const pname=p=>p?(p.display_name||p.username):"usuario";
const nrm=x=>{const r={id:x.id,uid:x.user_id,sid:x.series_id,u:pname(x.profiles),ap:x.user_id===U.id?(prof.avd||prof.av||(x.profiles&&x.profiles.avatar_path)):(x.profiles&&x.profiles.avatar_path),r:+x.rating||0,hl:!!x.liked,rw:!!x.rewatch,t:x.review||"",sp:!!x.spoilers,g:x.tags||[],ts:Date.parse(x.created_at),wd:x.watched_on,lk:(x.review_likes||[]).length,me:(x.review_likes||[]).some(l=>l.user_id===U.id)};RX[r.id]=r;return r};
const avu=p=>!p?"":p.startsWith("data:")?p:cvr(p),avs=p=>p?`;background-image:url(${avu(p)})`:"";
const av2=(n,s,p)=>`<div class="av" style="width:${s}px;height:${s}px${avs(p)}"></div>`;
const sCache=r=>{const id=idOf(r.id);return get(id)||(cache[id]=mapS(r))};
const subBar=(t)=>`<div class="lbar"><button onclick="subX()">‹ Atrás</button><b>${t}</b><span style="min-width:44px"></span></div>`;
function subOpen(h){const s=$("sub");if(s.classList.contains("open"))subH.push(s.innerHTML);else subH=[];$("det").style.zIndex="";s.innerHTML=h;s.classList.add("open");s.scrollTop=0}
const subRe=h=>{$("sub").innerHTML=h};
function subX(){const s=$("sub");if(subH.length)s.innerHTML=subH.pop();else s.classList.remove("open")}
const rvItem=r=>`<div class="rvi" onclick="openReview('${r.id}')"><div class="rvh"><span class="rvst">${r.r?S(r.r):""}${r.hl?' <i class="rvhe">♥</i>':""}${r.rw?' <i class="drw">'+RWI+'</i>':""}</span><span class="rvu" onclick="event.stopPropagation();openUser('${r.uid}')" style="cursor:pointer">${esc(r.u)}${av2(r.u,32,r.ap)}</span></div>${r.sp?'<div class="rvsp">⚠ Esta reseña puede contener spoilers</div>':`<p class="rvt">${esc(r.t)}</p>`}${r.lk?`<div class="rvl">♥ ${r.lk}</div>`:""}</div>`;
const rvItem2=r=>`<div class="rvi2" onclick="openReview('${r.id}')"><div class="rvh2"><span class="rvst">${r.r?S(r.r):""}${r.hl?' <i class="rvhe">♥</i>':""}${r.rw?' <i class="drw">'+RWI+'</i>':""}</span><span class="rvu" onclick="event.stopPropagation();openUser('${r.uid}')" style="cursor:pointer">${esc(r.u)}${av2(r.u,26,r.ap)}</span></div>${r.sp?'<div class="rvsp">⚠ Esta reseña puede contener spoilers</div>':`<p class="rvt2">${esc(r.t)}</p>`}${r.lk?`<div class="rvl">♥ ${r.lk}</div>`:""}</div>`;

/* Actividad de una persona en una serie: Diario / Reseñas (como en Letterboxd) */
let ACT={},ACTERR={},actTab="d",actU="";
const actMe=()=>actU===U.id,actHd=i=>actMe()?"Tu actividad en "+short(i.title):"Actividad de "+(UN[actU]||"")+" en "+short(i.title);
function drawAct(iid,re){const i=get(iid),es=ACT[iid+":"+actU],me=actMe(),dk=DSK(),T=dk?actTab:(actTab==="r"?"r":"d");let body;
  const diaryBody=()=>{if(!es)return '<div class="empty ld">Cargando…</div>';
    if(!es.length)return me?EMP("book","Sin entradas","Todavía no has registrado esta serie en tu diario.","Reseñar o registrar",`subX();openLog(${iid})`):EMP("book","Sin entradas","Todavía no ha registrado esta serie en su diario.");
    let m="";return es.map(x=>{const t=new Date(Date.parse((x.wd||"")+"T12:00:00")),ok=!isNaN(t),k=ok?t.toLocaleDateString(LANG,{month:"long",year:"numeric"}).replace(" de "," "):"Sin fecha",hd=k!==m?(m=k,`<div class="dmh">${k}</div>`):"";
    return hd+`<div class="de" onclick="openReview('${x.id}')"><div class="ddn">${ok?t.getDate():"–"}</div>${poster(i).replace(/onclick="[^"]*"/,"")}<div class="dti"><div class="dtl"><b>${esc(short(i.title))}</b> <small>${esc(i.app)}</small></div><div class="dst">${x.r?`<span class="dsr">${S(x.r)}</span>`:""}${x.hl?'<i class="dhe">♥</i>':""}${x.rw?'<i class="drw">'+RWI+'</i>':""}${x.t||x.sp?'<i class="drv">☰</i>':""}</div></div></div>`}).join("")};
  const revBody=()=>{if(!es)return '<div class="empty ld">Cargando…</div>';const l=es.filter(x=>x.t||x.sp);return l.length?`<div class="rvl2">${l.map(rvItem2).join("")}</div>`:EMP("chat","Sin reseñas",me?"Todavía no has escrito ninguna reseña de esta serie.":"Todavía no ha escrito ninguna reseña de esta serie.")};
  if(!dk){body=T==="r"?revBody():diaryBody();
    const h=pgH("act"+iid,actHd(i),[["d","Diario"],["r","Reseñas"]],T,"actGo",iid,body);re?subRe(h):subOpen(h);return}
  /* ===== Escritorio: como la página de actividad de Letterboxd ===== */
  if(T==="a"){if(!es)body='<div class="empty ld">Cargando…</div>';
    else if(!es.length)body=me?EMP("book",L2("Sin actividad","No activity"),L2("Todavía no has registrado esta serie en tu diario.","You haven't logged this series in your diary yet."),L2("Reseñar o registrar","Review or log"),`subX();openLog(${iid})`):EMP("book",L2("Sin actividad","No activity"),L2("Todavía no ha registrado esta serie en su diario.","They haven't logged this series in their diary yet."));
    else body='<div class="dax-feed">'+es.map(x=>actRow(i,x)).join("")+`</div><div class="dax-end">${L2("Fin de la actividad reciente","End of recent activity")}</div>`}
  else if(T==="d")body=diaryBody();
  else if(T==="r")body=revBody();
  else{const d=LSD[i.sid];
    if(!d)body=ACTERR[iid]?EME("No se pudieron cargar las listas","Couldn't load the lists"):'<div class="empty ld">Cargando…</div>';
    else{const l=d.filter(x=>x.uid===actU);body=l.length?`<div class="lsl">${l.map(lsRow).join("")}</div>`:EMP("list",L2("Sin listas","No lists"),me?"No has añadido esta serie a ninguna lista.":L2("Todavía no ha añadido esta serie a ninguna lista.","They haven't added this series to any list yet."),"","","sm")}}
  const h=actSerieD(i,body,T);re?subRe(h):subOpen(h)}
const actDate=wd=>{const t=Date.parse((wd||"")+"T12:00:00");return isNaN(t)?"":new Date(t).toLocaleDateString(LANG,{weekday:"long",day:"numeric",month:"short",year:"numeric"})};
const actVerbs=x=>{const me=actMe(),v=[x.rw?L2(me?"volviste a ver":"volvió a ver","rewatched"):L2(me?"viste":"vio","watched")];
  if(x.hl)v.push(L2(me?"marcaste con me gusta":"marcó con me gusta","liked"));
  if(x.r)v.push(L2(me?"puntuaste":"puntuó","rated"));
  if(x.t||x.sp)v.push(L2(me?"reseñaste":"reseñó","reviewed"));
  return v.length<2?v[0]:v.slice(0,-1).join(", ")+L2(" y "," and ")+v[v.length-1]};
const actRow=(i,x)=>{const dt=actDate(x.wd),who=actMe()?L2("Tú ","You "):`<b>${esc(x.u)}</b> `;
  return `<div class="dax-r" onclick="openReview('${x.id}')">${av2(x.u,30,x.ap)}<div class="dax-tx">${who}${actVerbs(x)} <b>${esc(short(i.title))}</b>${x.r?` <span class="dax-st">${S(x.r)}</span>`:""}${dt?" "+L2("el ","on ")+dt:""}</div><span class="dax-ago">${x.ts?rel(x.ts):""}</span></div>`};
const kfmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,"")+"M":n>=1e3?(n/1e3).toFixed(1).replace(/\.0$/,"")+"K":String(n);
const AXI={e:'<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
  l:'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.2"/><rect x="13" y="3" width="8" height="8" rx="1.2"/><rect x="3" y="13" width="8" height="8" rx="1.2"/><rect x="13" y="13" width="8" height="8" rx="1.2"/></svg>',
  h:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'};
function actSerieD(i,body,T){const iid=i.id,me=actMe(),d=MB[i.sid],l=LSD[i.sid],h=hue(i.title);
  const bg=i.cover?`url('${i.cover.replace(/'/g,"%27")}')`:`linear-gradient(135deg,hsl(${h},55%,34%),hsl(${(h+60)%360},50%,16%))`;
  const sx=(c,k,n)=>`<span class="${c}">${AXI[k]}${kfmt(n)}</span>`;
  const stats=(d?sx("e","e",d.m.length)+sx("l","h",d.m.filter(x=>x.hl).length):"")+(l?sx("b","l",l.length):"");
  const tabs=[["a",L2("Actividad","Activity")],["d",L2("Diario","Diary")],["r",L2("Reseñas","Reviews")],["l",L2("Listas","Lists")]];
  return `<div data-pg="act${iid}" class="dax"><div class="dax-bg"><i style="background-image:${bg}"></i></div><div class="dax-in"><div class="dax-main">
  <button class="dax-back" onclick="subX()">‹ ${L2("Serie","Series")}</button>
  <div class="dax-lb">${me?L2("Tu actividad en","Your activity for"):L2("Actividad de "+esc((UN[actU]||"").split(" ")[0])+" en","Activity by "+esc((UN[actU]||"").split(" ")[0])+" on")}</div>
  <h1 class="dax-h">${esc(short(i.title))} <small>${esc(i.app)}</small></h1>
  <div class="dax-tabs"><div>${tabs.map(([k,t])=>`<button class="${T===k?"on":""}" onclick="actGo('${k}',${iid})">${t}</button>`).join("")}</div><span class="dax-who">${me?L2("Tú","You"):esc(UN[actU]||"")}</span></div>
  ${body}</div>
  <aside class="dax-side">${poster(i).replace(/onclick="[^"]*"/,'onclick="subX()"')}<div class="dax-stats">${stats}</div></aside></div></div>`}
function actGo(k,iid){actTab=k;drawAct(iid,1)}
async function showAct(id,uid){const i=get(id);if(!i)return;closeOv();actU=uid||U.id;actTab=DSK()?"a":"d";const key=id+":"+actU;delete ACT[key];delete ACTERR[id];drawAct(id,0);
  if(DSK()&&sb&&i.sid){/* escritorio: estadísticas y listas de la serie (el feed no depende de ellas) */
    Promise.allSettled([MB[i.sid]?0:loadMem(i),LSD[i.sid]?0:loadLs(i)]).then(r=>{if(r[1].status==="rejected")ACTERR[id]=1;if(pgLive("act"+id)&&ACT[key])drawAct(id,1)})}
  try{let es=[];if(sb&&i.sid){const r=await sb.from("diary_entries").select(RSEL).eq("series_id",i.sid).eq("user_id",actU).order("watched_on",{ascending:false}).order("created_at",{ascending:false}).limit(100);if(r.error)throw r.error;es=r.data.map(nrm)}
    ACT[key]=es;if(pgLive("act"+id))drawAct(id,1)}
  catch(e){console.error(e);if(pgLive("act"+id))subRe(DSK()?actSerieD(i,EME("No se pudo cargar la actividad","Couldn't load the activity"),actTab):pgH("act"+id,actHd(i),[["d","Diario"],["r","Reseñas"]],actTab==="r"?"r":"d","actGo",id,EME("No se pudo cargar la actividad","Couldn't load the activity")))}}

/* Siguiendo / Seguidores */
let MYFO=null;
async function loadMyFo(){if(!sb||!U)return;
  try{const r=await sb.from("follows").select("*",{count:"exact",head:true}).eq("followee_id",U.id);if(r.error)throw r.error;MYFO=r.count||0;const c=$("myfo");if(c)c.textContent=MYFO;const d=$("dpfo");if(d)d.textContent=MYFO}catch(e){console.error(e)}}
async function openFol(uid,k){const ing=k==="ing",me=uid===U.id,t=ing?"Siguiendo":"Seguidores";
  subOpen(subBar(t)+'<div class="empty ld">Cargando…</div>');
  try{const a=await sb.from("follows").select(ing?"followee_id":"follower_id").eq(ing?"follower_id":"followee_id",uid).limit(1000);if(a.error)throw a.error;
    const ids=a.data.map(x=>ing?x.followee_id:x.follower_id);let ps=[];
    if(ids.length){const b=await sb.from("profiles").select("id,username,display_name,avatar_path").in("id",ids);if(b.error)throw b.error;ps=b.data}
    ps.sort((x,y)=>pname(x).localeCompare(pname(y)));
    const row=q=>{const n=pname(q);UN[q.id]=n;return `<div class="mbr" onclick="openUser('${q.id}')">${av2(n,33,apOf(q.id,q))}<span class="mbn">${esc(n)}</span><span></span><span></span><span></span></div>`};
    const emp=ing?EMP("users",me?"Aún no sigues a nadie":"Aún no sigue a nadie",me?"Las personas que sigas aparecerán aquí.":""):EMP("users","Aún no hay seguidores",me?"Cuando alguien te siga, aparecerá aquí.":"");
    if($("sub").classList.contains("open"))subRe(subBar(t)+(ps.length?`<div class="mbl">${ps.map(row).join("")}</div>`:emp))}
  catch(e){console.error(e);if($("sub").classList.contains("open"))subRe(subBar(t)+EME("No se pudo cargar la lista","Couldn't load the list"))}}

/* Sinopsis: expandir/colapsar con animación */
function synTog(el){const c=el.classList;if(!c.contains("cl")&&!c.contains("open"))return;
  const col=parseFloat(getComputedStyle(el).lineHeight)*3;
  if(c.contains("cl")){
    el.style.maxHeight=col+"px";c.replace("cl","open");void el.offsetHeight;el.style.maxHeight=el.scrollHeight+"px";
    const done=e=>{if(e.propertyName!=="max-height")return;el.removeEventListener("transitionend",done);if(c.contains("open"))el.style.maxHeight=""};
    el.addEventListener("transitionend",done)}
  else{
    el.style.maxHeight=el.scrollHeight+"px";c.replace("open","cl");void el.offsetHeight;el.style.maxHeight=col+"px";
    const done=e=>{if(e.propertyName!=="max-height")return;el.removeEventListener("transitionend",done);if(c.contains("cl"))el.style.maxHeight=""};
    el.addEventListener("transitionend",done)}}

