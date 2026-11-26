let sb=null,U=null,com={},curDet=0,cache={},CAT=[],shadow={},WLOK=true,shadowL={},shadowP="",dq=[],pushT=0,pushing=false,dirty=false,fails=0,statAt={};
const key=i=>norm(short(i.title));
const idOf=u=>parseInt(String(u).replace(/-/g,"").slice(0,12),16);
const sidOf=id=>{const i=get(id);return i&&i.sid};
/* En BD, "sin estado" se guarda como 'none' (ver migración 0010/0011). */
const stIn=r=>r.status==="none"?"":r.status;
const iState=i=>JSON.stringify([i.status||"",i.watched||0,i.rating||0,!!i.liked,!!i.wl]);
const cvr=p=>p?sb.storage.from("covers").getPublicUrl(p).data.publicUrl:"";
const mapS=r=>{const i={id:idOf(r.id),sid:r.id,title:r.title,app:r.app==="Otra"?"Desconocido":r.app,syn:r.synopsis||"",tropes:r.tropes||[],castTxt:r.cast_text||"",cast:(r.cast_members||[]).map(c=>({a:c.name,p:c.role||"",ph:cvr(c.photo),pp:c.photo||""})),eps:r.episodes,epm:r.duration_minutes?+r.duration_minutes:null,cp:r.cover_path||"",created_by:r.created_by,cover:cvr(r.cover_path),watched:0,rating:0,review:"",status:"",liked:false,added:Date.parse(r.created_at)};i._b=iState(i);return i};
function catAll(){const m=new Map();[...CAT,...items].forEach(i=>m.set(i.id,i));return [...m.values()]}
const listState=l=>JSON.stringify([l.name,l.desc||"",!!l.rank,l.ids.map(sidOf),l.tags||[],l.rep||0,l.ids.map(id=>{const x=(l.nt||{})[id];return x?[x.n||"",!!x.s]:["",false]})]);
const XC={on:true};
function lxOf(l){const nt={};(l.list_items||[]).forEach(x=>{if(x.note||x.spoiler)nt[idOf(x.series_id)]={n:x.note||"",s:!!x.spoiler}});
  const db={tags:l.tags||[],rep:l.replies||0,nt},has=db.tags.length||db.rep||Object.keys(nt).length,loc=LX[l.id];
  if("tags" in l){if(!has&&loc&&(loc.tags&&loc.tags.length||loc.rep||loc.nt&&Object.keys(loc.nt).length))return{...loc,dx:1};return db}
  return loc||{}}
const profState=()=>JSON.stringify([prof.name,prof.fam,prof.loc,prof.web,prof.pron,prof.bio,prof.av,!!prof.avd,(prof.fav||[]).map(sidOf)]);
const ck=async p=>{const r=await p;if(r.error)throw r.error;return r};
async function upUS(rs){let r=await sb.from("user_series").upsert(rs);if(r.error&&WLOK&&/watchlist/i.test(r.error.message||"")){WLOK=false;rs=rs.map(o=>{o=Object.assign({},o);delete o.watchlist;return o});r=await sb.from("user_series").upsert(rs)}if(r.error)throw r.error;return r}
function adopt(){for(const k in cache){const i=cache[k];if(iState(i)!==i._b){items.unshift(i);delete cache[k]}}}
function sched(){dirty=true;clearTimeout(pushT);pushT=setTimeout(push,500)}
function applyStat(r){const v=[];(r.histogram||[]).forEach((n,j)=>{for(let k=0;k<Math.min(+n,200);k++)v.push((j+1)/2)});const i=get(idOf(r.series_id));if(!i)return false;const kk=key(i),o=JSON.stringify([com[kk],i._m,i._rv,i._ls]);com[kk]=v;i._m=+r.members;i._rv=+r.reviews;i._ls=+r.lists;return o!==JSON.stringify([com[kk],i._m,i._rv,i._ls])}
async function loadStat(i){if(!sb||!i.sid||Date.now()-(statAt[i.sid]||0)<30000)return;statAt[i.sid]=Date.now();try{const{data}=await sb.from("series_stats").select("*").eq("series_id",i.sid).maybeSingle();if(data&&applyStat(data)&&curDet===i.id&&$("det").classList.contains("open"))show(i.id,true)}catch(e){}}
async function pull(){
  const uid=U.id,R=await Promise.all([
   sb.from("user_series").select("*,series(*)").eq("user_id",uid).order("updated_at",{ascending:false}),
   sb.from("diary_entries").select("*").eq("user_id",uid).order("watched_on",{ascending:false}).order("created_at",{ascending:false}),
   sb.from("lists").select("*,list_items(*)").eq("user_id",uid).order("created_at",{ascending:false}),
   sb.from("profiles").select("*").eq("id",uid).single(),
   sb.from("series").select("*").order("created_at",{ascending:false}).limit(1000),
   sb.from("follows").select("followee_id,status").eq("follower_id",uid)]);
  try{const pr=await sb.from("platforms").select("name");if(!pr.error)PLT=(pr.data||[]).map(x=>x.name)}catch(_){}
  R.forEach(r=>{if(r.error)throw r.error});const[a,b,c,d,e,f]=R,de={};FW=new Set(f.data.filter(x=>x.status!=="pending").map(x=>x.followee_id));PEND=new Set(f.data.filter(x=>x.status==="pending").map(x=>x.followee_id));const dc={};DEN=b.data.map(x=>({id:x.id,iid:idOf(x.series_id),wd:x.watched_on,r:+x.rating||0,hl:!!x.liked,rw:!!x.rewatch,t:x.review||"",sp:!!x.spoilers}));b.data.forEach(x=>{dc[x.series_id]=(dc[x.series_id]||0)+1;if(!de[x.series_id])de[x.series_id]=x});
  items=a.data.map(r=>{const i=mapS(r.series);Object.assign(i,{status:stIn(r),watched:r.watched_eps,rating:+r.rating||0,liked:r.liked,wl:!!r.watchlist,dcount:dc[r.series_id]||0});const x=de[r.series_id];if(x)Object.assign(i,{watchedOn:Date.parse(x.watched_on+"T12:00:00"),review:x.review,spoil:x.spoilers,rewatch:x.rewatch,rtags:x.tags,deid:x.id});return i});
  cache={};e.data.forEach(r=>{const id=idOf(r.id);if(!items.some(x=>x.id===id))cache[id]=mapS(r)});
  CAT=e.data.map(r=>items.find(x=>x.sid===r.id)||cache[idOf(r.id)]);pendS.forEach(x=>{if(!CAT.includes(x))CAT.unshift(x)});
  const need=new Set();c.data.forEach(l=>(l.list_items||[]).forEach(x=>need.add(x.series_id)));(d.data.favorites||[]).forEach(x=>need.add(x));
  const miss=[...need].filter(u=>!get(idOf(u)));if(miss.length){const r=await sb.from("series").select("*").in("id",miss);if(!r.error)r.data.forEach(x=>{cache[idOf(x.id)]=mapS(x)})}
  lists=c.data.map(l=>({id:idOf(l.id),sid:l.id,name:l.name,desc:l.description,rank:l.ranked,ids:(l.list_items||[]).sort((p,q)=>p.position-q.position).map(x=>idOf(x.series_id)),ts:Date.parse(l.created_at),...lxOf(l)}));
  const P=d.data;prof={user:P.username,name:P.display_name,fam:P.family_name,email:U.email,loc:P.location,web:P.website,pron:P.pronouns,bio:P.bio,av:P.avatar_path||"",fav:(P.favorites||[]).map(idOf),vis:P.visibility==="private"?"private":"public",cs:P.count_in_stats!==false,dsc:P.discoverable!==false};setMe();
  log=[];b.data.forEach(x=>{const i=get(idOf(x.series_id));if(!i)return;const ts=Date.parse(x.watched_on+"T12:00:00");log.push({t:"done",id:i.id,title:i.title,r:+x.rating||0,ts});if(x.rating)log.push({t:"rate",id:i.id,title:i.title,r:+x.rating,ts})});
  items.forEach(i=>{if(i.created_by===uid)log.push({t:"add",id:i.id,title:i.title,ts:i.added})});
  log.sort((p,q)=>q.ts-p.ts);log=log.slice(0,100);
  shadow={};items.forEach(i=>shadow[i.id]={st:iState(i),sid:i.sid});shadowL={};lists.forEach(l=>shadowL[l.id]={st:l.dx?"":listState(l),sid:l.sid});shadowP=profState();if(!P.display_name){prof.name=P.username.replace(/_[0-9a-f]{6}$/,"");sched()}
  sb.from("follows").select("*",{count:"exact",head:true}).eq("followee_id",U.id).eq("status","pending").then(r=>{if(!r.error){REQN=r.count||0;if(typeof nbDot==="function")nbDot()}});
  if(items.length){const r=await sb.from("series_stats").select("*").in("series_id",items.map(i=>i.sid));if(!r.error)r.data.forEach(applyStat)}
}
async function up(i,uid){if(!i.cover||!i.cover.startsWith("data:"))return;const bl=await (await fetch(i.cover)).blob(),path=uid+"/"+i.sid+(i.cp?"-"+Date.now().toString(36):"")+".jpg";await ck(sb.storage.from("covers").upload(path,bl,{upsert:true,contentType:"image/jpeg",cacheControl:"31536000"}));i.cp=path;i.cover=cvr(path)}
async function upCast(i,uid){for(let k=0;k<(i.cast||[]).length;k++){const c=i.cast[k];if(!c.ph||!c.ph.startsWith("data:"))continue;const bl=await (await fetch(c.ph)).blob(),path=uid+"/"+i.sid+"/c"+k+"-"+Math.random().toString(36).slice(2,7)+".jpg";await ck(sb.storage.from("covers").upload(path,bl,{upsert:true,contentType:"image/jpeg",cacheControl:"31536000"}));c.pp=path;c.ph=cvr(path)}}
async function push(){
  if(!U)return;if(pushing){return}pushing=true;dirty=false;const uid=U.id;
  try{
   pendS=pendS.filter(x=>x.fresh);for(const i of [...new Set([...items.filter(x=>x.fresh),...pendS])]){try{await up(i,uid)}catch(e){console.error(e);i.cover="";i.cp="";toast("No se pudo subir la portada")}try{await upCast(i,uid)}catch(e){console.error(e);(i.cast||[]).forEach(c=>{if(c.ph&&c.ph.startsWith("data:")){c.ph="";c.pp=""}});toast("No se pudieron subir algunas fotos")}await ck(sb.from("series").insert({id:i.sid,title:i.title,app:i.app,synopsis:i.syn||"",tropes:i.tropes||[],cast_text:i.castTxt||"",cast_members:(i.cast||[]).map(c=>({name:c.a,role:c.p||"",photo:c.pp||null})),episodes:i.eps,duration_minutes:i.epm||null,cover_path:i.cp||null}));i.fresh=false;i.created_by=uid}
   for(const i of [...pendU]){if(i.fresh){pendU=pendU.filter(x=>x!==i);continue}
    const oc=i.cp,ocv=cvr(oc);try{await up(i,uid)}catch(e){console.error(e);i.cover=ocv;i.cp=oc;toast("No se pudo subir la portada")}
    try{await upCast(i,uid)}catch(e){console.error(e);(i.cast||[]).forEach(c=>{if(c.ph&&c.ph.startsWith("data:")){c.ph="";c.pp=""}});toast("No se pudieron subir algunas fotos")}
    const r=await ck(sb.from("series").update({title:i.title,app:i.app,synopsis:i.syn||"",tropes:i.tropes||[],cast_text:i.castTxt||"",cast_members:(i.cast||[]).map(c=>({name:c.a,role:c.p||"",photo:c.pp||null})),episodes:i.eps,duration_minutes:i.epm||null,cover_path:i.cp||null}).eq("id",i.sid).select("id"));
    pendU=pendU.filter(x=>x!==i);if(!r.data||!r.data.length)throw new Error("No tienes permiso para editar esta serie");
    if(oc&&oc!==i.cp)try{await sb.storage.from("covers").remove([oc])}catch(e){}}
   const rows=[];for(const i of items){const st=iState(i);if(!shadow[i.id]||shadow[i.id].st!==st)rows.push({i,st,row:{user_id:uid,series_id:i.sid,status:i.status||(i.rating?"done":(i.liked?"none":"want")),watched_eps:i.watched||0,rating:i.rating||null,liked:!!i.liked,...(WLOK?{watchlist:inWl(i)}:{})}})}
   if(rows.length){await upUS(rows.map(r=>r.row));rows.forEach(r=>{shadow[r.i.id]={st:r.st,sid:r.i.sid};statAt[r.i.sid]=0});if(curDet&&$("det").classList.contains("open")){const c=get(curDet);if(c)loadStat(c)}}
   const gone=Object.keys(shadow).filter(k=>!items.some(i=>String(i.id)===k));
   if(gone.length){await ck(sb.from("user_series").delete().eq("user_id",uid).in("series_id",gone.map(k=>shadow[k].sid)));gone.forEach(k=>delete shadow[k])}
   let dsent=0;while(dq.length){const e=dq[0];await ck(sb.from("diary_entries").upsert(Object.assign({id:e.id,user_id:uid,series_id:e.series.sid},e.row)));dq.shift();dsent=1}
   if(dsent){RV={};RVt={};WB={};WBt={};HR=null;statAt={};if($("det").classList.contains("open")&&curDet){const c=get(curDet);if(c){loadRevs(c,true);loadWb(c,true);loadStat(c)}}}
   for(const l of lists){const st=listState(l);if(shadowL[l.id]&&shadowL[l.id].st===st)continue;
    const lb={id:l.sid,user_id:uid,name:l.name,description:l.desc||"",ranked:!!l.rank};
    try{await ck(sb.from("lists").upsert(XC.on?{...lb,tags:l.tags||[],replies:l.rep||0}:lb))}catch(e){if(XC.on&&/tags|replies|column|schema/i.test(e.message||"")){XC.on=false;await ck(sb.from("lists").upsert(lb))}else throw e}
    await ck(sb.from("list_items").delete().eq("list_id",l.sid));
    const r=l.ids.map((id,k)=>{const x=(l.nt||{})[id]||{},o={list_id:l.sid,series_id:sidOf(id),position:k};if(XC.on){o.note=x.n||"";o.spoiler=!!x.s}return o}).filter(x=>x.series_id);if(r.length)await ck(sb.from("list_items").insert(r));shadowL[l.id]={st,sid:l.sid}}
   const lg_=Object.keys(shadowL).filter(k=>!lists.some(l=>String(l.id)===k));
   for(const k of lg_){await ck(sb.from("lists").delete().eq("id",shadowL[k].sid));delete shadowL[k]}
   if(prof.avd){const bl=await (await fetch(prof.avd)).blob(),path=uid+"/avatar-"+Date.now()+".jpg";await ck(sb.storage.from("covers").upload(path,bl,{contentType:"image/jpeg"}));prof.av=path;prof.avd="";setMe()}
   const ps=profState();if(ps!==shadowP){await ck(sb.from("profiles").update({avatar_path:prof.av||null,display_name:prof.name||"",family_name:prof.fam||"",location:prof.loc||"",website:prof.web||"",pronouns:prof.pron||"",bio:prof.bio||"",favorites:(prof.fav||[]).map(sidOf).filter(Boolean)}).eq("id",uid));shadowP=ps}
  }catch(e){console.error(e);fails++;toast("No se pudo sincronizar: "+((e&&e.message)||e));dirty=true}
  finally{pushing=false;if(!dirty)fails=0;else setTimeout(sched,Math.min(60000,4000*2**Math.min(fails,4)))}}
async function legacy(){const mk="microboxd:mig:"+U.id;
  try{if(!LEG||localStorage.getItem(mk))return;const old=(LEG.items||[]).filter(i=>i&&i.title&&!/^Ejemplo:/.test(i.title));
   if(!old.length||items.length){localStorage.setItem(mk,"1");return}
   const map={};
   old.forEach(o=>{let i=CAT.find(c=>norm(c.title)===norm(o.title)&&c.app===o.app);
    if(i){Object.assign(i,{status:o.status,watched:o.watched,rating:o.rating||0,liked:!!o.liked});delete cache[i.id]}
    else{const sid=crypto.randomUUID();i=Object.assign({},o,{id:idOf(sid),sid,fresh:true,cp:""});delete i.added}
    i.review=o.review||"";i.spoil=!!o.spoil;i.rewatch=!!o.rewatch;i.rtags=o.rtags||[];i.watchedOn=o.watchedOn;map[o.id]=i.id;items.unshift(i);
    if(o.watchedOn||o.review){const eid=crypto.randomUUID();i.deid=eid;dq.push({id:eid,series:i,row:{watched_on:new Date(o.watchedOn||Date.now()).toISOString().slice(0,10),rating:o.rating||null,liked:!!o.liked,rewatch:!!o.rewatch,review:o.review||"",spoilers:!!o.spoil,tags:o.rtags||[]}})}});
   (LEG.lists||[]).forEach(l=>{const sid=crypto.randomUUID();lists.unshift({id:idOf(sid),sid,name:l.name,desc:l.desc||"",rank:!!l.rank,ids:(l.ids||[]).map(x=>map[x]).filter(Boolean),ts:Date.now()})});
   const lp=LEG.prof||{};["name","fam","loc","web","pron","bio"].forEach(k=>{if(!prof[k]&&lp[k])prof[k]=lp[k]});
   prof.fav=(prof.fav&&prof.fav.length)?prof.fav:(lp.fav||[]).map(x=>map[x]).filter(Boolean);
   localStorage.setItem(mk,"1");sched();toast("Hemos importado tus datos locales a tu cuenta")}catch(e){console.error(e)}}
let gm="in";
const trErr=e=>{const m=String(e&&e.message||e);return /Invalid login/i.test(m)?"Correo o contraseña incorrectos.":/not confirmed/i.test(m)?"Confirma tu correo antes de entrar (revisa tu bandeja de entrada).":/rate limit|too many/i.test(m)?"Demasiados intentos. Espera unos minutos e inténtalo de nuevo.":/already registered/i.test(m)?"Ese correo ya está registrado.":/password/i.test(m)?"La contraseña debe tener al menos 8 caracteres.":m};
function gate(msg,busy,retry){const g=$("gate");g.style.display="flex";g.classList.toggle("busy",!!busy);
  if(busy){g.innerHTML=LOGO;return}
  if(retry){g.innerHTML=LOGO+`<h2>Microboxd</h2>`+(`<div class="gerr">${esc(msg||"")}</div><button class="gb" onclick="location.reload()">Reintentar</button>`);return}
  const up=gm==="up";
  g.innerHTML=LOGO+`<h2>Microboxd</h2><p>Tu diario de microseries: puntúa, reseña y comparte lo que ves.</p><form class="gf" onsubmit="auth(event);return false"><input id="ge" type="email" autocomplete="email" placeholder="Correo electrónico" required><input id="gp" type="password" autocomplete="${up?"new-password":"current-password"}" placeholder="Contraseña${up?" (mín. 8 caracteres)":""}" minlength="8" required>${msg?`<div class="${msg.ok?"gok":"gerr"}">${esc(msg.t||msg)}</div>`:""}<button class="gb" type="submit">${up?"Crear cuenta":"Iniciar sesión"}</button></form><button class="glk" onclick="gm='${up?"in":"up"}';gate()">${up?"¿Ya tienes cuenta? Inicia sesión":"¿No tienes cuenta? Créala"}</button><button class="glk" onclick="mbLang('${LANG==="es"?"en":"es"}')">${LANG==="es"?"English":"Español"}</button>`}
async function auth(ev){const em=$("ge").value.trim(),pw=$("gp").value,b=ev.target.querySelector("button");b.disabled=true;
  try{if(gm==="up"){const r=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:location.origin+location.pathname}});if(r.error)throw r.error;
     if(r.data.session){location.reload();return}
     if(r.data.user&&r.data.user.identities&&!r.data.user.identities.length)throw new Error("already registered");
     gm="in";gate({t:"Te hemos enviado un correo para confirmar tu cuenta. Confírmalo y vuelve aquí para iniciar sesión.",ok:1});$("ge").value=em;return}
    const r=await sb.auth.signInWithPassword({email:em,password:pw});if(r.error)throw r.error;location.reload()}
  catch(e){gate(trErr(e));$("ge").value=em}}
async function logout(){try{await sb.auth.signOut()}catch(e){}location.reload()}
async function boot(){
  if(!window.supabase){gate("No se pudo cargar el servicio. Revisa tu conexión.",0,1);return}
  sb=supabase.createClient(SB_URL,SB_KEY);window.sb=sb;
  sb.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT")location.reload()});
  const{data:{session}}=await sb.auth.getSession();
  if(!session){gate();return}
  U=session.user;gate("Cargando…",1);
  try{await pull();await legacy()}catch(e){console.error(e);gate("Error al cargar tus datos: "+(e.message||e),0,1);return}
  $("gate").style.display="none";render()}
/* ===== Escritorio: listas de todos y Actividad dentro del perfil ===== */
