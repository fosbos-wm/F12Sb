/* =====================================================================
   SYSTEM – gleiche Formate in jedem Lernbereich
   ===================================================================== */
const FORMATS = {
 begriffe:[["karten","🃏 Karteikarten"],["sort","↔️ Zuordnen"],["luecke","✏️ Lückentext"],["detektiv","🔍 Beispiel-Detektiv"]],
 theorie:[["matrix","🧩 Struktur legen"],["diagnose","🩺 Fall-Diagnose"],["regler","🎚️ Einordnen"],["folgen","🔗 Folgen zuordnen"],["fehler","🕵️ Fehler-Detektiv"]],
 anwendung:[["auftraege","📋 Aufträge"]]
};
const HELP = {
 karten:"Lies die Frage, überlege dir die Antwort und tippe auf die Karte. Karten, die du noch nicht kannst, kommen später wieder.",
 sort:"Zu welchem Merkmal gehört die Aussage?",
 luecke:"Wähle in jeder Lücke das passende Wort. Achtung: Es sind auch falsche Wörter dabei.",
 detektiv:"Lies das Beispiel. Welches Merkmal wird hier besonders deutlich?",
 matrix:"Tippe ein Kärtchen an und dann das passende Feld. Zuerst die vier Stile, dann die Merkmale.",
 diagnose:"Schritt 1: Welcher Stil liegt vor? Schritt 2: Woran erkennst du das?",
 regler:"Stelle ein, wie viel Wärme und wie viel Anforderung in der Aussage stecken. Dann prüfen.",
 folgen:"Welche Folge oder welche Aussage gehört zu welchem Erziehungsstil?",
 fehler:"Diese Schülerantwort enthält Fehler. Tippe alle Sätze an, die du für falsch hältst, und prüfe dann.",
 auftraege:"Diese Aufträge setzt ihr im Unterricht oder im Praktikum praktisch um. Eure Lehrkraft gibt euch das Material dazu."
};
Object.assign(HELP,(LB.help||{}));

/* ---------- Hilfsfunktionen ---------- */
const $=s=>document.querySelector(s);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const bar=(n,t)=>`<div class="bar"><i style="width:${t?Math.round(n/t*100):0}%"></i></div>`;
const store={get(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let VIEW={lv:null,fmt:null};
let area;

/* ---------- Rahmen ---------- */
function render(){
 const root=$("#root");
 if(!VIEW.lv){
  document.body.className="";
  root.innerHTML=`<header><div class="top"><h1>${LB.title}</h1></div><p>Drei Ebenen – der Anspruch steigt von Stufe zu Stufe.</p></header>
  <main><p class="intro">Arbeite dich von unten nach oben: Erst die Begriffe sicher klären, dann die Theorie verstehen, dann das Wissen in der Praxis anwenden.</p>
  <div class="stairs">${["begriffe","theorie","anwendung"].map(id=>{const L=LB.levels[id];const cl={rot:"r",blau:"b",gruen:"g"}[L.color];
   return `<button class="tile ${cl}" onclick="go('${id}')"><div class="num">${L.nr}<small>${L.afb.split(" · ")[0]}</small></div><div class="txt"><h3>${L.name}</h3><p>${L.teaser}</p><p class="small" style="margin-top:4px">${L.texts} · ${FORMATS[id].length>1?FORMATS[id].length+" Übungsformate":"praktische Aufträge"}</p></div></button>`}).join("")}</div>
  <p class="legend">🔴 Rot = Begriffe (Wissen) · 🔵 Blau = Theorie (Verstehen) · 🟢 Grün = Anwendung (Übertragen)</p></main>`;
  return;
 }
 const L=LB.levels[VIEW.lv];
 document.body.className=L.color;
 const fm=FORMATS[VIEW.lv];
 if(!VIEW.fmt) VIEW.fmt=fm[0][0];
 root.innerHTML=`<header><div class="top"><button class="home-btn" onclick="go('')">← Übersicht</button><h1>Ebene ${L.nr} · ${L.name}</h1></div><p>${L.afb} — ${L.texts}</p></header>
 <div class="lvnav">${["begriffe","theorie","anwendung"].map(id=>{const X=LB.levels[id];return `<button class="${{rot:"r",blau:"b",gruen:"g"}[X.color]} ${id===VIEW.lv?"on":""}" onclick="go('${id}')">${X.nr} · ${X.name.split(" ")[0]}</button>`}).join("")}</div>
 ${fm.length>1?`<div class="sub">${fm.map(([k,l])=>`<button class="${k===VIEW.fmt?"on":""}" onclick="setFmt('${k}')">${l}</button>`).join("")}</div>`:`<div class="sub" style="padding:4px"></div>`}
 <main><div id="area"></div>${checkoutHTML(VIEW.lv)}</main>`;
 area=$("#area");
 ENGINES[VIEW.fmt]();
 window.scrollTo(0,0);
}
function go(id){VIEW={lv:id||null,fmt:null};try{history.replaceState(null,"",id?"#"+id:location.pathname)}catch(e){}render();}
function setFmt(k){VIEW.fmt=k;render();}
function intro(k){return `<p class="intro">${HELP[k]}</p>`;}
function checkoutHTML(id){
 const L=LB.levels[id],saved=store.get("lb3-co-"+id)||[];
 return `<div class="checkout"><h3>✅ Check-out: Ich kann …</h3>${L.checkout.map((t,i)=>`<label><input type="checkbox" ${saved[i]?"checked":""} onchange="saveCO('${id}',${i},this.checked)"> ${t}</label>`).join("")}</div>`;
}
function saveCO(id,i,v){const s=store.get("lb3-co-"+id)||[];s[i]=v;store.set("lb3-co-"+id,s);}
function doneBox(score,total,label,again){area.innerHTML=`<div class="box done"><div class="big">${score} / ${total}</div><p>${label}</p><button class="btn" onclick="${again}">Nochmal</button></div>`;}

/* ---------- Formate ---------- */
const ENGINES={};

/* Karteikarten */
let K={};
ENGINES.karten=(f)=>{const L=LB.levels.begriffe;K.filter=f||K.filter||"all";K.stack=shuffle(L.cards.filter(c=>K.filter==="all"||c.c===K.filter));K.total=K.stack.length;K.known=0;kRender();};
function kRender(){
 const L=LB.levels.begriffe;
 const filt=`<div class="row">${[["all","Alle"],...Object.entries(L.cats)].map(([k,l])=>`<button class="chip ${K.filter===k?"on":""}" onclick="ENGINES.karten('${k}')">${l}</button>`).join("")}</div>`;
 if(!K.stack.length){area.innerHTML=intro("karten")+filt+`<div class="box done" style="margin-top:12px"><div class="big">🎉</div><p><b>Alle ${K.total} Karten gewusst!</b></p><button class="btn" onclick="ENGINES.karten()">Nochmal</button></div>`;return;}
 const c=K.stack[0];
 area.innerHTML=intro("karten")+filt+`${bar(K.known,K.total)}<div class="small">${K.known} von ${K.total} gewusst · noch ${K.stack.length} im Stapel</div>
 <div class="flip" id="flip" onclick="this.classList.toggle('turned')"><div class="flip-in">
  <div class="face front"><span class="tag">${L.cats[c.c]}</span><div class="q">${c.q}</div><div class="hint">Tippen zum Umdrehen</div></div>
  <div class="face back"><div>${c.a}</div></div></div></div>
 <div class="grid2"><button class="btn no" onclick="kNext(false)">🔁 Noch nicht sicher</button><button class="btn ok" onclick="kNext(true)">✅ Wusste ich</button></div>`;
 fitCard();
}
function fitCard(){const f=$("#flip");if(!f)return;let h=230;f.querySelectorAll(".face").forEach(el=>{el.style.position="relative";h=Math.max(h,el.offsetHeight);el.style.position="";});f.querySelector(".flip-in").style.minHeight=h+"px";}
function kNext(ok){const c=K.stack.shift();if(ok)K.known++;else K.stack.splice(Math.min(K.stack.length,2+Math.floor(Math.random()*3)),0,c);kRender();}
window.addEventListener("resize",fitCard);

/* Zuordnen (generisch: items, Kategorien) */
let S={};
function sorter(items,cats,keys,help,againFn){
 S={list:shuffle(items),i:0,ok:0,cats,keys,help,againFn,lock:false};sRender();
}
function sRender(){
 if(S.i>=S.list.length){doneBox(S.ok,S.list.length,"richtig zugeordnet",S.againFn);return;}
 const it=S.list[S.i];
 area.innerHTML=intro(S.help)+`${bar(S.i,S.list.length)}<div class="small">Aussage ${S.i+1} von ${S.list.length} · ${S.ok} richtig</div>
 <div class="stmt">${it.t}</div><div class="grid2">${S.keys.map(k=>`<button class="btn out" data-k="${k}" onclick="sAns('${k}')">${S.cats[k]}</button>`).join("")}</div><div class="fb" id="fb"></div>`;
 S.lock=false;
}
function sAns(k){
 if(S.lock)return;S.lock=true;const it=S.list[S.i],ok=k===it.c;if(ok)S.ok++;
 document.querySelectorAll(".grid2 .btn").forEach(b=>{b.disabled=true;if(b.dataset.k===it.c){b.className="btn ok";b.disabled=false;b.style.opacity=1}});
 const fb=$("#fb");fb.className="fb "+(ok?"ok":"no");
 fb.innerHTML=`<b>${ok?"Richtig!":"Leider falsch."}</b> Gehört zu: <b>${S.cats[it.c]}</b>. ${it.e}<div style="margin-top:10px"><button class="btn ghost" onclick="S.i++;sRender()">Weiter →</button></div>`;
}
ENGINES.sort=()=>{const L=LB.levels.begriffe;sorter(L.sort,L.cats,L.sortCats,"sort","ENGINES.sort()");};
ENGINES.folgen=()=>{const L=LB.levels.theorie;sorter(L.folgen,L.styles,Object.keys(L.styles),"folgen","ENGINES.folgen()");};

/* Lückentext */
ENGINES.luecke=()=>{
 const L=LB.levels.begriffe;let h=intro("luecke");
 L.gaps.forEach((g,gi)=>{const ans=[...g.s.matchAll(/\[(.+?)\]/g)].map(m=>m[1]);const pool=shuffle([...ans,...g.x]);
  h+=`<div class="gap-s"><b>${gi+1}.</b> ${g.s.replace(/\[(.+?)\]/g,(_,w)=>`<select data-a="${w}" onchange="this.className=''"><option value="">…</option>${pool.map(p=>`<option>${p}</option>`).join("")}</select>`)}<span class="src">${g.src}</span></div>`;});
 h+=`<div class="row"><button class="btn" onclick="lCheck()">Prüfen</button><button class="btn ghost" onclick="ENGINES.luecke()">Neu mischen</button><span id="lres" class="small"></span></div>`;
 area.innerHTML=h;
};
function lCheck(){const s=[...document.querySelectorAll(".gap-s select")];let ok=0;s.forEach(x=>{const r=x.value===x.dataset.a;x.className=r?"ok":"no";if(r)ok++;});$("#lres").innerHTML=` <b>${ok} von ${s.length}</b> richtig${ok===s.length?" 🎉":" – korrigiere die roten Felder."}`;}

/* Beispiel-Detektiv */
let D={};
ENGINES.detektiv=()=>{D={list:shuffle(LB.levels.begriffe.detect),i:0,ok:0};dRender();};
function dRender(){
 const L=LB.levels.begriffe;
 if(D.i>=D.list.length){doneBox(D.ok,D.list.length,"Fälle gelöst","ENGINES.detektiv()");return;}
 const c=D.list[D.i];
 area.innerHTML=intro("detektiv")+`${bar(D.i,D.list.length)}<div class="small">Fall ${D.i+1} von ${D.list.length} · ${D.ok} gelöst</div>
 <div class="case">${c.t}</div><div class="opts">${L.sortCats.map(k=>`<button class="opt" data-k="${k}" onclick="dAns('${k}')">${L.cats[k]}</button>`).join("")}</div><div class="fb" id="fb"></div>`;
}
function dAns(k){const c=D.list[D.i],ok=k===c.k;if(ok)D.ok++;
 document.querySelectorAll(".opt").forEach(b=>{b.disabled=true;if(b.dataset.k===c.k)b.classList.add("ok");else if(b.dataset.k===k)b.classList.add("no");});
 const fb=$("#fb");fb.className="fb "+(ok?"ok":"no");fb.innerHTML=`<b>${ok?"Gut erkannt!":"Nicht ganz."}</b> ${c.e}<div style="margin-top:10px"><button class="btn ghost" onclick="D.i++;dRender()">Weiter →</button></div>`;}

/* Struktur legen (Matrix) */
let M={};
ENGINES.matrix=()=>{const L=LB.levels.theorie;M={items:[...L.matrix.filter(x=>x.st),...shuffle(L.matrix.filter(x=>!x.st))].map((x,i)=>({...x,id:i})),placed:{},sel:null,err:0};mRender();};
function mRender(){
 const L=LB.levels.theorie,keys=Object.keys(L.styles),tp=L.termPl||"Stile";
 const left=M.items.filter(x=>!M.placed[x.id]);
 const stylesLeft=left.some(x=>x.st);
 const pool=left.filter(x=>stylesLeft?x.st:true);
 const cell=k=>`<div class="cell" id="c-${k}" onclick="mDrop('${k}')">${L.axes?"":`<div class="hint">${L.cells[k]}</div>`}${M.items.filter(x=>M.placed[x.id]===k).sort((a,b)=>(b.st||0)-(a.st||0)).map(x=>`<div class="in ${x.st?"st":""}">${x.t}</div>`).join("")}</div>`;
 const grid=L.axes?`<div class="mx">
  <div></div><div class="ax">${L.axes.top[0]}</div><div class="ax">${L.axes.top[1]}</div>
  <div class="ax" style="writing-mode:vertical-rl;transform:rotate(180deg)">${L.axes.left[0]}</div>${cell(keys[0])}${cell(keys[1])}
  <div class="ax" style="writing-mode:vertical-rl;transform:rotate(180deg)">${L.axes.left[1]}</div>${cell(keys[2])}${cell(keys[3])}
 </div>`:`<div class="mx mx2">${keys.map(cell).join("")}</div>`;
 area.innerHTML=intro("matrix")+`
 <div class="pool">${pool.map(x=>`<button class="${x.st?"st":""} ${M.sel===x.id?"sel":""}" onclick="M.sel=${x.id};mRender()">${x.t}</button>`).join("")||"<b>Fertig! 🎉</b>"}</div>
 <div class="small">${stylesLeft?"Runde 1: Ordne zuerst die "+keys.length+" "+tp+" ein.":"Runde 2: Ordne jetzt die Merkmale zu."} · Fehlversuche: ${M.err}</div>
 ${grid}
 ${!left.length?`<div class="fb ok">Alles richtig eingeordnet – mit ${M.err} Fehlversuch(en).</div><button class="btn" style="margin-top:10px" onclick="ENGINES.matrix()">Nochmal</button>`:""}`;
}
function mDrop(k){
 if(M.sel===null)return;const it=M.items[M.sel];
 if(it.k===k){M.placed[it.id]=k;M.sel=null;mRender();}
 else{M.err++;const c=$("#c-"+k);c.classList.add("flash");setTimeout(()=>{M.sel=null;mRender();},450);}
}

/* Fall-Diagnose (zweistufig) */
let G={};
ENGINES.diagnose=()=>{G={list:shuffle(LB.levels.theorie.diagnose),i:0,ok:0,s1:null};gRender();};
function gRender(){
 const L=LB.levels.theorie;
 if(G.i>=G.list.length){doneBox(G.ok,G.list.length*2,"Punkte (Zuordnung + Begründung)","ENGINES.diagnose()");return;}
 const c=G.list[G.i];
 area.innerHTML=intro("diagnose")+`${bar(G.i,G.list.length)}<div class="small">Fall ${G.i+1} von ${G.list.length} · ${G.ok} Punkte</div>
 <div class="case">${c.t}</div>
 <div class="step">Schritt 1: Welche ${L.termSg||"Erziehungsstil"} liegt vor?</div>
 <div class="opts" id="s1">${Object.entries(L.styles).map(([k,l])=>`<button class="opt" data-k="${k}" onclick="g1('${k}')">${l}</button>`).join("")}</div>
 <div id="s2"></div><div class="fb" id="fb"></div>`;
}
function g1(k){
 const c=G.list[G.i],ok=k===c.k;if(ok)G.ok++;
 document.querySelectorAll("#s1 .opt").forEach(b=>{b.disabled=true;if(b.dataset.k===c.k)b.classList.add("ok");else if(b.dataset.k===k)b.classList.add("no");});
 $("#s2").innerHTML=`<div class="step">Schritt 2: Woran erkennst du das?</div><div class="opts">${c.r.map((r,i)=>`<button class="opt" data-i="${i}" onclick="g2(${i})">${r}</button>`).join("")}</div>`;
}
function g2(i){
 const c=G.list[G.i],ok=i===c.rk;if(ok)G.ok++;
 document.querySelectorAll("#s2 .opt").forEach(b=>{b.disabled=true;const j=+b.dataset.i;if(j===c.rk)b.classList.add("ok");else if(j===i)b.classList.add("no");});
 const L=LB.levels.theorie,fb=$("#fb");fb.className="fb "+(ok?"ok":"no");
 fb.innerHTML=`<b>Lösung:</b> ${L.styles[c.k]} – ${L.cells[c.k]}.<div style="margin-top:10px"><button class="btn ghost" onclick="G.i++;gRender()">Weiter →</button></div>`;
}

/* Einordnen mit Reglern (ein oder zwei Dimensionen) */
let R={};
ENGINES.regler=()=>{R={list:shuffle(LB.levels.theorie.slider),i:0,ok:0};rRender();};
function rRender(){
 const L=LB.levels.theorie,D=L.dims;
 if(R.i>=R.list.length){doneBox(R.ok,R.list.length,"Aussagen richtig eingeordnet","ENGINES.regler()");return;}
 const c=R.list[R.i];
 area.innerHTML=intro("regler")+`${bar(R.i,R.list.length)}<div class="small">Aussage ${R.i+1} von ${R.list.length} · ${R.ok} richtig</div>
 <div class="case" style="font-size:1.15rem">${c.t}</div>
 <div class="box">${D.map((d,i)=>`<div class="sl"><label>${d.icon} ${d.label} <span id="v${i}">5</span></label><input type="range" min="0" max="10" value="5" id="s${i}" oninput="$('#v${i}').textContent=this.value"><div class="row small" style="justify-content:space-between"><span>${d.lo}</span><span>${d.hi}</span></div></div>`).join("")}
  <button class="btn" id="rb" onclick="rCheck()">Prüfen</button>
 </div><div class="fb" id="fb"></div>`;
}
function rCheck(){
 const L=LB.levels.theorie,D=L.dims,fb=$("#fb"),c=R.list[R.i];
 const vals=D.map((d,i)=>+$("#s"+i).value);
 if(vals.some(v=>v===5)){fb.className="fb no";fb.innerHTML="Entscheide dich bei jedem Regler: eher hoch (über 5) oder eher niedrig (unter 5).";return;}
 const truth=c.v.map(x=>x?1:0),oks=vals.map((v,i)=>(v>5)===!!truth[i]),ok=oks.every(Boolean);if(ok)R.ok++;
 D.forEach((d,i)=>{$("#s"+i).disabled=true});$("#rb").disabled=true;
 fb.className="fb "+(ok?"ok":"no");
 fb.innerHTML=`<b>${ok?"Richtig eingeordnet!":"Nicht ganz."}</b> ${D.map((d,i)=>d.label+": <b>"+(truth[i]?d.hi:d.lo)+"</b>"+(oks[i]?"":" (falsch)")).join(" · ")} → <b>${L.map[truth.join("")]}</b>.<div style="margin-top:10px"><button class="btn ghost" onclick="R.i++;rRender()">Weiter →</button></div>`;
}

/* Fehler-Detektiv */
let E={};
ENGINES.fehler=(n)=>{E={n:n||0,mark:{},checked:false};eRender();};
function eRender(){
 const L=LB.levels.theorie,T=L.errors[E.n];
 area.innerHTML=intro("fehler")+`<div class="row" style="margin-bottom:10px">${L.errors.map((x,i)=>`<button class="chip ${i===E.n?"on":""}" onclick="ENGINES.fehler(${i})">${x.title}</button>`).join("")}</div>
 <div class="box eh"><div class="small" style="margin-bottom:8px">${T.title}</div>${T.s.map((s,i)=>{let cl="";if(E.checked){cl=s.c?(E.mark[i]?"hit":"miss"):(E.mark[i]?"wrong":"");}else if(E.mark[i])cl="mark";
  return `<p class="${cl}" onclick="eTog(${i})">${s.t}${E.checked&&s.c?`<span class="corr">✏️ ${s.c}</span>`:""}${E.checked&&!s.c&&E.mark[i]?`<span class="corr">Dieser Satz ist richtig.</span>`:""}</p>`}).join("")}</div>
 <div class="row" style="margin-top:10px"><button class="btn" onclick="eCheck()" ${E.checked?"disabled":""}>Prüfen</button><button class="btn ghost" onclick="ENGINES.fehler(${E.n})">Zurücksetzen</button></div><div class="fb" id="fb"></div>`;
 if(E.checked){const errs=T.s.filter(s=>s.c).length,hits=T.s.filter((s,i)=>s.c&&E.mark[i]).length,wrong=T.s.filter((s,i)=>!s.c&&E.mark[i]).length;
  const fb=$("#fb");fb.className="fb "+(hits===errs&&!wrong?"ok":"no");
  fb.innerHTML=`Du hast <b>${hits} von ${errs}</b> Fehlern gefunden${wrong?` und <b>${wrong}</b> richtige(n) Satz/Sätze fälschlich markiert`:""}. 🟩 gefunden · 🟥 übersehen · 🟨 war eigentlich richtig. Lies die Korrekturen ✏️ genau.`;}
}
function eTog(i){if(E.checked)return;E.mark[i]=!E.mark[i];eRender();}
function eCheck(){E.checked=true;eRender();}

/* Aufträge (Anwendung) */
ENGINES.auftraege=()=>{
 const L=LB.levels.anwendung;
 area.innerHTML=intro("auftraege")+L.tasks.map(t=>`<div class="task"><h3>${t.icon} ${t.title}</h3><div class="meta">${t.meta.map(m=>`<span>${m}</span>`).join("")}</div>
 <div class="goal">🎯 ${t.goal}</div><ol>${t.steps.map(s=>`<li>${s}</li>`).join("")}</ol><div class="prod">${t.prod}</div></div>`).join("");
};



const DOT={rot:"🔴",blau:"🔵",gruen:"🟢"};
function navHTML(){
 const L=LB.levels[PAGE.lv];
 return `<nav class="pnav"><h3>Weitere Übungen auf Ebene ${L.nr} · ${L.name}</h3>${PAGE.siblings.map(([f,l])=>`<a href="${f}" class="${f===PAGE.file?"on":""}">${l}</a>`).join("")}<a class="home" href="${PAGE.home}">← Übersicht aller Ebenen</a></nav>`;
}
function taskSingle(i){
 const t=LB.levels.anwendung.tasks[i];
 area.innerHTML=intro("auftraege")+`<div class="task"><h3>${t.icon} ${t.title}</h3><div class="meta">${t.meta.map(m=>`<span>${m}</span>`).join("")}</div>
 <div class="goal">🎯 ${t.goal}</div><ol>${t.steps.map(s=>`<li>${s}</li>`).join("")}</ol><div class="prod">${t.prod}</div>
 ${PAGE.pdf?`<a class="dl" href="${PAGE.pdf}" download>📄 Druckvorlage (PDF) herunterladen</a>`:""}</div>`;
}
function render(){
 const L=LB.levels[PAGE.lv];
 document.body.className=L.color+(location.hash==="#embed"?" embed":"");
 document.getElementById("root").innerHTML=`<header><div class="kick">${DOT[L.color]} Ebene ${L.nr} · ${L.name} · ${L.afb}</div><h1>${PAGE.title}</h1><p>${L.texts}</p></header>
 <main><div id="area"></div>${checkoutHTML(PAGE.lv)}${navHTML()}</main>`;
 area=$("#area");
 if(PAGE.task!=null) taskSingle(PAGE.task); else ENGINES[PAGE.fmt]();
}
render();