/* LB3-Versuchsschicht: zählt Versuche, meldet sie an die App, zeigt die Lösung ab Versuch 3 */
(function(){
 var P=(typeof PAGE!=="undefined"?PAGE:{}),EN=(typeof ENGINES!=="undefined"?ENGINES:null),H=location.hash||"",ST=P.file||"x";
 var KEY="lb3v-"+ST,teacher=/[#&]l(&|$)/.test(H);
 var m=H.match(/[#&]v=(\d+)/),base=m?+m[1]:(+localStorage.getItem(KEY)||0),sess=0,t0=Date.now();
 function ver(){return base+sess}
 function melde(p,mx){
  if(!(mx>0))return;sess++;var v=ver();
  try{localStorage.setItem(KEY,String(v))}catch(e){}
  try{if(window.parent!==window)window.parent.postMessage({ubErgebnis:{sid:"lb3-"+ST.replace(/\.html$/,""),punkte:Math.max(0,Math.min(mx,Math.round(p))),max:Math.round(mx),zuege:0,sekunden:Math.round((Date.now()-t0)/1000),versuch:v}},location.origin)}catch(e){}
  t0=Date.now();bar();
 }
 function bar(){
  var el=document.getElementById("lb3vb");
  if(!el){el=document.createElement("div");el.id="lb3vb";el.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:50;background:#fff;border-top:1px solid #cfd8e3;padding:8px 14px;font:600 14px system-ui,sans-serif;display:flex;gap:12px;align-items:center;justify-content:space-between";document.body.appendChild(el);document.body.style.paddingBottom="56px"}
  var v=ver(),L=window.LB3_LOES,can=L&&(teacher||v>=3);
  var txt=teacher?"Lehrkraft-Ansicht":(sess||base?("Versuch "+v+(v<3?" · Die Lösung ist ab Versuch 3 einsehbar":" · Lösung freigeschaltet")):"Der erste Versuch zählt für deinen Lernstand");
  el.innerHTML="<span>"+txt+"</span>"+(can?"<button id='lb3vl' style='background:#1F4FD1;color:#fff;border:0;border-radius:10px;padding:8px 14px;font-weight:700;cursor:pointer'>Lösung ansehen</button>":"");
  var b=document.getElementById("lb3vl");if(b)b.onclick=loes;
 }
 function loes(){
  var o=document.createElement("div");o.style.cssText="position:fixed;inset:0;z-index:99;background:rgba(15,23,42,.6);overflow:auto;padding:16px";
  o.innerHTML="<div style='background:#fff;max-width:900px;margin:0 auto;border-radius:14px;padding:18px'><button style='float:right;border:0;background:#eef2f7;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer'>Schließen</button><style>.lb3l table{border-collapse:collapse;width:100%;margin:10px 0}.lb3l td,.lb3l th{border:1px solid #d5dde6;padding:6px 8px;text-align:left;vertical-align:top;font-size:14px}.lb3l th{background:#f1f5f9}.lb3l h2{font-size:20px}.lb3l h3{font-size:16px}</style><div class='lb3l'>"+window.LB3_LOES+"</div></div>";
  o.querySelector("button").onclick=function(){o.remove()};document.body.appendChild(o);
 }
 var seenL=false,seenM=false,seenK=false;
 if(typeof window.doneBox==="function"){var d0=window.doneBox;window.doneBox=function(s,t){melde(s,t);return d0.apply(this,arguments)}}
 if(EN&&EN.luecke){var l0=EN.luecke;EN.luecke=function(){seenL=false;return l0.apply(this,arguments)};
  var c0=window.lCheck;window.lCheck=function(){var r=c0.apply(this,arguments);if(!seenL){seenL=true;var s=[].slice.call(document.querySelectorAll(".gap-s select")),ok=s.filter(function(x){return x.value===x.dataset.a}).length;melde(ok,s.length)}return r}}
 if(typeof window.eCheck==="function"){var e0=window.eCheck;window.eCheck=function(){var r=e0.apply(this,arguments);try{var T=LB.levels.theorie.errors[E.n],errs=T.s.filter(function(s){return s.c}).length,hit=T.s.filter(function(s,i){return s.c&&E.mark[i]}).length,wr=T.s.filter(function(s,i){return !s.c&&E.mark[i]}).length;melde(Math.max(0,hit-wr),errs)}catch(x){}return r}}
 if(EN&&EN.matrix){var m0=EN.matrix;EN.matrix=function(){seenM=false;return m0.apply(this,arguments)};
  var mr=window.mRender;window.mRender=function(){var r=mr.apply(this,arguments);try{if(!seenM&&M.items.every(function(x){return M.placed[x.id]})){seenM=true;melde(Math.max(0,M.items.length-M.err),M.items.length)}}catch(x){}return r}}
 if(EN&&EN.karten){var k0=EN.karten;EN.karten=function(){seenK=false;window.__kn=0;return k0.apply(this,arguments)};
  var kn=window.kNext;window.kNext=function(ok){if(!ok)window.__kn=(window.__kn||0)+1;var r=kn.apply(this,arguments);try{if(!seenK&&!K.stack.length){seenK=true;melde(Math.max(0,K.total-(window.__kn||0)),K.total)}}catch(x){}return r}}
 document.addEventListener("DOMContentLoaded",bar);if(document.readyState!=="loading")bar();
})();
