const BFK="mbx-bf",BF0={sort:"",fade:false,apps:[],themes:[],eps:"",dur:"",w:"",lk:"",rt:"",wl:""},BFG=["app","trope","pop","top","recent","all"];
let BF=(()=>{try{return Object.assign({},BF0,JSON.parse(localStorage.getItem(BFK)||"{}"))}catch(e){return Object.assign({},BF0)}})(),bd=null,bfPick=null;
const bfN=f=>(f.sort?1:0)+(f.fade?1:0)+(f.apps.length?1:0)+(f.themes.length?1:0)+["eps","dur","w","lk","rt","wl"].filter(k=>f[k]).length;
const bfAny=()=>L2("Cualquiera","Any"),bfYN=(a,b)=>[["",bfAny()],["y",a],["n",b]];
const bfR=()=>({
 sort:[["",L2("Predeterminado","Default")],["new",L2("Añadidas recientemente","Recently added")],["old",L2("Más antiguas primero","Oldest first")],["az",L2("Título A–Z","Title A–Z")],["za",L2("Título Z–A","Title Z–A")],["rate",L2("Mi valoración, mayor primero","My rating, highest first")],["pop",L2("Más populares","Most popular")],["eps+",L2("Más episodios","Most episodes")],["eps-",L2("Menos episodios","Fewest episodes")],["dur+",L2("Mayor duración","Longest")],["dur-",L2("Menor duración","Shortest")]],
 eps:[["",bfAny()],["0-30",L2("Hasta 30","Up to 30")],["31-60","31–60"],["61-100","61–100"],["101-99999",L2("Más de 100","Over 100")]],
 dur:[["",bfAny()],["0-60",L2("Hasta 1 h","Up to 1 h")],["61-180","1–3 h"],["181-360","3–6 h"],["361-9999999",L2("Más de 6 h","Over 6 h")]],
 w:bfYN(L2("Vistas","Watched"),L2("No vistas","Not watched")),lk:bfYN(L2("Con me gusta","Liked"),L2("Sin me gusta","Not liked")),rt:bfYN(L2("Valoradas","Rated"),L2("Sin valorar","Not rated")),wl:bfYN(L2("En mi watchlist","On my watchlist"),L2("Fuera de mi watchlist","Not on my watchlist"))});
const bfW=i=>i.status==="done"||(i.dcount||0)>0||!!i.watchedOn,bfIn=(v,r)=>{const[a,b]=r.split("-").map(Number);return v!=null&&v>=a&&v<=b};
function bfFilt(l){const f=BF;return l.filter(i=>{
  if(f.apps.length&&!f.apps.some(a=>a.toLowerCase()===(i.app||"").trim().toLowerCase()))return false;
  if(f.themes.length&&!f.themes.every(t=>hasT(i,t)))return false;
  if(f.eps&&!bfIn(i.eps,f.eps))return false;if(f.dur&&!bfIn(i.epm,f.dur))return false;
  const yn=(k,v)=>!f[k]||(f[k]==="y")===!!v;
  return yn("w",bfW(i))&&yn("lk",i.liked)&&yn("rt",i.rating>0)&&yn("wl",i.wl||i.status==="want")})}
function bfApply(l){const f=BF,r=bfFilt(l);
  const nv=(a,b)=>a==null?(b==null?0:1):b==null?-1:0,pp=i=>(com[key(i)]||[]).length+(i.rating?1:0);
  const S={new:(a,b)=>(b.added||0)-(a.added||0),old:(a,b)=>(a.added||0)-(b.added||0),az:(a,b)=>a.title.localeCompare(b.title),za:(a,b)=>b.title.localeCompare(a.title),rate:(a,b)=>b.rating-a.rating,pop:(a,b)=>pp(b)-pp(a),
   "eps+":(a,b)=>(b.eps||0)-(a.eps||0),"eps-":(a,b)=>(a.eps||0)-(b.eps||0),"dur+":(a,b)=>nv(a.epm,b.epm)||(b.epm||0)-(a.epm||0),"dur-":(a,b)=>nv(a.epm,b.epm)||(a.epm||0)-(b.epm||0)}[f.sort];
  return S?[...r].sort(S):r}
const bfGrid=l=>{const r=bfApply(l);if(!r.length)return bfN(BF)?EMF():EMH();
  const cl=i=>BF.fade&&bfW(i)?cell(i).replace("<div>",'<div class="fw">'):cell(i);
  // Big catalogues: paint a first batch and append the rest as the sentinel scrolls into view.
  const id=r.length>GB?++gid:0;if(id){GM.set(id,{r,cl,n:GB});for(const k of GM.keys()){if(GM.size<=6)break;GM.delete(k)}}
  return `<div class="grid g3">${r.slice(0,id?GB:r.length).map(cl).join("")}${id?`<div class="gmore" data-g="${id}"></div>`:""}</div>`};
const GB=60,GM=new Map();let gid=0;
(()=>{if(typeof IntersectionObserver!=="function"||typeof MutationObserver!=="function")return;
  const io=new IntersectionObserver(es=>{for(const e of es){if(!e.isIntersecting)continue;const el=e.target,g=GM.get(+el.dataset.g);io.unobserve(el);
    if(!g){el.remove();continue}
    const nx=g.r.slice(g.n,g.n+GB);g.n+=GB;el.insertAdjacentHTML("beforebegin",nx.map(g.cl).join(""));
    if(g.n>=g.r.length){GM.delete(+el.dataset.g);el.remove()}else io.observe(el)}},{rootMargin:"600px 0px"});
  const scan=()=>document.querySelectorAll(".gmore:not([data-o])").forEach(el=>{el.dataset.o=1;io.observe(el)});
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});scan()})();
const bfBtn=(c,ns)=>`<button class="bfb${bfN(BF)?" on":""}${c?" "+c:""}" aria-label="${L2("Filtros","Filters")}" onclick="bfOpen(${ns?"true":""})">${svg(BFIC,22)}</button>`;
const BFIC='<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>';
let bfNS=false,bfCtx=null;
function bfOpen(ns){bfNS=ns===true;bd=JSON.parse(JSON.stringify(BF));bfDraw();const f=$("fp");clearTimeout(f._t);f.classList.remove("out");f.classList.add("bf","open")}
function bfClose(){const f=$("fp");if(!f.classList.contains("open")||f.classList.contains("out"))return;f.classList.add("out");f._t=setTimeout(()=>f.classList.remove("open","out","bf"),240)}
function bfLbl(k){const f=bd,R=bfR();if(k==="apps")return f.apps.length?(f.apps.length>1?f.apps.length+" ":"")+f.apps.join(", "):bfAny();if(k==="themes")return f.themes.length?f.themes.join(", "):bfAny();const o=R[k].find(x=>x[0]===f[k]);return o?o[1]:bfAny()}
function bfDraw(){const keep=($("fp").querySelector(".bfs")||{}).scrollTop||0,N=(l,k)=>`<div class="srow" onclick="bfSel('${k}')"><span>${l}</span><span class="sv2">${esc(bfLbl(k))}</span><i class="chv">›</i></div>`;
  $("fp").innerHTML=`<div class="lef bfs" style="overflow-y:auto;height:100%"><div class="leh"><button onclick="bd=null;bfClose()">${L2("Cancelar","Cancel")}</button><b>${L2("Filtros","Filters")}</b><button class="sv" onclick="bfDone()">${L2("Hecho","Done")}</button></div>
  ${bfNS?"":`<div class="sgrp">${N(L2("Ordenar por","Sort by"),"sort")}</div>`}
  <div class="slb">${L2("Apariencia","Appearance")}</div><div class="sgrp"><div class="srow"><span>${L2("Atenuar vistas","Fade watched")}</span><button class="sw ${bd.fade?"on":""}" aria-label="${L2("Atenuar vistas","Fade watched")}" onclick="bd.fade=!bd.fade;this.classList.toggle('on',bd.fade)"></button></div></div>
  <div class="slb">${L2("Contenido","Content")}</div><div class="sgrp">${N(L2("Plataforma","Platform"),"apps")}${N(L2("Temas","Themes"),"themes")}${N(L2("Episodios","Episodes"),"eps")}${N(L2("Duración total","Total duration"),"dur")}</div>
  <div class="slb">${L2("Mi cuenta","My account")}</div><div class="sgrp">${N(L2("Vistas","Watched"),"w")}${N(L2("Me gusta","Liked"),"lk")}${N(L2("Valoradas","Rated"),"rt")}${N(L2("Watchlist","Watchlist"),"wl")}</div>
  <div class="srow so" style="margin-top:26px" onclick="bd=JSON.parse(JSON.stringify(BF0));bfDraw()"><span>${L2("Restablecer filtros","Reset filters")}</span></div><div style="height:40px"></div></div>`;
  const e=$("fp").querySelector(".bfs");if(e)e.scrollTop=keep}
function bfDone(){BF=bd;bd=null;try{localStorage.setItem(BFK,JSON.stringify(BF))}catch(e){}bfClose();if(bfCtx&&$("lst").classList.contains("open")&&$("lst").querySelector(".bfb")){const y=$("lst").scrollTop;bfCtx();$("lst").scrollTop=y}render()}
function bfSel(k){const multi=k==="apps"||k==="themes";let opts;
  if(k==="apps")opts=appsAll().map(a=>[a,appN(a)]);
  else if(k==="themes"){const tm=new Map();catAll().forEach(i=>{const seen=new Set();(i.tropes||[]).forEach(t=>{const q=tkey(t);if(!q)return;if(!tm.has(q))tm.set(q,{l:t.trim(),n:0});if(!seen.has(q)){seen.add(q);tm.get(q).n++}})});opts=[...tm.values()].sort((a,b)=>b.n-a.n||a.l.localeCompare(b.l)).map(x=>[x.l,x.n])}
  else opts=bfR()[k];bfPick={k,multi,opts};bfPickDraw()}
function bfPickDraw(){const{k,multi,opts}=bfPick,keep=($("ov").querySelector(".bfl")||{}).scrollTop||0,on=o=>multi?bd[k].some(x=>tkey(x)===tkey(o)):bd[k]===o;
  const ttl={sort:L2("Ordenar por","Sort by"),apps:L2("Plataforma","Platform"),themes:L2("Temas","Themes"),eps:L2("Episodios","Episodes"),dur:L2("Duración total","Total duration"),w:L2("Vistas","Watched"),lk:L2("Me gusta","Liked"),rt:L2("Valoradas","Rated"),wl:"Watchlist"}[k];
  const rows=opts.length?opts.map((o,j)=>{const v=multi?o[0]:o[0],lab=multi?o[0]:o[1];return `<button class="oi" style="display:flex;justify-content:space-between;gap:12px;text-align:left" onclick="bfTog(${j})"><span>${esc(lab)}${multi?` <small style="color:var(--mute)">${o[1]}</small>`:""}</span><span style="color:var(--g)">${on(v)?"✓":""}</span></button>`}).join(""):`<div class="ot"><span>${L2("Aún no hay temas.","No themes yet.")}</span></div>`;
  $("ov").innerHTML=`<div class="card"><div class="ot"><b>${ttl}</b>${k==="themes"?`<span>${L2("Deben coincidir todos los elegidos","Series must have all selected themes")}</span>`:""}</div><div class="bfl" style="max-height:52vh;overflow-y:auto">${rows}</div></div><button class="card" onclick="bfPickClose()">${multi?L2("Listo","Done"):L2("Cancelar","Cancel")}</button>`;$("ov").classList.add("open");const e=$("ov").querySelector(".bfl");if(e)e.scrollTop=keep}
function bfTog(j){const{k,multi,opts}=bfPick,o=opts[j];if(!multi){bd[k]=o[0];bfPickClose();return}
  const a=bd[k],x=a.findIndex(t=>tkey(t)===tkey(o[0]));if(x>=0)a.splice(x,1);else a.push(o[0]);bfPickDraw()}
function bfPickClose(){bfPick=null;closeOv();bfDraw()}
