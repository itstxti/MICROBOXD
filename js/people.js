const UN={},UA={};
const uCell=x=>`<div>${poster(x.it)}<div class="ss">${x.r?S(x.r):""}${x.rw?' <i class="drw">'+RWI+'</i>':""}</div></div>`;
const UD={},UT={};
async function uLoad(uid,P){const c=UD[uid];if(c&&Date.now()-c.t<45000)return c;
  const R=await Promise.all([sb.from("user_series").select("*,series(*)").eq("user_id",uid).limit(2000),sb.from("diary_entries").select("*,series(*),review_likes(user_id)").eq("user_id",uid).order("watched_on",{ascending:false}).order("created_at",{ascending:false}).limit(2000),sb.from("lists").select("*,list_items(position,series(*))").eq("user_id",uid).order("created_at",{ascending:false}).limit(200)]);
  R.forEach(x=>{if(x.error)throw x.error});const[us,de,ls]=R,by={};
  const mk=(row,o)=>Object.assign({},sCache(row),{status:"",watched:0,rating:0,liked:false,watchedOn:undefined,review:"",spoil:false,rewatch:false,rtags:[],deid:undefined,fresh:false},o);
  us.data.forEach(x=>{by[x.series_id]=mk(x.series,{status:stIn(x),watched:x.watched_eps||0,rating:+x.rating||0,liked:!!x.liked,wl:!!x.watchlist})});
  de.data.forEach(x=>{const i=by[x.series_id]||(by[x.series_id]=mk(x.series,{rating:+x.rating||0,liked:!!x.liked}));if(!i.watchedOn)Object.assign(i,{watchedOn:Date.parse(x.watched_on+"T12:00:00"),review:x.review||"",spoil:!!x.spoilers,rewatch:!!x.rewatch,rtags:x.tags||[],eid:x.id})});
  if(P)de.data.forEach(x=>nrm(Object.assign({},x,{profiles:P})));const pr=P?Object.assign({},P):null,rows=de.data,L=ls.data.map(l=>({id:l.id,name:l.name,desc:l.description||"",rank:!!l.ranked,tags:l.tags||[],its:(l.list_items||[]).sort((p,q)=>p.position-q.position).map(x=>x.series&&(by[x.series.id]||mk(x.series,{}))).filter(Boolean)}));
  return UD[uid]={t:Date.now(),items:Object.values(by),rows,lists:L,P:pr}}
const U2=(uid,h)=>h.replace(/onclick="show\((\d+)\)"/g,`onclick="uGo('${uid}',$1)"`);
function uGo(uid,id){const D=UD[uid],it=D&&D.items.find(i=>i.id===id);if(it&&it.eid&&RX[it.eid])openReview(it.eid);else show(id)}
async function openUser(uid){if(uid===U.id){$("sub").classList.remove("open");go("me");return}
  const bar=(t,m)=>`<div class="upb"><button class="ub" onclick="subX()">‹ Atrás</button><b>${esc(t||"")}</b>${m||"<span></span>"}</div>`;
  subOpen(bar("")+'<div class="empty ld">Cargando…</div>');
  try{const cnt=(t,c,v)=>sb.from(t).select("*",{count:"exact",head:true}).eq(c,v);
   const R=await Promise.all([sb.from("profiles").select("*").eq("id",uid).single(),cnt("follows","followee_id",uid),cnt("follows","follower_id",uid)]);
   R.forEach(r=>{if(r.error)throw r.error});const[p,fo,fg]=R,P=p.data,D=await uLoad(uid,P),I=D.items,nm=[pname(P),P.family_name].filter(Boolean).join(" "),seen=new Set(),act=[];
   D.rows.slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,40).forEach(x=>{if(!seen.has(x.series_id)){seen.add(x.series_id);act.push({it:sCache(x.series),r:+x.rating||0,rw:!!x.rewatch})}});UA[uid]=act;UN[uid]=nm;
   const rv=D.rows.filter(x=>x.review).slice(0,10).map(x=>nrm(Object.assign({},x,{profiles:P}))),isF=FW.has(uid),fids=(P.favorites||[]).slice(0,4);let fv=[];if(fids.length){const q=await sb.from("series").select("*").in("id",fids);if(!q.error)fv=fids.map(id=>(q.data||[]).find(x=>x.id===id)).filter(Boolean).map(sCache)}
   const wu=webUrl(P.website),LINK='<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    rt=I.filter(x=>x.rating),hb=Array(10).fill(0);rt.forEach(x=>{const j=Math.round(x.rating*2)-1;if(j>=0&&j<10)hb[j]++});const hm=Math.max(1,...hb);
   const yr=new Date().getFullYear(),thisYr=a=>a.filter(i=>i.watchedOn&&new Date(i.watchedOn).getFullYear()===yr).length,dn=I.filter(i=>i.status==="done"),avg=rt.length?(rt.reduce((a,i)=>a+i.rating,0)/rt.length).toFixed(1):"–";
   const row=(l,n,a)=>`<div class="link r" onclick="${a}">${l}<span>${n} ›</span></div>`,tgn=new Set(I.flatMap(i=>i.rtags||[]).concat(D.lists.flatMap(l=>l.tags)).map(t=>t.toLowerCase())).size;
   subRe(U2(uid,bar(nm,`<button class="um" aria-label="Más" onclick="uMenu('${uid}')">•••</button>`)+
   `<div class="uhd"><button class="ufl ${isF?"on":""}" id="fbtn" onclick="fbClick('${uid}')">${isF?"Siguiendo":"Seguir"}</button>${av2(nm,90,P.avatar_path)}<span></span></div>
   <div class="uin">${P.location||wu?`<div class="ulk">${P.location?`<span>${svg(PIN,17)}${esc(P.location)}</span>`:""}${wu?`<a href="${esc(wu)}" target="_blank" rel="noopener noreferrer">${svg(LINK,17)}${esc(wu.replace(/^https?:\/\/(www\.)?/i,"").replace(/\/$/,""))}</a>`:""}</div>`:""}${P.bio?`<p class="pbio">${esc(P.bio)}</p>`:""}</div>
   <div class="stats"><div><b>${I.length}</b>Series</div><div><b>${I.reduce((a,i)=>a+(i.watched||0),0)}</b>Episodios</div><div><b>${avg}</b>Nota media</div></div>
   ${fv.length?`<div class="ulb">Favoritas</div><div class="uph">${fv.map(i=>`<div>${poster(i)}</div>`).join("")}</div>`:""}
   ${act.length?`<div class="ulb">Actividad reciente</div><div class="uph">${act.slice(0,4).map(uCell).join("")}</div><div class="umore" onclick="userAct('${uid}')"><span>Más actividad</span><span class="wbc">›</span></div>`:""}
   ${rt.length?`<div class="uh2"><span class="hs">★</span><div class="bars">${hb.map(n=>`<u title="${n}" style="height:${Math.max(4,n/hm*100)}%"></u>`).join("")}</div><span class="hs">★★★★★</span></div>`:""}
   <div style="margin-top:14px">${row("Series",`${dn.length} / ${thisYr(dn)} este año`,`uPg('${uid}','all')`)}${row("Diario",`${I.filter(i=>i.watchedOn).length} / ${thisYr(I)} este año`,`uPg('${uid}','diary')`)}${row("Listas",D.lists.length,`uPg('${uid}','lst')`)}${row("Reseñas",D.rows.filter(x=>x.review).length,`uPg('${uid}','rev')`)}${row("Watchlist",I.filter(inWl).length,`uPg('${uid}','pend')`)}${row("Me gusta",I.filter(i=>i.liked).length,`uPg('${uid}','lk')`)}${row("Etiquetas",tgn,`uTags('${uid}')`)}${row("Siguiendo",fg.count||0,`openFol('${uid}','ing')`)}${row("Seguidores",`<span id="ufo">${fo.count||0}</span>`,`openFol('${uid}','ers')`)}${row("Estadísticas","",`openStats(UD['${uid}'].items,'${uid}')`)}</div>
   ${rv.length?`<div class="lbl">Reseñas</div><div style="padding:0 14px">${rv.map(rvItem).join("")}</div>`:""}`))}
  catch(e){console.error(e);subRe(bar("")+EME("No se pudo cargar este perfil","Couldn't load this profile"))}}
function uPg(uid,k){const D=UD[uid];if(!D)return;const I=D.items,nm=(UN[uid]||"").split(" ")[0];
  const T={all:["Series",()=>grid(I.filter(i=>i.status==="done"))],diary:["Diario",()=>diaryU(uid,I)],lst:["Listas",()=>uLv(uid)],rev:["Reseñas",()=>{const a=D.rows.filter(x=>x.review).map(x=>nrm(Object.assign({},x,{profiles:D.P})));return a.length?`<div style="padding:0 14px">${a.map(rvItem).join("")}</div>`:EMP("chat","Sin reseñas","Todavía no ha escrito ninguna reseña.")}],pend:["Watchlist",()=>{const w=I.filter(inWl);return w.length?grid(w):EMP("clock","Watchlist vacía","Todavía no ha añadido series a su watchlist.")}],lk:["Me gusta",()=>{const w=I.filter(i=>i.liked);return w.length?grid(w):EMP("heart","Sin me gusta","Todavía no ha marcado ninguna serie con me gusta.")}]}[k];
  subOpen(U2(uid,subBar(T[0])+T[1]()))}
function uLv(uid){const D=UD[uid];return D.lists.length?D.lists.map((l,k)=>`<div class="lst2" onclick="uList('${uid}',${k})"><div class="lh2"><b>${esc(l.name)}</b><span>${l.its.length} ${l.its.length===1?"serie":"series"}</span></div><div class="strip">${l.its.slice(0,7).map(nop).join("")}</div>${l.desc?`<p class="ldc" style="margin:10px 0 0">${esc(l.desc)}</p>`:""}</div>`).join(""):EMP("list","Sin listas","Todavía no ha creado ninguna lista.")}
function uList(uid,k){const l=UD[uid].lists[k];if(!l)return;
  subOpen(U2(uid,subBar(esc(l.name))+`<div class="in">${l.desc?`<p class="pbio" style="margin:0 0 12px">${esc(l.desc)}</p>`:""}${l.tags.length?`<div class="tgs" style="margin:0 0 14px">${l.tags.map(t=>`<span class="tgc">${esc(t)}</span>`).join("")}</div>`:""}<div class="lmeta">${llBox(l.id,uid===U.id)}</div></div>${l.its.length?grid(l.its,"g3"):EMV(0)}`));llLoad(l.id)}
function uTags(uid,re){const D=UD[uid];if(!D)return;const st=UT[uid]=UT[uid]||{tab:"s",srt:"n"},L=st.tab==="l",m={};
  (L?D.lists:D.items).forEach(x=>((L?x.tags:x.rtags)||[]).forEach(t=>{const k=t.toLowerCase();m[k]=m[k]||{t,n:0};m[k].n++}));
  const a=Object.values(m).sort(st.srt==="n"?(x,y)=>y.n-x.n||x.t.localeCompare(y.t):(x,y)=>x.t.localeCompare(y.t));
  const sb_=`<button aria-label="Ordenar" onclick="UT['${uid}'].srt=UT['${uid}'].srt==='n'?'a':'n';uTags('${uid}',1)" style="min-width:44px;display:flex;justify-content:flex-end;background:none;border:0;color:var(--mute);padding:0;cursor:pointer">${svg('<path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4"/>',24)}</button>`;
  const h=`<div class="lbar"><button onclick="subX()">‹ Atrás</button><b>Etiquetas</b>${sb_}</div><div class="seg tgtabs">${[["s","Series"],["l","Listas"]].map(([k,l])=>`<button class="${st.tab===k?"on":""}" onclick="UT['${uid}'].tab='${k}';uTags('${uid}',1)">${l}</button>`).join("")}</div>`+
   (a.length?a.map(x=>`<div class="tgrw" data-v="${esc(x.t)}" onclick="uTag('${uid}',this.dataset.v)"><span class="tgc">${esc(x.t)}</span><b>${x.n}</b><i>›</i></div>`).join(""):EMP("tag","Sin etiquetas","Todavía no usa etiquetas."));
  re?subRe(h):subOpen(h)}
function uTag(uid,t){const D=UD[uid],st=UT[uid],k=t.toLowerCase(),L=st.tab==="l",chip=`<span class="tgc" style="height:30px;font-size:15px">${esc(t)}</span>`;
  if(L){const f=D.lists.map((l,i)=>[l,i]).filter(([l])=>l.tags.some(x=>x.toLowerCase()===k));subOpen(subBar(chip)+f.map(([l,i])=>`<div class="lst2" onclick="uList('${uid}',${i})"><div class="lh2"><b>${esc(l.name)}</b><span>${l.its.length} ${l.its.length===1?"serie":"series"}</span></div><div class="strip">${l.its.slice(0,7).map(nop).join("")}</div></div>`).join(""))}
  else subOpen(U2(uid,subBar(chip)+grid(D.items.filter(i=>(i.rtags||[]).some(x=>x.toLowerCase()===k)),"g3")))}
function userAct(uid){const a=UA[uid]||[];subOpen(U2(uid,subBar("Actividad de "+esc((UN[uid]||"").split(" ")[0]))+`<div class="grid g3">${a.map(uCell).join("")}</div>`))}
function fbClick(uid){FW.has(uid)?askUnfollow(uid):toggleFollow(uid)}
function askUnfollow(uid){const n=(UN[uid]||"").split(" ")[0];$("ov").style.setProperty("--bgi","none");
  $("ov").innerHTML=`<div class="card"><button class="oi" style="border-top:0;font-size:17px;padding:18px;color:#ff453a" onclick="closeOv();toggleFollow('${uid}')">Dejar de seguir${n?" a "+esc(n):""}</button></div><button class="card" style="color:var(--b);font-size:17px" onclick="closeOv()">Cancelar</button>`;$("ov").classList.add("open")}
function uMenu(uid){const f=FW.has(uid);$("ov").style.setProperty("--bgi","none");
  $("ov").innerHTML=`<div class="card"><button class="oi" style="border-top:0" onclick="closeOv();${f?`askUnfollow('${uid}')`:`toggleFollow('${uid}')`}">${f?"Dejar de seguir":"Seguir"}</button><button class="oi" onclick="closeOv();shU('${uid}')">Compartir perfil</button></div><button class="card" onclick="closeOv()">Hecho</button>`;$("ov").classList.add("open")}
async function shU(uid){const t=`${UN[uid]||"Perfil"} en Microboxd`;try{if(navigator.share)await navigator.share({text:t});else{await navigator.clipboard.writeText(t);toast("Copiado al portapapeles")}}catch(e){}}
async function toggleFollow(uid){const on=!FW.has(uid);on?FW.add(uid):FW.delete(uid);
  const paint=v=>{mflPaint(uid,v);const b=$("fbtn");if(b){b.textContent=v?"Siguiendo":"Seguir";b.classList.toggle("on",v)}const c=$("ufo");if(c)c.textContent=Math.max(0,(+c.textContent||0)+(v?1:-1))};
  paint(on);FEED=null;HR=null;WB={};WBt={};
  try{if(on)await ck(sb.from("follows").insert({follower_id:U.id,followee_id:uid}));else await ck(sb.from("follows").delete().eq("follower_id",U.id).eq("followee_id",uid))}
  catch(e){on?FW.delete(uid):FW.add(uid);paint(!on);toast("No se pudo actualizar")}}
const meActLocal=()=>{let h="";const g=[];log.forEach(e=>{const l=g[g.length-1];if(l&&l.id===e.id&&Math.abs(l.ts-e.ts)<2500)l.es.push(e);else g.push({id:e.id,ts:e.ts,title:e.title,es:[e]})});
      h=g.length?g.map(o=>{const it=get(o.id),t=o.es.map(e=>e.t),r=(o.es.find(e=>e.t==="rate")||{}).r,v=[];
        if(t.includes("add")&&t.length===1)v.push("Añadiste");else{if(t.includes("done"))v.push("viste");if(it&&it.liked&&(t.includes("done")||t.includes("rate")))v.push("marcaste con me gusta");if(t.includes("rate"))v.push("puntuaste")}
        let x=v.length>1?v.slice(0,-1).join(", ")+" y "+v[v.length-1]:v[0];x=x.charAt(0).toUpperCase()+x.slice(1);
        return `<div class="act" ${it?`onclick="show(${it.id})" style="cursor:pointer"`:""}><div class="av">${ini()}</div><div>${x} <b>${esc(short(o.title))}</b>${r?" "+S(r):""}${t.includes("add")&&t.length===1?"":" el "+fmt(o.ts)}</div><span class="t">${rel(o.ts)}</span></div>`}).join(""):EMP("bolt","Todavía no hay actividad","Cuando puntúes, reseñes o añadas series, aparecerá aquí.");return h};
const loadingH='<div class="empty ld">Cargando…</div>';
let MYACT=null,MYACTs=0;
async function loadMyAct(){MYACTs=0;
  try{const[e,f,l,w]=await Promise.all([
      sb.from("diary_entries").select(RSEL+",series(*)").eq("user_id",U.id).order("created_at",{ascending:false}).limit(40),
      sb.from("follows").select("followee_id,created_at").eq("follower_id",U.id).order("created_at",{ascending:false}).limit(30),
      sb.from("review_likes").select("entry_id,created_at").eq("user_id",U.id).order("created_at",{ascending:false}).limit(30),
      sb.from("user_series").select("updated_at,series(*)").eq("user_id",U.id).eq("status","want").order("updated_at",{ascending:false}).limit(30)]);
    if(e.error)throw e.error;
    const wl=w.error?[]:w.data.filter(x=>x.series).map(x=>({k:"w",ts:Date.parse(x.updated_at),it:sCache(x.series)}));
    const out=e.data.map(x=>{nrm(x);return{k:"e",ts:Date.parse(x.created_at),x}});
    if(!f.error&&f.data.length){const p=await sb.from("profiles").select("id,username,display_name,avatar_path").in("id",f.data.map(x=>x.followee_id)),pm={};(p.data||[]).forEach(q=>pm[q.id]=q);
      f.data.forEach(x=>{const q=pm[x.followee_id];if(q){UN[q.id]=pname(q);out.push({k:"f",ts:Date.parse(x.created_at),uid:q.id,n:pname(q)})}})}
    if(!l.error&&l.data.length){const d=await sb.from("diary_entries").select(RSEL+",series(*)").in("id",l.data.map(x=>x.entry_id)),dm={};(d.data||[]).forEach(q=>dm[q.id]=q);
      l.data.forEach(x=>{const q=dm[x.entry_id];if(q){const r=nrm(q);out.push({k:"l",ts:Date.parse(x.created_at),r,it:sCache(q.series)})}})}
    out.push(...wl);MYACT=out.sort((a,b)=>b.ts-a.ts).slice(0,60)}
  catch(err){console.error(err);MYACT=MYACT||[]}
  if(tab==="act"&&seg.act==="me")render()}
const meActH=()=>{if(!sb||!U)return meActLocal();
  if(MYACT===null||MYACTs){const first=MYACT===null;if(first)MYACT=0;loadMyAct()}
  if(MYACT===0)return loadingH;
  if(!MYACT.length)return EMP("bolt","Todavía no hay actividad","Cuando puntúes, reseñes o añadas series, aparecerá aquí.");
  const av=av2(uname(),32,prof.avd||prof.av),T=o=>`<span class="t">${rel(o.ts)}</span>`,Y=L2("","You ");
  const join=v=>v.length>1?v.slice(0,-1).join(", ")+L2(" y "," and ")+v[v.length-1]:v[0];
  return MYACT.map(o=>{const t=T(o);
    if(o.k==="w")return `<div class="act fa" onclick="show(${o.it.id})" style="cursor:pointer">${av}<div>${L2("Añadiste","You added")} <b>${esc(short(o.it.title))}</b> ${L2("a tu watchlist","to your watchlist")}</div>${t}</div>`;
    if(o.k==="f")return `<div class="act fa" onclick="openUser('${o.uid}')" style="cursor:pointer">${av}<div>${L2("Seguiste a","You followed")} <b>${esc(o.n)}</b></div>${t}</div>`;
    if(o.k==="l")return `<div class="act fa" onclick="openReview('${o.r.id}')" style="cursor:pointer">${av}<div>${LANG==="es"?"Diste like a la reseña de "+esc(o.r.u)+(o.r.r?" "+S(o.r.r):"")+" sobre ":"You liked "+esc(o.r.u)+"’s "+(o.r.r?S(o.r.r)+" ":"")+"review of "}<b>${esc(short(o.it.title))}</b></div>${t}</div>`;
    const x=o.x,it=sCache(x.series),r=+x.rating||0;
    if(x.review){const body=x.spoilers?`<i>⚠ ${L2("Contiene spoilers","Contains spoilers")}</i>`:esc(x.review.slice(0,300));
      return `<div class="act fa rich" onclick="openReview('${x.id}')" style="cursor:pointer">${av}<div>${x.rewatch?L2("Volviste a ver","You rewatched"):L2("Viste","You watched")}<div class="fxft">${esc(short(it.title))}${it.app?` <small>${esc(it.app)}</small>`:""}</div><div class="fxfs">${r?`<span class="fxst">${S(r)}</span>`:""}${x.liked?'<span class="fxhr">♥</span>':""}</div><div class="fxfb">${nop(it)}<p>${body}</p></div></div>${t}</div>`}
    const v=[x.rewatch?L2("volviste a ver","rewatched"):L2("viste","watched")];if(x.liked)v.push(L2("marcaste con me gusta","liked"));if(r)v.push(L2("puntuaste","rated"));
    const sent=Y+join(v);
    return `<div class="act fa" onclick="openReview('${x.id}')" style="cursor:pointer">${av}<div>${LANG==="es"?sent.charAt(0).toUpperCase()+sent.slice(1):sent} <b>${esc(short(it.title))}</b>${r?` <span class="fxst">${S(r)}</span>`:""} ${L2("el","on")} ${adt(x.watched_on,o.ts)}</div>${t}</div>`}).join("")};
async function loadFeed(){if(!FW.size){FEED=[];if(tab==="act"||(tab==="home"&&DSK()))render();return}
  try{const ids=[...FW];
    const[e,f,l,w,pf]=await Promise.all([
      sb.from("diary_entries").select(RSEL+",series(*)").in("user_id",ids).order("created_at",{ascending:false}).limit(40),
      sb.from("follows").select("follower_id,followee_id,created_at").in("follower_id",ids).order("created_at",{ascending:false}).limit(20),
      sb.from("review_likes").select("entry_id,user_id,created_at").in("user_id",ids).order("created_at",{ascending:false}).limit(20),
      sb.from("user_series").select("user_id,updated_at,series(*)").in("user_id",ids).eq("status","want").order("updated_at",{ascending:false}).limit(20),
      sb.from("profiles").select("id,username,display_name,avatar_path,pronouns").in("id",ids)]);
    if(e.error)throw e.error;
    const out=e.data.map(x=>({k:"e",ts:Date.parse(x.created_at),x}));
    const need=new Set(),pm={};
    if(!f.error)f.data.forEach(x=>{need.add(x.follower_id);need.add(x.followee_id)});
    if(!l.error)l.data.forEach(x=>need.add(x.user_id));
    e.data.forEach(x=>{if(x.profiles)pm[x.user_id]=x.profiles});(pf.data||[]).forEach(q=>pm[q.id]=q);
    if(!w.error)w.data.forEach(x=>{const a=pm[x.user_id];if(a&&x.series)out.push({k:"w",ts:Date.parse(x.updated_at),a,it:sCache(x.series)})});
    const miss=[...need].filter(i=>!pm[i]);
    if(miss.length){const p=await sb.from("profiles").select("id,username,display_name,avatar_path").in("id",miss);(p.data||[]).forEach(q=>pm[q.id]=q)}
    if(!f.error)f.data.forEach(x=>{if(x.followee_id===U.id)return;const a=pm[x.follower_id],t=pm[x.followee_id];if(a&&t)out.push({k:"f",ts:Date.parse(x.created_at),a,uid:x.followee_id,t:pname(t)})});
    if(!l.error&&l.data.length){const d=await sb.from("diary_entries").select(RSEL+",series(*)").in("id",l.data.map(x=>x.entry_id)),dm={};(d.data||[]).forEach(q=>dm[q.id]=q);
      l.data.forEach(x=>{const q=dm[x.entry_id],a=pm[x.user_id];if(q&&a&&q.user_id!==x.user_id)out.push({k:"l",ts:Date.parse(x.created_at),a,x:q})})}
    FEED=out.sort((a,b)=>b.ts-a.ts).slice(0,50)}catch(e){console.error(e);FEED=[]}if(tab==="act"||(tab==="home"&&seg.home==="series"&&DSK()))render()}
const L2=(es,en)=>LANG==="es"?es:en;
const feedVerb=x=>{const v=[x.rewatch?L2("volvió a ver","rewatched"):L2("vio","watched")];if(x.liked)v.push(L2("marcó con me gusta","liked"));if(+x.rating)v.push(L2("puntuó","rated"));if(x.review)v.push(L2("reseñó","reviewed"));
  return v.length>1?v.slice(0,-1).join(", ")+L2(" y "," and ")+v[v.length-1]:v[0]};
const feedH=()=>{if(FEED===null){FEED=0;loadFeed()}if(FEED===0)return loadingH;
  if(!FEED.length)return FW.size?EMP("users","Todo tranquilo por aquí","Las personas que sigues aún no han registrado nada."):EMP("users","Sigue a otros miembros","Verás aquí lo que ven y puntúan los demás.","Buscar miembros","go('search')");
  return FEED.map(o=>{const t=`<span class="t">${rel(o.ts)}</span>`;
    if(o.k==="w"){const pr=o.a.pronouns,pw=LANG==="es"?"su":pr==="Ella"?"her":pr==="Él"?"his":"their";return `<div class="act fa" onclick="show(${o.it.id})" style="cursor:pointer">${av2(pname(o.a),32,o.a.avatar_path)}<div><span class="fxnm">${esc(pname(o.a))}</span> ${L2("añadió","added")} <b>${esc(short(o.it.title))}</b> ${L2("a su watchlist","to "+pw+" watchlist")}</div>${t}</div>`}
    if(o.k==="f")return `<div class="act fa" onclick="openUser('${o.uid}')" style="cursor:pointer">${av2(pname(o.a),32,o.a.avatar_path)}<div><span class="fxnm">${esc(pname(o.a))}</span> ${L2("siguió a","followed")} <b>${esc(o.t)}</b></div>${t}</div>`;
    if(o.k==="l"){const r=nrm(o.x),it=sCache(o.x.series);return `<div class="act fa" onclick="openReview('${r.id}')" style="cursor:pointer">${av2(pname(o.a),32,o.a.avatar_path)}<div><span class="fxnm">${esc(pname(o.a))}</span> ${LANG==="es"?"dio like a la reseña de "+esc(r.u)+(r.r?" "+S(r.r):"")+" sobre ":"liked "+esc(r.u)+"’s "+(r.r?S(r.r)+" ":"")+"review of "}<b>${esc(short(it.title))}</b></div>${t}</div>`}
    const x=o.x,r=nrm(x),it=sCache(x.series),n=pname(x.profiles),A=av2(n,32,x.profiles&&x.profiles.avatar_path),ti=esc(short(it.title));
    if(x.review){const body=x.spoilers?`<i>⚠ ${L2("Contiene spoilers","Contains spoilers")}</i>`:esc(x.review.slice(0,300));
      return `<div class="act fa rich" onclick="openReview('${x.id}')" style="cursor:pointer">${A}<div><span class="fxnm">${esc(n)}</span> ${x.rewatch?L2("volvió a ver","rewatched"):L2("vio","watched")}<div class="fxft">${ti}${it.app?` <small>${esc(it.app)}</small>`:""}</div><div class="fxfs">${r.r?`<span class="fxst">${S(r.r)}</span>`:""}${r.hl?'<span class="fxhr">♥</span>':""}</div><div class="fxfb">${nop(it)}<p>${body}</p></div></div>${t}</div>`}
    return `<div class="act fa" onclick="openReview('${x.id}')" style="cursor:pointer">${A}<div><span class="fxnm">${esc(n)}</span> ${feedVerb(x)} <b>${ti}</b>${r.r?` <span class="fxst">${S(r.r)}</span>`:""} ${L2("el","on")} ${adt(x.watched_on,o.ts)}</div>${t}</div>`}).join("")};
async function loadInc(){try{
  const[f,m,ml]=await Promise.all([sb.from("follows").select("follower_id,created_at,profiles!follows_follower_id_fkey(username,display_name,avatar_path)").eq("followee_id",U.id).order("created_at",{ascending:false}).limit(30),sb.from("diary_entries").select(RSEL+",series(*)").eq("user_id",U.id).neq("review","").limit(100),sb.from("lists").select("id,name").eq("user_id",U.id).limit(200)]);
  if(f.error)throw f.error;if(m.error)throw m.error;const out=f.data.map(x=>({k:"f",uid:x.follower_id,n:pname(x.profiles),ap:x.profiles&&x.profiles.avatar_path,ts:Date.parse(x.created_at)})),tt={};m.data.forEach(x=>{nrm(x);tt[x.id]=x.series&&x.series.title});
  const q=[];
  if(m.data.length)q.push(sb.from("review_likes").select("entry_id,user_id,created_at,profiles(username,display_name,avatar_path)").in("entry_id",m.data.map(x=>x.id)).order("created_at",{ascending:false}).limit(30).then(l=>{if(!l.error)l.data.forEach(x=>out.push({k:"l",uid:x.user_id,n:pname(x.profiles),ap:x.profiles&&x.profiles.avatar_path,ts:Date.parse(x.created_at),t:tt[x.entry_id]||"",eid:x.entry_id}))}));
  if(!ml.error&&ml.data.length){const ln={};ml.data.forEach(x=>ln[x.id]=x.name);
    q.push(sb.from("list_likes").select("list_id,user_id,created_at,profiles(username,display_name,avatar_path)").in("list_id",ml.data.map(x=>x.id)).order("created_at",{ascending:false}).limit(30).then(l=>{if(!l.error)l.data.forEach(x=>out.push({k:"ll",uid:x.user_id,n:pname(x.profiles),ap:x.profiles&&x.profiles.avatar_path,ts:Date.parse(x.created_at),t:ln[x.list_id]||"",lid:x.list_id}))}))}
  await Promise.all(q);
  INC=out.sort((a,b)=>b.ts-a.ts)}catch(e){console.error(e);INC=[]}if(tab==="act")render()}
const incGo=(k,id)=>{const l=lists.find(x=>x.sid===id);if(l)openList(l.id)};
const incH=()=>{if(INC===null){INC=0;loadInc()}if(INC===0)return loadingH;if(!INC.length)return EMP("bell","Sin actividad entrante","Aquí verás quién te sigue y los me gusta a tus reseñas y listas.");
  return INC.map(x=>{const go=x.k==="f"?`openUser('${x.uid}')`:x.k==="ll"?`incGo(0,'${x.lid}')`:`openReview('${x.eid}')`,
    txt=x.k==="f"?L2("empezó a seguirte","started following you"):x.k==="ll"?L2("dio like a tu lista ","liked your list ")+`<b>${esc(x.t)}</b>`:L2("dio like a tu reseña de ","liked your review of ")+`<b>${esc(short(x.t))}</b>`;
    return `<div class="act fa" onclick="${go}" style="cursor:pointer">${av2(x.n,32,x.ap)}<div><span class="fxnm">${esc(x.n)}</span> ${txt}</div><span class="t">${rel(x.ts)}</span></div>`}).join("")};
async function loadHR(){try{const{data,error}=await sb.from("diary_entries").select(RSEL+",series(*)").neq("review","").order("created_at",{ascending:false}).limit(30);if(error)throw error;HR=data}catch(e){console.error(e);HR=[]}if(tab==="home"&&seg.home==="rev")render()}
const hrH=()=>{if(HR===null){HR=0;loadHR()}if(HR===0)return loadingH;if(!HR.length)return EMP("chat","Aún no hay reseñas","Escribe una desde la ficha de una serie.");
  return HR.map(x=>{const r=nrm(x),it=sCache(x.series);return `<div class="row" onclick="openReview('${r.id}')" style="cursor:pointer">${nop(it)}<div><b>${esc(short(it.title))}</b><div class="ss">${r.r?S(r.r):""}${r.hl?" ♥":""} <span>${esc(r.u)}</span></div>${r.sp?"<i>⚠ Esta reseña puede contener spoilers</i>":esc(r.t.slice(0,300))}</div></div>`}).join("")};
