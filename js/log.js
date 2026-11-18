/* Volver a pulsar «Vista» la quita: borra también nota, me gusta y entradas del diario */
async function unwatch(id){const i=get(id);if(!i)return;
  if(hasAct(i)){POP="";toast(esc(short(i.title))+" no se puede quitar de tus series, porque tiene actividad");return}
  if(i.liked||i.wl){log=log.filter(e=>e.id!==id);Object.assign(i,{status:i.wl?"want":"",watched:0,wl:false});RV={};RVt={};WB={};WBt={};HR=null;save();optsR(id);refresh(id);render();return}
  if(sb&&i.sid&&U){try{const{error}=await sb.from("diary_entries").delete().eq("user_id",U.id).eq("series_id",i.sid);if(error)throw error}catch(e){console.error(e);toast("No se pudo quitar");return}}
  dq=dq.filter(e=>e.series!==i);DEN=DEN.filter(e=>e.iid!==id);
  drop(id);Object.assign(i,{dcount:0,review:"",watchedOn:undefined,spoil:false,deid:undefined,rewatch:false,rtags:[]});
  RV={};RVt={};WB={};WBt={};HR=null;save();optsR(id);refresh(id);render()}
/* Pulsar «Registrada»: con una sola entrada abre la entrada; con varias, la página de actividad */
async function goLog(id){const i=get(id);if(!i)return;closeOv();
  if((i.dcount||0)>1||!i.deid||!sb){showAct(id,U.id);return}
  try{if(!RX[i.deid]){const r=await sb.from("diary_entries").select(RSEL).eq("id",i.deid).single();if(r.error)throw r.error;nrm(r.data)}openReview(i.deid)}catch(e){console.error(e);showAct(id,U.id)}}
let POP="";function qv(id,k,sl){POP=k;const i=get(id);
  if(k==="l"){i.liked=!i.liked;if(i.liked)mark(i);else if(!i.status&&!i.rating&&items.includes(i))drop(id)}
  else if(k==="v"){if(i.status==="done"){if(i.watchedOn||i.deid||(i.dcount||0)>0){POP="";goLog(id);return}unwatch(id);return}else{if(!items.includes(i)){items.unshift(i);delete cache[id]}i.status="done";i.watched=i.eps;addLog("done",i)}}
  else{if(i.status==="want"){if(i.liked){i.status="";i.watched=0}else drop(id)}else if(i.status==="done"){i.wl=!i.wl}else{if(!items.includes(i)){items.unshift(i);delete cache[id]}i.status="want";i.watched=0}}
  save();if(!sl)opts(id);refresh(id)}
const mark=i=>{if(i.status!=="done"){i.status="done";i.watched=i.eps;addLog("done",i)}};
/* actualiza al instante el histograma de la comunidad con tu cambio de nota */
const comRate=(i,v)=>{const c=com[key(i)];if(!c)return;if(i.rating){const o=c.indexOf(i.rating);if(o>=0)c.splice(o,1)}if(v)c.push(v)};
function setR(i,v){comRate(i,v);i.rating=v;if(v){mark(i);addLog("rate",i)}}
function qr(id,v,d){const i=get(id);setR(i,d?v:(i.rating===v?0:v));save();optsR(id);refresh(id);if(DSK())render()}
async function shr(id){const i=get(id),t=`${short(i.title)} (${i.app})${i.rating?" "+S(i.rating):""} · Microboxd`;try{if(navigator.share)await navigator.share({text:t});else await navigator.clipboard.writeText(t)}catch(e){}}
let lg={},lg0="";
function openLog(id,add,ed,eid){closeOv();const i=get(id);
  const fresh=()=>{const x=ed&&eid&&RX[eid];
    if(x)return{id,add:!!add,ed:true,eid,d:x.wd||new Date().toISOString().slice(0,10),r:x.r||0,l:!!x.hl,re:!!x.rw,sp:!!x.sp,t:x.t||"",g:(x.g||[]).join(", ")};
    if(!ed&&i.deid)return{id,add:!!add,ed:false,d:new Date().toISOString().slice(0,10),r:i.rating||0,l:!!i.liked,re:true,sp:false,t:"",g:""};
    return{id,add:!!add,ed:!!ed,d:new Date(i.watchedOn||Date.now()).toISOString().slice(0,10),r:i.rating||0,l:!!i.liked,re:false,sp:!!i.spoil,t:i.review||"",g:(i.rtags||[]).join(", ")}};
  const go=o=>{lg=o;drawLog();$("lgs").classList.add("open");$("lgs").scrollTop=0};
  lg0=JSON.stringify(fresh());
  const dr=drafts[id];
  if(!dr){go(fresh());return}
  $("ov").innerHTML=`<div class="card"><div class="ot" style="padding:22px 16px 14px"><b>Borrador</b><span>Hay una entrada sin guardar de esta serie. ¿Quieres seguir editando?</span></div><div class="qa"><button onclick="dDisc(${id},${add?1:0},${ed?1:0},'${eid||""}')">Descartar</button><button style="color:#4ddc6f;font-weight:700" onclick="dRes(${id},${add?1:0})">Seguir editando</button></div></div>`;$("ov").classList.add("open")}
function dDisc(id,add,ed,eid){delete drafts[id];pers();openLog(id,!!add,!!ed,eid||undefined)}
function dRes(id,add){const d=drafts[id];closeOv();lg=Object.assign({},d,{add:!!add});drawLog();$("lgs").classList.add("open");$("lgs").scrollTop=0}
function cancelLog(){const{add,...rest}=lg;if(JSON.stringify(Object.assign({},lg,{add:lg.add}))!==lg0){drafts[lg.id]=Object.assign({},lg)}pers();$("lgs").classList.remove("open")}
const ldate=()=>{const t=fmt(new Date((lg.d||new Date().toISOString().slice(0,10))+"T12:00:00").getTime());return t.charAt(0).toUpperCase()+t.slice(1)};
function drawLogD(){const i=get(lg.id),ed=lg.ed&&lg.eid&&RX[lg.eid],tg_=tagArr(lg.g);
  $("lgs").innerHTML=`<div class="lgd"><div class="lgd-h"><b>${ed?L2("Editar entrada del diario","Edit diary entry"):L2("He visto…","I watched…")}</b><button class="lgd-x" aria-label="${L2("Cerrar","Close")}" onclick="cancelLog()">×</button></div>
  <div class="lgd-b"><div class="lgd-p">${nop(i)}</div><div class="lgd-m">
   <h2>${esc(short(i.title))} <small>${esc(i.app)}</small></h2>
   <div class="lgd-r1"><label class="lgd-d">${L2("Visto el","Watched on")} <input type="date" value="${lg.d}" onchange="if(this.value){lg.d=this.value;drawLog()}"></label>
    <label class="lgd-c"><input type="checkbox" ${lg.re?"checked":""} onchange="lg.re=this.checked;drawLog()"> ${L2("Ya la había visto","I've watched this before")}</label>
    <label class="lgd-c"><input type="checkbox" ${lg.sp?"checked":""} onchange="lg.sp=this.checked;drawLog()"> ${L2("Contiene spoilers","Contains spoilers")}</label></div>
   <textarea class="lgd-t" placeholder="${L2("Añade una reseña…","Add a review…")}" oninput="lg.t=this.value">${esc(lg.t)}</textarea>
   <div class="lgd-r2"><div class="lgd-tg"><div class="lgd-lb">${L2("Etiquetas","Tags")} <small class="lgd-hint">${L2("Pulsa Tab para completar, Intro para crear","Press Tab to complete, Enter to create")}</small></div><div class="tgd" id="tgd"><input id="tgdi" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${L2("p. ej. netflix","eg. netflix")}" value="${esc(lg.tq||"")}" oninput="lg.tq=this.value;tgdSug()" onkeydown="tgdKey(event)" onblur="setTimeout(tgdHide,120)"></div><div id="tgds" class="tgds"></div><div id="tgdc" class="tgdc"></div></div>
    <div><div class="lgd-lb">${L2("Valoración","Rating")} <small>${lg.r?lg.r:"–"} ${L2("de 5","out of 5")}</small></div><div class="sr" data-s="lgr">${sx(lg.r,v=>`lgr(${v})`)}</div></div>
    <div class="lgd-lk"><div class="lgd-lb">${L2("Me gusta","Like")}</div><button class="hb2 ${lg.l?"on":""}" aria-label="${L2("Me gusta","Like")}" onclick="lg.l=!lg.l;drawLog()">${svg(HEART,38)}</button></div></div>
  </div></div>
  <div class="lgd-f">${ed?`<button class="lgd-del" onclick="lgDel()">${L2("Eliminar","Delete")}</button>`:""}<button class="lgd-sv" onclick="saveLog()">${L2("Guardar","Save")}</button></div></div>`;tgdChips()}
/* Etiquetas en escritorio: campo en línea (Tab completa, Intro crea) */
let tgdI=0,tgdL=[];
function tgdChips(){const c=$("tgdc");if(!c)return;c.innerHTML=tagArr(lg.g).map((t,k)=>`<span class="tgc" title="${L2("Quitar","Remove")}" onclick="event.stopPropagation();tgdDel(${k})">${esc(t)}<i>×</i></span>`).join("")}
function tgdDel(k){const a=tagArr(lg.g);a.splice(k,1);lg.g=a.join(", ");tgdChips();tgdSug();const e=$("tgdi");e&&e.focus()}
function tgdAdd(t){t=(t||"").replace(/,/g," ").replace(/\s+/g," ").trim();if(!t)return false;const a=tagArr(lg.g);if(!a.some(x=>tkey(x)===tkey(t))){if(a.length>=20){toast("Máximo 20 etiquetas");return false}a.push(t);lg.g=a.join(", ")}lg.tq="";const e=$("tgdi");if(e)e.value="";tgdChips();tgdSug();return true}
function tgdSug(){const b=$("tgds");if(!b)return;const q=tkey(lg.tq),sel=tagArr(lg.g).map(tkey);tgdL=q?tgCounts().filter(x=>{const k=tkey(x.t);return !sel.includes(k)&&k.startsWith(q)}).sort((x,y)=>y.n-x.n||x.t.localeCompare(y.t)).slice(0,6).map(x=>x.t):[];if(tgdI>=tgdL.length)tgdI=0;
  b.innerHTML=tgdL.length?tgdL.map((t,k)=>`<div class="${k===tgdI?"on":""}" data-t="${esc(t)}" onmousedown="event.preventDefault();tgdAdd(this.dataset.t);$('tgdi').focus()">${esc(t)}</div>`).join(""):"";b.classList.toggle("open",!!tgdL.length)}
function tgdHide(){const b=$("tgds");b&&b.classList.remove("open")}
function tgdKey(e){
  if(e.key==="Tab"&&!e.shiftKey&&tgdL.length){e.preventDefault();lg.tq=tgdL[tgdI];e.target.value=lg.tq;tgdSug();return}
  if(e.key==="Enter"||e.key===","){e.preventDefault();tgdAdd(lg.tq);return}
  if(e.key==="ArrowDown"&&tgdL.length){e.preventDefault();tgdI=(tgdI+1)%tgdL.length;tgdSug();return}
  if(e.key==="ArrowUp"&&tgdL.length){e.preventDefault();tgdI=(tgdI-1+tgdL.length)%tgdL.length;tgdSug();return}
  if(e.key==="Escape"&&tgdL.length){e.stopPropagation();tgdHide();return}
  if(e.key==="Backspace"&&!e.target.value){const a=tagArr(lg.g);if(a.length){a.pop();lg.g=a.join(", ");tgdChips();tgdSug()}}}
function lgDel(){if(lg.eid)askRvDel(lg.eid)}
function drawLog(){const i=get(lg.id);$("lgs").classList.toggle("lgd-on",DSK());if(DSK())return drawLogD();$("lgs").innerHTML=`<div class="w"><div class="lh"><button onclick="cancelLog()">Cancelar</button><b>He visto…</b><button class="sv" onclick="saveLog()">Guardar</button></div>
  <div class="lt"><div class="ltp">${nop(i)}</div><span>${esc(short(i.title))}</span><small>${esc(i.app)}</small></div>
  <label class="lr ldt" onclick="const e=this.querySelector('input');try{e.showPicker()}catch(_){}"><span>Fecha</span><span class="ldv">${ldate()}</span><input type="date" value="${lg.d}" tabindex="-1" onchange="if(this.value){lg.d=this.value;drawLog()}"></label>
  <div class="lrx"><div><div class="lb">Valoración</div><div class="sr" data-s="lgr">${sx(lg.r,v=>`lgr(${v})`)}</div></div><div style="text-align:right"><div class="lb">Me gusta</div><button class="hb2 ${lg.l?"on":""}" aria-label="Me gusta" onclick="lg.l=!lg.l;drawLog()">${svg(HEART,40)}</button></div></div>
  <textarea placeholder="Añade una reseña…" oninput="lg.t=this.value">${esc(lg.t)}</textarea>
  <div class="tgr" onclick="openTagEd()">${tagArr(lg.g).length?tagArr(lg.g).map(t=>`<span class="tgc">${esc(t)}</span>`).join(""):'<span class="tgph">Añadir etiquetas…</span>'}</div>
  <div class="tg"><button class="${lg.re?"on":""}" onclick="lg.re=!lg.re;drawLog()">${svg(EYE,34)}<span>Ya la había visto</span></button><button class="${lg.sp?"on":""}" onclick="lg.sp=!lg.sp;drawLog()">${svg(WARN,34)}<span>${lg.sp?"Con spoilers":"Sin spoilers"}</span></button></div></div>`}
const tagArr=g=>(g||"").split(",").map(s=>s.trim()).filter(Boolean);
let tg={sel:[],q:"",srt:"n"};
function openTagEd(k){k=k||"log";const i=k==="log"?get(lg.id):null;tg={k,sel:k==="log"?tagArr(lg.g):[...le.tags],q:"",srt:tg.srt||"n",i};drawTagEd();$("tgs").classList.add("open");setTimeout(()=>{const e=$("tgi2");e&&e.focus()},60)}
function tgCounts(k){const m={},add=t=>{const y=tkey(t);if(!y)return;m[y]=m[y]||{t:t.trim(),n:0};m[y].n++};lists.forEach(l=>(l.tags||[]).forEach(add));items.forEach(i=>(i.rtags||[]).forEach(add));return Object.values(m)}
function drawTagEd(keep){const i=tg.i,ql=tg.q.trim().toLowerCase(),has=t=>tg.sel.some(x=>x.toLowerCase()===t.toLowerCase());
  let all=tgCounts(tg.k);tg.sel.forEach(t=>{if(!all.some(a=>a.t.toLowerCase()===t.toLowerCase()))all.push({t,n:0})});
  all=all.filter(a=>!ql||a.t.toLowerCase().includes(ql));all.sort(tg.srt==="n"?(a,b)=>b.n-a.n||a.t.localeCompare(b.t):(a,b)=>a.t.localeCompare(b.t));
  const mk=ql&&!all.some(a=>a.t.toLowerCase()===ql);
  const list=(mk?`<div class="tgli" onclick="tgAdd(tg.q)"><span>Crear “${esc(tg.q.trim())}”</span></div>`:"")+all.map(a=>`<div class="tgli" data-t="${esc(a.t)}" onclick="tgTog(this.dataset.t)"><span class="${has(a.t)?"on":""}">${esc(a.t)}</span><b>${a.n||""}</b></div>`).join("");
  const body=`<div class="tgf" onclick="$('tgi2').focus()">${tg.sel.map(t=>`<span class="tgc" data-t="${esc(t)}" onclick="event.stopPropagation();tgTog(this.dataset.t)">${esc(t)}</span>`).join("")}<input id="tgi2" enterkeyhint="done" autocomplete="off" autocapitalize="none" value="${esc(tg.q)}" oninput="tg.q=this.value;tgRefresh()" onkeydown="tgKey(event)"></div><div id="tgl">${list}</div>`;
  if(keep){$("tgl").outerHTML=`<div id="tgl">${list}</div>`;return}
  $("tgs").innerHTML=`<div class="lbar tgb"><span class="tgth">${i?nop(i):""}</span><b>Editar etiquetas</b><span class="tgac"><button aria-label="Ordenar" onclick="tg.srt=tg.srt==='n'?'a':'n';drawTagEd(1)">${svg('<path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4"/>',24)}</button><button class="sv" onclick="tgDone()">Hecho</button></span></div>${body}`}
function tgRefresh(){drawTagEd(1)}
function tgKey(e){if(e.key==="Enter"||e.key===","){e.preventDefault();tgAdd(tg.q)}else if(e.key==="Backspace"&&!tg.q&&tg.sel.length){tg.sel.pop();drawTagEd();setTimeout(()=>$("tgi2").focus(),0)}}
function tgAdd(t){t=(t||"").replace(/,/g," ").trim();if(!t)return;if(!tg.sel.some(x=>x.toLowerCase()===t.toLowerCase())){if(tg.sel.length>=20){toast("Máximo 20 etiquetas");return}tg.sel.push(t)}tg.q="";drawTagEd();setTimeout(()=>$("tgi2").focus(),0)}
function tgTog(t){const k=t.toLowerCase(),n=tg.sel.findIndex(x=>x.toLowerCase()===k);if(n>=0)tg.sel.splice(n,1);else{if(tg.sel.length>=20){toast("Máximo 20 etiquetas");return}tg.sel.push(t)}tg.q="";drawTagEd();setTimeout(()=>$("tgi2").focus(),0)}
function tgDone(){if(tg.q.trim())tgAdd(tg.q);document.activeElement&&document.activeElement.blur();$("tgs").classList.remove("open");if(tg.k==="list"){le.tags=tg.sel.slice();drawLe()}else{lg.g=tg.sel.join(", ");drawLog()}}
function lgr(v){lg.r=lg.r===v?0:v;drawLog()}
function saveLog(){if(DSK()&&lg.tq&&lg.tq.trim())tgdAdd(lg.tq);delete lg.tq;const i=get(lg.id),ts=lg.d?new Date(lg.d+"T12:00:00").getTime():Date.now();
  if(!lg.ed)i.dcount=(i.dcount||0)+1;
  const eid=lg.ed?(lg.eid||i.deid||crypto.randomUUID()):crypto.randomUUID(),latest=!lg.ed||eid===i.deid||!i.deid;
  if(latest){comRate(i,lg.r);i.rating=lg.r;i.liked=lg.l;i.review=lg.t||"";i.rtags=(lg.g||"").split(",").map(s=>s.trim()).filter(Boolean);i.rewatch=lg.re;i.spoil=lg.sp;i.watchedOn=ts;i.status="done";i.watched=i.eps;
  addLog("done",i);log[0].ts=ts;if(i.rating){addLog("rate",i);log[0].ts=ts}i.deid=eid}
  {dq.push({id:eid,series:i,row:{watched_on:lg.d||new Date().toISOString().slice(0,10),rating:lg.r||null,liked:!!lg.l,rewatch:!!lg.re,review:lg.t||"",spoilers:!!lg.sp,tags:(lg.g||"").split(",").map(s=>s.trim()).filter(Boolean)}})}
  {const d={id:eid,iid:i.id,wd:lg.d||new Date().toISOString().slice(0,10),r:lg.r||0,hl:!!lg.l,rw:!!lg.re,t:lg.t||"",sp:!!lg.sp},k=DEN.findIndex(e=>e.id===eid);if(k>=0)DEN[k]=d;else DEN.unshift(d)}
  {const r=RX[eid];if(r){Object.assign(r,{r:lg.r||0,hl:!!lg.l,rw:!!lg.re,t:lg.t||"",sp:!!lg.sp,g:(lg.g||"").split(",").map(s=>s.trim()).filter(Boolean),wd:lg.d||r.wd})}RV={};RVt={};WB={};WBt={};HR=null;for(const k in UD)delete UD[k];
   const sb_=$("sub");if(sb_.classList.contains("open")){const top=sb_.innerHTML;
    if(subH.length&&/actGo\(/.test(subH[subH.length-1])&&ACT[i.id+":"+U.id]){drawAct(i.id,1);subH[subH.length-1]=sb_.innerHTML;sb_.innerHTML=top}
    if(r&&curRv===eid)openReview(eid,1);else if(pgLive("act"+i.id))drawAct(i.id,1)}}
  delete drafts[i.id];pers();save();$("lgs").classList.remove("open");
  if(lg.add){$("ad").classList.remove("open");$("det").classList.remove("open");br=[];q="";tab="home";seg.home="series";render();$("mn").scrollTop=0}else{refresh(i.id);render()}
  toast(`<b>${esc(short(i.title))}</b> ${lg.ed?"se actualizó en tu diario":"se añadió a tu diario"}`)}
