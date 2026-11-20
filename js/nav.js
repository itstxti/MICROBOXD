/* ===== Escritorio: teclado (Esc, /, Tab), botón Atrás del navegador y enlaces a series =====
   Todo está limitado a pantallas ≥1024px salvo Esc, que es inofensivo en móvil. */
(function(){
const dsk=()=>matchMedia("(min-width:1024px)").matches;
/* Orden del DOM: a igual z-index, el último queda encima */
const LAYERS=["ad","lst","det","sub","le","fp","set","lgs","tgs","ov","form"];
const isOpen=e=>!!e&&e.classList.contains("open")&&!e.classList.contains("out");
function top(){let b=null,bz=-1;for(const id of LAYERS){const e=$(id);if(!isOpen(e))continue;const z=parseInt(getComputedStyle(e).zIndex,10)||0;if(z>=bz){bz=z;b=id}}return b}
function depth(){let n=0;for(const id of LAYERS)if(isOpen($(id)))n++;if(isOpen($("sub"))&&typeof subH!=="undefined")n+=subH.length;return n}
const cancelBtn=id=>[...$(id).querySelectorAll("button")].find(b=>/^(cancelar|cancel|cerrar|close)$/i.test(b.textContent.trim()));
function closeLayer(id){
  if(id==="ov")return closeOv();
  if(id==="lgs")return cancelLog();
  if(id==="det")return closeDet();
  if(id==="sub")return subX();
  if(id==="fp"&&$("fp").classList.contains("bf"))return bfClose();
  if(id==="lst"){$("lst").classList.remove("open");render();return}
  const b=cancelBtn(id);if(b)b.click();else $(id).classList.remove("open")}

/* Esc cierra la capa superior (igual que pulsar Cancelar / Atrás) */
document.addEventListener("keydown",e=>{
  if(e.key!=="Escape"||e.defaultPrevented||e.isComposing)return;
  if(typeof dnO!=="undefined"&&dnO)return; /* la búsqueda del menú ya gestiona Esc */
  const id=top();if(!id)return;e.preventDefault();closeLayer(id)});

/* "/" abre la búsqueda (si no estás escribiendo) */
document.addEventListener("keydown",e=>{
  if(e.key!=="/"||e.ctrlKey||e.metaKey||e.altKey||!dsk())return;
  const t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  if(typeof dnO!=="undefined"&&!dnO&&$("dsq")){e.preventDefault();dnTog()}});

/* Clic fuera de los modales "ligeros" (añadir, filtros, ajustes) los cierra. Los de formulario (serie, lista, registro) no,
   para no perder lo escrito por un clic accidental. */
document.addEventListener("click",e=>{
  if(!dsk())return;const id=top();if(id!=="ad"&&id!=="fp"&&id!=="set")return;
  if($(id).contains(e.target))return;
  e.stopPropagation();e.preventDefault();closeLayer(id)},true);

/* Teclado: los elementos clicables que son <div>/<span> se pueden enfocar con Tab y activar con Enter/Espacio */
const CLK='[onclick]:not(button):not(a):not(input):not(select):not(textarea)';
let at=0;function a11y(){at=0;if(!dsk())return;document.querySelectorAll(CLK+':not([tabindex])').forEach(el=>{el.tabIndex=0;if(!el.hasAttribute("role"))el.setAttribute("role","button")})}
new MutationObserver(()=>{if(!at)at=setTimeout(a11y,80)}).observe(document.body,{childList:true,subtree:true});a11y();
document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ")&&e.target&&e.target.matches&&e.target.matches(CLK+"[tabindex]")){e.preventDefault();e.target.click()}});

/* Historial: cada capa abierta (ficha, lista, reseñas, hojas…) añade una entrada; Atrás la cierra en vez de salir de la app */
let hN=0,skip=0,pend=0;
const sidHash=()=>{const s=typeof curDet!=="undefined"&&curDet&&sidOf(curDet);return s?"#/s/"+s:""};
function urlFor(){return top()==="det"&&sidHash()||undefined}
function sync(){pend=0;if(!dsk())return;const d=depth();
  if(d>hN){while(hN<d){hN++;history.pushState({mbx:hN},"",urlFor())}}
  else if(d<hN){const k=hN-d;hN=d;skip++;history.go(-k)}
  if(d===0&&/^#\/s\//.test(location.hash))history.replaceState(history.state,"",location.pathname+location.search)}
const later=()=>{if(!pend)pend=setTimeout(sync,0)};
const mo=new MutationObserver(later);
LAYERS.forEach(id=>{const e=$(id);if(e)mo.observe(e,{attributes:true,attributeFilter:["class"]})});
mo.observe($("sub"),{childList:true});
addEventListener("popstate",e=>{
  if(skip){skip--;return}if(!dsk())return;
  const t=(e.state&&e.state.mbx)||0;let g=0;
  while(depth()>t&&g++<12){const id=top();if(!id)break;closeLayer(id)}
  hN=t;later()});

/* Cambiar de serie dentro de la ficha actualiza la URL sin añadir entradas */
const _show=show;
show=function(){const r=_show.apply(this,arguments);try{if(dsk()&&top()==="det"){const h=sidHash();if(h&&location.hash!==h)history.replaceState(history.state,"",h)}}catch(_){}return r};

/* Enlaces: #/s/<id-de-serie> abre la ficha (al cargar la app y si cambias el hash a mano) */
function openFromHash(){const m=/^#\/s\/([0-9a-f-]{36})$/i.exec(location.hash);if(!m)return;
  const i=typeof get==="function"&&get(idOf(m[1]));if(i&&!(isOpen($("det"))&&curDet===i.id))show(i.id)}
addEventListener("hashchange",()=>{if(dsk())openFromHash()});
const gate=$("gate");
if(gate){if(gate.style.display==="none")openFromHash();else{const go2=new MutationObserver(()=>{if(gate.style.display==="none"){go2.disconnect();setTimeout(()=>{if(dsk())openFromHash()},50)}});go2.observe(gate,{attributes:true,attributeFilter:["style"]})}}
})();
