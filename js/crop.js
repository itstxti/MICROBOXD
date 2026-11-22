/* ===== Recortar imagen al subirla: arrastrar para encuadrar, zoom con deslizador / rueda / pellizco ===== */
/* imgCrop(file, aspecto ancho/alto, ancho de salida, calidad JPEG) -> Promise<dataURL|null> */
function imgCrop(file,ar,ow,q){return new Promise(res=>{
  const u=URL.createObjectURL(file),im=new Image();
  im.onerror=()=>{URL.revokeObjectURL(u);toast("No se pudo leer esa imagen");res(null)};
  im.onload=()=>{
    const W=im.naturalWidth,H=im.naturalHeight;
    const fw=Math.max(120,Math.round(Math.min(340,innerWidth-56,(innerHeight-250)*ar))),fh=Math.round(fw/ar);
    const min=Math.max(fw/W,fh/H);let s=min,cx=W/2,cy=H/2;
    const d=document.createElement("div");d.id="crp";d.className="crp";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label",L2("Ajustar imagen","Adjust image"));
    d.innerHTML=`<div class="crc"><div class="crt">${L2("Ajustar imagen","Adjust image")}</div><div class="crs" tabindex="0" style="width:${fw}px;height:${fh}px"><img alt="" draggable="false"></div><div class="crz"><span aria-hidden="true">−</span><input type="range" min="100" max="400" value="100" aria-label="Zoom"><span aria-hidden="true">＋</span></div><div class="crh">${L2("Arrastra para encuadrar","Drag to reposition")}</div><div class="cra"><button type="button" class="crx">${L2("Cancelar","Cancel")}</button><button type="button" class="cro">${L2("Usar imagen","Use image")}</button></div></div>`;
    const st=d.querySelector(".crs"),img=d.querySelector("img"),rg=d.querySelector("input");img.src=u;
    const clamp=()=>{cx=Math.min(W-fw/2/s,Math.max(fw/2/s,cx));cy=Math.min(H-fh/2/s,Math.max(fh/2/s,cy))};
    const paint=()=>{clamp();img.style.width=W*s+"px";img.style.height=H*s+"px";img.style.left=(fw/2-cx*s)+"px";img.style.top=(fh/2-cy*s)+"px"};
    const setS=n=>{s=Math.min(min*4,Math.max(min,n));rg.value=Math.round(s/min*100);paint()};
    const P=new Map();let pd=0;
    st.addEventListener("pointerdown",e=>{st.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===2){const [a,b]=[...P.values()];pd=Math.hypot(a[0]-b[0],a[1]-b[1])}});
    st.addEventListener("pointermove",e=>{if(!P.has(e.pointerId))return;const o=P.get(e.pointerId);
      if(P.size===2){P.set(e.pointerId,[e.clientX,e.clientY]);const [a,b]=[...P.values()],n=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)setS(s*n/pd);pd=n;return}
      cx-=(e.clientX-o[0])/s;cy-=(e.clientY-o[1])/s;P.set(e.pointerId,[e.clientX,e.clientY]);paint()});
    const up=e=>{P.delete(e.pointerId);pd=0};st.addEventListener("pointerup",up);st.addEventListener("pointercancel",up);
    st.addEventListener("wheel",e=>{e.preventDefault();setS(s*(e.deltaY<0?1.08:1/1.08))},{passive:false});
    st.addEventListener("keydown",e=>{const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(k){e.preventDefault();cx+=k[0]*12/s;cy+=k[1]*12/s;paint()}else if(e.key==="+"||e.key==="="){setS(s*1.1)}else if(e.key==="-"){setS(s/1.1)}});
    rg.oninput=()=>setS(min*rg.value/100);
    const close=v=>{document.removeEventListener("keydown",kd,true);d.classList.remove("on");setTimeout(()=>d.remove(),180);URL.revokeObjectURL(u);res(v)};
    const kd=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close(null)}};document.addEventListener("keydown",kd,true);
    d.querySelector(".crx").onclick=()=>close(null);
    d.querySelector(".cro").onclick=()=>{const sw=fw/s,sh=fh/s,w=Math.min(ow,Math.round(sw)),h=Math.round(w/ar),c=document.createElement("canvas");c.width=w;c.height=h;
      const x=c.getContext("2d");x.imageSmoothingQuality="high";x.drawImage(im,cx-sw/2,cy-sh/2,sw,sh,0,0,w,h);close(c.toDataURL("image/jpeg",q))};
    document.body.appendChild(d);paint();void d.offsetWidth;d.classList.add("on");d.querySelector(".cro").focus()};
  im.src=u})}
