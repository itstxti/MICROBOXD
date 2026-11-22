const PLUS='<path d="M12 5v14M5 12h14"/>',CHK='<path d="M5 12.5l4.5 4.5L19 7.5"/>';
const mflIn=on=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${on?CHK:PLUS}</svg>`;
const mflPaint=(uid,on)=>document.querySelectorAll(`.mfl[data-u="${uid}"]`).forEach(b=>{b.classList.toggle("on",on);b.setAttribute("aria-label",on?"Siguiendo":"Seguir");b.innerHTML=mflIn(on)});
let MEMQ=null,MEMH=null;const memQ=()=>q.trim().replace(/[%,()*]/g," ").trim();
/* Mientras llega la búsqueda se mantiene lo anterior (filas o "Sin resultados"); si aún no hubo ninguna, en blanco: así no parpadea */
const memHtml0=()=>q.trim()?(MEM.length?MEM.map(m=>{UN[m.id]=pname(m);const on=FW.has(m.id);return `<div class="mrow" onclick="openUser('${m.id}')">${av2(pname(m),40,m.avatar_path)}<div class="mbd"><div class="mtx"><b>${esc(pname(m))}</b><span>${esc(m.username)}</span></div><button class="mfl ${on?"on":""}" data-u="${m.id}" aria-label="${on?"Siguiendo":"Seguir"}" onclick="event.stopPropagation();fbClick('${m.id}')">${mflIn(on)}</button></div></div>`}).join(""):MEMQ===null?"":EMN()):EMP("users",L2("Buscar miembros","Search members"),L2("Escribe un nombre para encontrar a otros usuarios.","Type a name to find other members."));
const memHtml=()=>MEMH=memHtml0();
function memSearch(){clearTimeout(memT);memT=setTimeout(async()=>{const t=memQ();if(!t){MEM=[];MEMQ="";return}const k=++mq;
  try{const{data,error}=await sb.from("profiles").select("id,username,display_name,avatar_path").or(`username.ilike.%${t}%,display_name.ilike.%${t}%`).neq("id",U.id).limit(20);if(error)throw error;if(k!==mq)return;MEM=data;MEMQ=t;const e=$("mem"),h=memHtml0();if(e&&h!==MEMH){MEMH=h;e.innerHTML=h}}catch(e){console.error(e)}},250)}
/* ===== Formulario: personajes con foto ===== */
let fc=[];
function drawFc(){$("fcl").innerHTML=fc.map((r,k)=>`<div class="fcr"><label class="cph ${r.img?"has":""}" ${r.img?`style="background-image:url(${r.img})"`:""}>${r.img?"":svg(IC.me,22)}<input type="file" accept="image/*" hidden onchange="fcPh(${k},this)"></label><div class="fcn"><input placeholder="Nombre del personaje" maxlength="60" value="${esc(r.n)}" oninput="fc[${k}].n=this.value"><input placeholder="Actor o actriz (opcional)" maxlength="60" value="${esc(r.r)}" oninput="fc[${k}].r=this.value"></div><button type="button" class="fcx" aria-label="Quitar" onclick="fc.splice(${k},1);drawFc()">×</button><div class="lxg" onpointerdown="fcDrag(event,${k})" aria-label="${L2("Reordenar","Reorder")}"><div class="lxh"></div></div></div>`).join("");$("fca").style.display=fc.length>=20?"none":""}
function fcDrag(e,k0){e.preventDefault();const h=e.currentTarget,row=h.closest(".fcr"),n=row.parentNode.children.length,rh=row.offsetHeight,y0=e.clientY;let k1=k0;
  row.classList.add("drag");try{h.setPointerCapture(e.pointerId)}catch(_){}
  const mv=ev=>{const dy=ev.clientY-y0;row.style.transform="translateY("+dy+"px)";k1=Math.max(0,Math.min(n-1,k0+Math.round(dy/rh)))};
  const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);if(k1!==k0){const[m]=fc.splice(k0,1);fc.splice(k1,0,m)}drawFc()};
  addEventListener("pointermove",mv);addEventListener("pointerup",up);addEventListener("pointercancel",up)}
function fcPh(k,inp){const f=inp.files[0];if(!f)return;imgCrop(f,4/5,360,.9,{t:L2("Ajustar foto","Adjust photo")}).then(d=>{if(d){fc[k].img=d;drawFc()}});inp.value=""}
$("fca").onclick=()=>{if(fc.length<20){fc.push({n:"",r:"",img:""});drawFc();const i=$("fcl").querySelectorAll(".fcn input");if(i.length>=2)i[i.length-2].focus()}};
drawFc();
/* ===== Editar / eliminar serie (reutiliza el formulario de creación) ===== */
let editId=null;
const canEdit=i=>!!i&&(!!i.fresh||(!!U&&i.created_by===U.id));
const TM_MAX=20;
const tmGet=()=>($("f-tropes").value||"").split(",").map(t=>t.trim()).filter(Boolean);
function tmSet(a){const seen=new Set(),o=[];a.forEach(t=>{const k=tkey(t);if(k&&!seen.has(k)&&o.length<TM_MAX){seen.add(k);o.push(t.trim())}});$("f-tropes").value=o.join(", ");tmDraw()}
function tmCounts(){const m=new Map();catAll().forEach(i=>{const seen=new Set();(i.tropes||[]).forEach(t=>{const k=tkey(t);if(!k)return;if(!m.has(k))m.set(k,{l:t.trim(),n:0});if(!seen.has(k)){seen.add(k);m.get(k).n++}})});return [...m.entries()].map(([k,v])=>({k,...v})).sort((a,b)=>b.n-a.n||a.l.localeCompare(b.l))}
let tmSw=false;
function tmDrag(e){const el=e.target.closest(".tmx");if(!el||e.target.closest("i"))return;const box=$("tmc"),x0=e.clientX,y0=e.clientY;let drag=false,ox=0,oy=0;
  const t=setTimeout(()=>{drag=true;pfOn=true;el.classList.add("drag");const r=el.getBoundingClientRect();ox=x0-(r.left+r.width/2);oy=y0-(r.top+r.height/2);try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}},260);
  const place=(px,py)=>{el.style.transform="";const r=el.getBoundingClientRect();el.style.transform=`translate(${px-ox-(r.left+r.width/2)}px,${py-oy-(r.top+r.height/2)}px)`};
  const mv=ev=>{if(!drag){if(Math.abs(ev.clientX-x0)>8||Math.abs(ev.clientY-y0)>8)clearTimeout(t);return}ev.preventDefault();
    const px=ev.clientX,py=ev.clientY,o=[...box.children].find(c=>c!==el&&(r=>px>=r.left&&px<=r.right&&py>=r.top&&py<=r.bottom)(c.getBoundingClientRect()));
    if(o){const kids=[...box.children];if(kids.indexOf(o)>kids.indexOf(el))o.after(el);else o.before(el)}place(px,py)};
  const up=()=>{clearTimeout(t);removeEventListener("pointermove",mv);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);if(!drag)return;pfOn=false;
    tmSw=true;setTimeout(()=>tmSw=false,50);const cur=tmGet(),a=[...box.children].map(c=>cur[+c.dataset.i]);tmSet(a)};
  addEventListener("pointermove",mv,{passive:false});addEventListener("pointerup",up);addEventListener("pointercancel",up)}
document.addEventListener("click",e=>{if(tmSw){e.stopPropagation();e.preventDefault()}},true);
$("tmc").addEventListener("pointerdown",tmDrag);
function tmDraw(){const cur=tmGet(),ks=new Set(cur.map(tkey));
  $("tmc").innerHTML=cur.map((t,i)=>`<span class="tmx" data-i="${i}">${esc(t)}<i onclick="event.stopPropagation();tmDel(${i})" aria-label="${L2("Quitar","Remove")}">×</i></span>`).join("");
  $("tmn").textContent=cur.length?cur.length+" / "+TM_MAX:"";
  const q=tkey($("f-tq").value),all=tmCounts();
  if(q){const m=all.filter(x=>!ks.has(x.k)&&x.k.includes(q)).sort((a,b)=>(b.k.startsWith(q)-a.k.startsWith(q))||b.n-a.n).slice(0,5),exact=all.some(x=>x.k===q)||ks.has(q);
    $("tmd").innerHTML=`<div class="tmdd">${m.map(x=>`<div data-t="${esc(x.l)}" onmousedown="event.preventDefault()" onclick="tmAdd(this.dataset.t)"><span>${esc(x.l)}</span><small>${x.n} ${LANG==="es"&&x.n===1?"serie":"series"}</small></div>`).join("")}${exact?"":`<div class="mk" data-t="${esc($("f-tq").value.trim())}" onmousedown="event.preventDefault()" onclick="tmAdd(this.dataset.t)"><span>${L2("Crear","Create")} “${esc($("f-tq").value.trim())}”</span></div>`}</div>`;$("tmp").innerHTML=""}
  else{$("tmd").innerHTML="";const pop=all.filter(x=>!ks.has(x.k)).slice(0,8);
    $("tmp").innerHTML=pop.length&&cur.length<TM_MAX?`<p class="fl" style="margin-top:14px">${L2("Populares","Popular")}</p>`+pop.map(x=>`<button type="button" class="tmx sg" data-t="${esc(x.l)}" onclick="tmAdd(this.dataset.t)"><b>+</b> ${esc(x.l)}</button>`).join(""):""}}
function tmAdd(t){tmSet([...tmGet(),t]);$("f-tq").value="";tmDraw()}
function tmDel(i){const a=tmGet();a.splice(i,1);tmSet(a)}
function tmCommit(){const v=($("f-tq")||{}).value;if(v&&v.trim()){$("f-tq").value="";tmSet([...tmGet(),v.trim()])}}
function tmIn(){const el=$("f-tq");if(el.value.includes(",")){const parts=el.value.split(",");el.value=parts.pop();tmSet([...tmGet(),...parts.map(x=>x.trim()).filter(Boolean)])}tmDraw()}
function tmKey(e){if(e.key==="Enter"){e.preventDefault();tmCommit();tmDraw()}else if(e.key==="Backspace"&&!$("f-tq").value){const a=tmGet();if(a.length){a.pop();tmSet(a)}}}
function fmReset(){fmApps();["f-title","f-syn","f-tropes","f-tq","f-eps","f-min","f-img"].forEach(k=>$(k).value="");tmDraw();fc=[];drawFc();cover="";$("prev").style.display="none";$("dup").style.display="none"}
function fmMode(ed){$("ftl").textContent=ed?"Editar serie":"Nueva serie";$("save").textContent=ed?"Guardar cambios":"Guardar serie";$("fdel").style.display=ed?"":"none";$("form").style.zIndex="35";$("form").scrollTop=0;$("form").classList.add("open")}
function fmNew(t){editId=null;fmReset();$("f-title").value=t||"";fmMode(false)}
function fmEdit(id){const i=get(id);if(!canEdit(i)){toast("Solo puedes editar las series que has creado");return}
  editId=id;fmReset();
  fmApps(i.app);
  $("f-title").value=i.title;$("f-app").value=i.app;$("f-syn").value=i.syn||"";$("f-tropes").value=(i.tropes||[]).join(", ");$("f-tq").value="";tmDraw();$("f-eps").value=i.eps||"";$("f-min").value=i.epm||"";
  fc=(i.cast||[]).map(c=>({n:c.a,r:c.p||"",img:c.ph||"",pp:c.pp||""}));drawFc();
  if(i.cover){$("prev").src=i.cover;$("prev").style.display="block"}
  fmMode(true)}
function askDel(id){const i=get(id);if(!i)return;
  $("ov").innerHTML=`<div class="card"><div class="ot"><b>¿Eliminar “${esc(short(i.title))}”?</b></div><div style="padding:0 18px 16px;color:var(--mute);font-size:15px;line-height:1.4;text-align:center">Se borrará del catálogo y también de las reseñas, diarios y listas de todos los usuarios. No se puede deshacer.</div><button class="oi d" onclick="doDel(${id})">Eliminar serie</button></div><button class="card" onclick="closeOv()">Cancelar</button>`;$("ov").classList.add("open")}
async function doDel(id){const i=get(id);closeOv();if(!i)return;
  try{if(sb&&!i.fresh){const r=await ck(sb.from("series").delete().eq("id",i.sid).select("id"));if(!r.data||!r.data.length)throw new Error("sin permiso");
    try{const ps=[i.cp,...(i.cast||[]).map(c=>c.pp)].filter(Boolean);if(ps.length)await sb.storage.from("covers").remove(ps)}catch(e){}}}
  catch(e){console.error(e);toast("No se pudo eliminar la serie");return}
  items=items.filter(x=>x.id!==id);pendS=pendS.filter(x=>x!==i);pendU=pendU.filter(x=>x!==i);delete cache[id];CAT=CAT.filter(x=>x.id!==id);delete shadow[id];
  lists.forEach(l=>{l.ids=l.ids.filter(x=>x!==id)});prof.fav=(prof.fav||[]).filter(x=>x!==id);dq=dq.filter(e=>e.series!==i);log=log.filter(x=>x.id!==id);
  editId=null;curDet=0;$("form").classList.remove("open");$("det").classList.remove("open");save();render();toast("Serie eliminada")}
$("cancel").onclick=()=>$("form").classList.remove("open");
let dupT=0;$("f-title").oninput=()=>{clearTimeout(dupT);if(editId){$("dup").style.display="none";return}const v=$("f-title").value.trim();if(v.length<4){$("dup").style.display="none";return}
  dupT=setTimeout(async()=>{try{const{data}=await sb.rpc("similar_series",{q:v}),d=data&&data[0];$("dup").style.display=d?"block":"none";if(d)$("dup").textContent="¿Es la misma que “"+d.title+"” ("+d.app+")? Una serie puede tener nombres distintos según la app o el país."}catch(e){}},300)};
$("f-img").onchange=e=>{const inp=e.target,f=inp.files[0];if(!f)return;
  imgCrop(f,2/3,720,.9,{t:L2("Ajustar portada","Adjust cover")}).then(d=>{if(d){cover=d;$("prev").src=cover;$("prev").style.display="block"}});inp.value=""};
const epmv=()=>{const v=parseFloat(($("f-min").value||"").replace(",","."));return v>0&&v<=20000?Math.round(v*10)/10:null};
$("save").onclick=()=>{tmCommit();const title=$("f-title").value.trim();if(!title)return;
  if(editId){const i=get(editId);if(!canEdit(i)){$("form").classList.remove("open");return}
   const cs=fc.filter(r=>r.n.trim());
   Object.assign(i,{title,app:$("f-app").value,syn:$("f-syn").value.trim(),tropes:$("f-tropes").value.split(",").map(s=>s.trim()).filter(Boolean),
    cast:cs.map(r=>({a:r.n.trim(),p:r.r.trim(),ph:r.img||"",pp:r.img&&!r.img.startsWith("data:")?(r.pp||""):""})),
    castTxt:cs.map(r=>r.n.trim()+(r.r.trim()?" ("+r.r.trim()+")":"")).join(", "),eps:Math.max(1,parseInt($("f-eps").value)||1),epm:epmv()});
   if(cover)i.cover=cover;if(!i.fresh&&!pendU.includes(i))pendU.push(i);
   const id=i.id;editId=null;cover="";$("form").classList.remove("open");save();render();show(id,true);toast("Serie actualizada");return}
  const sid=crypto.randomUUID(),it={id:idOf(sid),sid,fresh:true,title,app:$("f-app").value,syn:$("f-syn").value.trim(),
   tropes:$("f-tropes").value.split(",").map(s=>s.trim()).filter(Boolean),cast:fc.filter(r=>r.n.trim()).map(r=>({a:r.n.trim(),p:r.r.trim(),ph:r.img||"",pp:""})),castTxt:fc.filter(r=>r.n.trim()).map(r=>r.n.trim()+(r.r.trim()?" ("+r.r.trim()+")":"")).join(", "),eps:Math.max(1,parseInt($("f-eps").value)||1),epm:epmv(),
   watched:0,rating:0,review:"",status:"",cover,added:Date.now()};
  it._b=iState(it);cache[it.id]=it;pendS.push(it);CAT.unshift(it);addLog("add",it);
  ["f-title","f-syn","f-tropes","f-tq","f-eps","f-min","f-img"].forEach(k=>$(k).value="");tmDraw();fc=[];drawFc();cover="";$("prev").style.display="none";$("dup").style.display="none";
  $("form").classList.remove("open");$("ad").classList.remove("open");save();render();show(it.id)};
boot();
