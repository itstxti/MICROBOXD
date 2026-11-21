const SBH=()=>`<div class="sbw"><div class="sbr"><div class="sb">${svg(IC.search,20)}<input id="qi" placeholder="Busca series, apps, temas…" value="${esc(q)}" onfocus="if(!sf){sf=1;this.parentNode.nextElementSibling.style.display='';sr()}" oninput="q=this.value;this.nextElementSibling.style.display=q?'':'none';this.parentNode.nextElementSibling.style.display=(q||sf)?'':'none';sr()"><button class="sbx" aria-label="Borrar" style="display:${q?"":"none"}" onclick="q='';render();$('qi')&&$('qi').focus()">×</button></div><button class="sbc" style="display:${q||sf?"":"none"}" onclick="sCancel()">Cancelar</button></div></div>`;
function sCancel(){q="";sf=0;const i=$("qi");if(i){i.value="";i.blur()}const c=document.querySelector(".sbc");if(c)c.classList.add("x");sr();setTimeout(()=>{if(tab==="search"&&!sf&&!q.trim()){if(c){c.style.display="none";c.classList.remove("x")}spl("")}},320)}
function render(){
  document.documentElement.classList.toggle("dh",tab==="home");
  document.documentElement.classList.toggle("dpr",tab==="me"||(tab==="act"&&DSK()));
  if(tab==="me"&&!DSK()&&!["perfil","diary","lst","pend"].includes(seg.me))seg.me="perfil";
  const titles={home:LOGO+"Microboxd",search:"Buscar",act:"Actividad",me:esc(uname())};
  const sg=SEGS[tab];
  const bn=tab==="search"&&br.length&&!q.trim()?br[br.length-1]:null;
  $("hd").innerHTML=(bn?`<h1 class="bkb"><button onclick="brBack()">‹ ${br.length>1?esc(brTitle(br[br.length-2])):(DSK()?"Series":"Explorar")}</button><b>${esc(brTitle(bn))}</b>${BFG.includes(bn.t)?`<button class="bfb${bfN(BF)?" on":""}" aria-label="${L2("Filtros","Filters")}" onclick="bfOpen()">${svg(BFIC,22)}</button>`:"<span></span>"}</h1>`:tab==="me"?`<h1 class="h1p"><button class="gear" aria-label="Ajustes" onclick="openSet()">${svg(GEAR,22)}</button>${titles[tab]}${seg.me==="lst"?`<button class="plus2" aria-label="Nueva lista" onclick="editList()">${svg('<path d="M12 4v16M4 12h16"/>',26)}</button>`:""}${seg.me==="pend"?bfBtn("plus2",false):""}<button class="dots" aria-label="Más" onclick="meOpts()">•••</button></h1>`:tab==="search"?`<h1>Buscar</h1>${SBH()}<div id="spl"></div>`:(tab==="home"&&seg.home==="series"&&items.length?`<h1 class="h1p"><span class="ttl">${titles[tab]}</span>${bfBtn("bfh",true)}</h1>`:`<h1><span class="ttl">${titles[tab]}</span></h1>`))+(sg?`<div class="seg">${sg.map(([k,l])=>`<button class="${seg[tab]===k?"on":""}" onclick="setSeg('${k}')">${l}</button>`).join("")}</div>`:"");
  const dnF=document.activeElement&&document.activeElement.id==="dsq"?[document.activeElement.selectionStart,document.activeElement.selectionEnd]:null;
  $("dn").innerHTML=`<div class="dnl" onclick="go('home')">${LOGO.replace(/"c([ab])"/g,'"dc$1"').replace(/#c([ab])\)/g,"#dc$1)")}<b>Microboxd</b></div>${[["home","series",L2("Series","Series")],["home","rev",L2("Reseñas","Reviews")],["home","lst",L2("Listas","Lists")]].map(([t,k,l])=>`<a class="${tab===t&&(!k||seg.home===k)?"on":""}" onclick="dnTo('${t}','${k}')">${l}</a>`).join("")}<div class="dnsp"></div><button class="dnsb" aria-label="${L2("Buscar","Search")}" onclick="dnTog()"><span class="i1">${svg(IC.search,20)}</span><span class="i2">${svg('<path d="M5 5l14 14M19 5L5 19"/>',20)}</span></button><div class="dns"><input id="dsq" autocomplete="off" enterkeyhint="search" value="${tab==="search"?esc(q):""}" oninput="dnIn(this.value)" onkeydown="dnKey(event)">${svg(IC.search,16)}</div><button class="dnb" onclick="openAdd()">+ ${L2("REGISTRAR","LOG")}</button><div class="dnav" onclick="go('me')">${ini()}</div>`;
  $("dn").classList.toggle("so",!!dnO);if(dnF){const i=$("dsq");if(i){i.focus();try{i.setSelectionRange(dnF[0],dnF[1])}catch(e){}}}
  $("tb").innerHTML=["home","search","add","act","me"].map(t=>`<button class="${t==="add"?"plus":tab===t?"on":""}" aria-label="${t}" onclick="go('${t}')">${(tab===t&&t!=="add"&&t!=="search")?svg(IC[t],26).replace('fill="none"','fill="currentColor"'):svg(IC[t],t==="add"?30:26)}</button>`).join("");
  let h="";
  if(tab==="home"){
    if(seg.home==="series"){
      const fi=bfFilt(items);h=wbanner()+`<div class="mro">`+hrow("Añadidas recientemente",fi.slice(0,10))+hrow("Mejor valoradas",fi.filter(i=>i.rating).sort((a,b)=>b.rating-a.rating).slice(0,10))+`</div>`+dhome(fi);if(items.length&&!fi.length)h=EMF();
      if(!items.length)h=EMP("tv","Tu biblioteca está vacía","Añade tu primera serie para empezar a puntuar y reseñar.","Añadir serie","openAdd()");
    }else if(seg.home==="jr"){h=diary();}else if(seg.home==="lst"){h=DSK()?glH():lv(lists,0)+(lists.length?'<div style="text-align:center;padding:6px 0 18px"><button class="emb" onclick="editList()">Nueva lista</button></div>':"");
    }else{
      h=hrH();
    }
  }else if(tab==="search"){
    if(br.length&&!q.trim())sf=0;
    h='<div id="sr"></div>';
  }else if(tab==="act"){
    if(seg.act==="fr")h=feedH();
    else if(seg.act==="in")h=incH();
    else h=meActH();
    if(DSK()){if(MYFO===null)loadMyFo();h=dpfHead()+actDsk(h)}
  }else{
    const done=items.filter(i=>i.rating),r=done.length?(done.reduce((a,i)=>a+i.rating,0)/done.length).toFixed(1):"–";
    if(seg.me==="perfil"){
      const pf=(prof.fav||[]).map(get).filter(Boolean),fav=pf.slice(0,4);
      const rec=[...new Set(log.map(e=>e.id))].map(get).filter(Boolean).slice(0,4);
      const yr=new Date().getFullYear(),thisYr=a=>a.filter(i=>i.watchedOn&&new Date(i.watchedOn).getFullYear()===yr).length,dn=items.filter(i=>i.status==="done");
      const row=(l,n,a)=>`<div class="link r" onclick="${a}">${l}<span>${n} ›</span></div>`;
      h=`<div class="av big">${ini()}</div>${profInfo()}<div class="stats"><div><b>${items.length}</b>Series</div><div><b>${items.reduce((a,i)=>a+i.watched,0)}</b>Episodios</div><div><b>${r}</b>Nota media</div></div>
      <div class="lbl">Favoritas</div><div class="grid" onpointerdown="pfDrag(event)">${fav.map((i,k)=>`<div class="fvq" data-k="${k}">${cell(i)}</div>`).join("")}${'<div class="fve" onclick="favAdd()">＋</div>'.repeat(4-fav.length)}</div><div class="lbl">Actividad reciente</div>${grid(rec)}
      <div class="link" style="margin-top:0" onclick="go('act')">Más actividad <span>›</span></div>
      ${myHist()}
      <div style="margin-top:14px">${row("Series",`${dn.length} / ${thisYr(dn)} este año`,"openAll()")}${row("Diario",`${items.filter(i=>i.watchedOn).length} / ${thisYr(items)} este año`,"setSeg('diary')")}${row("Listas",lists.length,"setSeg('lst')")}${row("Reseñas",items.filter(i=>i.review).length,"openRev()")}${row("Watchlist",items.filter(inWl).length,"setSeg('pend')")}${row("Me gusta",items.filter(i=>i.liked).length,"openLikes()")}${row("Etiquetas",tagsAll().length,"openTags()")}${row("Siguiendo",`<span id="myfg">${FW.size}</span>`,`openFol('${U.id}','ing')`)}${row("Seguidores",`<span id="myfo">${MYFO===null?"–":MYFO}</span>`,`openFol('${U.id}','ers')`)}${row("Estadísticas","","openStats(null)")}</div>`;loadMyFo();
    }else if(seg.me==="diary")h=diary();else if(seg.me==="lst")h=lv(lists,0);else if(seg.me==="pend"){const w=items.filter(inWl);h=w.length?bfGrid(w):EMP("clock","Tu watchlist está vacía","Guarda aquí las series que quieres ver más adelante.","Buscar series","go('search')")}else h=""
  }
  if(tab==="me"){if(MYFO===null)loadMyFo();h=dpfHead()+`<div class="mro">${h}</div>`+(seg.me==="perfil"?dprof():dpv())}
  $("mn").innerHTML=h;if(tab==="search")sr();else sfx();setNh();
}
const spl=h=>{const e=$("spl");if(e)e.innerHTML=h};let SRL=null,SRM=null;
function sfx(){const c=document.documentElement.classList;c.toggle("insr",tab==="search"&&!(br.length&&!q.trim()));c.toggle("sfoc",tab==="search"&&!!(sf||q.trim()))}
const srRow=i=>`<div class="srr">${poster(i)}<div class="srt"><h3 onclick="show(${i.id})">${esc(i.title)}</h3>${i.rating?`<div class="ss">${S(i.rating)}</div>`:""}<div>${i.app?`<span class="tg2 ap" role="button" tabindex="0" data-q="${esc(i.app)}" onclick="goQ(this.dataset.q)">${esc(i.app)}</span>`:""}${(i.tropes||[]).slice(0,6).map(t=>`<span class="tg2" role="button" tabindex="0" data-q="${esc(t)}" onclick="goQ(this.dataset.q)">${esc(t)}</span>`).join("")}</div></div></div>`;
const srD=bd=>`<div class="srx"><div class="srm"><div class="srh">${L2("Mostrando coincidencias para","Showing matches for")} “${esc(q.trim())}”</div>${bd}</div><aside class="srs"><div class="srh">${L2("Mostrar resultados de","Show results for")}</div>${[["s",L2("Series","Series")],["r",L2("Reseñas","Reviews")],["l",L2("Listas","Lists")],["m",L2("Miembros","Members")]].map(([k,l])=>`<button class="${sq===k?"on":""}" onclick="sq='${k}';sr()">${l}</button>`).join("")}</aside></div>`;
function sr(){
  sfx();const el=$("sr");if(!el)return;
  const lh=el.dataset.lh;el.dataset.lh="";
  let old="";{const m=!q.trim()?(sf&&!br.length?"f":"b"):"r";if(el!==SRL){SRL=el;SRM=null}if(m!==SRM){if(m==="f"&&SRM==="b")old=el.innerHTML;SRM=m;el.classList.remove("an");void el.offsetWidth;el.classList.add("an")}}
  const pills=()=>`<div class="ptabs">${[["s","Series"],["r","Reseñas"],["l","Listas"],["m","Miembros"]].map(([k,l])=>`<button class="${sq===k?"on":""}" onclick="sq='${k}';sr()">${l}</button>`).join("")}</div>`;
  if(!q.trim()&&sf&&!br.length){
    spl(pills());el.innerHTML=rsqH();
    if(old){const o=document.createElement("div");o.className="oldc";o.innerHTML=old;el.appendChild(o);setTimeout(()=>o.remove(),330)}
  }else if(!q.trim()){
    el.innerHTML=br.length?brBody():`<h3 class="sec" style="margin-top:6px">Explorar por</h3>`+BRR.map(([k,l])=>`<div class="br" onclick="brPush('${k}')">${l}<span>›</span></div>`).join("");
  }else{
    const n=norm(q),tb=pills();
    const sm=catAll().filter(i=>norm(i.title+i.app+(i.tropes||[]).join("")).includes(n)),D1=DSK();
    spl(tb);const bd=(sq==="m"?`<div id="mem">${memHtml()}</div>`:sq==="r"?rvl(items.filter(i=>i.review&&norm(i.title+i.review).includes(n))):sq==="l"?lv(lists.filter(l=>norm(l.name+l.desc).includes(n)),0,"Sin resultados."):D1?(sm.length?sm.map(srRow).join(""):EMN()):grid(sm,"g3"));
    const nh=D1?srD(bd):bd;
    /* miembros: si el HTML es idéntico no se reemplaza (evita que el estado vacío vuelva a animarse = parpadeo) */
    if(sq==="m"&&lh===nh)el.dataset.lh=nh;else{el.innerHTML=nh;if(sq==="m")el.dataset.lh=nh}
    if(sq==="m")memSearch()
  }
}
let br=[];
const BRR=[["apps","Aplicación"],["tropes","Tema"],["pop","Más populares"],["top","Mejor valoradas"],["recent","Añadidas recientemente"],["lists","Listas"],["all","Todas las series"]];
const brTitle=n=>({apps:"Aplicación",tropes:"Tema",app:n.v,trope:n.v,pop:"Más populares",top:"Mejor valoradas",recent:"Añadidas recientemente",lists:"Listas",all:"Todas las series"}[n.t]);
const brPush=(t,v)=>{br.push({t,v});render();$("mn").scrollTop=0};
const brBack=()=>{if(DSK()&&br.length<=1){br=[];go("home");return}br.pop();render();$("mn").scrollTop=0};
function brBody(){const n=br[br.length-1],rows=(a,t)=>a.map(([l,c])=>`<div class="br" data-v="${esc(l)}" onclick="brPush('${t}',this.dataset.v)">${esc(l)}<span>${c} ›</span></div>`).join("");
  if(n.t==="apps")return rows(appsAll().map(a=>[a,catAll().filter(i=>i.app===a).length]),"app");
  if(n.t==="tropes"){const tm=new Map();catAll().forEach(i=>{const seen=new Set();(i.tropes||[]).forEach(t=>{const k=tkey(t);if(!k)return;if(!tm.has(k))tm.set(k,{l:t.trim(),n:0});if(!seen.has(k)){seen.add(k);tm.get(k).n++}})});const tr=[...tm.values()];return tr.length?rows(tr.map(x=>[x.l,x.n]),"trope"):EMP("tag",L2("Aún no hay temas","No themes yet"),L2("Los temas de tus series aparecerán aquí.","Themes from your series will show up here."))}
  if(n.t==="app")return bfGrid(catAll().filter(i=>i.app===n.v));
  if(n.t==="trope")return bfGrid(catAll().filter(i=>hasT(i,n.v)));
  if(n.t==="pop")return bfGrid([...catAll()].sort((a,b)=>((com[key(b)]||[]).length+(b.rating?1:0))-((com[key(a)]||[]).length+(a.rating?1:0))||b.watched-a.watched));
  if(n.t==="top")return bfGrid(items.filter(i=>i.rating).sort((a,b)=>b.rating-a.rating));
  if(n.t==="recent")return bfGrid(catAll());
  if(n.t==="all")return bfGrid([...catAll()].sort((a,b)=>a.title.localeCompare(b.title)));
  return lv(lists,0)}
