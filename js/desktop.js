const DSK=()=>matchMedia("(min-width:1024px)").matches;
function dnTo(t,k){go(t);if(k)setSeg(k)}
let dnO=0;
function dnTog(){if(dnO)dnX();else{dnO=1;$("dn").classList.add("so");const i=$("dsq");if(i){i.value=tab==="search"?q:"";i.focus()}}}
function dnX(){dnO=0;$("dn").classList.remove("so");const i=$("dsq");if(i)i.blur();if(tab==="search"&&(q||sf))setTimeout(()=>{if(!dnO&&tab==="search"){q="";sf=0;render()}},300)}
function dnIn(v){if(tab==="search"&&!br.length){q=v;sr()}}
function dnKey(e){if(e.key==="Enter"){e.preventDefault();dnGo(e.target.value)}else if(e.key==="Escape")dnX()}
function dnGo(v){v=(v||"").trim();if(!v)return;["det","lst","sub"].forEach(k=>$(k).classList.remove("open"));q=v;br=[];sf=0;tab="search";dnO=1;rsqAdd();render();$("mn").scrollTop=0;const i=$("dsq");if(i)i.blur()}
const comAvg=i=>{const c=com[key(i)];return Math.round((c&&c.length?c.reduce((a,b)=>a+b,0)/c.length:i.rating||0)*2)/2};
function dhome(fi){
  if(FEED===null&&DSK()){FEED=0;loadFeed()}
  const pp=i=>(com[key(i)]||[]).length+(i.rating?1:0),pop=bfFilt([...catAll()]).sort((a,b)=>pp(b)-pp(a)||b.watched-a.watched).slice(0,6),
   row=l=>`<div class="drow">${l.map(i=>`<div>${poster(i)}<div class="ss">${comAvg(i)?S(comAvg(i)):""}</div></div>`).join("")}</div>`,
   sh=(t,more,f)=>`<div class="dsh"><span>${t}</span><span class="dsr">${f?bfBtn("",true):""}${more}</span></div>`,
   mo=(l,fn)=>`<a onclick="${fn}">${l} ›</a>`;
  const rv=(Array.isArray(FEED)?FEED:[]).filter(o=>o.k==="e"&&o.x.review).slice(0,4).map(o=>{const x=o.x,r=nrm(x),it=sCache(x.series),n=pname(x.profiles);
    return `<div class="drv" onclick="openReview('${x.id}')"><div class="drp">${nop(it)}</div><div><h4>${esc(short(it.title))}${r.r?` <span class="fxst">${S(r.r)}</span>`:""}</h4><div class="m">${esc(n)} · ${rel(o.ts)}</div><p>${x.spoilers?`<i>⚠ ${L2("Contiene spoilers","Contains spoilers")}</i>`:esc(x.review.slice(0,260))}</p></div></div>`}).join("");
  const rvH=FEED===0||FEED===null?`<div class="empty ld">${L2("Cargando…","Loading…")}</div>`:rv||EMP("chat",L2("Aún no hay reseñas","No reviews yet"),FW.size?L2("Tus amigos aún no han escrito reseñas.","Your friends haven't written reviews yet."):L2("Sigue a otros miembros para ver aquí sus reseñas.","Follow other members to see their reviews here."),"","","sm");
  const wk=Date.now()-7*864e5,E=(DEN.length?DEN.map(e=>({wd:Date.parse(e.wd),r:e.r,t:e.t})):items.filter(i=>i.watchedOn).map(i=>({wd:+i.watchedOn,r:i.rating,t:""}))).filter(e=>e.wd>=wk),
   rt=E.filter(e=>e.r>0),avg=rt.length?(rt.reduce((a,e)=>a+e.r,0)/rt.length).toFixed(1):"–";
  const st=(n,l)=>`<div><b>${n}</b><span>${l}</span></div>`;
  const th=tmCounts().slice(0,10).map(t=>`<span class="tag" data-v="${esc(t.l)}" onclick="goBr('trope',this.dataset.v)">${esc(t.l)}</span>`).join("");
  const ls=lists.slice(0,4).map(l=>{const n=l.ids.map(get).filter(Boolean).length;return `<div class="dli" onclick="openList(${l.id})"><b>${esc(l.name)}</b><span>${n} ${n===1?L2("serie","series"):"series"}</span></div>`}).join("")||`<div class="dli" onclick="editList()"><b>${L2("Crea tu primera lista","Create your first list")}</b><span>＋</span></div>`;
  return `<div class="dhm">${sh(L2("Populares ahora","Popular right now"),mo(L2("MÁS","MORE"),"goBr('pop')"),1)}${pop.length?row(pop):EMH("sm")}
  <div class="dcols"><div>${sh(L2("Reseñas recientes de amigos","Recent reviews from friends"),mo(L2("TODAS","ALL"),"dnTo('home','rev')"))}${rvH}
  ${sh(L2("Añadidas recientemente","Recently added"),mo(L2("MÁS","MORE"),"goBr('recent')"))}${fi.length?row(fi.slice(0,5)):EMH("sm")}</div>
  <aside class="dside"><div class="dbx"><h5>${L2("Tu semana","Your week")}</h5><div class="dst">${st(E.length,L2("REGISTROS","LOGGED"))}${st(E.filter(e=>e.t).length,L2("RESEÑAS","REVIEWS"))}${st(avg,L2("MEDIA ★","AVG ★"))}</div></div>
  <div class="dbx"><h5>${L2("Tus listas","Your lists")}</h5>${ls}</div>
  ${th?`<div class="dbx"><h5>${L2("Temas en tendencia","Trending themes")}</h5>${th}</div>`:""}</aside></div></div>`}
function wbanner(){const f=[...items].filter(i=>i.cover).sort((a,b)=>b.rating-a.rating)[0]||catAll().find(i=>i.cover),hh=hue(f?f.title:"microboxd");
  const bg=f?`background-image:url('${f.cover.replace(/'/g,"%27")}')`:`background:linear-gradient(135deg,hsl(${hh},55%,34%),hsl(${(hh+60)%360},50%,16%))`;
  const n=items.filter(i=>i.status==="done"||(i.dcount||0)>0).length;
  return `<div class="wb"><div class="bg" style="${bg}"></div><h2>${L2("Hola de nuevo, ","Welcome back, ")}${esc(uname())}. ${L2("Esto es lo que se está viendo…","Here's what's being watched…")}</h2><p>${n?L2("Llevas "+n+(n===1?" serie vista":" series vistas")+". ¿Qué has visto hoy?","You've watched "+n+" series. What did you watch today?"):L2("Valora, reseña y sigue todas las micro-series que ves.","Rate, review and keep track of every micro-series you watch.")}</p><button class="dnb" onclick="openAdd()">${L2("REGISTRAR UNA SERIE","LOG A SERIES")}</button></div>`}
function poster(i){
  const h=hue(i.title);
  return `<div class="poster" onclick="show(${i.id})">${i.cover?`<img src="${i.cover}" alt="">`:
  `<div class="fb" style="background:linear-gradient(160deg,hsl(${h},60%,38%),hsl(${(h+50)%360},65%,16%))"><small>${esc(i.app)}</small><b>${esc(short(i.title))}</b></div>`}</div>`;
}
const cell=i=>`<div>${poster(i)}<div class="ss">${S(i.rating)}</div></div>`;
const grid=(l,c)=>l.length?`<div class="grid ${c||""}">${l.map(cell).join("")}</div>`:EMH();
const hrow=(t,l)=>l.length?`<h3 class="sec">${t}</h3><div class="hrow">${l.map(i=>`<div class="hp">${poster(i)}<div class="ss">${S(i.rating)}</div></div>`).join("")}</div>`:"";


/* Ir a explorar (Populares, Recientes, un tema) desde Inicio: descarta la búsqueda anterior para no abrir sus resultados */
const goBr=(t,v)=>{q="";br=[];go("search");brPush(t,v)};
