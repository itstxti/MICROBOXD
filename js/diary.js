const tm=()=>$("mnu").classList.toggle("open");
function goQ(v){closeDet();tab="search";q=v;render()}
function closeDet(){const d=$("det");if(!d.classList.contains("open")||d.classList.contains("out"))return;d.classList.add("out");render();setTimeout(()=>{d.classList.remove("open","out")},190)}
function rate(id,n,d){const i=get(id);setR(i,d?n:(i.rating===n?0:n));save();show(id,true)}
function rev(id,v){get(id).review=v;save()}
function del(id){DEN=DEN.filter(e=>e.iid!==id);const d=get(id);if(d)comRate(d,0);items=items.filter(i=>i.id!==id);if(d){Object.assign(d,{status:"",watched:0,rating:0,liked:false,wl:false});d._b=iState(d);cache[id]=d}lists.forEach(l=>l.ids=l.ids.filter(x=>x!==id));log=log.filter(e=>e.id!==id);save();closeDet()}

const rvl=r=>r.length?r.map(i=>`<div class="row" onclick="show(${i.id})" style="cursor:pointer">${poster(i)}<div><b>${esc(short(i.title))}</b><div class="ss">${S(i.rating)}${i.liked?" ♥":""}</div>${i.spoil?"<i>⚠ Contiene spoilers</i>":esc(i.review)}</div></div>`).join(""):EMN();
const nop=i=>poster(i).replace(/onclick="[^"]*"/,"");
const lv=(a=lists,nw=1,em)=>(nw?`<div class="link" style="margin-top:0;border-top:0" onclick="editList()">Nueva lista <span>＋</span></div>`:"")+(a.length?a.map(l=>{const its=l.ids.map(get).filter(Boolean);return `<div class="lst2" onclick="openList(${l.id})"><div class="lh2"><b>${esc(l.name)}</b><span>${its.length} ${its.length===1?"serie":"series"}</span></div><div class="strip">${its.slice(0,7).map(nop).join("")}</div>${l.desc?`<p class="ldc" style="margin:10px 0 0">${esc(l.desc)}</p>`:""}</div>`}).join(""):em?EMN():EMP("list","Aún no tienes listas","Agrupa tus series en listas: tus mejores venganzas, maratones de fin de semana…",nw?"":"Nueva lista","editList()"));
const dOpen=async(eid,iid)=>{if(!RX[eid]&&sb){try{const{data}=await sb.from("diary_entries").select(RSEL).eq("id",eid).single();if(data)nrm(data)}catch(e){}}if(RX[eid])openReview(eid);else show(iid)};
const diaryEn=(en,get,clk,own)=>{
  if(own)items.forEach(i=>{if(i.watchedOn&&!en.some(e=>e.iid===i.id))en.push({id:i.deid||"",iid:i.id,wd:new Date(i.watchedOn).toISOString().slice(0,10),r:i.rating||0,hl:!!i.liked,rw:!!i.rewatch,t:i.review||"",sp:!!i.spoil})});
  en=en.filter(e=>get(e.iid)).map((e,k)=>[e,k]).sort((a,b)=>a[0].wd<b[0].wd?1:a[0].wd>b[0].wd?-1:a[1]-b[1]).map(x=>x[0]);
  if(!en.length)return own?EMP("book","Tu diario está vacío","Marcar una serie como vista no la añade aquí: usa “Registrar en el diario” para anotar cuándo la viste."):EMP("book","Diario vacío","Todavía no ha registrado nada en su diario.");
  let m="";return en.map(e=>{const i=get(e.iid),t=new Date(e.wd+"T12:00:00"),k=t.toLocaleDateString(LANG,{month:"long",year:"numeric"}).replace(" de "," "),hd=k!==m?(m=k,`<div class="dmh">${k}</div>`):"";
   return hd+`<div class="de" onclick="${clk(e,i)}"><div class="ddn">${t.getDate()}</div>${nop(i)}<div class="dti"><div class="dtl"><b>${esc(short(i.title))}</b> <small>${esc(i.app)}</small></div><div class="dst">${e.r?`<span class="dsr">${S(e.r)}</span>`:""}${e.hl?'<i class="dhe">♥</i>':""}${e.rw?'<i class="drw">'+RWI+'</i>':""}${e.t||e.sp?'<i class="drv">☰</i>':""}</div></div></div>`}).join("")};
const diaryOwn=()=>diaryEn(DEN.slice(),get,(e,i)=>e.id?`dOpen('${e.id}',${i.id})`:`show(${i.id})`,1);
const diaryU=(uid,I)=>{const D=UD[uid];if(!D)return diary(I);return diaryEn(D.rows.map(x=>({id:x.id,iid:idOf(x.series_id),wd:x.watched_on,r:+x.rating||0,hl:!!x.liked,rw:!!x.rewatch,t:x.review||"",sp:!!x.spoilers})),id=>I.find(i=>i.id===id),(e,i)=>RX[e.id]?`openReview('${e.id}')`:`uGo('${uid}',${i.id})`,0)};
const diary=(src)=>{if(!src)return diaryOwn();const d=(src||items).filter(i=>i.watchedOn).sort((a,b)=>b.watchedOn-a.watchedOn);if(!d.length)return src?EMP("book","Diario vacío","Todavía no ha registrado nada en su diario."):EMP("book","Tu diario está vacío","Marcar una serie como vista no la añade aquí: usa “Registrar en el diario” para anotar cuándo la viste.");let m="";
  return d.map(i=>{const t=new Date(i.watchedOn),k=t.toLocaleDateString(LANG,{month:"long",year:"numeric"}).replace(" de "," "),hd=k!==m?(m=k,`<div class="dmh">${k}</div>`):"";
   return hd+`<div class="de" onclick="show(${i.id})"><div class="ddn">${t.getDate()}</div>${poster(i).replace(/onclick="[^"]*"/,"")}<div class="dti"><div class="dtl"><b>${esc(short(i.title))}</b> <small>${esc(i.app)}</small></div><div class="dst">${i.rating?`<span class="dsr">${S(i.rating)}</span>`:""}${i.liked?'<i class="dhe">♥</i>':""}${i.rewatch?'<i class="drw">'+RWI+'</i>':""}${i.review?'<i class="drv">☰</i>':""}</div></div></div>`}).join("")};
const tagsAll=()=>[...new Set(items.flatMap(i=>i.rtags||[]))];
function sheet(t,b,rt){$("lst").innerHTML=`<div class="lbar lbt"><button onclick="$('lst').classList.remove('open','top');render()">‹ ${esc(uname())}</button><b>${t}</b>${rt||'<span style="min-width:44px"></span>'}</div>${b}`;$("lst").classList.add("open");$("lst").scrollTop=0}
const openRev=()=>sheet("Reseñas",rvl(items.filter(i=>i.review)));
const openLikes=()=>{bfCtx=openLikes;sheet("Me gusta",bfGrid(items.filter(i=>i.liked)),bfBtn("",false).replace("class=\"","class=\"bfl2 "))};
let tsrt="n",ttab="s";
function openTags(){const L=ttab==="l",m={};(L?lists:items).forEach(i=>((L?i.tags:i.rtags)||[]).forEach(t=>{const k=t.toLowerCase();m[k]=m[k]||{t,n:0};m[k].n++}));let a=Object.values(m);a.sort(tsrt==="n"?(x,y)=>y.n-x.n||x.t.localeCompare(y.t):(x,y)=>x.t.localeCompare(y.t));
  const sb=`<button aria-label="Ordenar" onclick="tsrt=tsrt==='n'?'a':'n';openTags()" style="min-width:44px;display:flex;justify-content:flex-end;background:none;border:0;color:var(--mute);padding:0;cursor:pointer">${svg('<path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4"/>',24)}</button>`;
  const tabs=`<div class="seg tgtabs">${[["s","Series"],["l","Listas"]].map(([k,l])=>`<button class="${ttab===k?"on":""}" onclick="ttab='${k}';openTags()">${l}</button>`).join("")}</div>`;
  const h=tabs+(a.length?a.map(x=>`<div class="tgrw" data-v="${esc(x.t)}" onclick="${L?"openListTag":"openTag"}(this.dataset.v)"><span class="tgc">${esc(x.t)}</span><b>${x.n}</b><i>›</i></div>`).join(""):EMP("tag",L?"Aún no etiquetas tus listas":"Aún no usas etiquetas",L?"Añádelas al crear o editar una lista.":"Añádelas al registrar una serie en tu diario para organizarlas."));
  const wasOpen=$("lst").classList.contains("open"),y=$("lst").scrollTop;sheet("Etiquetas",h,sb);if(wasOpen)$("lst").scrollTop=y}
const openListTag=x=>sheet(`<span class="tgc" style="height:30px;font-size:15px">${esc(x)}</span>`,lv(lists.filter(l=>(l.tags||[]).some(t=>t.toLowerCase()===x.toLowerCase())),0,"Ninguna lista con esta etiqueta."));
const openTagTop=x=>{openTag(x);$("lst").classList.add("top")};
const openTag=x=>sheet(`<span class="tgc" style="height:30px;font-size:15px">${esc(x)}</span>`,grid(items.filter(i=>(i.rtags||[]).some(t=>t.toLowerCase()===x.toLowerCase())),"g3"));
let stY=0;
function stGo(y){stY=y;if(DSK()&&tab==="me"&&seg.me==="stt"&&!STXI){render();return}if(STXI){STXR=1;openStats();STXR=0;return}const sc=$("lst").scrollTop;openStats();$("lst").scrollTop=sc}
let STXR=0;const stOut=(h)=>{h=`<div class="dst2 dsx">${h}</div>`;return STXI?(STXR?subRe:subOpen)(U2(STXN,subBar("Estadísticas")+h)):sheet("Estadísticas",h)};
let STXI=null,STXN="";
const stEn=()=>{if(STXI){const D=UD[STXN];return D?D.rows.map(x=>({iid:idOf(x.series_id),wd:x.watched_on,r:+x.rating||0,hl:!!x.liked,rw:!!x.rewatch,t:x.review||""})):[]}
  const en=DEN.map(e=>({iid:e.iid,wd:e.wd,r:e.r,hl:e.hl,rw:e.rw,t:e.t}));
  items.forEach(i=>{if(i.watchedOn&&!en.some(e=>e.iid===i.id))en.push({iid:i.id,wd:new Date(i.watchedOn).toISOString().slice(0,10),r:i.rating||0,hl:!!i.liked,rw:!!i.rewatch,t:i.review||""})});return en};
function openStats(src,nm){stOut(statsH(src,nm))}
function statsH(src,nm){if(src===null){STXI=null;STXN=""}else if(src){STXI=src;STXN=nm||"";stY=0}const IT=STXI||items;
  const EN=stEn(),eyr=e=>+(e.wd||"").slice(0,4),ys=[...new Set(EN.map(eyr).filter(Boolean))].sort((a,b)=>b-a);
  if(stY&&!ys.includes(stY))stY=0;
  const EA=stY?EN.filter(e=>eyr(e)===stY):EN,ids=new Set(EA.map(e=>e.iid)),A=stY?IT.filter(i=>ids.has(i.id)):IT,dn=A.filter(i=>i.status==="done"),rt=A.filter(i=>i.rating),eps=A.reduce((a,i)=>a+(i.watched||0),0),
    nl=stY?[]:IT.filter(i=>!EN.some(e=>e.iid===i.id)),RTx=[...EA.filter(e=>e.r).map(e=>e.r),...nl.filter(i=>i.rating).map(i=>i.rating)],LKx=EA.filter(e=>e.hl).length+nl.filter(i=>i.liked).length,RVn=EA.filter(e=>e.t).length+nl.filter(i=>i.review).length,
    avg=RTx.length?(RTx.reduce((a,r)=>a+r,0)/RTx.length).toFixed(1).replace(".",","):"–",
    PY=stY&&ys.includes(stY-1)?EN.filter(e=>eyr(e)===stY-1):null,pids=PY&&new Set(PY.map(e=>e.iid)),
    dl=(c,p)=>{if(!PY||p==null||c==null||c===p)return"";const d=c-p;return`<small class="${d>0?"up":""}">${d>0?"+":"−"}${Math.abs(Math.round(d*10)/10).toString().replace(".",",")} vs ${stY-1}</small>`},
    pAvg=PY&&PY.some(e=>e.r)?PY.filter(e=>e.r).reduce((a,e)=>a+e.r,0)/PY.filter(e=>e.r).length:null,
    k=(v,l,d)=>`<div><b>${v}</b>${l}${d||""}</div>`,sec=(t,b,c)=>`<section class="stsc${c?" "+c:""}"><div class="sth">${t}</div>${b}</section>`;
  let h=ys.length?`<div class="sty">${[0,...ys].map(y=>`<button class="${stY===y?"on":""}" onclick="stGo(${y})">${y||L2("Todo","All")}</button>`).join("")}</div>`:"";
  h+=`<div class="stsum">${k(dn.length,"Series vistas",PY&&dl(dn.length,IT.filter(i=>i.status==="done"&&pids.has(i.id)).length))}${k(eps,"Episodios")}${k(EA.length,L2("Registros","Logs"),dl(EA.length,PY&&PY.length))}${k(avg,"Nota media",RTx.length&&pAvg!=null?dl(+(RTx.reduce((a,r)=>a+r,0)/RTx.length).toFixed(1),+pAvg.toFixed(1)):"")}${k(LKx,L2("Me gusta","Likes"),dl(LKx,PY&&PY.filter(e=>e.hl).length))}${k(RVn,"Reseñas",dl(RVn,PY&&PY.filter(e=>e.t).length))}</div>${eps?`<div class="stn" style="padding:10px 14px 0">${(()=>{const mn=A.reduce((t,i)=>t+(i.epm?i.epm*Math.min(1,(i.watched||0)/Math.max(1,i.eps||1)):(i.watched||0)*1.5),0),est=A.some(i=>(i.watched||0)&&!i.epm);return(est?"≈ ":"")+(mn>=90?Math.round(mn/60*10)/10+" h":Math.round(mn)+" min")+" "+(est?L2("de episodios vistos (1,5 min por episodio si no se indica la duración total)","of episodes watched (1.5 min per episode when no total duration is set)"):L2("de episodios vistos","of episodes watched"))})()}</div>`:""}`;
  if(!A.length){return h+(stY?EMP("bolt","No hay actividad en "+stY,L2("Prueba con otro año.","Try another year.")):EMP("bolt",L2("Aún no hay estadísticas","No stats yet"),STXI?L2("Todavía no hay datos para mostrar.","There's no data to show yet."):L2("Registra tu primera serie para ver aquí tus estadísticas.","Log your first series to see your stats here.")))}
  let g="";
  // actividad por mes
  const now=new Date(),ms=[];
  if(stY)for(let m=0;m<12;m++)ms.push([stY,m]);else for(let m=11;m>=0;m--){const d=new Date(now.getFullYear(),now.getMonth()-m,1);ms.push([d.getFullYear(),d.getMonth()])}
  const cnt=ms.map(([y,m])=>EA.filter(e=>{const d=new Date((e.wd||"")+"T12:00:00");return d.getFullYear()===y&&d.getMonth()===m}).length),cm=Math.max(1,...cnt);
  if(cnt.some(n=>n))g+=sec(stY?"Actividad en "+stY:"Últimos 12 meses",`<div class="stc">${cnt.map(n=>`<div>${n?`<em>${n}</em>`:""}<u class="${n===cm?"mx":""}" style="height:${n?Math.max(6,n/cm*78):2}%"></u></div>`).join("")}</div><div class="stl">${ms.map(([y,m])=>`<span>${new Date(2000,m,1).toLocaleDateString(LANG,{month:"narrow"}).toUpperCase()}</span>`).join("")}</div>`,"wide");
  // valoraciones
  if(RTx.length){const b=Array(10).fill(0);RTx.forEach(r=>{const j=Math.round(r*2)-1;if(j>=0&&j<10)b[j]++});const bm=Math.max(1,...b),top=b.indexOf(Math.max(...b));
    g+=sec("Valoraciones",`<div class="stc" style="height:110px">${b.map((n,j)=>`<div>${n?`<em>${n}</em>`:""}<u class="${j===top?"mx":""}" style="height:${n?Math.max(6,n/bm*78):2}%"></u></div>`).join("")}</div><div class="stl">${b.map((n,j)=>`<span>${j%2?(j+1)/2+"★":""}</span>`).join("")}</div><div class="stn">Nota más habitual: ${S((top+1)/2)} · ${b[top]} ${b[top]===1?"serie":"series"}</div>`)}
  // por app
  const ap=appsAll().map(a=>{const x=A.filter(i=>i.app===a),r=x.filter(i=>i.rating);return{a,n:x.length,r:r.length?(r.reduce((t,i)=>t+i.rating,0)/r.length).toFixed(1).replace(".",","):""}}).filter(x=>x.n).sort((x,y)=>y.n-x.n),am=Math.max(1,...ap.map(x=>x.n));
  if(ap.length)g+=sec("Por app",`<div class="stw">${ap.map((x,k)=>`<div class="stb ${k?"":"top"}"><span>${esc(x.a)}</span><u><i style="width:${x.n/am*100}%;min-width:4px"></i></u><em><b>${x.n}</b>${x.r?` · ★ ${x.r}`:""}</em></div>`).join("")}</div>`);
  // temas
  const tc={};A.forEach(i=>(i.tropes||[]).forEach(t=>{const key=tkey(t);if(!key)return;(tc[key]=tc[key]||{t:t.trim(),n:0}).n++}));const tp=Object.values(tc).sort((x,y)=>y.n-x.n||x.t.localeCompare(y.t)).slice(0,6),tm2=Math.max(1,...tp.map(x=>x.n));
  if(tp.length)g+=sec("Temas favoritos",`<div class="stw">${tp.map((x,k)=>`<div class="stb ${k?"":"top"}"><span>${esc(x.t)}</span><u><i style="width:${x.n/tm2*100}%;min-width:4px"></i></u><em><b>${x.n}</b></em></div>`).join("")}</div>`);
  // más repetidas
  const rc={};EA.forEach(e=>rc[e.iid]=(rc[e.iid]||0)+1);const rp=Object.entries(rc).filter(([id,n])=>n>1&&IT.some(i=>i.id===+id||i.id===id)).map(([id,n])=>[IT.find(i=>i.id===+id||i.id===id),n]).sort((x,y)=>y[1]-x[1]).slice(0,5);
  if(rp.length)g+=sec(L2("Más repetidas","Most rewatched"),`<div class="stw">${rp.map(([i,n],k)=>`<div class="stt" onclick="show(${i.id})"><span><i class="rk">${k+1}</i><b>${esc(short(i.title))}</b></span><em>×${n}</em></div>`).join("")}</div>`);
  // mejor valoradas
  const tr=[...rt].sort((x,y)=>y.rating-x.rating||(+!!y.liked)-(+!!x.liked)).slice(0,5);
  if(tr.length)g+=sec("Mejor valoradas",`<div class="stw">${tr.map((i,k)=>`<div class="stt" onclick="show(${i.id})"><span><i class="rk">${k+1}</i><b>${esc(short(i.title))}</b></span><em>${S(i.rating)}${i.liked?" ♥":""}</em></div>`).join("")}</div>`);
  return h+'<div class="stgrid">'+g+'</div><div style="height:30px"></div>'}
