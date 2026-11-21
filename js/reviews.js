/* ===== Miembros y Listas de una serie ===== */
let MB={},LSD={},memTab="all",lsTab="all";
const apOf=(uid,p)=>uid===U.id?(prof.avd||prof.av||(p&&p.avatar_path)):(p&&p.avatar_path);
const subClose=()=>{subH=[];$("sub").classList.remove("open")};
const pgH=(pg,title,tabs,cur,fn,iid,body)=>`<div data-pg="${pg}"><div class="rvhd"><div class="rvbar"><button onclick="subX()" aria-label="Atrás"><span class="rvch">‹</span> Serie</button><b>${esc(title)}</b></div><div class="seg">${tabs.map(([k,l])=>`<button class="${cur===k?"on":""}" onclick="${fn}('${k}',${iid})">${l}</button>`).join("")}</div></div>${body}</div>`;
const pgLive=pg=>$("sub").classList.contains("open")&&$("sub").querySelector('[data-pg="'+pg+'"]');

/* Miembros */
async function loadMem(i){
  const[a,b,c]=await Promise.all([
    sb.from("user_series").select("user_id,rating,liked,updated_at,profiles(username,display_name,avatar_path)").eq("series_id",i.sid).eq("status","done").order("updated_at",{ascending:false}).limit(300),
    sb.from("profiles").select("id,username,display_name,avatar_path").contains("favorites",[i.sid]).limit(300),
    sb.from("diary_entries").select(RSEL).eq("series_id",i.sid).order("created_at",{ascending:false}).limit(500)]);
  if(a.error)throw a.error;if(b.error)throw b.error;
  /* última entrada del diario de cada persona (si la tiene) */
  const e={};if(!c.error)(c.data||[]).forEach(x=>{const r=nrm(x);if(!e[r.uid])e[r.uid]=r.id});
  const m=a.data.map(x=>({uid:x.user_id,u:pname(x.profiles),ap:apOf(x.user_id,x.profiles),r:+x.rating||0,hl:!!x.liked})),by={};m.forEach(x=>by[x.uid]=x);
  const f=b.data.map(p=>by[p.id]||{uid:p.id,u:pname(p),ap:apOf(p.id,p),r:0,hl:false});
  MB[i.sid]={m,f,e}}
const memRow=(x,rv,e)=>`<div class="mbr" onclick="${e&&e[x.uid]?`openReview('${e[x.uid]}')`:`openUser('${x.uid}')`}">${av2(x.u,33,x.ap)}<span class="mbn">${esc(x.u)}</span><span class="mbs">${x.r?S(x.r):""}</span><span class="mbh">${x.hl?'<i class="rvhe">♥</i>':""}</span><span class="mbi">${rv.has(x.uid)?"☰":""}</span></div>`;
function drawMem(iid,re){const i=get(iid),d=MB[i.sid];let body;
  if(!d)body='<div class="empty ld">Cargando…</div>';
  else{const l=({all:d.m,lk:d.m.filter(x=>x.hl),fan:d.f,fr:d.m.filter(x=>FW.has(x.uid))})[memTab],rv=new Set((RV[i.sid]||[]).map(r=>r.uid)),
    msg=({all:"Nadie ha visto esta serie todavía.",lk:"A nadie le ha gustado todavía.",fan:"Nadie la tiene entre sus favoritas.",fr:"Ninguna persona a la que sigues la ha visto."})[memTab];
    body=l.length?`<div class="mbl">${l.map(x=>memRow(x,rv,d.e)).join("")}</div>`:EMP("users",L2("Sin miembros","No members"),msg,"","","sm")}
  const h=pgH("mem"+iid,"Miembros de "+short(i.title),[["all","Todos"],["lk","Likes"],["fan","Fans"],["fr","Amigos"]],memTab,"memGo",iid,body);
  re?subRe(h):subOpen(h)}
function memGo(k,iid){memTab=k;drawMem(iid,1)}
async function openMem(iid,tab){const i=get(iid);if(!i)return;memTab=tab||"all";
  if(!sb||!i.sid){subOpen(pgH("mem"+iid,"Miembros de "+short(i.title),[["all","Todos"]],"all","memGo",iid,EMS()));return}
  drawMem(iid,0);
  try{await loadMem(i);if(pgLive("mem"+iid))drawMem(iid,1)}
  catch(e){console.error(e);if(pgLive("mem"+iid))subRe(pgH("mem"+iid,"Miembros de "+short(i.title),[["all","Todos"]],"all","memGo",iid,EME("No se pudieron cargar los miembros","Couldn't load the members")))}}

/* Listas */
async function loadLs(i){
  const a=await sb.from("list_items").select("list_id").eq("series_id",i.sid).limit(200);if(a.error)throw a.error;
  const ids=[...new Set(a.data.map(x=>x.list_id))];if(!ids.length){LSD[i.sid]=[];return}
  const b=await sb.from("lists").select("id,user_id,name,description,ranked,created_at,profiles(username,display_name,avatar_path),list_items(position,series(*))").in("id",ids).order("created_at",{ascending:false}).limit(100);if(b.error)throw b.error;
  LSD[i.sid]=b.data.map(l=>({id:l.id,uid:l.user_id,u:pname(l.profiles),ap:apOf(l.user_id,l.profiles),name:l.name,desc:l.description,rank:l.ranked,
    its:(l.list_items||[]).slice().sort((p,q)=>p.position-q.position).map(x=>x.series&&sCache(x.series)).filter(Boolean)}))}
const lsFind=lid=>{for(const k in LSD){const l=LSD[k].find(x=>x.id===lid);if(l)return l}};
const lsRow=l=>`<div class="lsr" onclick="openLsItem('${l.id}')"><div class="lsh"><b>${esc(l.name)}</b><span class="rvu" onclick="event.stopPropagation();openUser('${l.uid}')">${esc(l.u)}${av2(l.u,26,l.ap)}</span></div><div class="strip">${l.its.slice(0,7).map(nop).join("")}</div>${l.desc?`<p class="lsd">${esc(l.desc)}</p>`:""}</div>`;
function drawLs(iid,re){const i=get(iid),d=LSD[i.sid];let body;
  if(!d)body='<div class="empty ld">Cargando…</div>';
  else{const l=({all:d,fr:d.filter(x=>FW.has(x.uid)),me:d.filter(x=>x.uid===U.id)})[lsTab],
    msg=({all:"Esta serie aún no está en ninguna lista.",fr:"Ninguna persona a la que sigues la ha añadido a una lista.",me:"No has añadido esta serie a ninguna lista."})[lsTab];
    body=l.length?`<div class="lsl">${l.map(lsRow).join("")}</div>`:EMP("list",L2("Sin listas","No lists"),msg,"","","sm")}
  const h=pgH("ls"+iid,"Listas con "+short(i.title),[["all","Todas"],["fr","Amigos"],["me","Tuyas"]],lsTab,"lsGo",iid,body);
  re?subRe(h):subOpen(h)}
function lsGo(k,iid){lsTab=k;drawLs(iid,1)}
async function openLsts(iid){const i=get(iid);if(!i)return;lsTab="all";
  if(!sb||!i.sid){subOpen(pgH("ls"+iid,"Listas con "+short(i.title),[["all","Todas"]],"all","lsGo",iid,EMS()));return}
  drawLs(iid,0);
  try{await loadLs(i);if(pgLive("ls"+iid))drawLs(iid,1)}
  catch(e){console.error(e);if(pgLive("ls"+iid))subRe(pgH("ls"+iid,"Listas con "+short(i.title),[["all","Todas"]],"all","lsGo",iid,EME("No se pudieron cargar las listas","Couldn't load the lists")))}}
function openLsItem(lid){const l=lsFind(lid);if(!l)return;
  if(l.uid===U.id&&lists.some(x=>x.id===idOf(l.id))){subClose();$("det").classList.remove("open");openList(idOf(l.id));return}
  openFL(lid)}
function openFL(lid){const l=lsFind(lid);if(!l)return;
  const body=l.its.length?l.its.map((i,k)=>`<div class="lrw" onclick="subClose();show(${i.id})">${l.rank?`<span class="lrn">${k+1}</span>`:""}<div class="lpo">${nop(i)}</div><div class="dti"><b>${esc(short(i.title))}</b><small>${esc(i.app)}</small></div></div>`).join(""):EMV(0);
  subOpen(subBar("Lista")+`<div class="in"><div class="lown" onclick="openUser('${l.uid}')" style="cursor:pointer">${av2(l.u,24,l.ap)}<span>${esc(l.u)}</span></div><h2 class="lnm">${esc(l.name)}</h2>${l.desc?`<p class="ldc">${esc(l.desc)}</p>`:""}<div class="lmeta">${llBox(l.id,l.uid===U.id)}</div>${body}</div>`);llLoad(l.id)}
let WB={},WBt={};
async function loadWb(i,force){if(!sb||!i.sid)return;if(!force&&Date.now()-(WBt[i.sid]||0)<30000)return;WBt[i.sid]=Date.now();
  try{const ids=[...FW];if(!ids.length){WB[i.sid]=[];return}
   const[a,b]=await Promise.all([sb.from("diary_entries").select(RSEL).eq("series_id",i.sid).in("user_id",ids).order("created_at",{ascending:false}).limit(100),
    sb.from("user_series").select("user_id,rating,liked,updated_at,profiles(username,display_name,avatar_path)").eq("series_id",i.sid).eq("status","done").in("user_id",ids).order("updated_at",{ascending:false})]);
   if(a.error)throw a.error;
   const w=a.data.map(nrm),have=new Set(w.map(x=>x.uid));
   /* amigos que la marcaron como vista sin entrada en el diario */
   if(!b.error)(b.data||[]).forEach(r=>{if(have.has(r.user_id))return;have.add(r.user_id);w.push({id:"",uid:r.user_id,sid:i.sid,u:pname(r.profiles),ap:r.profiles&&r.profiles.avatar_path,r:+r.rating||0,hl:!!r.liked,rw:false,t:"",sp:false,wd:"",lk:0,me:false})});
   const o=JSON.stringify(WB[i.sid]);WB[i.sid]=w;if(o!==JSON.stringify(WB[i.sid])&&curDet===i.id&&$("det").classList.contains("open"))show(i.id,true)}catch(e){console.error(e)}}
async function loadRevs(i,force){if(!sb||!i.sid)return;if(!force&&Date.now()-(RVt[i.sid]||0)<30000)return;RVt[i.sid]=Date.now();
  try{const{data,error}=await sb.from("diary_entries").select(RSEL).eq("series_id",i.sid).neq("review","").order("created_at",{ascending:false}).limit(100);if(error)throw error;
   const o=JSON.stringify(RV[i.sid]);RV[i.sid]=data.map(nrm);if(o!==JSON.stringify(RV[i.sid])&&curDet===i.id&&$("det").classList.contains("open"))show(i.id,true)}catch(e){console.error(e)}}
const revsSec=i=>{const a=RV[i.sid];if(!a)return revSec(i);if(!a.length)return"";
  const l=rvTab==="fr"?a.filter(r=>FW.has(r.uid)):[...a].sort((x,y)=>y.lk-x.lk||y.ts-x.ts);
  return `<div class="rvs"><div class="seg d" style="margin:6px 0 4px">${[["pop","Populares"],["fr","Amigos"]].map(([k,t])=>`<button class="${rvTab===k?"on":""}" onclick="rvTab='${k}';show(${i.id},true)">${t}</button>`).join("")}</div><div class="rvlb">${rvTab==="fr"?"Reseñas de amigos":"Reseñas populares"}</div>${l.length?l.slice(0,4).map(rvItem).join(""):'<div class="chint">Nadie a quien sigues ha reseñado esta serie.</div>'}<div class="rvall" onclick="openRevs(${i.id})">Todas las reseñas <span>›</span></div></div>`};
let curRv=0;
function openReview(id,re){const r=RX[id];if(!r)return;curRv=id;UN[r.uid]=r.u;const i=get(idOf(r.sid)),mine=r.uid===U.id;
  if(DSK()){
   const hd=`<div class="rvd" data-pg="rv${id}"><div class="rvd-in">
    <div class="rvd-l">${i?`<div class="rvd-po" onclick="subX();show(${i.id})">${nop(i)}</div>`:""}</div>
    <div class="rvd-m"><button class="dax-back" onclick="subX()">‹ ${L2("Atrás","Back")}</button>
     <div class="rvd-by" onclick="openUser('${r.uid}')">${av2(r.u,26,r.ap)}<span>${L2("Reseña de","Review by")} <b>${esc(r.u)}</b></span></div>
     <h1 class="rvd-ti" ${i?`onclick="subX();show(${i.id})"`:""}>${esc(i?short(i.title):"")}${i?` <small>${esc(i.app)}</small>`:""}</h1>
     <div class="rvd-sr">${r.r?S(r.r):""}${r.hl?' <i class="rvhe">♥</i>':""}</div>
     <div class="rvd-wd">${r.rw?L2("Vuelto a ver el","Rewatched on"):L2("Visto el","Watched on")} ${fsh(Date.parse(r.wd+"T12:00:00"))}</div>
     ${r.t?`<p class="rvd-tx">${esc(r.t)}</p>`:""}
     <div class="rvlk">${mine?`<button class="hb2" aria-label="Me gusta" onclick="toast('No puedes dar like a tu propia reseña')" style="display:flex">${svg(HEART,22)}</button>`:`<button class="hb2 ${r.me?"on":""}" aria-label="Me gusta" onclick="likeRev('${r.id}')" style="display:flex">${svg(HEART,22)}</button>`}<span>${r.lk?`${r.lk} ${r.lk===1?"like":"likes"}`:"Aún sin likes"}</span></div>
     ${r.g&&r.g.length?`<div class="tgs">${r.g.map(t=>mine?`<span class="tgc" data-v="${esc(t)}" onclick="openTagTop(this.dataset.v)" style="cursor:pointer">${esc(t)}</span>`:`<span class="tgc">${esc(t)}</span>`).join("")}</div>`:""}
    </div>
    <div class="rvd-r">${i?pnl(i,mine?{rv:1,ed:id}:{rv:1}):""}</div>
   </div></div>`;
   re?subRe(hd):subOpen(hd);return}
  const dots='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2"><circle cx="4" cy="13" r="2.6"/><circle cx="13" cy="13" r="2.6"/><circle cx="22" cy="13" r="2.6"/></svg>';
  const h=`<div class="lbar"><button onclick="subX()">‹ Atrás</button><b>Reseña</b><button aria-label="Más" onclick="rvMenu('${id}')" style="min-width:44px;display:flex;justify-content:flex-end">${dots}</button></div><div class="in rvx">
  <div class="rvtop"><div style="flex:1;min-width:0"><div class="lown" onclick="openUser('${r.uid}')" style="cursor:pointer">${av2(r.u,28,r.ap)}<span>${esc(r.u)}</span></div>
  <h2 class="rvti" ${i?`onclick="subX();show(${i.id})" style="cursor:pointer"`:""}>${esc(i?short(i.title):"")}${i?` <small>${esc(i.app)}</small>`:""}</h2><div class="rvsr">${r.r?S(r.r):""}${r.hl?' <i class="rvhe">♥</i>':""}</div><div class="rvwd">${r.rw?"Vuelto a ver el":"Visto el"} ${fsh(Date.parse(r.wd+"T12:00:00"))}</div></div>${i?`<div class="rvpo" onclick="subX();show(${i.id})" style="cursor:pointer">${nop(i)}</div>`:""}</div>
  ${r.t?`<p class="rvbody">${esc(r.t)}</p>`:""}${r.g&&r.g.length?`<div class="tgs">${r.g.map(t=>mine?`<span class="tgc" data-v="${esc(t)}" onclick="openTagTop(this.dataset.v)" style="cursor:pointer">${esc(t)}</span>`:`<span class="tgc">${esc(t)}</span>`).join("")}</div>`:""}
  <div class="rvlk">${mine?`<button class="hb2" aria-label="Me gusta" onclick="toast('No puedes dar like a tu propia reseña')" style="display:flex">${svg(HEART,28)}</button>`:`<button class="hb2 ${r.me?"on":""}" aria-label="Me gusta" onclick="likeRev('${r.id}')" style="display:flex">${svg(HEART,28)}</button>`}<span>${r.lk?`${r.lk} ${r.lk===1?"like":"likes"}`:"Aún sin likes"}</span></div>
  <div class="rvhr"></div>${i?`<div class="rvpl"><button class="pill" onclick="showAct(${i.id},'${r.uid}')">${av2(r.u,18,r.ap)}Actividad ›</button><button class="pill" onclick="subX();show(${i.id})">Serie ›</button></div>`:""}</div>`;
  re?subRe(h):subOpen(h)}
function rvMenu(id){const r=RX[id];if(!r)return;const i=get(idOf(r.sid)),mine=r.uid===U.id;
  {const h=i?hue(i.app):0;$("ov").style.setProperty("--bgi",i?(i.cover?`url(${i.cover})`:`linear-gradient(160deg,hsl(${h},60%,38%),hsl(${(h+50)%360},65%,16%))`):"none")}
  $("ov").innerHTML=`<div class="otl"><b>${esc(i?short(i.title):"")}</b><span>${r.rw?"Vuelto a ver el":"Visto el"} ${fsh(Date.parse(r.wd+"T12:00:00"))}</span></div><div class="card">${mine?`<button class="oi d" onclick="askRvDel('${id}')">Eliminar</button><button class="oi" onclick="closeOv();openLog(${i?i.id:0},0,1,'${id}')">Editar</button>`:""}${i?`<button class="oi" onclick="closeOv();pickList(${i.id})">Añadir serie a listas</button>`:""}<button class="oi" onclick="closeOv();${i?`shr(${i.id})`:""}">Compartir</button></div><button class="card" onclick="closeOv()">Hecho</button>`;$("ov").classList.add("open")}
function askRvDel(id){$("ov").style.setProperty("--bgi","none");
  $("ov").innerHTML=`<div class="card"><button class="oi" style="border-top:0;font-size:17px;padding:18px;color:#ff453a" onclick="closeOv();rvDel('${id}',1)">Eliminar entrada</button></div><button class="card" style="color:var(--b);font-size:17px" onclick="closeOv()">Cancelar</button>`;$("ov").classList.add("open")}
async function rvDel(id,ok){const r=RX[id];if(!r||r.uid!==U.id)return;if(!ok){askRvDel(id);return}closeOv();
  try{const{error}=await sb.from("diary_entries").delete().eq("id",id);if(error)throw error}catch(e){toast("No se pudo eliminar");return}
  const i=get(idOf(r.sid));
  dq=dq.filter(e=>e.id!==id);DEN=DEN.filter(e=>e.id!==id);
  for(const k in ACT)ACT[k]=ACT[k].filter(x=>x.id!==id);
  if(i){i.dcount=Math.max(0,(i.dcount||1)-1);
   /* la serie sigue vista y conserva su nota; si quedan otras entradas, la más reciente pasa a ser la actual */
   let nx=null;try{const q=await sb.from("diary_entries").select("id,watched_on,review,spoilers,rewatch,tags").eq("user_id",U.id).eq("series_id",i.sid).order("watched_on",{ascending:false}).order("created_at",{ascending:false});if(!q.error){i.dcount=q.data.length;nx=q.data[0]||null}}catch(e){}
   if(nx)Object.assign(i,{watchedOn:Date.parse(nx.watched_on+"T12:00:00"),review:nx.review||"",spoil:!!nx.spoilers,rewatch:!!nx.rewatch,rtags:nx.tags||[],deid:nx.id});
   else if(i.deid===id||i.dcount===0)Object.assign(i,{review:"",watchedOn:undefined,spoil:false,rewatch:false,rtags:[],deid:undefined,dcount:0});
   if(i.status!=="done"){i.status="done";i.watched=i.eps}
   save()}
  $("lgs").classList.remove("open");RV={};RVt={};WB={};WBt={};HR=null;subX();if(i&&pgLive("act"+i.id)&&ACT[i.id+":"+U.id]){actU=U.id;drawAct(i.id,1)}if(i&&curDet===i.id&&$("det").classList.contains("open")){loadRevs(i,true);loadWb(i,true);show(i.id,true)}render()}
async function likeRev(id){const r=RX[id];if(!r||r.uid===U.id)return;const on=!r.me;r.me=on;r.lk+=on?1:-1;openReview(id,1);if($("det").classList.contains("open"))show(curDet,true);HR=null;
  try{if(on)await ck(sb.from("review_likes").insert({entry_id:id,user_id:U.id}));else await ck(sb.from("review_likes").delete().eq("entry_id",id).eq("user_id",U.id))}
  catch(e){r.me=!on;r.lk+=on?-1:1;openReview(id,1);toast("No se pudo guardar el me gusta")}}
async function openRevs(iid){const i=get(iid);if(!i)return;if(!RV[i.sid])await loadRevs(i,true);rsTab="all";drawRevs(iid,0)}
function drawRevs(iid,re){const i=get(iid),a=RV[i.sid]||[];
  const f=({all:a,fr:a.filter(r=>FW.has(r.uid)),me:a.filter(r=>r.uid===U.id),lk:a.filter(r=>r.hl)})[rsTab].slice().sort((x,y)=>y.lk-x.lk||y.ts-x.ts);
  const rr=a.filter(r=>r.r),hb=Array(10).fill(0);rr.forEach(r=>{const j=Math.round(r.r*2)-1;if(j>=0&&j<10)hb[j]++});const hm=Math.max(1,...hb),ht=hb.indexOf(Math.max(...hb)),av=rr.length?(rr.reduce((t,r)=>t+r.r,0)/rr.length).toFixed(1).replace(".",","):"",
    fr=[...new Map(a.filter(r=>FW.has(r.uid)).map(r=>[r.uid,r])).values()].slice(0,6);
  const sd=`<aside class="rvsd">${rr.length?`<div class="rvsh">${L2("Valoraciones","Ratings")}</div><div class="rvhs">${hb.map((n,j)=>`<u class="${j===ht?"mx":""}" style="height:${n?Math.max(6,n/hm*100):3}%"></u>`).join("")}</div><div class="rvhl"><span>★</span><b>${av}</b><span>★★★★★</span></div><div class="rvhn">${rr.length} ${L2(rr.length===1?"valoración":"valoraciones",rr.length===1?"rating":"ratings")}</div>`:""}${fr.length?`<div class="rvsh">${L2("Amigos que la reseñaron","Friends who reviewed")}</div><div class="rvfr">${fr.map(r=>av2(r.u,40,r.ap)).join("")}</div>`:""}</aside>`;
  const h=`<div class="rvw"><div class="rvhd"><div class="rvbar"><button onclick="subX()" aria-label="Atrás"><span class="rvch">‹</span> Serie</button><b>${L2("Reseñas de","Reviews of")} ${esc(short(i.title))}</b></div><div class="rvdk">${nop(i)}</div><div class="rvdm">${esc(i.app)}${i.eps?` · ${i.eps} ${L2("episodios","episodes")}`:""}</div><div class="seg">${[["all","Todos"],["fr","Amigos"],["me","Tú"],["lk","Favoritas"]].map(([k,l])=>`<button class="${rsTab===k?"on":""}" onclick="rsTab='${k}';drawRevs(${iid},1)">${l}</button>`).join("")}</div></div><div class="rvbd"><div class="rvl2">${f.length?f.map(rvItem2).join(""):EMP("chat",L2("Sin reseñas","No reviews"),L2("Todavía no hay reseñas aquí.","There are no reviews here yet."),"","","sm")}</div>${sd}</div></div>`;
  re?subRe(h):subOpen(h)}
