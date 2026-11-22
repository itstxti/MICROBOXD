(function(){const vv=window.visualViewport;if(!vv)return;const de=document.documentElement;
let KB=0;const kb=()=>{if(!document.querySelector(".sheet.open")){if(KB){KB=0;de.style.setProperty("--kb","0px");de.classList.remove("kbd")}return 0}const f=document.activeElement,ed=f&&/^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName);const H=de.getBoundingClientRect().height;const k=ed?Math.max(0,Math.round(H-vv.height-vv.offsetTop)):0;if(k!==KB){KB=k;de.style.setProperty("--kb",k+"px");de.classList.toggle("kbd",k>0)}if(k>0&&(scrollY||vv.offsetTop))scrollTo(0,0);return k};
const fit=()=>{kb();const f=document.activeElement;if(f&&/^(INPUT|TEXTAREA)$/.test(f.tagName)&&f.closest(".sheet.open"))setTimeout(()=>{try{f.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){}},80)};
vv.addEventListener("resize",fit);vv.addEventListener("scroll",kb);addEventListener("focusin",()=>setTimeout(fit,320));addEventListener("focusout",()=>setTimeout(kb,100))})();
(function(){const sc=el=>{while(el&&el!==document.body&&el!==document.documentElement){if(el.scrollHeight>el.clientHeight+1){const o=getComputedStyle(el).overflowY;if(o==="auto"||o==="scroll")return true}if(el.scrollWidth>el.clientWidth+1){const o=getComputedStyle(el).overflowX;if(o==="auto"||o==="scroll")return true}el=el.parentElement}return false};
addEventListener("touchmove",e=>{if(e.touches.length>1)return;if(!sc(e.target))e.preventDefault()},{passive:false});
addEventListener("scroll",()=>{if(scrollY||scrollX)scrollTo(0,0)},{passive:true})})();

const BUILD="1795308851";
(function(){let n=0;const chk=async()=>{try{const j=await (await fetch("/version.json?__v="+Date.now(),{cache:"no-store"})).json();if(j.b&&j.b!==BUILD&&n<2&&!document.querySelector(".sheet.open,.ov.open")){n++;try{const k=+sessionStorage.getItem("mbxr")||0;if(k>=2)return;sessionStorage.setItem("mbxr",k+1)}catch(e){}location.reload()}else if(j.b===BUILD){try{sessionStorage.removeItem("mbxr")}catch(e){}}}catch(e){}};
chk();document.addEventListener("visibilitychange",()=>{if(!document.hidden)chk()});setInterval(()=>{if(!document.hidden)chk()},300000)})();
