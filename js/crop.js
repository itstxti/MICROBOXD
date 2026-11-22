/* ===== Recortar imagen al subirla: arrastrar para encuadrar, zoom con deslizador / rueda / pellizco ===== */
/* imgCrop(file, aspecto ancho/alto, ancho de salida, calidad JPEG, {t:título, round:guía circular}) -> Promise<dataURL|null> */
function imgCrop(file,ar,ow,q,o){o=o||{};return new Promise(res=>{
  const u=URL.createObjectURL(file),im=new Image();
  im.onerror=()=>{URL.revokeObjectURL(u);toast("No se pudo leer esa imagen");res(null)};
  im.onload=()=>{
    const W=im.naturalWidth,H=im.naturalHeight;
    const pd=28,fw=Math.max(110,Math.round(Math.min(320,innerWidth-2*pd-32,(innerHeight-330)*ar))),fh=Math.round(fw/ar),sw0=fw+2*pd,sh0=fh+2*pd;
    const min=Math.max(fw/W,fh/H);let s=min,cx=W/2,cy=H/2;
    const d=document.createElement("div");d.id="crp";d.className="crp";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label",L2("Ajustar imagen","Adjust image"));
    const ttl=o.t||L2("Ajustar imagen","Adjust image");
    d.innerHTML=`<div class="crc"><div class="crt"><b>${ttl}</b><small>${W} × ${H} px</small></div><div class="crs" tabindex="0" style="width:${sw0}px;height:${sh0}px" aria-label="${L2("Arrastra para encuadrar. Flechas para mover, + y - para el zoom.","Drag to reposition. Arrow keys to move, + and - to zoom.")}"><img alt="" draggable="false"><div class="crf${o.round?" rd":""}" style="left:${pd}px;top:${pd}px;width:${fw}px;height:${fh}px"><i class="crg"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div></div><div class="crz"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="6" width="16" height="12" rx="2"/></svg><input type="range" min="100" max="400" value="100" aria-label="Zoom"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 9v6M9 12h6"/></svg></div><div class="crh"><span>${L2("Arrastra para encuadrar","Drag to reposition")}</span><button type="button" class="crr">${L2("Restablecer","Reset")}</button></div><div class="cra"><button type="button" class="crx">${L2("Cancelar","Cancel")}</button><button type="button" class="cro"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${L2("Usar imagen","Use image")}</button></div></div>`;
    const st=d.querySelector(".crs"),img=d.querySelector("img"),rg=d.querySelector("input");img.src=u;
    const clamp=()=>{cx=Math.min(W-fw/2/s,Math.max(fw/2/s,cx));cy=Math.min(H-fh/2/s,Math.max(fh/2/s,cy))};
    const paint=()=>{clamp();img.style.width=W*s+"px";img.style.height=H*s+"px";img.style.left=(pd+fw/2-cx*s)+"px";img.style.top=(pd+fh/2-cy*s)+"px"};
    const setS=n=>{s=Math.min(min*4,Math.max(min,n));rg.value=Math.round(s/min*100);paint()};
    const P=new Map();let pdist=0;
    st.addEventListener("pointerdown",e=>{st.setPointerCapture(e.pointerId);st.classList.add("dg");P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===2){const [a,b]=[...P.values()];pdist=Math.hypot(a[0]-b[0],a[1]-b[1])}});
    st.addEventListener("pointermove",e=>{if(!P.has(e.pointerId))return;const o=P.get(e.pointerId);
      if(P.size===2){P.set(e.pointerId,[e.clientX,e.clientY]);const [a,b]=[...P.values()],n=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pdist)setS(s*n/pdist);pdist=n;return}
      cx-=(e.clientX-o[0])/s;cy-=(e.clientY-o[1])/s;P.set(e.pointerId,[e.clientX,e.clientY]);paint()});
    const up=e=>{P.delete(e.pointerId);pdist=0;if(!P.size)st.classList.remove("dg")};st.addEventListener("pointerup",up);st.addEventListener("pointercancel",up);
    st.addEventListener("wheel",e=>{e.preventDefault();setS(s*(e.deltaY<0?1.08:1/1.08))},{passive:false});
    st.addEventListener("keydown",e=>{const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(k){e.preventDefault();cx+=k[0]*12/s;cy+=k[1]*12/s;paint()}else if(e.key==="+"||e.key==="="){setS(s*1.1)}else if(e.key==="-"){setS(s/1.1)}});
    rg.oninput=()=>setS(min*rg.value/100);
    d.querySelector(".crr").onclick=()=>{cx=W/2;cy=H/2;setS(min)};
    const close=v=>{document.removeEventListener("keydown",kd,true);d.classList.remove("on");setTimeout(()=>d.remove(),180);URL.revokeObjectURL(u);res(v)};
    const kd=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close(null)}};document.addEventListener("keydown",kd,true);
    d.querySelector(".crx").onclick=()=>close(null);
    d.querySelector(".cro").onclick=()=>{const sw=fw/s,sh=fh/s,w=Math.min(ow,Math.round(sw)),h=Math.round(w/ar),c=document.createElement("canvas");c.width=w;c.height=h;
      const x=c.getContext("2d");x.imageSmoothingQuality="high";x.drawImage(im,cx-sw/2,cy-sh/2,sw,sh,0,0,w,h);close(c.toDataURL("image/jpeg",q))};
    document.body.appendChild(d);paint();void d.offsetWidth;d.classList.add("on");d.querySelector(".cro").focus({focusVisible:false})};
  im.src=u})}
