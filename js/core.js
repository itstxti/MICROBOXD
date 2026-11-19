const APPS0=["DramaBox","ReelShort","ShortMax","GoodShort","FlexTV","Desconocido"];
let PLT=[];
const appsAll=()=>{const o=[...APPS0];PLT.forEach(a=>{if(!o.some(x=>x.toLowerCase()===a.toLowerCase()))o.push(a)});catAll().forEach(i=>{const a=(i.app||"").trim();if(a&&!o.some(x=>x.toLowerCase()===a.toLowerCase()))o.push(a)});return o};
const KEY="microboxd:v1";
let DEN=[];
let prof={name:"",fam:"",email:"",loc:"",web:"",bio:"",pron:"",fav:[]},items=[],log=[],lists=[],sq="s",sf=0,adq="",tab="home",q="",cover="";
const SQL={s:"Series",r:"Reseñas",l:"Listas",m:"Miembros"};let RSQ=[];try{RSQ=JSON.parse(localStorage.getItem("microboxd:rsq")||"[]").filter(x=>x&&x.q&&SQL[x.k])}catch(e){}
const rsqSave=()=>{try{localStorage.setItem("microboxd:rsq",JSON.stringify(RSQ))}catch(e){}};
function rsqAdd(){const t=q.trim();if(!t)return;const k=RSQ.findIndex(x=>x.q.toLowerCase()===t.toLowerCase());if(k>=0)RSQ.splice(k,1);RSQ.unshift({q:t,k:sq});RSQ=RSQ.slice(0,12);rsqSave()}
function rsqUse(n){const x=RSQ[n];if(!x)return;sq=x.k;q=x.q;const i=$("qi");if(i){i.value=q;i.focus();i.nextElementSibling.style.display=""}sr()}
function rsqDel(n,e){e.stopPropagation();RSQ.splice(n,1);rsqSave();sr()}
function rsqClear(){RSQ=[];rsqSave();sr()}
const rsqH=()=>RSQ.length?`<div class="rsqh"><span>BÚSQUEDAS RECIENTES</span><button onclick="rsqClear()">Borrar</button></div>`+RSQ.map((x,n)=>`<div class="rsq" onclick="rsqUse(${n})"><span class="rq">${esc(x.q)}</span><span class="rk">${SQL[x.k]}</span><button aria-label="Quitar" onclick="rsqDel(${n},event)">×</button></div>`).join(""):"";
document.addEventListener("click",e=>{if(tab==="search"&&q.trim()&&e.target.closest&&e.target.closest("#sr")&&!e.target.closest(".ptabs,.rsq,.rsqh"))rsqAdd()},true);
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&e.target.id==="qi"){rsqAdd();e.target.blur()}});
const seg={home:"series",act:"me",me:"perfil"};
const SEGS={home:[["series","Series"],["rev","Reseñas"],["lst","Listas"],["jr","Diario"]],act:[["fr","Amigos"],["me","Tú"],["in","Entrantes"]],me:[["perfil","Perfil"],["diary","Diario"],["lst","Listas"],["pend","Watchlist"]]};
let LEG=null;try{LEG={items:JSON.parse(localStorage.getItem(KEY)||"null")||[],lists:JSON.parse(localStorage.getItem("microboxd:lists")||"null")||[],prof:JSON.parse(localStorage.getItem("microboxd:prof")||"null")||{}}}catch(e){}
const $=id=>document.getElementById(id);
let rs=[],drafts={},tT=0;try{rs=JSON.parse(localStorage.getItem("microboxd:rs")||"[]");drafts=JSON.parse(localStorage.getItem("microboxd:drafts")||"{}")}catch(e){}
const pers=()=>{try{localStorage.setItem("microboxd:rs",JSON.stringify(rs));localStorage.setItem("microboxd:drafts",JSON.stringify(drafts))}catch(e){}};
function toast(m){const t=$("toast");t.innerHTML=m;t.classList.add("on");clearTimeout(tT);tT=setTimeout(()=>t.classList.remove("on"),2600)}
let pendS=[],pendU=[];const save=()=>{adopt();sched()};
const uname=()=>(prof.name||"").trim()||"tú",ini=()=>'<i class="mav"></i>';
const setMe=()=>{const u=prof.avd||(prof.av?cvr(prof.av):"");document.documentElement.style.setProperty("--meav",u?`url("${u}")`:"none")};
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tkey=t=>String(t||"").replace(/[’‘`´′ʼ]/g,"'").replace(/\s+/g," ").trim().toLowerCase();
const hasT=(i,v)=>(i.tropes||[]).some(t=>tkey(t)===tkey(v));
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
const hue=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return h};
const get=id=>items.find(i=>i.id===id)||cache[id];
const short=t=>t.replace(/^Ejemplo:\s*/,"");
const S=n=>"★".repeat(Math.floor(n))+(n%1?"½":"");
const fsh=ts=>new Date(ts).toLocaleDateString(LANG,{day:"numeric",month:"short",year:"numeric"});
const fmt=ts=>new Date(ts).toLocaleDateString(LANG,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const rel=ts=>{const m=Math.floor((Date.now()-ts)/6e4);if(m<1)return LANG==="es"?"ahora":"now";if(m<60)return m+" min";const h=Math.floor(m/60);if(h<24)return h+" h";const d=Math.floor(h/24);if(d<7)return d+" d";const w=Math.floor(d/7);if(w<5)return w+(LANG==="es"?" sem":" w");const mo=Math.floor(d/30);return mo<12?mo+(LANG==="es"?" mes":" mo"):Math.floor(d/365)+(LANG==="es"?" a":" y")};
const adt=(wd,ts)=>fsh(wd?Date.parse(wd+"T12:00:00"):ts);
const addLog=(t,i)=>{log.unshift({t,id:i.id,title:i.title,r:i.rating,ts:Date.now()});log=log.slice(0,100)};
let appPrev="DramaBox";
function fmApps(sel){const s=$("f-app"),o=appsAll();if(sel&&!o.some(x=>x.toLowerCase()===sel.toLowerCase()))o.push(sel);s.innerHTML=o.map(a=>`<option>${esc(a)}</option>`).join("")+`<option value="__new">＋ ${L2("Añadir plataforma…","Add platform…")}</option>`;s.value=sel&&o.includes(sel)?sel:o[0];appPrev=s.value;$("f-app2").style.display="none";appDelUi();$("f-app2").placeholder=L2("Nombre de la plataforma","Platform name");$("f-appmg").textContent=L2("Gestionar plataformas","Manage platforms")}
const appBase=a=>APPS0.some(x=>x.toLowerCase()===(a||"").toLowerCase());
function appDelUi(){}
const appN=v=>catAll().filter(i=>(i.app||"").trim().toLowerCase()===v.toLowerCase()).length;
function platOpen(){const o=appsAll(),rows=o.map((a,k)=>{const n=appN(a),base=appBase(a),can=!base&&!n;
  return `<div style="display:flex;align-items:center;gap:10px;padding:11px 15px;border-top:1px solid var(--bg)"><div style="flex:1;min-width:0"><div style="font-size:15px;color:var(--tx);overflow:hidden;text-overflow:ellipsis">${esc(a)}</div><small style="color:var(--mute)">${n} ${L2(n===1?"serie":"series","series")}${base?" · "+L2("fija","built-in"):""}</small></div>${can?`<button class="pdel" data-a="${esc(a)}" onclick="platDel(this.dataset.a)" style="background:none;border:0;color:var(--o);font:inherit;font-size:14px;padding:6px;cursor:pointer">${L2("Eliminar","Delete")}</button>`:!base?`<small style="color:var(--mute);text-align:right;max-width:120px">${L2("En uso","In use")}</small>`:""}</div>`}).join("");
  $("ov").innerHTML=`<div class="card"><div class="ot"><b>${L2("Plataformas","Platforms")}</b><span>${L2("Solo se pueden eliminar si ninguna serie las usa","Can only be deleted when no series use them")}</span></div><div style="max-height:50vh;overflow-y:auto">${rows}</div><div style="display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--bg)"><input id="pl-n" maxlength="30" placeholder="${L2("Nueva plataforma","New platform")}" style="flex:1;min-width:0;background:var(--bg);border:0;border-radius:10px;padding:10px 12px;color:var(--tx);font:inherit;font-size:15px;outline:0" onkeydown="if(event.key==='Enter'){event.preventDefault();platAdd()}"><button onclick="platAdd()" style="background:var(--g);border:0;border-radius:10px;color:#fff;font:inherit;font-weight:700;padding:0 14px;cursor:pointer">${L2("Añadir","Add")}</button></div></div><button class="card" onclick="platClose()">${L2("Listo","Done")}</button>`;$("ov").classList.add("open")}
function platClose(){const v=$("f-app").value;closeOv();fmApps(v==="__new"?"":v)}
function platAdd(){const inp=$("pl-n"),v=inp.value.trim().replace(/\s+/g," ").slice(0,30);if(!v)return;
  if(appsAll().some(x=>x.toLowerCase()===v.toLowerCase())){toast(L2("Ya existe","Already exists"));return}
  PLT.push(v);if(sb&&U)sb.from("platforms").insert({name:v}).then(r=>{if(r.error)console.error(r.error)});platOpen()}
async function platDel(v){if(appN(v)){toast(L2("Hay series con esta plataforma","Some series use this platform"));return}
  if(sb&&U&&PLT.some(x=>x.toLowerCase()===v.toLowerCase())){const r=await sb.from("platforms").delete().ilike("name",v.replace(/[%_\\]/g,"\\$&")).select("id");if(r.error||!(r.data||[]).length){toast(L2("Solo quien la creó puede eliminarla","Only its creator can delete it"));return}}
  PLT=PLT.filter(x=>x.toLowerCase()!==v.toLowerCase());platOpen();toast(L2("Plataforma eliminada","Platform deleted"))}
function appCommit(){const s=$("f-app"),inp=$("f-app2"),v=inp.value.trim().replace(/\s+/g," ").slice(0,30);
  if(!v){s.value=appPrev;inp.style.display="none";return}
  const ex=[...s.options].find(o=>o.value!=="__new"&&o.value.toLowerCase()===v.toLowerCase());
  if(ex)s.value=ex.value;else{s.add(new Option(v,v),s.options[s.options.length-1]);s.value=v;if(sb&&U&&!PLT.some(x=>x.toLowerCase()===v.toLowerCase())&&!appBase(v)){PLT.push(v);sb.from("platforms").insert({name:v}).then(r=>{if(r.error)console.error(r.error)})}}
  appPrev=s.value;appDelUi();inp.value="";inp.style.display="none"}
$("f-app").onchange=()=>{const s=$("f-app");if(s.value==="__new"){const inp=$("f-app2");inp.style.display="block";inp.value="";inp.focus()}else{appPrev=s.value;$("f-app2").style.display="none";appDelUi()}};
$("f-app2").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();appCommit()}};$("f-app2").onblur=appCommit;
$("f-app").innerHTML=APPS0.map(a=>`<option>${a}</option>`).join("")+`<option value="__new">＋ Añadir plataforma…</option>`;

const IC={home:'<rect x="5" y="3" width="11" height="18" rx="2"/><path d="M19 6v12"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',add:'<circle cx="12" cy="12" r="10"/><path d="M12 7v10M7 12h10"/>',act:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'};
const EI={tv:'<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M8 21h8M12 18v3"/>',book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6"/>',list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>',tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',alert:'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/>',filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'};
/* Empty states: un único componente (EMP) para toda la app. Variantes cortas: */
const EMN=c=>EMP("search",L2("Sin resultados","No results"),L2("Prueba con otra búsqueda.","Try a different search."),"","",c),
 EMF=c=>EMP("filter",L2("Sin coincidencias","No matches"),L2("Prueba a cambiar o quitar los filtros.","Try changing or removing the filters."),"","",c),
 EMH=c=>EMP("tv",L2("Nada por aquí todavía","Nothing here yet"),L2("Cuando haya series, aparecerán aquí.","Series will show up here once there are some."),"","",c),
 EMC=()=>EMP("search",L2("Sin resultados","No results"),L2("Ninguna serie de tu catálogo coincide.","No series in your catalog match."),"","","sm"),
 EME=(es,en)=>EMP("alert",L2(es,en),L2("Revisa tu conexión e inténtalo de nuevo.","Check your connection and try again."),"","","sm"),
 EMV=o=>EMP("list",L2("Lista vacía","Empty list"),o?L2("Pulsa ••• y Editar para añadir series.","Tap ••• and Edit to add series."):L2("Esta lista aún no tiene series.","This list has no series yet."),"","",o?"":"sm"),
 EMS=()=>EMP("alert",L2("Sin sincronizar","Not synced"),L2("Esta serie aún no está sincronizada.","This series hasn't been synced yet."),"","","sm");
const EMP=(ic,t,sub,btn,fn,cls)=>`<div class="empty em${cls?" "+cls:""}"><div class="emi">${svg(EI[ic]||EI.tv,44)}</div><b>${t}</b>${sub?`<p>${sub}</p>`:""}${btn?`<button class="emb" onclick="${fn}">${btn}</button>`:""}</div>`;
const RWI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/></svg>';
const svg=(p,s=28)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const LOGO=`<svg viewBox="0 0 24 24" width="26" height="26"><defs><clipPath id="ca"><polygon points="0,0 14,0 10,24 0,24"/></clipPath><clipPath id="cb"><polygon points="14,0 24,0 24,24 10,24"/></clipPath></defs><g clip-path="url(#ca)"><path fill="var(--g)" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></g><g clip-path="url(#cb)"><path transform="translate(1.2 -1.4)" fill="var(--o)" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></g></svg>`;


/* Anti-parpadeo: #sub (reseñas, actividad, miembros…) y #lst (listas) se repintan a menudo cuando llegan datos
   (refresh, likes, cargas en segundo plano). Si el HTML nuevo es idéntico al último que se escribió y nadie ha
   añadido/quitado nodos desde entonces, no se toca el DOM: así no se recrean pósters/avatares ni se reinician
   animaciones. (No se compara con el DOM real porque el traductor ES→EN cambia textos después de pintar.)
   Si algo difiere, se repinta como siempre. */
(function(){const d=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");if(!d||!d.set||!window.MutationObserver)return;
  ["sub","lst"].forEach(id=>{const el=document.getElementById(id);if(!el)return;
    let last=null,dirty=true;const mo=new MutationObserver(ms=>{if(ms.some(m=>m.type==="childList"))dirty=true});mo.observe(el,{childList:true,subtree:true});
    Object.defineProperty(el,"innerHTML",{configurable:true,get(){return d.get.call(this)},set(h){
      if(mo.takeRecords().some(m=>m.type==="childList"))dirty=true;
      h=String(h);if(!dirty&&h===last&&d.get.call(this))return;
      d.set.call(this,h);last=h;mo.takeRecords();dirty=false}})})})();
