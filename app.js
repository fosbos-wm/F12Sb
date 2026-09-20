let initializeApp, getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile; let getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, limit, where, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, increment; let getStorage, storageRef, uploadBytes, getDownloadURL, deleteObject; let storage=null; let firebaseReadyPromise = null; async function loadFirebase(){ if(firebaseReadyPromise) return firebaseReadyPromise; firebaseReadyPromise = Promise.all([ import("https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js"), import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js"), import("https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js"), import("https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js") ]).then(([appMod, authMod, fsMod, storageMod])=>{ ({initializeApp}=appMod); ({getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,updateProfile}=authMod); ({getFirestore,collection,doc,addDoc,setDoc,updateDoc,deleteDoc,getDoc,getDocs,query,orderBy,limit,where,onSnapshot,serverTimestamp,arrayUnion,arrayRemove,increment}=fsMod); ({getStorage,ref:storageRef,uploadBytes,getDownloadURL,deleteObject}=storageMod); if(!app) app=initializeApp(firebaseConfig); if(!auth) auth=getAuth(app); if(!db) db=getFirestore(app); if(!storage) storage=getStorage(app); window.CampusFirebase={ get db(){return db}, get currentUser(){return currentUser}, collection,doc,addDoc,setDoc,updateDoc,deleteDoc,getDoc,getDocs, query,orderBy,limit,where,onSnapshot,serverTimestamp,arrayUnion,increment, modal,toast,pageHead,footer,render }; return true; }); return firebaseReadyPromise; } /*
 WICHTIG:
 Diese Werte werden nach dem Anlegen deiner Firebase-Web-App aus
 der Firebase Console hier eingesetzt.
*/ const firebaseConfig = { apiKey: "AIzaSyB_q4BaOGXaxLLL_fYB1MNA0HO2llAeG_s", authDomain: "f12sb-9f3db.firebaseapp.com", projectId: "f12sb-9f3db", storageBucket: "f12sb-9f3db.firebasestorage.app", messagingSenderId: "85936724696", appId: "1:85936724696:web:aa5be7604fd580e4add5ad" }; /* =========================================================
 F12Sb MASTER – STABILE MODULREGISTRY
 Die Master-App selbst enthält keine Pflicht-Imports
 von Zusatzmodulen. Module werden erst beim Öffnen geladen.
 ========================================================= */ const CAMPUS_MODULES={ lernpfad:{label:"Persönlicher Lernpfad",route:"lernpfad",ready:true}, lernressourcen:{label:"Lernressourcen",route:"ressourcen",ready:true}, lernjournal:{label:"Lernjournal",route:"journal",ready:true}, lernmethoden:{label:"Lernmethoden",route:"methoden",ready:true}, lernimpulse:{label:"Lernimpulse",route:"impulse",ready:false}, lernstand:{label:"Lernstandsmessung",route:"lernstand",ready:true}, lerncoaching:{label:"Lerncoaching",route:"lerncoaching",ready:false}, resilienz:{label:"Resilienz & Respressi",route:"resilienz",ready:false}, kompetenz:{label:"Kompetenzwerkstatt",route:"kompetenz",ready:true}, forum:{label:"Campus-Forum",route:"forum",ready:true}, pinnwand:{label:"Pinnwand",route:"pinnwand",ready:true}, kollaboration:{label:"Tools für Zusammenarbeit",route:"kollaboration",ready:true}, wortwolke:{label:"Wortwolke",route:"wortwolke",ready:true}, kanban:{label:"Kanban-Board",route:"kanban",ready:true}, terminfindung:{label:"Terminfindung",route:"terminfindung",ready:true}, teamgesucht:{label:"Team gesucht",route:"teamgesucht",ready:true}, checkliste:{label:"Gemeinsame Checkliste",route:"checkliste",ready:true}, ampel:{label:"Verständnis-Ampel",route:"ampel",ready:true}, umfrage:{label:"Live-Umfrage",route:"umfrage",ready:true}, zufallspicker:{label:"Wer ist dran?",route:"zufallspicker",ready:true}, lernwerkzeuge:{label:"Lern-Werkzeuge",route:"lernwerkzeuge",ready:true}, karteikarten:{label:"Karteikarten",route:"karteikarten",ready:true},"fokus-timer":{label:"Fokus-Timer",route:"fokus-timer",ready:true}, glossar:{label:"Glossar",route:"glossar",ready:true}, projekte:{label:"Projekte",route:"projekte",ready:true}, kalender:{label:"Campus-Kalender",route:"kalender",ready:true}, kompetenzprofil:{label:"Kompetenzprofil",route:"kompetenzprofil",ready:false}, team:{label:"Lehrkräfte Klassenteam",route:"team",ready:true} }; const configReady = !Object.values(firebaseConfig).some(v => String(v).includes("HIER_") || String(v).includes("DEIN-PROJEKT")); let app=null, auth=null, db=null; const $=id=>document.getElementById(id); const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const statusLabel={green:"Auf Kurs",yellow:"Klärungsbedarf",red:"Handlungsbedarf"};
const labels={question:"Frage",info:"Info",idea:"Idee",project:"Projekt",practice:"Praxis"};
let currentUser=null, profile=null, unsubscribers=[];
let activeBoardId=null;
let activeFach=null;
function openFach(fach){activeFach=fach;go("fach")}
function closeFach(){activeFach=null;go("faecher")}
window.openFach=openFach;window.closeFach=closeFach;

function toast(t){const
x=$("toast");x.textContent=t;x.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove("show"),
2500)}
function authError(err){
 const map={
 "auth/invalid-credential":"E-Mail oder Passwort ist nicht korrekt.","auth/email-already-in-use":"Für diese E-Mail existiert bereits ein Konto.","auth/weak-password":"Das Passwort muss mindestens 6 Zeichen haben.","auth/invalid-email":"Bitte eine gültige E-Mail-Adresse eingeben.","auth/too-many-requests":"Zu viele Versuche. Bitte später erneut versuchen."
 };
 $("authError").textContent=map[err?.code]||"Anmeldung konnte nicht durchgeführt werden.";
}
function modal(html){$("modal").innerHTML=html;$("modalBackdrop").hidden=false}
function closeModal(){$("modalBackdrop").hidden=true}
function pageHead(k,h,p,actions=""){return`<div class="page-head"><div><div class="kicker">${k}</div><h1>${h}</h1><p>${p}</p>
</div><div class="actions">${actions}</div></div>`}
function footer(){return`<div class="footer"><span>F12Sb 26/27 · FOSBOS Weilheim</span><span>Gemeinsam · offen ·
respektvoll</span><span><button type="button"onclick="showImpressum()"style="background:none;border:none;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer">Impressum</button></span></div>`}

/* =========================================================
 IMPRESSUM – Angaben gemäß § 5 TMG, übernommen von der
 offiziellen Schul-Website (fos-bos-weilheim.de/impressum),
 Stand siehe dortige Seite. Als Modal aufrufbar, damit es auch
 VOR dem Login vom Anmelde-Bildschirm aus erreichbar ist.
 ========================================================= */
function showImpressum(){
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">RECHTLICHES</div>
 <h2>Impressum</h2>
 <div class="form"style="gap:14px">
 <p><strong>Angaben gemäß § 5 TMG</strong><br>
 Staatliche Fachoberschule und Berufsoberschule Weilheim<br>
 Kerschensteinerstraße 2<br>
 82362 Weilheim i.OB</p>

 <p><strong>Vertreten durch</strong><br>Christian Dick, OStD (Schulleiter)</p>

 <p><strong>Kontakt</strong><br>
 Telefon: +49 881 9239-43<br>
 Fax: +49 881 9239-40<br>
 E-Mail: 0897.Sekretariat@schule.bayern.de</p>

 <p><strong>Aufsichtsbehörde</strong><br>
 Bayerisches Staatsministerium für Unterricht und Kultus<br>
 Salvatorstraße 2<br>
 80333 München<br>
 www.km.bayern.de</p>

 <p><strong>Redaktionell verantwortlich</strong><br>Christian Dick, OStD</p>

 <p><strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle</strong><br>
 Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

 <div class="notice">
 <strong>Hinweis zur F12Sb-App</strong>
 <p style="margin-bottom:0">Diese App ist ein Unterrichts-/Klassenprojekt und kein offizielles IT-Angebot der Schulverwaltung. Die obigen Angaben entsprechen denen der offiziellen Schul-Website (fos-bos-weilheim.de). Für Rückfragen zu dieser App wende dich zusätzlich an die betreuende Lehrkraft. Eine ausführliche Datenschutzerklärung für die App selbst steht noch aus.</p>
 </div>

 <div class="form-actions"><button class="secondary"onclick="closeModal()">Schließen</button></div>
 </div>`);
}

function tile(icon,title,text,target,farbe){return`<a class="card tile"style="border-left:4px solid ${farbe||"var(--line)"}"href="#${target}"><span class="emoji">${icon}</span>
<strong>${title}</strong><small>${text}</small></a>`}
function statusDot(s){return`<span class="dot ${s}"></span>`}
function isApproved(){return profile?.status==="approved"}
function isTeacher(){return isApproved() && (profile?.role==="teacher"||profile?.role==="admin")}
function isAdmin(){return isApproved() && profile?.role==="admin"}
function updateTeacherTeamNav(){
 const sidebar=$("sidebar");
 if(!sidebar)return;

 // Lernressourcen bleiben als eigene Seite/Kachel verfügbar,
 // werden aber NICHT in der linken Seiten-Navigation angezeigt.
 sidebar.querySelectorAll('a[href="#ressourcen"],button[data-page="ressourcen"],.nav-link[data-page="ressourcen"]')
 .forEach(el=>el.remove());

 // Remove the obsolete visible wording everywhere inside the sidebar.
 const walker=document.createTreeWalker(sidebar,NodeFilter.SHOW_TEXT);
 const nodes=[];let n;
 while((n=walker.nextNode()))nodes.push(n);
 nodes.forEach(node=>{
 node.textContent=node.textContent.replace(/Team\s*&\s*SQ/gi,"");
 });

 // Find the actual team navigation item and give it exactly the requested label.
 const links=[...sidebar.querySelectorAll('a[href="#team"],button[data-page="team"],.nav-link[data-page="team"]')];
 const link=links[0];
 if(link){
 link.textContent="Lehrkräfte Klassenteam";
 link.hidden=!isTeacher();
 link.setAttribute("aria-hidden",String(!isTeacher()));
 }
}
function showAuth(){
 $("authScreen").hidden=false;$("app").hidden=true;$("logoutBtn").hidden=true;
 $("userName").textContent="";
}
function showApp(){
 $("authScreen").hidden=true;$("app").hidden=false;$("logoutBtn").hidden=false;
 $("userName").textContent=profile?.displayName||currentUser?.email||"Campus";
 updateTeacherTeamNav();
 render();
}
function clearListeners(){unsubscribers.forEach(u=>u&&u());unsubscribers=[]}

async function ensureProfile(user, displayName="", extra={}){
 const ref=doc(db,"users",user.uid), snap=await getDoc(ref);
 if(!snap.exists()){
 const firstName=(extra.firstName||"").trim();
 const lastName=(extra.lastName||"").trim();
 const finalName=(firstName||lastName)?`${firstName} ${lastName}`.trim():(displayName||user.displayName||"Campus-Mitglied");
 await setDoc(ref,{
 uid:user.uid,email:user.email||"",
 firstName,lastName,
 displayName:finalName,
role:"student",status:"pending",createdAt:serverTimestamp()
 });
 }
 const s=await getDoc(ref);profile=s.data();
}

// Liest Vorname/Nachname aus dem Registrierungsformular.
// Unterstützt sowohl separate Felder (registerFirstName/registerLastName)
// als auch – als Rückfallebene – das bisherige einzelne Namensfeld
// (registerName), das dann am ersten Leerzeichen aufgeteilt wird.
function getRegisterNameFields(){
 const firstEl=$("registerFirstName"), lastEl=$("registerLastName");
 if(firstEl && lastEl){
 return {firstName:firstEl.value.trim(), lastName:lastEl.value.trim()};
 }
 const full=($("registerName")?.value||"").trim();
 const parts=full.split(/\s+/).filter(Boolean);
 return {firstName:parts[0]||"", lastName:parts.slice(1).join(" ")||""};
}

function showLoginForm(){
 $("loginTab").classList.add("active");
 $("registerTab").classList.remove("active");
 $("loginForm").hidden=false;
 $("registerForm").hidden=true;
 $("authError").textContent="";
}
function showRegisterForm(){
 $("registerTab").classList.add("active");
 $("loginTab").classList.remove("active");
 $("loginForm").hidden=true;
 $("registerForm").hidden=false;
 $("authError").textContent="";
}

/* =========================================================
 LERNRESSOURCEN – ANLEGEN
 Nur freigeschaltete Lehrkräfte/Admins dürfen Ressourcen
 erstellen. Die bestehende Anzeige bleibt unverändert.
 ========================================================= */
window.openLernressourceForm=async function(){
 if(!isTeacher()){
 toast("Nur freigeschaltete Lehrkräfte können Lernressourcen anlegen.");
 return;
 }

 try{ await loadFirebase(); }catch(e){
 console.error("Firebase für Lernressource:",e);
 toast("Firebase ist noch nicht bereit. Bitte erneut versuchen.");
 return;
 }

 modal(`<button class="modal-close"type="button"onclick="closeModal()">×</button>
 <div class="kicker">LERNRESSOURCE</div>
 <h2>Neue Lernressource</h2>
 <p>Lege eine Ressource für den gemeinsamen Campus an.</p>
 <div class="form">
 <label>Titel<input id="lrTitle"type="text"maxlength="200"placeholder="Titel der Lernressource"></label>
 <label>Art
 <select id="lrType">
 <option value="taskcard">TaskCard</option>
 <option value="ki">KI-Lernressource</option>
 <option value="video">Video</option>
 <option value="bycs">ByCS / mebis</option>
 <option value="canva">Canva</option>
 <option value="learningapps">LearningApps</option>
 <option value="website">Webseite</option>
 <option value="external">Externer Link</option>
 </select>
 </label>
 <label>Link / URL<input id="lrUrl"type="url"maxlength="2000"placeholder="https://..."></label>
 <label>Beschreibung<textarea id="lrDescription"rows="4"maxlength="2000"placeholder="Kurzbeschreibung"></textarea></label>
 <label>Fach / Lernbereich<input id="lrSubject"type="text"maxlength="150"placeholder="z. B. Betriebswirtschaft"></label>
 <label>Schlagworte<input id="lrTags"type="text"maxlength="500"placeholder="z. B. Prüfung, Grundlagen, Übung"></label>
 <div class="form-actions">
 <button class="secondary"type="button"onclick="closeModal()">Abbrechen</button>
 <button class="primary"type="button"id="lrSave">Lernressource anlegen</button>
 </div>
 </div>`);

 const save=document.getElementById("lrSave");
 if(!save)return;
 save.addEventListener("click",async()=>{
 const title=document.getElementById("lrTitle")?.value.trim()||"";
 const type=document.getElementById("lrType")?.value||"external";
 const url=document.getElementById("lrUrl")?.value.trim()||"";
 const description=document.getElementById("lrDescription")?.value.trim()||"";
 const subject=document.getElementById("lrSubject")?.value.trim()||"";
 const tags=(document.getElementById("lrTags")?.value||"").split(",").map(x=>x.trim()).filter(Boolean);

 if(!title){toast("Bitte einen Titel eingeben.");return;}
 if(!url){toast("Bitte einen Link / eine URL eingeben.");return;}
 try{
 const u=new URL(url);
 if(!/^https?:$/.test(u.protocol))throw new Error("protocol");
 }catch(e){toast("Bitte eine gültige http(s)-URL eingeben.");return;}

 if(!currentUser || !db){toast("Firebase ist noch nicht bereit. Bitte erneut versuchen.");return;}
 if(!isTeacher()){toast("Dein Lehrkraft-Zugang ist nicht freigeschaltet.");return;}

 save.disabled=true;
 save.textContent="Wird gespeichert …";
 try{
 await addDoc(collection(db,"lernressourcen"),{
 title,type,url,description,subject,tags,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.displayName||currentUser.email||"Lehrkraft",
 createdAt:serverTimestamp(),
 updatedAt:serverTimestamp()
 });
 closeModal();
 toast("Lernressource wurde angelegt.");
 await render();
 }catch(e){
 console.error("Lernressource anlegen:",e);
 save.disabled=false;
 save.textContent="Lernressource anlegen";
 if(e?.code==="permission-denied"){
 toast("Firebase verweigert das Anlegen. Bitte die veröffentlichten Firestore-Regeln prüfen.");
 }else{
 toast("Die Lernressource konnte nicht angelegt werden.");
 }
 }
 });
};

function openLernressource(encodedUrl){
 try{
 const url=decodeURIComponent(encodedUrl);
 window.open(url,"_blank","noopener,noreferrer");
 }catch(e){
 console.error("Lernressource öffnen:",e);
 toast("Die Ressource konnte nicht geöffnet werden.");
 }
}

function editLernressourceForm(collectionName,id,title,type,url,description,subject,tagsText){
 if(!isTeacher()){toast("Nur freigeschaltete Lehrkräfte können Lernressourcen bearbeiten.");return}
 window.__editLernressourceCollection=collectionName||"lernressourcen";
 window.__editLernressourceId=id;
 modal(`<button class="modal-close"type="button"onclick="closeModal()">×</button>
 <div class="kicker">LERNRESSOURCE</div>
 <h2>Lernressource bearbeiten</h2>
 <div class="form">
 <label>Titel<input id="lrTitle"type="text"maxlength="200"value="${esc(title||"")}"></label>
 <label>Art
 <select id="lrType">
 <option value="taskcard">TaskCard</option>
 <option value="ki">KI-Lernressource</option>
 <option value="video">Video</option>
 <option value="bycs">ByCS / mebis</option>
 <option value="canva">Canva</option>
 <option value="learningapps">LearningApps</option>
 <option value="website">Webseite</option>
 <option value="external">Externer Link</option>
 </select>
 </label>
 <label>Link / URL<input id="lrUrl"type="url"maxlength="2000"value="${esc(url||"")}"></label>
 <label>Beschreibung<textarea id="lrDescription"rows="4"maxlength="2000">${esc(description||"")}</textarea></label>
 <label>Fach / Lernbereich<input id="lrSubject"type="text"maxlength="150"value="${esc(subject||"")}"></label>
 <label>Schlagworte<input id="lrTags"type="text"maxlength="500"value="${esc(tagsText||"")}"></label>
 <div class="form-actions">
 <button class="secondary"type="button"onclick="closeModal()">Abbrechen</button>
 <button class="primary"type="button"id="lrUpdateSave">Änderungen speichern</button>
 </div>
 </div>`);
 const typeSel=$("lrType");
 if(typeSel)typeSel.value=type||"external";
 const btn=$("lrUpdateSave");
 if(btn)btn.addEventListener("click",updateLernressource);
}

async function updateLernressource(){
 const collectionName=window.__editLernressourceCollection||"lernressourcen";
 const id=window.__editLernressourceId;
 if(!id)return;
 const title=$("lrTitle")?.value.trim()||"";
 const type=$("lrType")?.value||"external";
 const url=$("lrUrl")?.value.trim()||"";
 const description=$("lrDescription")?.value.trim()||"";
 const subject=$("lrSubject")?.value.trim()||"";
 const tags=($("lrTags")?.value||"").split(",").map(x=>x.trim()).filter(Boolean);

 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(!url){toast("Bitte einen Link / eine URL eingeben.");return}
 try{
 const u=new URL(url);
 if(!/^https?:$/.test(u.protocol))throw new Error("protocol");
 }catch(e){toast("Bitte eine gültige http(s)-URL eingeben.");return}

 const btn=$("lrUpdateSave");
 if(btn){btn.disabled=true;btn.textContent="Speichert …"}
 try{
 await updateDoc(doc(db,collectionName,id),{title,type,url,description,subject,tags,updatedAt:serverTimestamp()});
 closeModal();toast("Lernressource wurde geändert.");await render();
 }catch(e){
 console.error("Lernressource bearbeiten:",e);
 if(btn){btn.disabled=false;btn.textContent="Änderungen speichern"}
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Änderungen konnten nicht gespeichert werden.");
 }
}

async function renderRessourcenRoute(){
 /*
 Lernressourcen bewusst direkt in app.js rendern.
 Dadurch ist der Bereich unabhängig davon, ob das optionale
 Modul modules/lernressourcen.js auf GitHub Pages geladen werden kann.
 Es werden beide bisher verwendeten Collections unterstützt:
 - lernressourcen (aktuelle Struktur)
 - resources (ältere Bestände)
 */
 try{
 await loadFirebase();
 const fb=window.CampusFirebase;
 if(!fb?.db) throw new Error("Firebase ist noch nicht bereit.");

 const collections=["lernressourcen","resources"];
 const all=[];
 for(const collectionName of collections){
 try{
 const ref=fb.collection(fb.db,collectionName);
 let snap;
 try{
 snap=await fb.getDocs(fb.query(ref,fb.orderBy("createdAt","desc"),fb.limit(200)));
 }catch(orderError){
 snap=await fb.getDocs(ref);
 }
 snap.docs.forEach(d=>all.push({id:d.id,collection:collectionName,...d.data()}));
 }catch(error){
 console.warn("Lernressourcen-Collection nicht lesbar:",collectionName,error);
 }
 }

 // Doppelte Datensätze vermeiden, falls derselbe Inhalt in beiden
 // Collections liegt. Die ID allein reicht nicht, weil sie je Collection
 // vergeben wird; deshalb wird zusätzlich die normalisierte URL verwendet.
 const seen=new Set();
 const resources=all.filter(r=>{
 const key=[String(r.title??r.name??"").trim().toLowerCase(),String(r.url??r.link??"").trim().toLowerCase()].join("|");
 if(!key.replace(/\|/g,"")) return false;
 if(seen.has(key)) return false;
 seen.add(key);
 return true;
 });

 const types={
 taskcard:{icon:"",label:"TaskCard"},
 ki:{icon:"",label:"KI-Lernressource"},
 external:{icon:"",label:"Externer Link"},
 video:{icon:"",label:"Video-Link"},
 bycs:{icon:"",label:"ByCS / mebis"},
 canva:{icon:"",label:"Canva"},
 learningapps:{icon:"",label:"LearningApps"},
 website:{icon:"",label:"Webseite"}
 };
 const typeOf=r=>{
 const raw=String(r.type??r.category??"external").toLowerCase();
 if(types[raw]) return raw;
 if(raw.includes("task")) return"taskcard";
 if(raw.includes("video")) return"video";
 if(raw.includes("bycs")||raw.includes("mebis")) return"bycs";
 if(raw.includes("canva")) return"canva";
 if(raw.includes("learningapps")||raw.includes("learning apps")) return"learningapps";
 if(raw.includes("ki")) return"ki";
 if(raw.includes("web")) return"website";
 return"external";
 };
 const urlOf=r=>String(r.url??r.link??"").trim();
 const titleOf=r=>String(r.title??r.name??"Lernressource");
 const descOf=r=>String(r.description??r.text??"");
 const subjectOf=r=>String(r.subject??r.fach??r.lernbereich??"");
 const tagsOf=r=>Array.isArray(r.tags)?r.tags:(typeof r.tags==="string"?r.tags.split(",").map(x=>x.trim()).filter(Boolean):[]);

 const grouped={taskcard:[],ki:[],external:[],video:[],bycs:[],canva:[],learningapps:[],website:[]};
 resources.forEach(r=>grouped[typeOf(r)].push(r));

 const canEdit=typeof isTeacher==="function" && isTeacher();
 const addButton=canEdit?`<button class="primary"onclick="window.openLernressourceForm()">＋ Lernressource hinzufügen</button>`:"";

 const card=r=>{
 const type=typeOf(r),t=types[type],tags=tagsOf(r),url=urlOf(r);
 return`<article class="card resource-card"data-resource-id="${esc(r.id)}"data-resource-collection="${esc(r.collection)}">
 <div class="resource-head"><span class="resource-icon">${t.icon}</span><span class="pill">${esc(t.label)}</span></div>
 <h3>${esc(titleOf(r))}</h3>
 ${descOf(r)?`<p>${esc(descOf(r))}</p>`:""}
 ${subjectOf(r)?`<div class="resource-meta"> ${esc(subjectOf(r))}</div>`:""}
 ${tags.length?`<div class="chips">${tags.map(x=>`<span class="chip">#${esc(x)}</span>`).join("")}</div>`:""}
 ${url?`<button class="primary resource-open"onclick="window.openLernressource('${encodeURIComponent(url)}')">${t.icon} Lernressource öffnen →</button>`:`<div class="notice">Für diese Ressource ist noch kein Link hinterlegt.</div>`}
 ${canEdit?`<div class="form-actions"style="margin-top:10px"><button class="secondary"onclick="editLernressourceForm('${esc(r.collection)}','${esc(r.id)}','${esc(String(titleOf(r)).replace(/\n/g,"\\n"))}','${esc(type)}','${esc(String(url).replace(/\n/g,"\\n"))}','${esc(String(descOf(r)).replace(/\n/g,"\\n"))}','${esc(String(subjectOf(r)).replace(/\n/g,"\\n"))}','${esc(tags.join(",").replace(/\n/g,"\\n"))}')">Bearbeiten</button><button class="secondary"onclick="deleteCampusEntry('${r.collection}','${r.id}','Lernressource')">Löschen</button></div>`:""}
 </article>`;
 };

 return`${pageHead("LERNWERKSTATT","Lernressourcen-Bibliothek","Finde passende Lernmaterialien, digitale Angebote und externe Lernwege – zentral für Schüler und Lehrkräfte.",addButton)}
 <div class="card"style="border-left:4px solid #3fa66a">
 <span class="badge"> DEINE LERNBIBLIOTHEK</span>
 <h2>Passende Ressource auswählen</h2>
 <p>TaskCards, KI-Lernangebote, Videos, ByCS/mebis, Canva und LearningApps sowie weitere Webseiten an einem Ort.</p>
 <div class="chips"><span class="chip"> TaskCard</span><span class="chip"> KI</span><span class="chip"> Video</span><span class="chip"> ByCS / mebis</span><span class="chip"> Canva</span><span class="chip"> LearningApps</span><span class="chip"> Webseite</span></div>
 </div>
 ${Object.entries(grouped).map(([type,list])=>{
 if(!list.length)return"";
 const t=types[type];
 return`<section class="resource-section"><div class="section-head"><div><div class="kicker">${t.icon} ${t.label.toUpperCase()}</div><h2>${esc(t.label)}</h2></div><span class="pill">${list.length}</span></div><div class="grid grid-3">${list.map(card).join("")}</div></section>`;
 }).join("")}
 ${resources.length?`<div class="notice"style="margin-top:16px"> ${resources.length} Lernressource${resources.length===1?"":"n"} verfügbar.</div>`:`<div class="card empty"style="margin-top:12px"><strong>Noch keine Lernressourcen vorhanden.</strong><p>Lege z. B. eine TaskCard, einen KI-Link, ein Video oder einen ByCS-/mebis-Link an.</p>${canEdit?`<button class="primary"onclick="window.openLernressourceForm()">＋ Erste Lernressource anlegen</button>`:""}</div>`}
 ${footer()}`;
 }catch(error){
 console.error("Lernressourcen konnten nicht geladen werden:",error);
 return moduleError("Lernressourcen","app.js",error);
 }
}

/* =========================================================
 PERSÖNLICHER LERNPFAD – trainiert selbstreguliertes Lernen:
 Schüler:innen entscheiden selbst, was sie gerade brauchen, um
 den nächsten Schritt im Verstehen zu machen. Statt Ziele mit
 Etappen abzuhaken, macht man regelmäßig einen kurzen Check-in
 (Wo stehe ich? Was brauche ich jetzt?) aus einer festen, klar
 benannten Auswahl an Lernstrategien. Optional einem Thema
 zugeordnet (dann als Kette sichtbar) oder ganz spontan.
 Collection"lernpfade"ist PRIVAT (nur die Person selbst +
 Lehrkräfte, exakt wie beim Lernjournal – die Firestore-Regel
 dafür gab es bereits vorher).
 ========================================================= */
const lernpfadStrategies={
 einlesen:{icon:"",label:"Tiefer einlesen"},
 anders_ueben:{icon:"",label:"Anders üben"},
 frage_klaeren:{icon:"",label:"Frage klären"},
 jemanden_fragen:{icon:"",label:"Jemanden fragen"},
 pause:{icon:"⏸",label:"Pause machen"},
 erklaeren:{icon:"",label:"Anderen erklären"},
 zusammenfassen:{icon:"",label:"Zusammenfassen"},
 verknuepfen:{icon:"",label:"Mit Bekanntem verknüpfen"},
 beispiele_suchen:{icon:"",label:"Beispiele suchen"},
 selbst_testen:{icon:"",label:"Mich selbst abfragen"},
 kleine_schritte:{icon:"",label:"In kleine Schritte teilen"},
 visualisieren:{icon:"",label:"Visualisieren / skizzieren"},
 umgebung_wechseln:{icon:"",label:"Umgebung wechseln"},
 sinn_klaeren:{icon:"",label:"Sinn/Ziel klären"},
 bereit:{icon:"✅",label:"Bereit für das Nächste"}
};

function lernpfadStrategyLinkHTML(strategy){
 const map={
 einlesen:["ressourcen","Zu den Lernressourcen"],
 anders_ueben:["karteikarten","Zu den Karteikarten"],
 jemanden_fragen:["kompetenz","Zum Kompetenznetzwerk"],
 frage_klaeren:["forum","Im Campus-Forum fragen"],
 pause:["fokus-timer","⏱ Zum Fokus-Timer"],
 zusammenfassen:["journal","Im Lernjournal festhalten"],
 beispiele_suchen:["ressourcen","Zu den Lernressourcen"],
 selbst_testen:["karteikarten","Zu den Karteikarten"],
 sinn_klaeren:["journal","Im Lernjournal festhalten"]
 };
 const m=map[strategy];
 return m?`<button class="secondary"style="align-self:flex-start;margin-top:6px"onclick="go('${m[0]}')">${m[1]}</button>`:"";
}

function lernpfadEntryHTML(e){
 const strat=lernpfadStrategies[e.strategy]||{icon:"",label:"Check-in"};
 const canManage=e.uid===currentUser.uid||isTeacher();
 return`<div class="list-item"style="flex-direction:column;align-items:stretch;gap:6px">
 <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
 <div><strong>${strat.icon} ${esc(strat.label)}</strong><small style="display:block;margin-top:2px">${fmtDate(e.createdAt)}</small></div>
 ${canManage?`<button class="secondary"onclick="deleteLernpfadEntry('${e.id}')">Löschen</button>`:""}
 </div>
 ${e.standort?`<p style="margin:4px 0 0;font-size:13px">${esc(e.standort)}</p>`:""}
 ${e.strategyDetail?`<div class="notice"style="margin-top:4px"><strong>Konkret:</strong> ${esc(e.strategyDetail)}</div>`:""}
 ${lernpfadStrategyLinkHTML(e.strategy)}
 ${e.outcome?`<div class="notice"style="margin-top:6px;border-left:4px solid #3fa66a"><strong> Wie ist es gelaufen?</strong> ${esc(e.outcome)}</div>`
 :`<button class="secondary"style="align-self:flex-start;margin-top:6px"onclick="openLernpfadOutcomeForm('${e.id}')">Wie ist es gelaufen? (später ergänzen)</button>`}
 </div>`;
}

function computeLernpfadPatterns(entries){
 const total=entries.length;
 const withOutcome=entries.filter(e=>e.outcome).length;
 const strategyCounts={};
 Object.keys(lernpfadStrategies).forEach(k=>strategyCounts[k]=0);
 entries.forEach(e=>{if(strategyCounts[e.strategy]!==undefined)strategyCounts[e.strategy]++});

 const topicGroups=new Map();
 entries.forEach(e=>{
 const topic=String(e.topic||"").trim();
 if(!topic)return;
 if(!topicGroups.has(topic))topicGroups.set(topic,[]);
 topicGroups.get(topic).push(e);
 });
 const strugglingTopics=[];
 topicGroups.forEach((list,topic)=>{
 list.sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 const lastIsBereit=list.length&&list[list.length-1].strategy==="bereit";
 if(list.length>=3&&!lastIsBereit)strugglingTopics.push({topic,count:list.length});
 });

 return {total,withOutcome,strategyCounts,strugglingTopics};
}

function lernpfadPatternsHTML(entries){
 if(entries.length<3)return"";
 const p=computeLernpfadPatterns(entries);
 const reflectPct=p.total?Math.round((p.withOutcome/p.total)*100):0;
 const maxCount=Math.max(1,...Object.values(p.strategyCounts));
 return`<div class="card"style="margin-bottom:14px;border-left:4px solid #4a90d9">
 <div class="kicker">AUSWERTUNG</div>
 <h3 style="margin:6px 0 4px"> Meine Lernmuster</h3>
 <p style="color:var(--muted);font-size:12px;margin:0 0 12px">Basierend auf ${p.total} Check-ins – gute Gesprächspunkte fürs nächste Lerncoaching, wenn du magst.</p>
 <div class="ampel-bars">${Object.entries(lernpfadStrategies).map(([key,s])=>{
 const count=p.strategyCounts[key]||0;
 const barPct=Math.round((count/maxCount)*100);
 return`<div class="ampel-bar-row"><span style="min-width:150px">${s.icon} ${esc(s.label)}</span><div class="ampel-bar-track"><div class="ampel-bar-fill"style="width:${barPct}%;background:var(--blue)"></div></div><b style="min-width:50px;text-align:right">${count}×</b></div>`;
 }).join("")}</div>
 <p style="margin:12px 0 0;font-size:12px"> Reflexionsquote: <b>${reflectPct}%</b> der Check-ins mit „Wie ist es gelaufen?"ergänzt.</p>
 ${p.strugglingTopics.length?`<div class="notice"style="margin-top:10px;background:#fff5dc"><strong> Mögliche Gesprächspunkte:</strong><ul style="margin:6px 0 0;padding-left:18px">${p.strugglingTopics.map(t=>`<li>„${esc(t.topic)}" – ${t.count} Check-ins, noch nicht als „bereit für das Nächste"markiert</li>`).join("")}</ul></div>`:""}
 </div>`;
}

async function renderLernpfadRoute(){
 let entries=[];
 try{
 const snap=await getDocs(query(collection(db,"lernpfade"),where("uid","==",currentUser.uid)));
 entries=snap.docs.map(d=>({id:d.id,...d.data()}));
 entries.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 }catch(e){console.error("Lernpfad laden:",e)}

 const grouped=new Map();
 const spontaneous=[];
 entries.forEach(e=>{
 const topic=String(e.topic||"").trim();
 if(topic){
 if(!grouped.has(topic))grouped.set(topic,[]);
 grouped.get(topic).push(e);
 }else{
 spontaneous.push(e);
 }
 });

 const topicSections=[...grouped.entries()].map(([topic,list])=>{
 list.sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 return`<div class="card"style="margin-bottom:14px"><h3 style="margin-top:0"> ${esc(topic)}</h3><div class="list">${list.map(lernpfadEntryHTML).join("")}</div></div>`;
 }).join("");

 return`${pageHead("SELBSTSTÄNDIG LERNEN","Persönlicher Lernpfad","Finde selbst heraus, was du gerade brauchst, um den nächsten Schritt im Verstehen zu machen.",`<button class="primary"onclick="openLernpfadCheckinForm()">＋ Neuer Lern-Check-in</button>`)}
 <div class="notice"><strong>Dein Lernpfad ist privat.</strong><p style="margin-bottom:0">Nur du selbst und Lehrkräfte können ihn sehen.</p></div>
 <div style="margin-top:14px">${lernpfadPatternsHTML(entries)}</div>
 ${entries.length===0?`<div class="empty"style="margin-top:14px"><strong>Noch kein Check-in.</strong>Starte mit deinem ersten: Woran arbeitest du gerade, und was brauchst du als Nächstes?</div>`:`
 <div style="margin-top:14px">${topicSections}</div>
 ${spontaneous.length?`<div class="card"style="margin-top:14px"><h3 style="margin-top:0"> Spontane Check-ins</h3><div class="list">${spontaneous.map(lernpfadEntryHTML).join("")}</div></div>`:""}
 `}
 ${footer()}`;
}

function openLernpfadCheckinForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können einen Check-in machen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">PERSÖNLICHER LERNPFAD</div>
 <h2>Neuer Lern-Check-in</h2>
 <div class="form">
 <label>Woran arbeitest du gerade? (optional)<input id="lpTopic"maxlength="120"placeholder="z. B. Bindungstheorie nach Bowlby"></label>
 <label>Wo stehst du gerade? Was verstehst du schon, was ist noch unklar?<textarea id="lpStandort"rows="3"maxlength="500"placeholder="Kurze, ehrliche Einschätzung …"></textarea></label>
 <label>Was brauchst du jetzt?</label>
 <div class="grid grid-3"style="gap:8px">${Object.entries(lernpfadStrategies).map(([key,s])=>`<button type="button"class="secondary lp-strategy-btn"data-strategy="${key}"onclick="selectLernpfadStrategy('${key}')"style="text-align:left">${s.icon} ${esc(s.label)}</button>`).join("")}</div>
 <input type="hidden"id="lpStrategy"value="">
 <div id="lpStrategyDetailWrap"hidden><label>Was genau? (z. B. deine konkrete Frage)<textarea id="lpStrategyDetail"rows="2"maxlength="300"></textarea></label></div>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addLernpfadCheckin()">Check-in speichern</button>
 </div>
 </div>`);
}

function selectLernpfadStrategy(key){
 const field=$("lpStrategy");
 if(field)field.value=key;
 document.querySelectorAll(".lp-strategy-btn").forEach(btn=>{
 btn.classList.toggle("primary",btn.dataset.strategy===key);
 btn.classList.toggle("secondary",btn.dataset.strategy!==key);
 });
 const wrap=$("lpStrategyDetailWrap");
 if(wrap)wrap.hidden=(key!=="frage_klaeren");
}

async function addLernpfadCheckin(){
 const topic=$("lpTopic")?.value.trim()||"";
 const standort=$("lpStandort")?.value.trim()||"";
 const strategy=$("lpStrategy")?.value||"";
 const strategyDetail=$("lpStrategyDetail")?.value.trim()||"";
 if(!standort){toast("Bitte kurz beschreiben, wo du gerade stehst.");return}
 if(!strategy){toast("Bitte auswählen, was du jetzt brauchst.");return}
 try{
 await addDoc(collection(db,"lernpfade"),{
 uid:currentUser.uid,
 name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 topic,standort,strategy,strategyDetail,outcome:"",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Check-in gespeichert.");
 }catch(e){
 console.error("Lernpfad-Check-in speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Check-in konnte nicht gespeichert werden.");
 }
}

function openLernpfadOutcomeForm(id){
 window.__outcomeLernpfadId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">PERSÖNLICHER LERNPFAD</div>
 <h2>Wie ist es gelaufen?</h2>
 <div class="form">
 <label>Hat es geholfen? Was hast du gelernt?<textarea id="lpOutcome"rows="3"maxlength="400"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="saveLernpfadOutcome()">Speichern</button>
 </div>
 </div>`);
}

async function saveLernpfadOutcome(){
 const id=window.__outcomeLernpfadId;
 if(!id)return;
 const outcome=$("lpOutcome")?.value.trim()||"";
 if(!outcome){toast("Bitte kurz eintragen, wie es gelaufen ist.");return}
 try{
 await updateDoc(doc(db,"lernpfade",id),{outcome,outcomeAt:serverTimestamp()});
 closeModal();await render();showMotivationsBild();toast("Danke für deine Reflexion.");
 }catch(e){
 console.error("Lernpfad-Ergebnis speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Konnte nicht gespeichert werden.");
 }
}

async function deleteLernpfadEntry(id){
 if(!confirm("Diesen Check-in wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"lernpfade",id));await render();toast("Check-in gelöscht.");}
 catch(e){console.error("Check-in löschen:",e);toast("Check-in konnte nicht gelöscht werden.")}
}

async function renderLernjournalRoute(){
 try{
 return await renderJournal();
 }catch(error){
 console.error("Lernjournal konnte nicht geladen werden:",error);
 return moduleError("Lernjournal","app.js",error);
 }
}

function moduleError(title,file,error){
 return`${pageHead("CAMPUS-MODUL",title,"Das einzelne Modul konnte nicht geladen werden.",`<button class="secondary"onclick="go('start')">← Startseite</button>`)}
 <div class="card">
 <h3>Die Campus-App selbst funktioniert.</h3>
 <p>Nur dieses Modul ist momentan nicht erreichbar.</p>
 <div class="notice"><b>Benötigte Datei:</b> ${esc(file)}<br><small>${esc(error?.message||"Unbekannter Fehler")}</small></div>
 </div>${footer()}`;
}

$("loginTab").addEventListener("click",showLoginForm);
$("registerTab").addEventListener("click",showRegisterForm);


$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();$("authError").textContent="";
 if(!configReady){$("authError").textContent="Firebase ist noch nicht konfiguriert.";return}
 try{
 await loadFirebase();
 await signInWithEmailAndPassword(auth,$("loginEmail").value.trim(),$("loginPassword").value);
 }catch(err){console.error(err);authError(err)}
});
$("registerForm").addEventListener("submit",async e=>{
 e.preventDefault();$("authError").textContent="";
 const pw=$("registerPassword").value;
 if(pw!==$("registerPassword2").value){$("authError").textContent="Die Passwörter stimmen nicht überein.";return}
 if(pw.length<8||!/[A-Za-zÄÖÜäöüß]/.test(pw)||!/[0-9]/.test(pw)){$("authError").textContent="Das Passwort muss mindestens 8 Zeichen lang sein und Buchstaben UND Zahlen enthalten.";return}
 if(!configReady){$("authError").textContent="Firebase ist noch nicht konfiguriert.";return}
 const {firstName,lastName}=getRegisterNameFields();
 if(!firstName||!lastName){$("authError").textContent="Bitte Vorname und Nachname angeben.";return}
 try{
 await loadFirebase();
 const cred=await createUserWithEmailAndPassword(auth,$("registerEmail").value.trim(),pw);
 const fullName=`${firstName} ${lastName}`.trim();
 await updateProfile(cred.user,{displayName:fullName});
 await ensureProfile(cred.user,fullName,{firstName,lastName});
 }catch(err){console.error(err);authError(err)}
});
$("forgotBtn").onclick=async()=>{
 const email=$("loginEmail").value.trim();
 if(!email){$("authError").textContent="Bitte zuerst deine E-Mail-Adresse eingeben.";return}
 try{await loadFirebase();await sendPasswordResetEmail(auth,email);toast("E-Mail zum Zurücksetzen wurde versendet.")}catch(err)
{console.error(err);authError(err)}
};
$("logoutBtn").onclick=async()=>{
 try{await loadFirebase();await signOut(auth)}catch(e){console.error(e)}
};
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
$("helpQuick").onclick=openHelpForm;
$("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});

async function getCollection(name,sortField="createdAt",desc=true){
 if(!db) return [];
 const load=async()=>{
 try{
 const q=query(collection(db,name),orderBy(sortField,desc?"desc":"asc"),limit(300));
 const snap=await getDocs(q);
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){
 console.warn("Sortierte Abfrage fehlgeschlagen, Fallback ohne orderBy:",name,e);
 try{
 const snap=await getDocs(collection(db,name));
 const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
 rows.sort((a,b)=>{
 const av=a?.[sortField]?.seconds ?? a?.[sortField] ??"";
 const bv=b?.[sortField]?.seconds ?? b?.[sortField] ??"";
 return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
 });
 return rows.slice(0,100);
 }catch(fallbackError){
 console.error("Firestore-Abfrage fehlgeschlagen:",name,fallbackError);
 return [];
 }
 }
 };
 return await Promise.race([
 load(),
 new Promise(resolve=>setTimeout(()=>{console.warn("Firestore-Abfrage Timeout:",name);resolve([])},7000))
 ]);
}

function fmtDate(v){if(!v)return"—";if(v.seconds)return new Date(v.seconds*1000).toLocaleDateString("de-DE");return String(v)}
function fmtDateOnly(v){
 if(!v)return"—";
 if(typeof v==="object"&&v.seconds)return new Date(v.seconds*1000).toLocaleDateString("de-DE");
 const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
 return m?`${m[3]}.${m[2]}.${m[1]}`:String(v);
}
function cleanDateInput(v){return v||"—"}

async function getUpcomingCampusCalendarEvent(){
 let events=[];
 try{events=await getCollection("events","start",false)}catch(e){console.error("Startseite Kalender events:",e)}
 if(!events.length){
 try{events=await getCollection("calendar","date",false)}catch(e){console.error("Startseite Kalender calendar:",e)}
 }
 const today=new Date(); today.setHours(0,0,0,0);
 const eventDate=e=>{
 const raw=e?.start||e?.date||e?.startDate;
 if(!raw)return null;
 if(typeof raw==="object"&&raw.seconds)return new Date(raw.seconds*1000);
 const d=new Date(String(raw).slice(0,10)+"T00:00:00");
 return isNaN(d)?null:d;
 };
 return events.map(e=>({e,d:eventDate(e)})).filter(x=>x.d&&x.d>=today).sort((a,b)=>a.d-b.d)[0]?.e||null;
}


async function openUserManagement(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Benutzer verwalten.");return}
 try{
 const snap=await getDocs(collection(db,"users"));
 let users=snap.docs.map(d=>({uid:d.id,...d.data()}))
 .sort((a,b)=>String(a.displayName||a.email||"").localeCompare(String(b.displayName||b.email||""),"de"));
 if(!isAdmin()) users=users.filter(u=>u.role==="student");
 const rows=users.map(u=>{
 const status=u.status||"pending";
 const name=esc(u.displayName||u.email||u.uid);
 const roleLabel=u.role==="admin"?"Admin":u.role==="teacher"?"Lehrkraft":"Schüler/in";
 const canManageStatus=(u.role!=="admin") && (u.role==="student" || isAdmin());
 const actions=(u.role==="student" || isAdmin()) ?`
 <div style="display:flex;gap:6px;flex-wrap:wrap">
 ${canManageStatus && status!=="approved"?`<button class="secondary"onclick="setUserStatus('${u.uid}','approved')"> Freischalten</button>`:""}
 ${canManageStatus && status!=="blocked"?`<button class="secondary"onclick="setUserStatus('${u.uid}','blocked')">Sperren</button>`:""}
 ${canManageStatus && status==="blocked"?`<button class="secondary"onclick="setUserStatus('${u.uid}','pending')">Reaktivieren</button>`:""}
 ${isAdmin()&&u.uid!==currentUser.uid?`
 <select onchange="setUserRole('${u.uid}',this.value)">
 <option value="student" ${u.role==="student"?"selected":""}>Schüler/in</option>
 <option value="teacher" ${u.role==="teacher"?"selected":""}>Lehrkraft</option>
 <option value="admin" ${u.role==="admin"?"selected":""}>Admin</option>
 </select>`:""}
 </div>`:"";
 return`<div class="list-item"style="align-items:flex-start;gap:12px">
 <div style="min-width:0;flex:1"><strong>${name}</strong>
 <small>${esc(u.email||"")} · ${roleLabel} · <span class="pill">${esc(status)}</span></small></div>
 ${actions}
 </div>`;
 }).join("");
 modal(`
 <button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">BENUTZERVERWALTUNG</div>
 <h2>${isAdmin()?"Benutzer & Rollen":"Schüler freischalten"}</h2>
 <p>${isAdmin()
 ?"Verwalte Freigaben und Rollen. Dein eigenes Admin-Konto kann hier nicht auf eine andere Rolle gesetzt werden."
 :"Hier kannst du Schülerkonten freischalten, sperren oder reaktivieren."}</p>
 <div class="list">${rows||`<div class="empty">Keine passenden Benutzer vorhanden.</div>`}</div>
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Schließen</button></div>
 `);
 }catch(e){
 console.error("Benutzerverwaltung:",e);
 toast(e?.code==="permission-denied"?"Keine Berechtigung zur Benutzerverwaltung.":"Benutzer konnten nicht geladen werden.");
 }
}

async function setUserStatus(uid,status){
 if(!isTeacher())return;
 if(!["pending","approved","blocked"].includes(status))return;
 try{
 const ref=doc(db,"users",uid);
 const snap=await getDoc(ref);
 if(!snap.exists()){toast("Benutzer nicht gefunden.");return}
 const target=snap.data();
 if(target.role==="admin"){toast("Admin-Konten können nicht gesperrt oder reaktiviert werden.");return}
 if(!isAdmin() && target.role!=="student"){toast("Lehrkräfte dürfen nur Schülerkonten verwalten.");return}
 const payload={status,updatedAt:serverTimestamp()};
 if(status==="approved"||status==="blocked"){
 payload.approvedBy=currentUser.uid;
 payload.approvedAt=serverTimestamp();
 }
 await updateDoc(ref,payload);
 toast(status==="approved"?"Zugang freigeschaltet.":status==="blocked"?"Zugang gesperrt.":"Zugang reaktiviert.");
 await openUserManagement();
 }catch(e){
 console.error("Benutzerstatus:",e);
 toast(e?.code==="permission-denied"?"Änderung nicht erlaubt.":"Status konnte nicht geändert werden.");
 }
}

async function setUserRole(uid,role){
 if(!isAdmin()||uid===currentUser.uid)return;
 if(!["student","teacher","admin"].includes(role))return;
 try{
 await updateDoc(doc(db,"users",uid),{role,updatedAt:serverTimestamp()});
 toast("Rolle geändert.");
 await openUserManagement();
 }catch(e){
 console.error("Benutzerrolle:",e);
 toast(e?.code==="permission-denied"?"Rollenänderung nicht erlaubt.":"Rolle konnte nicht geändert werden.");
 }
}

// Landkreis Weilheim-Schongau plus die drei angrenzenden Landkreise
// Garmisch-Partenkirchen, Starnberg und Landsberg am Lech. Die Positionen
// sind aus echten Breiten-/Längengraden berechnet (äquidistante Projektion
// mit Kosinus-Korrektur, auf den Kartenausschnitt skaliert) – die Orte
// liegen also tatsächlich ungefähr dort zueinander, wo sie auch in
// Wirklichkeit liegen. "lk" markiert den Landkreis für die farbliche
// Hintergrundfläche.
const LANDKREIS_ORTE=[
 // Weilheim-Schongau
 ["Weilheim i.OB.",648,455,"ws"],["Penzberg",981,566,"ws"],["Schongau",313,488,"ws"],
 ["Peißenberg",532,499,"ws"],["Peiting",374,503,"ws"],["Bernried a. Starnberger See",865,365,"ws"],
 ["Hohenpeißenberg",472,505,"ws"],["Pähl",687,377,"ws"],["Polling",679,473,"ws"],
 ["Raisting",590,373,"ws"],["Wessobrunn",488,417,"ws"],["Wielenbach",701,431,"ws"],
 ["Altenstadt",244,577,"ws"],["Hohenfurch",294,536,"ws"],["Ingenried",175,586,"ws"],
 ["Schwabbruck",151,559,"ws"],["Schwabsoien",205,542,"ws"],["Bernbeuren",157,630,"ws"],
 ["Burggen",70,595,"ws"],["Habach",869,607,"ws"],["Antdorf",840,628,"ws"],
 ["Obersöchering",767,574,"ws"],["Sindelsdorf",915,621,"ws"],["Huglfing",731,525,"ws"],
 ["Eberfing",777,517,"ws"],["Eglfing",768,499,"ws"],["Oberhausen",589,493,"ws"],
 ["Rottenbuch",394,608,"ws"],["Böbing",415,565,"ws"],["Seeshaupt",882,485,"ws"],
 ["Iffeldorf",920,565,"ws"],["Steingaden",256,661,"ws"],["Prem",214,694,"ws"],["Wildsteig",346,665,"ws"],
 // Landkreis Landsberg am Lech
 ["Landsberg am Lech",288,195,"ll"],["Kaufering",285,151,"ll"],["Dießen a. Ammersee",589,304,"ll"],
 ["Utting a. Ammersee",581,271,"ll"],["Schondorf a. Ammersee",629,230,"ll"],["Eching a. Ammersee",614,190,"ll"],
 ["Greifenberg",574,207,"ll"],["Windach",514,178,"ll"],["Türkenfeld",556,151,"ll"],
 ["Geltendorf",505,111,"ll"],["Egling a.d. Paar",310,75,"ll"],["Denklingen",258,269,"ll"],
 ["Apfeldorf",266,348,"ll"],["Kinsau",281,398,"ll"],["Hurlach",198,112,"ll"],
 ["Igling",214,160,"ll"],["Obermeitingen",187,70,"ll"],["Prittriching",379,72,"ll"],
 ["Finning",414,233,"ll"],["Fuchstal",298,316,"ll"],["Vilgertshofen",365,297,"ll"],
 ["Reichling",346,355,"ll"],["Rott",397,343,"ll"],["Scheuring",256,71,"ll"],
 ["Schwifting",330,242,"ll"],["Thaining",151,370,"ll"],["Weil",367,139,"ll"],
 ["Pflugdorf",212,257,"ll"],["Penzing",414,146,"ll"],["Hofstetten",259,417,"ll"],
 // Landkreis Starnberg
 ["Starnberg",923,256,"sta"],["Gauting",975,171,"sta"],["Krailling",1010,130,"sta"],
 ["Gilching",850,121,"sta"],["Weßling",808,167,"sta"],["Wörthsee",756,195,"sta"],
 ["Herrsching a. Ammersee",688,256,"sta"],["Inning a. Ammersee",727,208,"sta"],["Seefeld",746,178,"sta"],
 ["Pöcking",891,297,"sta"],["Feldafing",882,338,"sta"],["Tutzing",840,372,"sta"],
 ["Berg",953,283,"sta"],["Andechs",705,284,"sta"],
 // Landkreis Garmisch-Partenkirchen
 ["Garmisch-Partenkirchen",583,888,"gap"],["Farchant",600,850,"gap"],["Grainau",532,925,"gap"],
 ["Oberau",629,803,"gap"],["Eschenlohe",708,772,"gap"],["Oberammergau",549,756,"gap"],
 ["Ettal",588,784,"gap"],["Bad Kohlgrub",503,687,"gap"],["Bad Bayersoien",408,673,"gap"],
 ["Saulgrub",532,694,"gap"],["Mittenwald",810,950,"gap"],["Krün",810,903,"gap"],
 ["Wallgau",833,876,"gap"],["Murnau a. Staffelsee",730,647,"gap"],["Riegsee",785,653,"gap"],
 ["Seehausen a. Staffelsee",744,663,"gap"],["Spatzenhausen",720,628,"gap"],["Uffing a. Staffelsee",679,667,"gap"],
 ["Großweil",843,709,"gap"],["Ohlstadt",786,732,"gap"],["Schwaigen",659,749,"gap"]
];
let liveUnsubHeimat=null;
let liveUnsubMiniKalender=null;
function subscribeMiniKalenderLive(){
 // Der Mini-Kalender auf der Startseite ist derselbe Campus-Kalender –
 // ändert eine Lehrkraft dort etwas (events/calendar-Sammlung), wird die
 // Startseite live nachgezogen, ohne dass neu navigiert werden muss.
 const refresh=()=>{miniKalenderHTML().then(html=>{const el=$("miniKalenderWrap");if(el)el.innerHTML=html});};
 const unsub1=onSnapshot(collection(db,"events"),refresh,e=>console.error("Mini-Kalender-Live-Update:",e));
 const unsub2=onSnapshot(collection(db,"calendar"),refresh,e=>console.error("Mini-Kalender-Live-Update:",e));
 liveUnsubMiniKalender=()=>{unsub1();unsub2()};
}
async function getHeimatEintraege(){
 if(!db)return [];
 try{
 const snap=await getDocs(collection(db,"heimatorte"));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Heimatorte laden:",e);return []}
}
function heimatkarteSVG(entries){
 const byOrt={};
 entries.forEach(e=>{if(!byOrt[e.ort])byOrt[e.ort]=[];byOrt[e.ort].push(e.name||"Campus-Mitglied")});
 const dots=LANDKREIS_ORTE.map(([name,x,y])=>{
 const here=byOrt[name]||[];
 const r=here.length?9+Math.min(here.length,6)*2:4;
 const fill=here.length?"#e8890c":"#c7d6df";
 const title=here.length?`${name}: ${here.join(", ")}`:name;
 return`<g><circle cx="${x}"cy="${y}"r="${r}"fill="${fill}"stroke="#fff"stroke-width="2"opacity="${here.length?1:.55}"><title>${esc(title)}</title></circle>
 ${here.length?`<text x="${x}"y="${y+4}"text-anchor="middle"font-size="11"font-weight="800"fill="#fff">${here.length}</text>`:""}
 ${here.length?`<text x="${x}"y="${y-r-6}"text-anchor="middle"font-size="12"font-weight="700"fill="var(--ink)">${esc(name)}</text>`:""}
 </g>`;
 }).join("");
 return`<svg viewBox="0 0 1080 1020"style="width:100%;height:auto;max-height:560px">
 <path d="M40,530 Q30,400 200,370 Q400,340 650,360 Q850,350 1010,430 Q1030,530 990,610 Q900,700 700,720 Q450,740 220,700 Q30,660 40,530 Z"fill="var(--soft-green)"stroke="var(--green)"stroke-width="2"opacity=".55"/>
 <path d="M100,180 Q90,60 300,40 Q480,20 620,90 Q680,180 650,280 Q660,380 480,430 Q300,460 160,380 Q80,300 100,180 Z"fill="var(--soft-blue)"stroke="var(--blue)"stroke-width="2"opacity=".4"/>
 <path d="M660,220 Q650,110 800,90 Q970,70 1040,170 Q1060,260 1000,340 Q930,410 800,400 Q680,380 660,220 Z"fill="var(--soft-purple)"stroke="#8a6fc9"stroke-width="2"opacity=".4"/>
 <path d="M370,750 Q360,650 500,620 Q680,590 850,640 Q900,680 890,800 Q880,940 720,970 Q550,1000 430,940 Q350,880 370,750 Z"fill="var(--soft-orange)"stroke="#e8890c"stroke-width="2"opacity=".4"/>
 <text x="500"y="405"text-anchor="middle"font-size="13"font-weight="800"fill="var(--green)"opacity=".8">WEILHEIM-SCHONGAU</text>
 <text x="300"y="75"text-anchor="middle"font-size="13"font-weight="800"fill="var(--blue)"opacity=".8">LANDSBERG A. LECH</text>
 <text x="850"y="135"text-anchor="middle"font-size="13"font-weight="800"fill="#8a6fc9"opacity=".8">STARNBERG</text>
 <text x="620"y="655"text-anchor="middle"font-size="13"font-weight="800"fill="#e8890c"opacity=".8">GARMISCH-PARTENKIRCHEN</text>
 ${dots}
 </svg>`;
}
async function saveHeimatort(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können sich eintragen.");return}
 const ort=$("heimatOrtSelect")?.value;
 if(!ort){toast("Bitte einen Ort auswählen.");return}
 try{
 await setDoc(doc(db,"heimatorte",currentUser.uid),{
 uid:currentUser.uid,name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 ort,createdAt:serverTimestamp()
 });
 toast("Eingetragen! Danke fürs Mitmachen.");
 await render();
 }catch(e){console.error("Heimatort speichern:",e);toast("Konnte nicht gespeichert werden.")}
}
async function removeHeimatort(){
 try{await deleteDoc(doc(db,"heimatorte",currentUser.uid));await render();toast("Eintrag entfernt.")}
 catch(e){console.error("Heimatort löschen:",e);toast("Konnte nicht entfernt werden.")}
}
async function removeHeimatortAsTeacher(uid,name){
 if(!isTeacher()){toast("Dieser Bereich ist nur für Lehrkräfte.");return}
 if(!confirm(`Eintrag von ${name||"dieser Person"} wirklich entfernen?`))return;
 try{await deleteDoc(doc(db,"heimatorte",uid));await render();toast("Eintrag entfernt.")}
 catch(e){console.error("Heimatort löschen (Lehrkraft):",e);toast("Konnte nicht entfernt werden.")}
}
async function resetAlleHeimatorte(){
 if(!isTeacher()){toast("Dieser Bereich ist nur für Lehrkräfte.");return}
 if(!confirm("Wirklich ALLE Heimatorte-Einträge der Klasse zurücksetzen? Das kann nicht rückgängig gemacht werden."))return;
 try{
 const entries=await getHeimatEintraege();
 await Promise.all(entries.map(e=>deleteDoc(doc(db,"heimatorte",e.uid))));
 await render();
 toast("Alle Einträge zurückgesetzt.");
 }catch(e){console.error("Heimatorte zurücksetzen:",e);toast("Konnte nicht zurückgesetzt werden.")}
}
window.removeHeimatortAsTeacher=removeHeimatortAsTeacher;
window.resetAlleHeimatorte=resetAlleHeimatorte;
function subscribeHeimatkarteLive(){
 liveUnsubHeimat=onSnapshot(collection(db,"heimatorte"),snap=>{
 const entries=snap.docs.map(d=>({id:d.id,...d.data()}));
 const el=$("heimatkarteWrap");
 if(el)el.innerHTML=heimatkarteSVG(entries);
 },e=>console.error("Heimatkarte-Live-Update:",e));
}
window.saveHeimatort=saveHeimatort;window.removeHeimatort=removeHeimatort;

// Alle eingetragenen Geburtstage sortiert nach dem nächsten anstehenden Datum.
// Feste, individuelle Farbe pro Person – aus der UID abgeleitet (immer
// gleich für dieselbe Person), im Blau-Grün-Violett-Bereich passend zum
// Schullogo (statt warmer Töne, die dazu nicht passen würden).
function personColorHue(uid){
 let hash=0;
 const str=String(uid||"");
 for(let i=0;i<str.length;i++){hash=(hash*31+str.charCodeAt(i))>>>0}
 return 80+(hash%180);
}
function personColor(uid){
 const hue=personColorHue(uid);
 return {bg:`hsl(${hue},55%,93%)`,text:`hsl(${hue},60%,30%)`,border:`hsl(${hue},45%,55%)`};
}
async function getAllBirthdaysSorted(){
 try{
 const snap=await getDocs(collection(db,"users"));
 const users=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.status==="approved"&&u.birthday);
 const today=new Date();today.setHours(0,0,0,0);
 return users.map(u=>{
 const [mmStr,ddStr]=String(u.birthday).split("-");
 const mm=parseInt(mmStr,10),dd=parseInt(ddStr,10);
 let next=new Date(today.getFullYear(),mm-1,dd);
 if(next<today)next=new Date(today.getFullYear()+1,mm-1,dd);
 const days=Math.round((next-today)/86400000);
 return {name:u.displayName||u.email||"Campus-Mitglied",uid:u.uid,date:next,days,isToday:days===0};
 }).sort((a,b)=>a.days-b.days);
 }catch(e){console.error("Geburtstage laden:",e);return []}
}
async function getSteckbriefe(){
 if(!db)return [];
 try{
 const snap=await getDocs(collection(db,"steckbriefe"));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Steckbriefe laden:",e);return []}
}
function openSteckbriefForm(existing){
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">STECKBRIEF</div>
 <h2>${existing?"Meinen Steckbrief bearbeiten":"Meinen Steckbrief anlegen"}</h2>
 <div class="form">
 <label>Das mag ich (Hobbys, Interessen)<textarea id="sbMag"rows="2"maxlength="200">${esc(existing?.mag||"")}</textarea></label>
 <label>Darin bin ich gut / dabei kann ich helfen<textarea id="sbGutDarin"rows="2"maxlength="200">${esc(existing?.gutDarin||"")}</textarea></label>
 <label>Ein Fakt über mich (optional)<textarea id="sbFakt"rows="2"maxlength="200">${esc(existing?.fakt||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 ${existing?`<button class="secondary"onclick="deleteSteckbrief()">Löschen</button>`:""}
 <button class="primary"onclick="saveSteckbrief()">Speichern</button>
 </div>
 </div>`);
}
async function saveSteckbrief(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können einen Steckbrief anlegen.");return}
 const mag=$("sbMag")?.value.trim()||"";
 const gutDarin=$("sbGutDarin")?.value.trim()||"";
 const fakt=$("sbFakt")?.value.trim()||"";
 if(!mag&&!gutDarin&&!fakt){toast("Bitte mindestens ein Feld ausfüllen.");return}
 try{
 await setDoc(doc(db,"steckbriefe",currentUser.uid),{
 uid:currentUser.uid,name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 mag,gutDarin,fakt,updatedAt:serverTimestamp()
 });
 closeModal();await render();showMotivationsBild();toast("Steckbrief gespeichert.");
 }catch(e){console.error("Steckbrief speichern:",e);toast("Konnte nicht gespeichert werden.")}
}
async function deleteSteckbrief(){
 try{await deleteDoc(doc(db,"steckbriefe",currentUser.uid));closeModal();await render();toast("Steckbrief gelöscht.")}
 catch(e){console.error("Steckbrief löschen:",e);toast("Konnte nicht gelöscht werden.")}
}
window.openSteckbriefForm=openSteckbriefForm;window.saveSteckbrief=saveSteckbrief;window.deleteSteckbrief=deleteSteckbrief;
window.mySteckbriefData=null;

async function renderKlassenteam(){
 const [heimatEntries,steckbriefe,birthdays]=await Promise.all([getHeimatEintraege(),getSteckbriefe(),getAllBirthdaysSorted()]);
 const myHeimatort=heimatEntries.find(e=>e.uid===currentUser.uid);
 window.mySteckbriefData=steckbriefe.find(s=>s.uid===currentUser.uid)||null;
 return`${pageHead("GEMEINSCHAFT","Unser Klassenteam","Einander kennenlernen und übers Jahr zusammenfinden.")}
 <div class="card">
 <div class="kicker">KENNENLERNEN</div>
 <h2 style="margin-top:4px">Wo unser Klassenteam zu Hause ist</h2>
 <p style="color:var(--muted)">Trag deinen Heimatort ein – so seht ihr auf einen Blick, wer aus eurer Gegend kommt. Vielleicht ergeben sich daraus ja Fahrgemeinschaften oder gemeinsame Projekte übers Jahr.</p>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
 <select id="heimatOrtSelect"style="flex:1;min-width:200px">
 <option value="">Ort auswählen …</option>
 ${[...LANDKREIS_ORTE].sort((a,b)=>a[0].localeCompare(b[0],"de")).map(([name])=>`<option value="${esc(name)}"${myHeimatort?.ort===name?"selected":""}>${esc(name)}</option>`).join("")}
 </select>
 <button class="primary"onclick="saveHeimatort()">${myHeimatort?"Aktualisieren":"Eintragen"}</button>
 ${myHeimatort?`<button class="secondary"onclick="removeHeimatort()">Entfernen</button>`:""}
 </div>
 <div id="heimatkarteWrap">${heimatkarteSVG(heimatEntries)}</div>
 ${isTeacher()?`<details style="margin-top:14px">
 <summary style="cursor:pointer;color:var(--muted);font-size:13px">Für Lehrkräfte: Einträge verwalten (${heimatEntries.length})</summary>
 <div class="list"style="margin-top:10px">${heimatEntries.map(e=>`<div class="list-item"><div><strong>${esc(e.name||"Campus-Mitglied")}</strong><small>${esc(e.ort||"")}</small></div><button class="secondary"onclick="removeHeimatortAsTeacher('${e.uid}','${esc(e.name||"")}')">Entfernen</button></div>`).join("")||`<div class="empty">Noch keine Einträge.</div>`}</div>
 ${heimatEntries.length?`<div class="form-actions"style="margin-top:10px"><button class="secondary"onclick="resetAlleHeimatorte()">Alle Einträge zurücksetzen</button></div>`:""}
 </details>`:""}
 </div>

 <div class="card"style="margin-top:16px">
 <div class="kicker">STECKBRIEFE</div>
 <h2 style="margin-top:4px">Wer wir sind</h2>
 <p style="color:var(--muted)">Ein paar Sätze übereinander – hilft beim Kennenlernen und Zusammenarbeiten.</p>
 <div class="form-actions"style="margin-bottom:14px"><button class="primary"onclick="openSteckbriefForm(mySteckbriefData)">${mySteckbriefData?"Meinen Steckbrief bearbeiten":"＋ Meinen Steckbrief anlegen"}</button></div>
 <div class="grid grid-3">${steckbriefe.map(s=>`<div class="card"style="background:#f7fafc">
 <strong>${esc(s.name)}</strong>
 ${s.mag?`<p style="margin:8px 0 0;font-size:13px"><b>Mag:</b> ${esc(s.mag)}</p>`:""}
 ${s.gutDarin?`<p style="margin:6px 0 0;font-size:13px"><b>Gut darin:</b> ${esc(s.gutDarin)}</p>`:""}
 ${s.fakt?`<p style="margin:6px 0 0;font-size:13px"><b>Fakt:</b> ${esc(s.fakt)}</p>`:""}
 </div>`).join("")||`<div class="empty">Noch keine Steckbriefe – leg den ersten an!</div>`}</div>
 </div>

 <div class="card"style="margin-top:16px">
 <div class="kicker">TERMINE</div>
 <h2 style="margin-top:4px">Geburtstage im Klassenteam</h2>
 <div class="list">${birthdays.map(b=>{const c=personColor(b.uid);return`<div class="list-item"style="background:${c.bg};border-left:4px solid ${c.border};border-radius:8px;padding:10px 12px;margin-bottom:6px"><div><strong style="color:${c.text}">${esc(b.name)}</strong><small>${esc(b.date.toLocaleDateString("de-DE",{day:"2-digit",month:"long"}))}</small></div><div style="display:flex;align-items:center;gap:8px">${b.isToday?`<span class="pill green"> Heute!</span>`:`<span class="pill"style="background:${c.border};color:#fff">in ${b.days} Tagen</span>`}${isTeacher()?`<button type="button"class="secondary"style="padding:4px 8px"onclick="adminRemoveBirthday('${b.uid}')"title="Geburtstag entfernen">✕</button>`:""}</div></div>`}).join("")||`<div class="empty">Noch keine Geburtstage eingetragen.</div>`}</div>
 </div>
 ${footer()}`;
}

// ============================================================
// STUNDENPLAN (WebUntis), NOTEN & WOCHENPLANUNG – F12Sb
// ============================================================

// Fächer der FOS 12 Sozialwesen. "Sozialwirtschaft und Recht" läuft als
// zweijähriges Profilfach weiter. Die beiden frei gewählten Fächer der
// Schule erscheinen als "Wahlpflichtfach 1/2" (echte Fachbezeichnung je
// nach Wahl der Schüler:innen unterschiedlich).
const F12SB_FAECHER=[
 {key:"deutsch",label:"Deutsch"},
 {key:"englisch",label:"Englisch"},
 {key:"geschichte",label:"Geschichte/Sozialkunde"},
 {key:"mathematik",label:"Mathematik"},
 {key:"paedagogik",label:"Pädagogik/Psychologie"},
 {key:"sozialwirtschaft",label:"Sozialwirtschaft und Recht"},
 {key:"wahlpflicht1",label:"Wahlpflichtfach 1"},
 {key:"wahlpflicht2",label:"Wahlpflichtfach 2"}
];

// ============================================================
// LERNWERKSTATT · FÄCHER-ZEITSTRAHL
// ============================================================

// Lehrplan-Zeitstrahl je Fach. "typ": "projekt" | "einzel". Aktuell mit
// echten Inhalten für Pädagogik/Psychologie befüllt (Jahresverlaufsplanung
// FOS 12 Sozialwesen, B-Block 2026/27); die übrigen Fächer sind als leere,
// erweiterbare Struktur angelegt.
const LEHRPLAN_WOCHEN={
 paedagogik:[
 {id:"pp12_01",start:"2026-09-15",end:"2026-09-17",lb:"LB 1",thema:"Formalia und der Begriff Entwicklung",typ:"einzel",
 planung:"Formalia/Der Begriff Entwicklung; Begriff Entwicklung; Bedingungen der Entwicklung."},
 {id:"pp12_02",start:"2026-09-22",end:"2026-09-24",lb:"LB 1",thema:"Psychoanalyse: Grundannahmen und Persönlichkeitsmodell",typ:"einzel",
 planung:"Bedingungen der Entwicklung; Einstieg Psychoanalyse/Grundannahmen, Instanzen und Dynamiken; Das psychoanalytische Persönlichkeitsmodell."},
 {id:"pp12_03",start:"2026-09-29",end:"2026-10-01",lb:"LB 1",thema:"Ich-Stärke, Angst und Abwehr",typ:"einzel",
 planung:"Ich-Stärke und Ich-Schwäche; Angst und Abwehr (Lernsituation „Carlas Diebstähle“); Angst und Abwehr."},
 {id:"pp12_04",start:"2026-10-06",end:"2026-10-08",lb:"LB 1",thema:"Abwehrmechanismen und psychosexuelle Entwicklung",typ:"einzel",
 planung:"Die Abwehrmechanismen; Psychosexuelle Entwicklung (orale und anale Phase); Phallische Phase, Latenzperiode, genitale Phase (Puzzle)."},
 {id:"pp12_05",start:"2026-10-13",end:"2026-10-15",lb:"LB 1",thema:"Fehlentwicklungen und Lebensspanne",typ:"einzel",
 planung:"Entstehung von seelischen Fehlentwicklungen/kritische Würdigung der psychoanalytischen Theorie; Entwicklung im Lebenslauf – die Theorie der Lebensspanne; 1. Kurzarbeit: Entwicklung/Psychoanalytische Theorie.",
 leistungsnachweis:true},
 {id:"pp12_06",start:"2026-10-20",end:"2026-10-22",lb:"LB 1",thema:"Bindung und Erklärvideo (Produktphase)",typ:"einzel",
 planung:"Bindung und Entwicklung; Erstellen eines Erklärvideos; Präsentation und Besprechung der Videos I.",
 produktphase:true},
 {id:"pp12_07",start:"2026-10-27",end:"2026-10-29",lb:"LB 1",thema:"Videos II und sichere/unsichere Bindung",typ:"einzel",
 planung:"Präsentation und Besprechung der Videos II; Sichere und unsichere Bindung; Sichere und unsichere Bindung.",
 produktphase:true},
 {id:"pp12_08",start:"2026-11-10",end:"2026-11-12",lb:"LB 1",thema:"Bindungsförderung, Jugendalter, Resilienz",typ:"einzel",
 planung:"Förderung gelungener Bindung; Entwicklung im Jugendalter; Vulnerabilität und Resilienz."},
 {id:"pp12_09",start:"2026-11-17",end:"2026-11-19",lb:"LB 1",thema:"Puffer LB1 – Übergang zu LB 2: Persönlichkeit",typ:"einzel",
 planung:"Puffer/Prüfungsvorbereitung zu LB 1; Start LB 2: Begriff Persönlichkeit."},
 {id:"pp12_10",start:"2026-11-24",end:"2026-11-26",lb:"LB 2",thema:"Persönlichkeitserhebung und Big-Five-Modell",typ:"einzel",
 planung:"Erhebung der Persönlichkeit; Big-Five-Modell; Big-Five-Modell."},
 {id:"pp12_11",start:"2026-12-01",end:"2026-12-03",lb:"LB 2",thema:"Personenzentrierte Theorie und Aktualisierungstendenz",typ:"einzel",
 planung:"Menschenbild der personenzentrierten Theorie; Menschenbild der personenzentrierten Theorie; Aktualisierungstendenz."},
 {id:"pp12_12",start:"2026-12-08",end:"2026-12-10",lb:"LB 2",thema:"Selbstkonzept und Schulaufgabe",typ:"einzel",
 planung:"Bildung und Wirkung des Selbstkonzepts; 1. Schulaufgabe: Psychosexuelle Entwicklung/Persönlichkeit; Flexibilität des Selbstkonzepts/Abwehr.",
 leistungsnachweis:true},
 {id:"pp12_13",start:"2026-12-15",end:"2026-12-17",lb:"LB 2",thema:"Bewertungsprozess, Kongruenz, psychische Störungen",typ:"einzel",
 planung:"Organismischer Bewertungsprozess; Kongruenz und Inkongruenz; Entstehung psychischer Störungen."},
 {id:"pp12_14",start:"2026-12-22",end:"2026-12-23",lb:"LB 2",thema:"Bedeutung für Erziehung und sozial-kognitive Theorie",typ:"einzel",
 planung:"Bedeutung für die Erziehung; Die sozial-kognitive Theorie und Persönlichkeit."},
 {id:"pp12_15",start:"2027-01-12",end:"2027-01-14",lb:"LB 2",thema:"Identität und Identitätstypen nach Marcia",typ:"einzel",
 planung:"Identität oder Selbstverständnis eines Menschen; Identitätstypen nach Marcia; Puffer/Prüfungsvorbereitung."},
 {id:"pp12_16",start:"2027-01-19",end:"2027-01-21",lb:"LB 3",thema:"Puffer LB2 – Start LB 3: Soziale Arbeit",typ:"einzel",
 planung:"Puffer LB 2; Start LB 3: Grundlagen Sozialer Arbeit; Aufgabenbereiche der Sozialen Arbeit."},
 {id:"pp12_17",start:"2027-01-26",end:"2027-01-28",lb:"LB 3",thema:"Aufgabenbereiche und Handlungskonzepte",typ:"einzel",
 planung:"Aufgabenbereiche der Sozialen Arbeit; Aufgabenbereiche der Sozialen Arbeit; Handlungskonzepte."},
 {id:"pp12_18",start:"2027-02-02",end:"2027-02-04",lb:"LB 3",thema:"Verhaltensorientiertes Konzept und Anpassung",typ:"einzel",
 planung:"Verhaltensorientiertes Konzept; Verhaltensmodifikation; Anpassung."},
 {id:"pp12_19",start:"2027-02-16",end:"2027-02-18",lb:"LB 3",thema:"Nische, Habitat und Lebens-Stress",typ:"einzel",
 planung:"Nische und Habitat; Lebens-Stress; Methode für die Praxis."},
 {id:"pp12_20",start:"2027-02-23",end:"2027-02-25",lb:"LB 3",thema:"Fallbearbeitung und Life-Modell/Lebenswelt",typ:"einzel",
 planung:"Fallbearbeitung Frau Müller; kritische Würdigung Life-Modell; Thiersch – Lebenswelt."},
 {id:"pp12_21",start:"2027-03-02",end:"2027-03-04",lb:"LB 3",thema:"Thiersch: Dimensionen und Handlungsmaximen",typ:"einzel",
 planung:"Thiersch – Dimensionen; Thiersch – Handlungsmaximen; Wiederholung/Prüfungsvorbereitung."},
 {id:"pp12_22",start:"2027-03-09",end:"2027-03-11",lb:"LB 4",thema:"2. Schulaufgabe – Start LB 4: Kommunikation",typ:"einzel",
 planung:"2. Schulaufgabe: Soziale Arbeit; Puffer; Start LB 4: Soziale Kommunikation und Interaktion.",
 leistungsnachweis:true},
 {id:"pp12_23",start:"2027-03-16",end:"2027-03-18",lb:"LB 4",thema:"Organon-Modell und erstes Axiom",typ:"einzel",
 planung:"Organon-Modell; erfolgreiche und gestörte Kommunikation; erstes Axiom (Watzlawick)."},
 {id:"pp12_24",start:"2027-04-06",end:"2027-04-08",lb:"LB 4",thema:"Zweites bis viertes Axiom",typ:"einzel",
 planung:"Zweites Axiom; drittes Axiom; viertes Axiom (Watzlawick)."},
 {id:"pp12_25",start:"2027-04-13",end:"2027-04-15",lb:"LB 4",thema:"Fünftes Axiom, Fallbearbeitung, Techniken",typ:"einzel",
 planung:"Fünftes Axiom; Fallbearbeitung; Kommunikationstechniken."},
 {id:"pp12_26",start:"2027-04-20",end:"2027-04-22",lb:"LB 4",thema:"Kulturelle Unterschiede und Kurzarbeit",typ:"einzel",
 planung:"Kulturbedingte Unterschiede; Wiederholung/Prüfungsvorbereitung; 2. Kurzarbeit: Kommunikation.",
 leistungsnachweis:true},
 {id:"pp12_27",start:"2027-04-27",end:"2027-04-29",lb:"LB 4",thema:"Digitale Medien – Start Fachreferate",typ:"einzel",
 planung:"Kommunikation und digitale Medien; Puffer; Präsentationen der Fachreferate.",
 produktphase:true},
 {id:"pp12_28",start:"2027-05-04",end:"2027-05-05",lb:"LB 4",thema:"Präsentationen der Fachreferate",typ:"einzel",
 planung:"Präsentationen Fachreferate; Präsentationen Fachreferate.",
 produktphase:true},
 {id:"pp12_29",start:"2027-05-11",end:"2027-05-13",lb:"LB 1–4",thema:"Puffer und Wiederholung vor der Fachabiturprüfung",typ:"einzel",
 planung:"Puffer/Prüfungsvorbereitung; Puffer/Prüfungsvorbereitung; Wiederholung – Gesamtwiederholung LB 1–4."}
 ],
 deutsch:[],englisch:[],geschichte:[],mathematik:[],sozialwirtschaft:[],wahlpflicht1:[],wahlpflicht2:[]
};
// Lernziel-Vorschläge je Woche, abgeleitet aus den offiziellen
// Kompetenzerwartungen des LehrplanPLUS FOS 12 Pädagogik/Psychologie
// (lehrplanplus.bayern.de, LB 1–4). Lehrkräfte sehen diese als Vorschlag
// beim erstmaligen Anlegen eines Auftrags und können sie frei anpassen.
const LEHRPLAN_ZIELE_VORSCHLAG={
 pp12_01:["Ich kann den Begriff Entwicklung definieren und zentrale Bedingungen von Entwicklung (Anlage, Umwelt, Selbststeuerung) erläutern."],
 pp12_02:["Ich kann die Grundannahmen der Psychoanalyse und das psychoanalytische Instanzenmodell (Es, Ich, Über-Ich) erklären."],
 pp12_03:["Ich kann Ich-Stärke und Ich-Schwäche unterscheiden und das Zusammenspiel von Angst und Abwehr an einem Fallbeispiel analysieren."],
 pp12_04:["Ich kann zentrale Abwehrmechanismen benennen und die psychosexuellen Entwicklungsphasen nach Freud (oral, anal, phallisch, Latenz, genital) beschreiben."],
 pp12_05:["Ich kann die Entstehung seelischer Fehlentwicklungen aus psychoanalytischer Sicht erklären und die Theorie kritisch würdigen.","Ich kann Entwicklung als lebenslangen Prozess (Theorie der Lebensspanne) beschreiben."],
 pp12_06:["Ich kann den Zusammenhang von Bindung und Entwicklung erläutern und mein Wissen in einem eigenen Erklärvideo aufbereiten."],
 pp12_07:["Ich kann sichere und unsichere Bindungsmuster unterscheiden und ihre Bedeutung für die weitere Entwicklung einschätzen."],
 pp12_08:["Ich kann Maßnahmen zur Förderung gelungener Bindung benennen und Vulnerabilität sowie Resilienz im Jugendalter erläutern."],
 pp12_09:["Ich kann die zentralen Inhalte von LB 1 (Entwicklung) zusammenfassend wiedergeben und den Übergang zum Persönlichkeitsbegriff (LB 2) einordnen."],
 pp12_10:["Ich kann Methoden zur Erhebung von Persönlichkeit benennen und das Big-Five-Modell mit seinen Dimensionen erklären."],
 pp12_11:["Ich kann das Menschenbild der personenzentrierten Theorie nach Rogers erläutern und den Begriff Aktualisierungstendenz erklären."],
 pp12_12:["Ich kann die Bildung und Wirkung des Selbstkonzepts beschreiben und dessen Flexibilität sowie Abwehrmechanismen erläutern."],
 pp12_13:["Ich kann den organismischen Bewertungsprozess sowie Kongruenz und Inkongruenz nach Rogers erklären und auf die Entstehung psychischer Störungen beziehen."],
 pp12_14:["Ich kann die Bedeutung der personenzentrierten und der sozial-kognitiven Theorie für die Erziehung erläutern."],
 pp12_15:["Ich kann den Begriff Identität erklären und die Identitätstypen nach Marcia unterscheiden."],
 pp12_16:["Ich kann Grundlagen und zentrale Aufgabenbereiche der Sozialen Arbeit benennen und erläutern."],
 pp12_17:["Ich kann Aufgabenbereiche der Sozialen Arbeit vertiefen und ein Handlungskonzept Sozialer Arbeit erläutern."],
 pp12_18:["Ich kann das verhaltensorientierte Konzept Sozialer Arbeit erklären und Verhaltensmodifikation an einem Beispiel anwenden."],
 pp12_19:["Ich kann die Begriffe Nische, Habitat und Lebens-Stress im Kontext Sozialer Arbeit erläutern und auf die Praxis beziehen."],
 pp12_20:["Ich kann einen Praxisfall mithilfe des Life-Modells und Thierschs Konzept der Lebensweltorientierung analysieren."],
 pp12_21:["Ich kann Thierschs Dimensionen und Handlungsmaximen der Lebensweltorientierung erläutern und auf einen Fall anwenden."],
 pp12_22:["Ich kann soziale Kommunikation und Interaktion als Grundbegriffe definieren und ihre Bedeutung im Sozialwesen einordnen."],
 pp12_23:["Ich kann das Organon-Modell nach Bühler erklären und erfolgreiche von gestörter Kommunikation unterscheiden (erstes Axiom nach Watzlawick)."],
 pp12_24:["Ich kann das zweite, dritte und vierte Axiom von Watzlawick erläutern und an Beispielen erkennen."],
 pp12_25:["Ich kann das fünfte Axiom erläutern und Kommunikationstechniken auf eine Fallbearbeitung anwenden."],
 pp12_26:["Ich kann kulturbedingte Unterschiede in der Kommunikation erläutern und mein Wissen zu Kommunikationsmodellen zusammenfassen."],
 pp12_27:["Ich kann Chancen und Risiken digitaler Medien für Kommunikation und Lernen einschätzen."],
 pp12_28:["Ich kann mein Fachreferat strukturiert und fachlich fundiert präsentieren."],
 pp12_29:["Ich kann die zentralen Inhalte aus LB 1 bis LB 4 vernetzt wiederholen und mich gezielt auf die Fachabiturprüfung vorbereiten."]
};
function lehrplanWocheById(fach,wocheId){
 return (LEHRPLAN_WOCHEN[fach]||[]).find(w=>w.id===wocheId)||null;
}
// Farbcodierung je Lernbereich (unabhängig von Projekt/Einzelthema),
// dieselbe Nummerierung wie bei der Lernstandsmessung (LB1–LB4).
const LERNBEREICH_FARBEN={
 1:{bg:"#dbeafe",border:"#4a90d9",text:"#1f5a8a"},
 2:{bg:"#f0e0fb",border:"#9b59b6",text:"#6c3483"},
 3:{bg:"#dcf3d1",border:"#3fa66a",text:"#1f6b3d"},
 4:{bg:"#fde8c2",border:"#e0a324",text:"#8a6512"}
};
function lernbereichNummern(lbText){
 return (lbText||"").match(/\d/g)||[];
}
function lernbereichBadgeHTML(lbText){
 const nums=lernbereichNummern(lbText);
 if(!nums.length)return"";
 if(nums.length>1)return`<span class="lb-badge"style="background:#eef1f3;border-color:#8a99a3;color:#556570">Lernbereich ${nums.join("+")}</span>`;
 const c=LERNBEREICH_FARBEN[nums[0]]||LERNBEREICH_FARBEN[1];
 return`<span class="lb-badge"style="background:${c.bg};border-color:${c.border};color:${c.text}">Lernbereich ${nums[0]}</span>`;
}
function lernbereichAkzentfarbe(lbText){
 const nums=lernbereichNummern(lbText);
 if(nums.length!==1)return"#8a99a3";
 return(LERNBEREICH_FARBEN[nums[0]]||LERNBEREICH_FARBEN[1]).border;
}

// Unterrichtsblöcke aus der Block- und Praxislogik der Jahresverlaufsplanung
// (nur Pädagogik/Psychologie) – gruppieren die Wochen im Lernpfad zu klar
// abgegrenzten Abschnitten mit Überschrift.
const UNTERRICHTSBLOECKE={
 paedagogik:[
 {id:"ub1",start:"2026-10-05",end:"2026-10-23",titel:"Unterrichtsblock 1",stunden:18},
 {id:"ub2",start:"2026-11-23",end:"2026-12-11",titel:"Unterrichtsblock 2",stunden:18},
 {id:"ub3",start:"2027-01-18",end:"2027-02-05",titel:"Unterrichtsblock 3",stunden:18},
 {id:"ub4",start:"2027-03-08",end:"2027-03-19",titel:"Unterrichtsblock 4",stunden:12},
 {id:"ub5",start:"2027-04-05",end:"2027-04-09",titel:"Unterrichtsblock 5",stunden:6},
 {id:"ub6",start:"2027-05-03",end:"2027-05-14",titel:"Unterrichtsblock 6",stunden:12},
 {id:"ub7",start:"2027-06-28",end:"2027-07-16",titel:"Unterrichtsblock 7",stunden:18}
 ]
};
function findUnterrichtsblock(fach,dateStr){
 return (UNTERRICHTSBLOECKE[fach]||[]).find(b=>dateStr>=b.start&&dateStr<=b.end)||null;
}

function combinedTimeline(fach){
 const wochen=(LEHRPLAN_WOCHEN[fach]||[]).map(w=>({...w,kind:"woche"}));
 return [...wochen].sort((a,b)=>a.start.localeCompare(b.start));
}

// ---- Motivierende Kurz-Verstärkung (intermittierend) ----
// Bei kleinen Schritten erscheint die Nachricht bewusst nicht jedes Mal
// (nach einem variablen Muster), bei großen Meilensteinen (Woche
// komplett geschafft) immer – intermittierende Verstärkung wirkt
// nachhaltiger als eine erwartbare Nachricht bei jedem Klick.
const MOTIVATIONS_KARTEN=[
 {emoji:"🔥",text:"Läuft bei dir!"},
 {emoji:"💪",text:"Nice, weiter so!"},
 {emoji:"🚀",text:"Das war stark!"},
 {emoji:"⭐",text:"Du rockst das!"},
 {emoji:"🙌",text:"Sauber gemacht!"},
 {emoji:"🎯",text:"Ziel erreicht – on to the next!"},
 {emoji:"😎",text:"Genau so!"},
 {emoji:"🏆",text:"Top Leistung!"}
];
const MOTIVATIONS_KARTEN_BESONDERS=[
 {emoji:"🎉",text:"Ganze Woche geschafft – richtig stark!"},
 {emoji:"🥳",text:"Komplett abgeschlossen, weiter so!"},
 {emoji:"👑",text:"Das nenn ich Einsatz!"}
];
function showMotivationsBild(besonders){
 if(!besonders && Math.random()>0.65)return;
 const liste=besonders?MOTIVATIONS_KARTEN_BESONDERS:MOTIVATIONS_KARTEN;
 const pick=liste[Math.floor(Math.random()*liste.length)];
 const el=document.createElement("div");
 el.className="motivations-karte";
 el.innerHTML=`<div class="motivations-karte-inner"><span class="motivations-emoji">${pick.emoji}</span><strong>${esc(pick.text)}</strong></div>`;
 el.onclick=()=>el.remove();
 document.body.appendChild(el);
 setTimeout(()=>el.remove(),2600);
}
// Alte Aufrufstellen nutzen weiterhin diesen Namen.
function showMotivationsToast(besonders){showMotivationsBild(besonders)}

// ---- Auftrag/Ziele je Woche (Lehrkraft pflegt, Schüler:innen sehen) ------
async function getLehrplanAuftrag(wocheId){
 try{
 const snap=await getDocs(query(collection(db,"lehrplanAuftraege"),where("wocheId","==",wocheId)));
 if(snap.empty)return null;
 return {id:snap.docs[0].id,...snap.docs[0].data()};
 }catch(e){console.error("Auftrag laden:",e);return null}
}
async function saveLehrplanAuftrag(fach,wocheId){
 if(!isTeacher()){toast("Nur Lehrkräfte können Arbeitsaufträge eintragen.");return}
 const titel=$("auftragTitel")?.value.trim();
 const beschreibung=$("auftragBeschreibung")?.value.trim()||"";
 if(!titel){toast("Bitte einen Titel eingeben.");return}
 try{
 const existing=await getLehrplanAuftrag(wocheId);
 const payload={wocheId,fach,titel,beschreibung,updatedAt:serverTimestamp(),updatedBy:currentUser.uid};
 if(existing)await updateDoc(doc(db,"lehrplanAuftraege",existing.id),payload);
 else{payload.createdAt=serverTimestamp();await addDoc(collection(db,"lehrplanAuftraege"),payload)}
 await openWocheDetail(fach,wocheId);
 toast("Arbeitsauftrag gespeichert.");
 }catch(e){console.error("Auftrag speichern:",e);toast("Konnte nicht gespeichert werden.")}
}
async function deleteLehrplanAuftrag(id,fach,wocheId){
 if(!confirm("Diesen Arbeitsauftrag wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"lehrplanAuftraege",id));await openWocheDetail(fach,wocheId);toast("Arbeitsauftrag gelöscht.")}
 catch(e){console.error(e);toast("Konnte nicht gelöscht werden.")}
}

// ---- Material je Woche ----------------------------------------------
const MATERIAL_KATEGORIEN=[
 {key:"lernsituation",label:"Lernsituation"},{key:"lehrtext",label:"Lehrtext"},
 {key:"praesentation",label:"Präsentation"},{key:"bild",label:"Bild"},
 {key:"video",label:"Video"},{key:"audio",label:"Audio"},{key:"link",label:"Link"}
];
async function getLehrplanMaterialien(wocheId){
 try{
 const snap=await getDocs(query(collection(db,"lehrplanMaterialien"),where("wocheId","==",wocheId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Material laden:",e);return []}
}
async function addLehrplanMaterial(fach,wocheId){
 if(!isTeacher()){toast("Nur Lehrkräfte können Material einstellen.");return}
 const kategorie=$("matKategorie")?.value;
 const titel=$("matTitel")?.value.trim();
 const url=$("matUrl")?.value.trim();
 if(!titel){toast("Bitte einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"lehrplanMaterialien"),{wocheId,fach,kategorie,titel,url,createdBy:currentUser.uid,createdAt:serverTimestamp()});
 await openWocheDetail(fach,wocheId);
 toast("Material hinzugefügt.");
 }catch(e){console.error("Material speichern:",e);toast("Konnte nicht gespeichert werden.")}
}
async function deleteLehrplanMaterial(id,fach,wocheId){
 if(!confirm("Dieses Material wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"lehrplanMaterialien",id));await openWocheDetail(fach,wocheId);toast("Gelöscht.")}
 catch(e){console.error(e);toast("Konnte nicht gelöscht werden.")}
}
function materialEmbedHTML(m){
 const url=m.url||"";
 if(m.kategorie==="video"){
 if(/youtube\.com|youtu\.be/.test(url)){
 const idMatch=url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
 const vid=idMatch?idMatch[1]:"";
 return vid?`<iframe width="100%"height="200"src="https://www.youtube.com/embed/${vid}"loading="lazy"style="border:0;border-radius:8px"allowfullscreen></iframe>`:`<a href="${url}"target="_blank"rel="noopener">${esc(m.titel)} ↗</a>`;
 }
 return `<video controls style="width:100%;border-radius:8px;max-height:240px"src="${url}"></video>`;
 }
 if(m.kategorie==="audio")return `<audio controls style="width:100%"src="${url}"></audio>`;
 if(m.kategorie==="bild")return `<img src="${url}"alt="${esc(m.titel)}"style="max-width:100%;border-radius:8px">`;
 return `<a href="${url}"target="_blank"rel="noopener"class="pill"> ${esc(m.titel)} öffnen ↗</a>`;
}

// ---- Teams/Gruppen je Woche -------------------------------------------
async function getLehrplanTeams(wocheId){
 try{
 const snap=await getDocs(query(collection(db,"lehrplanTeams"),where("wocheId","==",wocheId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Teams laden:",e);return []}
}
async function createLehrplanTeam(fach,wocheId){
 const teamName=$("neuTeamName")?.value.trim();
 if(!teamName){toast("Bitte einen Team-Namen eingeben.");return}
 try{
 await addDoc(collection(db,"lehrplanTeams"),{wocheId,fach,teamName,mitgliederUids:[currentUser.uid],mitgliederNamen:[profile?.displayName||"Ich"],createdBy:currentUser.uid,createdAt:serverTimestamp()});
 await openWocheDetail(fach,wocheId);
 toast("Team erstellt – du bist Mitglied!");
 }catch(e){console.error(e);toast("Konnte nicht erstellt werden.")}
}
async function joinLehrplanTeam(teamId,fach,wocheId){
 try{
 const ref=doc(db,"lehrplanTeams",teamId);
 const snap=await getDoc(ref);
 if(!snap.exists())return;
 const d=snap.data();
 if((d.mitgliederUids||[]).includes(currentUser.uid)){toast("Du bist schon in diesem Team.");return}
 await updateDoc(ref,{mitgliederUids:[...(d.mitgliederUids||[]),currentUser.uid],mitgliederNamen:[...(d.mitgliederNamen||[]),profile?.displayName||"Mitglied"]});
 await openWocheDetail(fach,wocheId);
 toast("Team beigetreten!");
 }catch(e){console.error(e);toast("Konnte nicht beitreten.")}
}
async function leaveLehrplanTeam(teamId,fach,wocheId){
 try{
 const ref=doc(db,"lehrplanTeams",teamId);
 const snap=await getDoc(ref);
 if(!snap.exists())return;
 const d=snap.data();
 const uids=[...(d.mitgliederUids||[])],namen=[...(d.mitgliederNamen||[])];
 const idx=uids.indexOf(currentUser.uid);
 if(idx>-1){uids.splice(idx,1);namen.splice(idx,1)}
 await updateDoc(ref,{mitgliederUids:uids,mitgliederNamen:namen});
 await openWocheDetail(fach,wocheId);
 toast("Team verlassen.");
 }catch(e){console.error(e);toast("Konnte nicht verlassen werden.")}
}
async function deleteLehrplanTeam(teamId,fach,wocheId){
 if(!confirm("Dieses Team wirklich auflösen?"))return;
 try{await deleteDoc(doc(db,"lehrplanTeams",teamId));await openWocheDetail(fach,wocheId);toast("Team aufgelöst.")}
 catch(e){console.error(e);toast("Konnte nicht gelöscht werden.")}
}

// ---- Produkte/Ergebnisse je Woche --------------------------------------
async function getLehrplanProdukte(wocheId){
 try{
 const snap=await getDocs(query(collection(db,"lehrplanProdukte"),where("wocheId","==",wocheId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Produkte laden:",e);return []}
}
async function addLehrplanProdukt(fach,wocheId){
 const titel=$("produktTitel")?.value.trim();
 const inhalt=$("produktInhalt")?.value.trim();
 const file=$("produktDatei")?.files?.[0]||null;
 if(!titel){toast("Bitte einen Titel eingeben.");return}
 if(!inhalt&&!file){toast("Bitte einen Link/Text eingeben oder eine Datei auswählen.");return}
 try{
 let dateiUrl="",dateiName="";
 if(file){
 toast("Datei wird hochgeladen …");
 const up=await uploadCampusDatei(file,`lehrplanProdukte/${wocheId}`);
 dateiUrl=up.url;dateiName=up.name;
 }
 await addDoc(collection(db,"lehrplanProdukte"),{wocheId,fach,uid:currentUser.uid,name:profile?.displayName||"Campus-Mitglied",titel,inhalt,dateiUrl,dateiName,createdAt:serverTimestamp()});
 await openWocheDetail(fach,wocheId);
 showMotivationsBild();
 }catch(e){console.error("Lernprodukt hochladen:",e);toast("Fehler: "+(e?.message||e));}
}
async function deleteLehrplanProdukt(id,fach,wocheId){
 if(!confirm("Dieses Produkt wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"lehrplanProdukte",id));await openWocheDetail(fach,wocheId);toast("Gelöscht.")}
 catch(e){console.error(e);toast("Konnte nicht gelöscht werden.")}
}

// ---- Persönlicher Fortschritt (Ziele erfüllt, Häkchen am Zeitstrahl) ---
async function getLehrplanFortschritt(wocheId){
 if(!currentUser)return {zieleErfuellt:{},abgeschlossen:false};
 try{
 const snap=await getDoc(doc(db,"lehrplanFortschritt",`${currentUser.uid}_${wocheId}`));
 if(!snap.exists())return {zieleErfuellt:{},abgeschlossen:false};
 return snap.data();
 }catch(e){console.error("Fortschritt laden:",e);return {zieleErfuellt:{},abgeschlossen:false}}
}
async function toggleZielErfuellt(fach,wocheId,zielId,erfuellt){
 try{
 const ref=doc(db,"lehrplanFortschritt",`${currentUser.uid}_${wocheId}`);
 const snap=await getDoc(ref);
 const data=snap.exists()?snap.data():{uid:currentUser.uid,wocheId,fach,zieleErfuellt:{},abgeschlossen:false};
 data.zieleErfuellt=data.zieleErfuellt||{};
 data.zieleErfuellt[zielId]=erfuellt;
 data.updatedAt=serverTimestamp();
 await setDoc(ref,data);
 await openWocheDetail(fach,wocheId);
 if(erfuellt)showMotivationsToast();
 }catch(e){console.error("Ziel-Status:",e);toast("Konnte nicht gespeichert werden.")}
}
async function toggleAuftragGelesen(fach,wocheId,erledigt){
 try{
 const ref=doc(db,"lehrplanFortschritt",`${currentUser.uid}_${wocheId}`);
 const snap=await getDoc(ref);
 const data=snap.exists()?snap.data():{uid:currentUser.uid,wocheId,fach,zieleErfuellt:{},abgeschlossen:false};
 data.auftragGelesen=erledigt;
 data.updatedAt=serverTimestamp();
 await setDoc(ref,data);
 await openWocheDetail(fach,wocheId);
 if(erledigt)showMotivationsToast();
 }catch(e){console.error("Auftrag-gelesen-Status:",e);toast("Konnte nicht gespeichert werden.")}
}
async function toggleMaterialErhalten(fach,wocheId,erledigt){
 try{
 const ref=doc(db,"lehrplanFortschritt",`${currentUser.uid}_${wocheId}`);
 const snap=await getDoc(ref);
 const data=snap.exists()?snap.data():{uid:currentUser.uid,wocheId,fach,zieleErfuellt:{},abgeschlossen:false};
 data.materialErhalten=erledigt;
 data.updatedAt=serverTimestamp();
 await setDoc(ref,data);
 await openWocheDetail(fach,wocheId);
 if(erledigt)showMotivationsToast();
 }catch(e){console.error("Material-erhalten-Status:",e);toast("Konnte nicht gespeichert werden.")}
}
window.toggleAuftragGelesen=toggleAuftragGelesen;
window.toggleMaterialErhalten=toggleMaterialErhalten;
async function markWocheAbgeschlossen(fach,wocheId){
 const fortschritt=await getLehrplanFortschritt(wocheId);
 const ziele=LEHRPLAN_ZIELE_VORSCHLAG[wocheId]||[];
 const alleErfuellt=ziele.length>0 && ziele.every((z,i)=>fortschritt.zieleErfuellt?.[`z${i}`]);
 if(!alleErfuellt){toast("Bitte zuerst alle Ziele als erfüllt markieren.");return}
 try{
 await setDoc(doc(db,"lehrplanFortschritt",`${currentUser.uid}_${wocheId}`),{...fortschritt,uid:currentUser.uid,wocheId,fach,abgeschlossen:true,updatedAt:serverTimestamp()});
 await render();
 showMotivationsToast(true);
 }catch(e){console.error("Woche abschließen:",e);toast("Konnte nicht gespeichert werden.")}
}

window.saveLehrplanAuftrag=saveLehrplanAuftrag;window.deleteLehrplanAuftrag=deleteLehrplanAuftrag;
window.addLehrplanMaterial=addLehrplanMaterial;window.deleteLehrplanMaterial=deleteLehrplanMaterial;
window.createLehrplanTeam=createLehrplanTeam;window.joinLehrplanTeam=joinLehrplanTeam;
window.leaveLehrplanTeam=leaveLehrplanTeam;window.deleteLehrplanTeam=deleteLehrplanTeam;
window.addLehrplanProdukt=addLehrplanProdukt;window.deleteLehrplanProdukt=deleteLehrplanProdukt;
window.toggleZielErfuellt=toggleZielErfuellt;window.markWocheAbgeschlossen=markWocheAbgeschlossen;

function webUntisUrl(){
 const today=new Date().toISOString().slice(0,10);
 return `https://fos-bos-weilheim.webuntis.com/WebUntis?school=fos-bos-weilheim#/basic/timetablePublic/class?date=${today}&entityId=1190`;
}
function webUntisEmbedHTML(heightPx,openByDefault){
 const url=webUntisUrl();
 return `<details class="untis-embed"${openByDefault?"open":""}>
 <summary> Stundenplan anzeigen/ausblenden</summary>
 <iframe src="${url}"loading="lazy"style="width:100%;height:${heightPx}px;border:1px solid var(--line,#e2eaf0);border-radius:10px;background:#fff"class="untis-iframe"title="Stundenplan F12Sb (WebUntis)"></iframe>
 <div class="untis-fallback"><small>Wird der Stundenplan oben nicht angezeigt? Manche Schulnetzwerke blockieren die Einbettung.</small>
 <a href="${url}"target="_blank"rel="noopener"class="pill"> Stundenplan in WebUntis öffnen ↗</a></div>
 </details>`;
}

// ---- Noten (0–15 Punkte je Fach, getrennt nach Halbjahr) ------------------
async function getMeineNoten(){
 if(!db||!currentUser)return {entries:{}};
 try{
 const snap=await getDoc(doc(db,"noten",currentUser.uid));
 if(!snap.exists())return {entries:{}};
 const d=snap.data();
 return {entries:d.entries||{}};
 }catch(e){console.error("Noten laden:",e);return {entries:{}}}
}
// FPA (fachpraktische Ausbildung) bleibt ein einfacher Notentopf – dafür gilt
// eine eigene Regel (§8 FOBOSO), keine Schulaufgabe/sonstige-Leistungen-Logik.
function notenListe(noten,fach,hj){
 return (noten.entries?.[fach]?.[hj])||[];
}
function notenDurchschnitt(liste){
 if(!liste.length)return null;
 const sum=liste.reduce((a,e)=>a+e.value,0);
 return Math.round(sum/liste.length);
}
// Rundung nach § 19 Abs. 6 FOBOSO: ab „,50" aufrunden, darunter abrunden;
// Werte unter 1,00 werden immer auf 0 abgerundet.
function foboso19Runden(wert){
 if(wert===null||!Number.isFinite(wert))return null;
 if(wert<1)return 0;
 return Math.round(wert);
}
// Notenbezeichnung nach der Punktetabelle in § 19 FOBOSO.
function fobosoNotenwort(punkte){
 if(!Number.isFinite(punkte))return"";
 if(punkte>=13)return"sehr gut";
 if(punkte>=10)return"gut";
 if(punkte>=7)return"befriedigend";
 if(punkte>=4)return"ausreichend";
 if(punkte>=1)return"mangelhaft";
 return"ungenügend";
}
// Die 7 regulären Fächer: Schulaufgabe(n) + gewichteter Durchschnitt der
// "sonstigen Leistungen" (schriftlich: Stegreif/Kurzarbeit + mündlich, als
// EIN gemeinsamer Topf), beides zählt 1:1, danach gerundet (§21 Abs.1 FOBOSO).
function schulaufgabenListe(noten,fach,hj){
 return noten.entries?.[fach]?.[hj]?.schulaufgaben||[];
}
function sonstigeListe(noten,fach,hj){
 return noten.entries?.[fach]?.[hj]?.sonstige||[];
}
// Alle bisher eingetragenen Einzelwerte (Schulaufgabe(n) + sonstige
// Leistungen) als schlichte Zahlenliste, für die Kurzanzeige, solange noch
// kein Halbjahresergebnis berechnet werden kann.
function alleEinzelwerte(noten,fach,hj){
 const sa=schulaufgabenListe(noten,fach,hj).map(v=>({value:v,muendlich:false}));
 const so=sonstigeListe(noten,fach,hj).map(e=>({value:e.value,muendlich:e.type==="muendlich"}));
 return[...sa,...so];
}
function sonstigeSchnitt(liste){
 if(!liste.length)return null;
 const gewSumme=liste.reduce((a,e)=>a+(e.gewicht||1),0);
 return liste.reduce((a,e)=>a+e.value*(e.gewicht||1),0)/gewSumme;
}
function berechneHalbjahresergebnis(noten,fach,hj){
 const sa=schulaufgabenListe(noten,fach,hj);
 const sonst=sonstigeListe(noten,fach,hj);
 if(!sa.length||!sonst.length)return null;
 const sSchnitt=sonstigeSchnitt(sonst);
 const saSumme=sa.reduce((a,v)=>a+v,0);
 const roh=(saSumme+sSchnitt)/(sa.length+1);
 return foboso19Runden(roh);
}
function fachLabel(fach){
 return F12SB_FAECHER.find(f=>f.key===fach)?.label||fach;
}
// Bezeichnung der "sonstigen Leistung" – fängt auch ältere Einträge ab,
// die noch mit dem alten zweistufigen "schriftlich"/"muendlich" gespeichert wurden.
function sonstigeLeistungLabel(type){
 if(type==="muendlich")return "Mündliche Note";
 if(type==="stegreif")return "Stegreifaufgabe";
 if(type==="kurzarbeit")return "Kurzarbeit";
 return "Schriftlich (Stegreif/KA)";
}
async function updateNotenDoc(mutator){
 const ref=doc(db,"noten",currentUser.uid);
 const snap=await getDoc(ref);
 const data=snap.exists()?snap.data():{uid:currentUser.uid,entries:{}};
 data.entries=data.entries||{};
 mutator(data);
 data.uid=currentUser.uid;
 data.updatedAt=serverTimestamp();
 await setDoc(ref,data);
}
async function addSchulaufgabe(fach,hj){
 const value=$("saNeuValue")?.value;
 const num=Math.max(0,Math.min(15,parseInt(value,10)));
 if(!Number.isFinite(num)){toast("Bitte eine Zahl von 0 bis 15 eingeben.");return}
 try{
 await updateNotenDoc(data=>{
 data.entries[fach]=data.entries[fach]||{};
 data.entries[fach][hj]=data.entries[fach][hj]||{schulaufgaben:[],sonstige:[]};
 data.entries[fach][hj].schulaufgaben=data.entries[fach][hj].schulaufgaben||[];
 data.entries[fach][hj].schulaufgaben.push(num);
 });
 closeModal();
 await render();
 toast("Schulaufgabe hinzugefügt.");
 }catch(e){console.error("Schulaufgabe speichern:",e);toast("Fehler: "+(e?.message||e));}
}
async function deleteSchulaufgabe(fach,hj,index){
 try{
 await updateNotenDoc(data=>{
 if(data.entries?.[fach]?.[hj]?.schulaufgaben)data.entries[fach][hj].schulaufgaben.splice(index,1);
 });
 closeModal();
 await render();
 toast("Entfernt.");
 }catch(e){console.error("Schulaufgabe löschen:",e);toast("Fehler: "+(e?.message||e));}
}
async function addSonstigeLeistung(fach,hj){
 const value=$("sonstNeuValue")?.value;
 const type=$("sonstNeuType")?.value;
 const gewicht=$("sonstNeuGewicht")?.value;
 const num=Math.max(0,Math.min(15,parseInt(value,10)));
 const g=Math.max(0.5,Math.min(5,parseFloat(gewicht)||1));
 if(!Number.isFinite(num)){toast("Bitte eine Zahl von 0 bis 15 eingeben.");return}
 try{
 await updateNotenDoc(data=>{
 data.entries[fach]=data.entries[fach]||{};
 data.entries[fach][hj]=data.entries[fach][hj]||{schulaufgaben:[],sonstige:[]};
 data.entries[fach][hj].sonstige=data.entries[fach][hj].sonstige||[];
 data.entries[fach][hj].sonstige.push({id:`${Date.now()}_${Math.random().toString(36).slice(2,7)}`,value:num,type,gewicht:g});
 });
 closeModal();
 await render();
 toast("Note hinzugefügt.");
 }catch(e){console.error("Sonstige Leistung speichern:",e);toast("Fehler: "+(e?.message||e));}
}
async function deleteSonstigeLeistung(fach,hj,entryId){
 try{
 await updateNotenDoc(data=>{
 if(data.entries?.[fach]?.[hj]?.sonstige)data.entries[fach][hj].sonstige=data.entries[fach][hj].sonstige.filter(e=>e.id!==entryId);
 });
 closeModal();
 await render();
 toast("Gelöscht.");
 }catch(e){console.error("Sonstige Leistung löschen:",e);toast("Fehler: "+(e?.message||e));}
}
// FPA behält die einfache Eintragsliste (kein Schulaufgabe/sonstige-Modell).
async function addNotenEintrag(fach,hj){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Noten eintragen.");return}
 const value=$("notenNeuValue")?.value;
 const num=Math.max(0,Math.min(15,parseInt(value,10)));
 if(!Number.isFinite(num)){toast("Bitte eine Zahl von 0 bis 15 eingeben.");return}
 try{
 await updateNotenDoc(data=>{
 data.entries[fach]=data.entries[fach]||{};
 data.entries[fach][hj]=data.entries[fach][hj]||[];
 data.entries[fach][hj].push({id:`${Date.now()}_${Math.random().toString(36).slice(2,7)}`,value:num,type:""});
 });
 closeModal();
 await render();
 toast("Note hinzugefügt.");
 }catch(e){console.error("Note speichern:",e);toast("Note konnte nicht gespeichert werden.")}
}
async function deleteNotenEintrag(fach,hj,entryId){
 try{
 await updateNotenDoc(data=>{
 if(data.entries?.[fach]?.[hj])data.entries[fach][hj]=data.entries[fach][hj].filter(e=>e.id!==entryId);
 });
 await openNotenDetail(fach,hj);
 await render();
 toast("Note gelöscht.");
 }catch(e){console.error("Note löschen:",e);toast("Konnte nicht gelöscht werden.")}
}
async function openNotenDetail(fach,hj){
 const noten=await getMeineNoten();
 const sa=schulaufgabenListe(noten,fach,hj);
 const sonst=sonstigeListe(noten,fach,hj);
 const sSchnitt=sonstigeSchnitt(sonst);
 const ergebnis=berechneHalbjahresergebnis(noten,fach,hj);
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">MEINE NOTEN · ${hj==="hj1"?"1. HALBJAHR":"2. HALBJAHR"}</div>
 <h2>${esc(fachLabel(fach))}</h2>
 <p style="color:var(--muted)">Nach § 21 Abs. 1 FOBOSO: Der (gewichtete) Durchschnitt der sonstigen Leistungen zählt genauso viel wie jede Schulaufgabe.</p>
 <div class="notice"style="margin-bottom:14px">
 <strong style="font-size:24px">${ergebnis===null?"—":`${ergebnis} Punkte`}</strong>${ergebnis!==null?` <span class="pill">${fobosoNotenwort(ergebnis)}</span>`:""}
 <small style="display:block;color:var(--muted)">Halbjahresergebnis (gerundet)</small>
 </div>

 <h3 style="margin:14px 0 6px;font-size:14px"> Schulaufgabe(n)</h3>
 <div class="list">${sa.map((v,i)=>`<div class="list-item"><strong>${v} Punkte</strong><button class="secondary"onclick="deleteSchulaufgabe('${fach}','${hj}',${i})">Löschen</button></div>`).join("")||`<div class="empty">Noch keine Schulaufgabe eingetragen.</div>`}</div>
 <div class="form-actions"style="margin-top:8px;align-items:flex-end">
 <label style="width:80px">Punkte<input id="saNeuValue"type="number"min="0"max="15"placeholder="0–15"></label>
 <button class="primary"onclick="addSchulaufgabe('${fach}','${hj}')">＋ Schulaufgabe</button>
 </div>

 <h3 style="margin:18px 0 4px;font-size:14px"> Sonstige Leistungen (schriftlich & mündlich, ein gemeinsamer Topf)</h3>
 <p style="font-size:11px;color:var(--muted);margin:0 0 8px">Durchschnitt: ${sSchnitt===null?"—":sSchnitt.toFixed(2)+" Punkte"} aus ${sonst.length} ${sonst.length===1?"Eintrag":"Einträgen"} – zählt wie eine weitere Schulaufgabe.</p>
 <div class="list">${sonst.map(e=>`<div class="list-item"><div><strong>${e.value} Punkte</strong><small>${sonstigeLeistungLabel(e.type)}${e.gewicht&&e.gewicht!==1?` · Gewicht ${e.gewicht}`:""}</small></div><button class="secondary"onclick="deleteSonstigeLeistung('${fach}','${hj}','${e.id}')">Löschen</button></div>`).join("")||`<div class="empty">Noch keine Leistung eingetragen.</div>`}</div>
 <div class="form-actions"style="margin-top:8px;flex-wrap:wrap;align-items:flex-end">
 <label style="width:70px">Punkte<input id="sonstNeuValue"type="number"min="0"max="15"placeholder="0–15"></label>
 <label style="width:170px">Art<select id="sonstNeuType">
 <option value="stegreif">Stegreifaufgabe</option>
 <option value="kurzarbeit">Kurzarbeit</option>
 <option value="muendlich">Mündliche Note</option>
 </select></label>
 <label style="width:85px">Gewichtung<input id="sonstNeuGewicht"type="number"min="0.5"max="5"step="0.5"value="1"title="Gewichtung nach Umfang/Schwierigkeitsgrad"></label>
 <button class="primary"onclick="addSonstigeLeistung('${fach}','${hj}')">＋ Hinzufügen</button>
 </div>

 <div class="form-actions"style="margin-top:14px"><button class="secondary"onclick="closeModal()">Schließen</button></div>
 `);
}
async function resetMeineNoten(){
 if(!confirm("Wirklich alle eigenen Noten zurücksetzen? Das kann nicht rückgängig gemacht werden."))return;
 try{
 await deleteDoc(doc(db,"noten",currentUser.uid));
 closeModal();
 await render();
 toast("Noten zurückgesetzt.");
 }catch(e){console.error("Noten zurücksetzen:",e);toast("Konnte nicht zurückgesetzt werden.")}
}
window.addSchulaufgabe=addSchulaufgabe;window.deleteSchulaufgabe=deleteSchulaufgabe;
window.addSonstigeLeistung=addSonstigeLeistung;window.deleteSonstigeLeistung=deleteSonstigeLeistung;
window.openNotenDetail=openNotenDetail;
function openNotenSchnellzugriff(){
 const fach=$("notenSchnellFach")?.value;
 const hj=$("notenSchnellHj")?.value;
 if(fach&&hj)openNotenDetail(fach,hj);
}
window.openNotenSchnellzugriff=openNotenSchnellzugriff;
window.addNotenEintrag=addNotenEintrag;
window.deleteNotenEintrag=deleteNotenEintrag;
window.resetMeineNoten=resetMeineNoten;

// ---- Bestehens-Rechner nach §8, §21 Abs. 3, §22 Abs. 1 Nr. 2 FOBOSO -------
// Hinweis: Dies ist ausschließlich eine Orientierungshilfe (wie die
// entsprechenden "ohne Gewähr"-Tools der Schulen selbst). Die tatsächliche
// Entscheidung trifft die Klassenkonferenz/Schulleitung anhand einer
// pädagogischen Gesamtwürdigung, nicht rein rechnerisch. Verwendet wird
// jeweils der Durchschnitt aller schriftlichen/mündlichen Einzelnoten.
function checkFoboso21(punkte){
 const n=punkte.length;
 if(!n)return{passed:null,rule:null};
 const sum=punkte.reduce((a,b)=>a+b,0);
 const zero=punkte.filter(p=>p===0).length;
 const oneToThree=punkte.filter(p=>p>=1&&p<=3).length;
 const atLeastFour=punkte.filter(p=>p>=4).length;
 if(zero===0&&oneToThree===0)return{passed:true,rule:"a"};
 if(zero===1&&oneToThree===0&&atLeastFour===n-1&&sum>=6*n)return{passed:true,rule:"d"};
 if(zero===0&&oneToThree===1&&atLeastFour===n-1&&sum>=5*n)return{passed:true,rule:"b"};
 if(zero===0&&oneToThree===2&&atLeastFour===n-2&&sum>=6*n)return{passed:true,rule:"c"};
 return{passed:false,rule:null};
}
// Für die 12. Klasse gibt es keine Probezeit mehr (die gilt nur in der 11.).
// Stattdessen ist relevant: die Jahrespunktzahl je Fach (§21 FOBOSO) und eine
// grobe Orientierung, ob die Zulassungsvoraussetzungen zur Abschlussprüfung
// nach §31/§35 FOBOSO grundsätzlich im Rahmen liegen. Die exakte
// Fachabitur-Berechnung mit optimalem Streichvorschlag (25 Halbjahresergebnisse
// + 4 dreifach gewichtete Prüfungen, §35 Abs. 6 FOBOSO) leistet
// diese App bewusst nicht – dafür nutzt eure Schule den offiziellen
// Streichvorschlag-Rechner (z. B. der Beruflichen Oberschule Traunstein).
function berechneBestehen(noten){
 const faecherHJ1=F12SB_FAECHER.map(f=>berechneHalbjahresergebnis(noten,f.key,"hj1"));
 const faecherHJ2=F12SB_FAECHER.map(f=>berechneHalbjahresergebnis(noten,f.key,"hj2"));
 const vollHJ1=faecherHJ1.every(p=>Number.isFinite(p));
 const vollJahr=vollHJ1&&faecherHJ2.every(p=>Number.isFinite(p));

 let jahr=null;
 if(vollJahr){
 // Jahrespunktzahl nach § 21 Abs. 2 FOBOSO: Durchschnitt der beiden
 // (bereits gerundeten) Halbjahresergebnisse, danach erneut gerundet.
 const jahrespunkte=F12SB_FAECHER.map((f,i)=>foboso19Runden((faecherHJ1[i]+faecherHJ2[i])/2));
 // Orientierung nach §35 Abs. 9 FOBOSO: höchstens 2 Gesamtergebnisse mit
 // 1–3 Punkten bzw. 1 mit 0 Punkten – sonst ist die Zulassung gefährdet.
 const unter4=jahrespunkte.filter(p=>p>=1&&p<=3).length;
 const nullPunkte=jahrespunkte.filter(p=>p===0).length;
 const imRahmen=nullPunkte<=1 && (nullPunkte===1?unter4===0:unter4<=2);
 jahr={jahrespunkte,imRahmen};
 }
 return{jahr,vollHJ1,vollJahr};
}
// Einfache Orientierung "was fehlt noch": für jedes noch unter 4 liegende
// oder fehlende Fach wird angezeigt, welcher Wert für die einfachste
// Bestehens-Variante (Regel a: alle Fächer ≥4) fehlen würde.

// Analoge Übersicht fürs ganze Schuljahr: Jahrespunktzahl je Fach (Durchschnitt
// der beiden Halbjahresergebnisse) plus fpA mit eigener Jahresregel (§8 FOBOSO).
function wasFehltNochJahr(noten){
 const liste=F12SB_FAECHER.map(f=>{
 const p1=berechneHalbjahresergebnis(noten,f.key,"hj1");
 const p2=berechneHalbjahresergebnis(noten,f.key,"hj2");
 if(!Number.isFinite(p1)||!Number.isFinite(p2)){
 const fehlt=!Number.isFinite(p1)&&!Number.isFinite(p2)?"HJ1 und HJ2 fehlen noch":!Number.isFinite(p1)?"HJ1 fehlt noch":"HJ2 fehlt noch";
 return{label:f.label,status:"fehlt",text:fehlt};
 }
 const jp=foboso19Runden((p1+p2)/2);
 if(jp===0)return{label:f.label,status:"ungenuegend",text:`0 Punkte im Jahr – für die einfache Variante (alle Fächer ≥4) fehlen noch 4 Punkte`};
 if(jp<4)return{label:f.label,status:"kritisch",text:`Aktuell ${jp} Punkte im Jahr – für die einfache Variante (alle Fächer ≥4) fehlen noch ${4-jp} Punkte`};
 return{label:f.label,status:"ok",text:`${jp} Punkte im Jahr`};
 });
 return liste;
}

// ---- Wochen-/Monatsplanung -------------------------------------------
async function getMeineWochenplanung(){
 if(!db||!currentUser)return [];
 try{
 const snap=await getDocs(query(collection(db,"wochenplanung"),where("uid","==",currentUser.uid)));
 return snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.dueDate||"9999-99-99").localeCompare(b.dueDate||"9999-99-99"));
 }catch(e){console.error("Wochenplanung laden:",e);return []}
}
function openWochenplanForm(existing){
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">WOCHEN-/MONATSPLANUNG</div>
 <h2>${existing?"Eintrag bearbeiten":"Neue Planung"}</h2>
 <div class="form">
 <label>Was steht an?<input id="wpTitle"type="text"maxlength="140"value="${esc(existing?.title||"")}"placeholder="z. B. Vokabeltest vorbereiten"></label>
 <label>Fach (optional)<select id="wpSubject">
 <option value="">Kein bestimmtes Fach</option>
 ${F12SB_FAECHER.map(f=>`<option value="${f.key}"${existing?.subject===f.key?"selected":""}>${f.label}</option>`).join("")}
 </select></label>
 <label>Zeitraum<select id="wpScope">
 <option value="woche"${(!existing||existing.scope==="woche")?"selected":""}>Diese Woche</option>
 <option value="monat"${existing?.scope==="monat"?"selected":""}>Dieser Monat</option>
 </select></label>
 <label>Termin (optional)<input id="wpDate"type="date"value="${esc(existing?.dueDate||"")}"></label>
 <label>Notiz (optional)<textarea id="wpNote"rows="2"maxlength="300">${esc(existing?.note||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 ${existing?`<button class="secondary"onclick="deleteWochenplanEntry('${existing.id}')">Löschen</button>`:""}
 <button class="primary"onclick="saveWochenplanEntry(${existing?`'${existing.id}'`:"null"})">Speichern</button>
 </div>
 </div>`);
}
async function saveWochenplanEntry(id){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können planen.");return}
 const title=$("wpTitle")?.value.trim();
 if(!title){toast("Bitte eintragen, was ansteht.");return}
 const payload={
 uid:currentUser.uid,
 title,
 subject:$("wpSubject")?.value||"",
 scope:$("wpScope")?.value||"woche",
 dueDate:$("wpDate")?.value||"",
 note:$("wpNote")?.value.trim()||"",
 updatedAt:serverTimestamp()
 };
 try{
 if(id){
 await updateDoc(doc(db,"wochenplanung",id),payload);
 }else{
 payload.createdAt=serverTimestamp();
 payload.done=false;
 await addDoc(collection(db,"wochenplanung"),payload);
 }
 closeModal();
 await render();
 toast("Gespeichert.");
 }catch(e){console.error("Wochenplanung speichern:",e);toast("Konnte nicht gespeichert werden.")}
}
async function toggleWochenplanDone(id,done){
 try{await updateDoc(doc(db,"wochenplanung",id),{done:!done,updatedAt:serverTimestamp()});await render();}
 catch(e){console.error("Wochenplanung ändern:",e);toast("Konnte nicht geändert werden.")}
}
async function deleteWochenplanEntry(id){
 if(!confirm("Diesen Planungseintrag wirklich löschen?"))return;
 try{
 await deleteDoc(doc(db,"wochenplanung",id));
 closeModal();
 await render();
 toast("Eintrag gelöscht.");
 }catch(e){console.error("Wochenplanung löschen:",e);toast("Konnte nicht gelöscht werden.")}
}
async function quickAddWochenplan(){
 const input=$("quickWpInput");
 const title=input?.value.trim();
 if(!title){toast("Bitte kurz eintragen, was ansteht.");return}
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können planen.");return}
 try{
 await addDoc(collection(db,"wochenplanung"),{
 uid:currentUser.uid,title,subject:"",scope:"woche",dueDate:"",note:"",done:false,createdAt:serverTimestamp()
 });
 if(input)input.value="";
 await render();
 toast("Zur Wochenplanung hinzugefügt.");
 }catch(e){console.error("Schnell-Eintrag:",e);toast("Konnte nicht gespeichert werden.")}
}
window.openWochenplanForm=openWochenplanForm;
window.saveWochenplanEntry=saveWochenplanEntry;
window.toggleWochenplanDone=toggleWochenplanDone;
window.deleteWochenplanEntry=deleteWochenplanEntry;
window.quickAddWochenplan=quickAddWochenplan;


async function miniKalenderHTML(){
 let events=[];
 try{events=(await getCollection("events","start",false)).map(e=>({...e,collection:"events"}))}catch(e){}
 if(!events.length){try{events=(await getCollection("calendar","date",false)).map(e=>({...e,collection:"calendar"}))}catch(e){}}
 let birthdayEvents=[];
 try{birthdayEvents=await getBirthdayEvents()}catch(e){}
 // Dieselben Schulferien-Zeiträume wie im vollständigen Campus-Kalender.
 const ferienZeitraeume=[
 ["2026-08-03","2026-09-14"],["2026-11-02","2026-11-06"],["2026-12-24","2027-01-08"],
 ["2027-02-08","2027-02-12"],["2027-03-22","2027-04-02"],["2027-05-18","2027-05-28"],["2027-08-02","2027-09-13"]
 ];
 const istFerien=key=>ferienZeitraeume.some(([von,bis])=>key>=von&&key<=bis);
 const today=new Date();today.setHours(0,0,0,0);
 const monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
 const days=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d});
 const dateKey=d=>d.toISOString().slice(0,10);
 const eventDates=new Set(events.map(e=>String(e.start||e.date||"").slice(0,10)));
 const birthdayDates=new Set(birthdayEvents.map(e=>String(e.start||"").slice(0,10)));
 const wt=["Mo","Di","Mi","Do","Fr","Sa","So"];
 return `<a href="#kalender"class="mini-kalender">
 ${days.map((d,i)=>{const key=dateKey(d);const isToday=key===dateKey(today);
 const ferien=istFerien(key),geburtstag=birthdayDates.has(key),termin=eventDates.has(key);
 return `<div class="mini-kalender-day${isToday?" mini-kalender-today":""}${ferien?" mini-kalender-ferien":""}"><small>${wt[i]}</small><strong>${d.getDate()}</strong>${geburtstag?`<span class="mini-kalender-dot mini-kalender-dot-pink"></span>`:termin?`<span class="mini-kalender-dot"></span>`:""}</div>`;}).join("")}
 </a>
 <small style="display:block;margin-top:6px;color:var(--muted);font-size:10px">Zum vollständigen Campus-Kalender →</small>`;
}
async function renderStart(){
 let tasks=[],projects=[],news=[],nextCalendar=null,birthdayInfo=null,wochenplan=[];
 try{[tasks,projects,news,nextCalendar,birthdayInfo,wochenplan]=await Promise.all([getCollection("tasks","deadline",false),getCollection("projects"),getCollection("news"),getUpcomingCampusCalendarEvent(),getUpcomingBirthdayInfo(),getMeineWochenplanung()])}catch(e){}
 const miniKalender=await miniKalenderHTML();
 const upcomingDate=nextCalendar?.start||nextCalendar?.date||nextCalendar?.startDate;
 const upcomingDateText=upcomingDate?.seconds?new Date(upcomingDate.seconds*1000).toLocaleDateString("de-DE"):String(upcomingDate||"").slice(0,10);
 const upcomingTime=nextCalendar?.time?` · ${esc(nextCalendar.time)} Uhr`:"";
 const newsAction=(isTeacher()?`<button class="primary"onclick="openNewsForm()">＋ News veröffentlichen</button>`:"")
 +(isTeacher()?`<button class="secondary"onclick="openUserManagement()"> Benutzer verwalten</button>`:"");
 return`<section class="hero"><div><span class="badge"> F12Sb 26/27</span><h1>Willkommen auf dem Campus.</h1><p>Hier
verbinden wir Lernen, Projekte, Praxis und Gemeinschaft. Alle angemeldeten Mitglieder arbeiten am selben digitalen Campus.</p>
</div><div class="actions">${isTeacher()?`<button class="primary"onclick="openNewsForm()">＋ News veröffentlichen</button>`:""}<button class="secondary"onclick="go('kompass')">Mein Kompass →</button><button class="secondary"onclick="go('forum')">Campus-Forum</button></div></section>
 <div class="grid grid-3">
 <div class="card card-compact"style="border-left:4px solid #4a90d9"><h3> Campus-News</h3><div class="list">${news.slice(0,3).map(p=>`<div
class="list-item"><div><strong>${esc(p.title||p.text)}</strong>${p.title?`<small>${esc(p.text)} · ${fmtDate(p.createdAt)}</small>`:`<small>${fmtDate(p.createdAt)}</small>`}</div><div style="display:flex;align-items:center;gap:8px"><span class="pill">Info</span>${isAdmin()?`<button class="secondary"onclick="deleteNews('${p.id}')">Löschen</button>`:""}</div>
</div>`).join("")||`<div class="empty">Noch keine News.</div>`}</div></div>
 <div class="card card-compact"style="border-left:4px solid #9b59b6"><h3> Nächster Termin</h3><div class="list">${nextCalendar?`<div class="list-item"><div><strong>${esc(nextCalendar.title||nextCalendar.name||"Termin")}</strong><small>${esc(upcomingDateText)}${upcomingTime}</small></div><span class="pill green">Termin</span></div>`:`<div class="empty">Noch keine anstehenden Termine.</div>`}</div></div>
 <div class="card card-compact"style="border-left:4px solid #e0629e"><h3> Geburtstage</h3>${
 !birthdayInfo?`<div class="empty">Noch keine Geburtstage eingetragen.</div>`
 :birthdayInfo.isToday?`<p style="margin:6px 0 0;font-weight:800;font-size:14px"> Herzlichen Glückwunsch, ${birthdayInfo.people.map(p=>{const c=personColor(p.uid);return`<span style="color:${c.text}">${esc(p.name)}</span>`}).join(" & ")}!</p>`
 :`<div class="list-item"><div><strong>${birthdayInfo.people.map(p=>{const c=personColor(p.uid);return`<span style="color:${c.text}">${esc(p.name)}</span>`}).join(" & ")}</strong><small>${esc(birthdayInfo.date.toLocaleDateString("de-DE",{day:"2-digit",month:"long"}))} · ${birthdayInfo.days===1?"morgen":`in ${birthdayInfo.days} Tagen`}</small></div><span class="pill"style="background:${personColor(birthdayInfo.people[0].uid).border};color:#fff">Nächste(r)</span></div>`
 }</div>
 </div>
 <div class="grid grid-2"style="margin-bottom:16px;gap:12px">
 <div class="card card-compact"style="text-align:center">
 <h3 style="margin:0 0 6px"> Uhrzeit</h3>
 <div style="display:flex;justify-content:center">${analogClockSVG(64)}</div>
 <small class="live-clock-date"style="color:var(--muted);display:block;margin-top:4px">${new Date().toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long"})}</small>
 </div>
 <div class="card card-compact">
 <h3 style="margin:0 0 8px"> Kalender</h3>
 <div id="miniKalenderWrap">${miniKalender}</div>
 </div>
 </div>
 ${(()=>{ensureGlobalClock();return"";})()}
 <div class="card"style="margin-top:16px;margin-bottom:16px">
 <div class="kicker">STUNDENPLAN</div>
 <h2 style="margin-top:4px">Aktueller Stundenplan</h2>
 ${webUntisEmbedHTML(300)}
 <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
 <input id="quickWpInput"type="text"maxlength="140"placeholder="Was steht diese Woche an? Kurz eintragen …"style="flex:1;min-width:220px">
 <button class="primary"onclick="quickAddWochenplan()">＋ Zur Wochenplanung</button>
 <button class="secondary"onclick="go('kompass')">Ausführlicher planen →</button>
 </div>
 ${wochenplan.length?`<div class="list"style="margin-top:10px">${wochenplan.filter(w=>!w.done).slice(0,3).map(w=>`<div class="list-item"><div><strong>${esc(w.title)}</strong>${w.subject?`<small>${esc(F12SB_FAECHER.find(f=>f.key===w.subject)?.label||"")}</small>`:""}</div><span class="pill">${w.scope==="monat"?"Monat":"Woche"}</span></div>`).join("")}</div>`:""}
 </div>
 <div class="card"style="margin-bottom:16px;text-align:center;border-left:4px solid #3fa66a">
 <h2 style="margin:0 0 8px"> FOSBOS-WM Jahresfokus: Solidarität und Zusammenhalt</h2>
 <p style="margin:0;font-style:italic;color:var(--muted)">„Solidarität lebt von kleinen Taten – heute schon jemandem geholfen?“</p>
 </div>
 ${pageHead("ÜBERSICHT","Unser Campus","Die wichtigsten Bereiche auf einen Blick.",newsAction)}
 <div class="grid grid-4">
 ${tile(" ","Campus-Kompass","Dein persönlicher Lern- und Projektüberblick.","kompass","#1688cf")}
 ${tile(" ","Lernwerkstatt","Lernaufträge, Methoden, Tools und KI.","lernwerkstatt","#e0a324")}
 ${tile(" ","Campus-Forum","Austauschen, fragen, helfen und gemeinsam denken.","forum","#1a9b8e")}
 ${tile(" ","Projekte","Projektteams, Ziele, Fortschritt und Ergebnisse.","projekte","#7c5cbf")}
 ${tile(" ","Kompetenzwerkstatt","Kompetenzen sichtbar machen und entwickeln.","kompetenz","#3fa66a")}
 ${tile(" ","Lernjournal","Lernweg, Reflexionen und nächste Schritte.","journal","#d24d76")}</div>
</div>${footer()}`;
}
async function getRecentForumActivityCount(days){
 try{
 const posts=await getCollection("posts","createdAt",true);
 const cutoff=Date.now()-days*86400000;
 return posts.filter(p=>{
 const t=p.createdAt?.seconds?p.createdAt.seconds*1000:0;
 return t>=cutoff;
 }).length;
 }catch(e){return 0}
}

function printNotenPDF(noten,bestehen){
 const win=window.open("","_blank","width=800,height=800");
 if(!win){toast("Das PDF-Fenster wurde vom Browser blockiert. Bitte Pop-ups erlauben.");return}
 const fmt=(fach,hj)=>{const erg=berechneHalbjahresergebnis(noten,fach,hj);const sa=schulaufgabenListe(noten,fach,hj).length,so=sonstigeListe(noten,fach,hj).length;return erg===null?"—":`${erg} Punkte (${sa} SA, ${so} sonst.)`};
 const rows=F12SB_FAECHER.map(f=>`<tr><td>${escPDF(f.label)}</td><td>${fmt(f.key,"hj1")}</td><td>${fmt(f.key,"hj2")}</td></tr>`).join("");
 win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Meine Noten – F12Sb</title>
 <style>
 @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.55;margin:0}
 h1{font-size:24px;margin:0 0 4px}.meta{color:#666;font-size:12px;margin-bottom:20px}
 table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}
 th{background:#f3f3f3}.status{background:#f3f3f3;border-radius:8px;padding:12px;font-size:13px;margin-top:10px}
 .disclaimer{font-size:11px;color:#777;margin-top:16px}
 .print-note{background:#f3f3f3;padding:10px;border-radius:8px;margin-bottom:20px;font-size:12px}
 @media print{.print-note{display:none}}
 </style></head><body>
 <div class="print-note">Persönliche Notenübersicht. Im Druckdialog „Als PDF sichern“ auswählen.</div>
 <h1>Meine Noten – F12Sb</h1>
 <div class="meta">Punkte 0–15 je Fach und Halbjahr</div>
 <table><thead><tr><th>Fach</th><th>HJ1</th><th>HJ2</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="status">
 <strong>${!bestehen.vollJahr?"Jahresergebnis: noch nicht alle Noten eingetragen.":bestehen.jahr.imRahmen?"Zulassungs-Orientierung: im Rahmen von §35 Abs. 9 FOBOSO.":"Achtung: Punktlage könnte die Zulassung zur Abschlussprüfung gefährden."}</strong>
 </div>
 <p class="disclaimer">Diese Berechnung ist ausschließlich eine Orientierungshilfe nach §21, §35 Abs. 9 FOBOSO – ohne Gewähr. Die vollständige Fachabitur-Berechnung übernimmt der offizielle Streichvorschlag-Rechner eurer Schule.</p>
 <script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>
 </body></html>`);
 win.document.close();
}
function printWochenplanPDF(entries){
 const win=window.open("","_blank","width=800,height=800");
 if(!win){toast("Das PDF-Fenster wurde vom Browser blockiert. Bitte Pop-ups erlauben.");return}
 const rows=entries.map(w=>`<tr><td>${w.done?"✓":""}</td><td>${escPDF(w.title)}</td><td>${w.subject?escPDF(F12SB_FAECHER.find(f=>f.key===w.subject)?.label||""):"—"}</td><td>${w.scope==="monat"?"Monat":"Woche"}</td><td>${escPDF(w.dueDate||"—")}</td></tr>`).join("");
 win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Wochenplanung – F12Sb</title>
 <style>
 @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.55;margin:0}
 h1{font-size:24px;margin:0 0 16px}
 table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}
 th{background:#f3f3f3}
 .print-note{background:#f3f3f3;padding:10px;border-radius:8px;margin-bottom:20px;font-size:12px}
 @media print{.print-note{display:none}}
 </style></head><body>
 <div class="print-note">Persönliche Wochen-/Monatsplanung. Im Druckdialog „Als PDF sichern“ auswählen.</div>
 <h1>Meine Wochen-/Monatsplanung – F12Sb</h1>
 <table><thead><tr><th>Erl.</th><th>Was steht an</th><th>Fach</th><th>Zeitraum</th><th>Termin</th></tr></thead><tbody>${rows||"<tr><td colspan=5>Noch keine Einträge.</td></tr>"}</tbody></table>
 <script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>
 </body></html>`);
 win.document.close();
}
window.printNotenPDF=printNotenPDF;window.printWochenplanPDF=printWochenplanPDF;

async function renderKompass(){
 const tasks=await getCollection("tasks","deadline",false), projects=await getCollection("projects");
 const projectDeadlines=projects.filter(p=>p.deadline).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)));
 const todayStr=new Date().toISOString().slice(0,10);
 const [unreadCount,forumActivity,wochenplan,noten]=await Promise.all([
 getUnreadMessageCount().catch(()=>0),
 getRecentForumActivityCount(3),
 getMeineWochenplanung(),
 getMeineNoten()
 ]);
 const bestehen=berechneBestehen(noten);
 const offenePlanung=wochenplan.filter(w=>!w.done);
 const erledigtePlanung=wochenplan.filter(w=>w.done);

 return`${pageHead("PERSÖNLICH","Mein Campus-Kompass","Dein persönlicher Überblick über Stundenplan, Aufgaben, Noten und Projekte.",`<button class="primary"onclick="openTaskForm()">＋ Aufgabe</button>`)}

 ${(unreadCount>0||forumActivity>0)?`<div class="kompass-alerts">
 ${unreadCount>0?`<a href="#forum-nachrichten"class="pill kompass-alert-msg"> ${unreadCount} neue Nachricht${unreadCount===1?"":"en"}</a>`:""}
 ${forumActivity>0?`<a href="#forum-board"class="pill kompass-alert-forum"> ${forumActivity} neue${forumActivity===1?"r":""} Forum-Beitrag${forumActivity===1?"":"e"} (3 Tage)</a>`:""}
 </div>`:""}

 <div class="kicker"style="margin-top:6px">ORIENTIERUNG</div>
 <div class="card"style="margin-top:8px">
 <h2 style="margin-top:0"> Aktueller Stundenplan</h2>
 ${webUntisEmbedHTML(360)}
 </div>

 <div class="kicker"style="margin:22px 0 8px">WOCHEN-/MONATSPLANUNG</div>
 <div class="card">
 <p style="color:var(--muted);margin-top:0">Orientiere dich am Stundenplan oben: Was steht diese Woche oder diesen Monat an? Nur du siehst deine eigene Planung.</p>
 <div class="form-actions"style="margin-bottom:10px">
 <button class="primary"onclick="openWochenplanForm(null)">＋ Neuer Planungspunkt</button>
 ${wochenplan.length?`<button class="secondary"onclick="printWochenplanPDF(${JSON.stringify(wochenplan).replace(/"/g,"&quot;")})"> Als PDF</button>`:""}
 </div>
 <div class="list">${offenePlanung.map(w=>`<div class="list-item">
 <div><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox"onclick="toggleWochenplanDone('${w.id}',${!!w.done})"><strong>${esc(w.title)}</strong></label>
 <small>${w.subject?esc(F12SB_FAECHER.find(f=>f.key===w.subject)?.label||""):"Kein Fach"} ${w.dueDate?"· "+esc(fmtDateOnly(w.dueDate)):""}</small></div>
 <div style="display:flex;gap:6px;align-items:center"><span class="pill">${w.scope==="monat"?"Monat":"Woche"}</span><button class="secondary"onclick="openWochenplanForm(${JSON.stringify(w).replace(/"/g,"&quot;")})">Bearbeiten</button></div>
 </div>`).join("")||`<div class="empty">Noch nichts geplant. Leg deinen ersten Punkt an.</div>`}</div>
 ${erledigtePlanung.length?`<details style="margin-top:10px"><summary style="cursor:pointer;color:var(--muted);font-size:13px">${erledigtePlanung.length} erledigt</summary>
 <div class="list"style="margin-top:8px">${erledigtePlanung.map(w=>`<div class="list-item"style="opacity:.6"><div><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox"checked onclick="toggleWochenplanDone('${w.id}',${!!w.done})"><strong style="text-decoration:line-through">${esc(w.title)}</strong></label></div><button class="secondary"onclick="deleteWochenplanEntry('${w.id}')">Löschen</button></div>`).join("")}</div>
 </details>`:""}
 </div>

 <div class="kicker"style="margin:22px 0 8px">PERSÖNLICH · NUR FÜR DICH SICHTBAR</div>
 <div class="card">
 <h2 style="margin-top:0"> Meine Noten</h2>
 <p style="color:var(--muted);font-size:12px">Halbjahresergebnis nach § 21 Abs. 1 FOBOSO. Diese Ansicht sieht ausschließlich du selbst, nicht einmal Lehrkräfte.</p>

 <div class="noten-split">
 <div class="noten-eintragen-kachel">
 <strong style="display:block;font-size:13px;margin-bottom:8px"> Note eintragen</strong>
 <label style="font-size:11px">Fach<select id="notenSchnellFach">
 ${F12SB_FAECHER.map(f=>`<option value="${f.key}">${f.label}</option>`).join("")}
 </select></label>
 <label style="font-size:11px;margin-top:8px;display:block">Halbjahr<select id="notenSchnellHj">
 <option value="hj1">1. Halbjahr</option>
 <option value="hj2">2. Halbjahr</option>
 </select></label>
 <button class="primary"style="margin-top:10px;width:100%"onclick="openNotenSchnellzugriff()">Öffnen →</button>
 </div>

 <div class="noten-uebersicht">
 <div style="overflow-x:auto"><table class="noten-table noten-table-kompakt">
 <thead><tr><th>Fach</th><th>HJ1</th><th>HJ2</th></tr></thead>
 <tbody>
 ${F12SB_FAECHER.map(f=>{
 const erg1=berechneHalbjahresergebnis(noten,f.key,"hj1");
 const erg2=berechneHalbjahresergebnis(noten,f.key,"hj2");
 const w1=alleEinzelwerte(noten,f.key,"hj1");
 const w2=alleEinzelwerte(noten,f.key,"hj2");
 const zelle=(erg,w)=>{
 if(!w.length)return"–";
 const werte=w.map(x=>`${x.value}<sup title="${x.muendlich?"mündlich":"schriftlich"}">${x.muendlich?"m":"s"}</sup>`).join(", ");
 return erg!==null?`<strong>${erg}</strong><br><small style="font-weight:400">(${werte})</small>`:werte;
 };
 return`<tr><td>${f.label}</td>
 <td><button type="button"class="secondary noten-cell-btn"onclick="openNotenDetail('${f.key}','hj1')">${zelle(erg1,w1)}</button></td>
 <td><button type="button"class="secondary noten-cell-btn"onclick="openNotenDetail('${f.key}','hj2')">${zelle(erg2,w2)}</button></td>
 </tr>`;
 }).join("")}
 </tbody></table></div>
 <p style="font-size:10px;color:var(--muted);margin:6px 0 0">Fett = Halbjahresergebnis nach FOBOSO (braucht Schulaufgabe UND sonstige Leistungen). In Klammern: die einzelnen Werte, <sup>s</sup> = schriftlich, <sup>m</sup> = mündlich.</p>
 <div class="form-actions"style="margin-top:10px">
 <button class="secondary"onclick="resetMeineNoten()">Zurücksetzen</button>
 <button class="secondary"onclick="printNotenPDF(${JSON.stringify(noten).replace(/"/g,"&quot;")},${JSON.stringify(bestehen).replace(/"/g,"&quot;")})"> PDF</button>
 </div>
 </div>
 </div>

 <div class="grid grid-2"style="margin-top:16px;gap:12px">
 <details class="noten-collapsible">
 <summary> Jahresergebnis je Fach</summary>
 <div class="notice">
 ${!bestehen.vollJahr?`<p style="margin:0">Trag alle Noten beider Halbjahre ein, um deinen endgültigen Stand zu sehen.</p>`
 :`<strong style="font-size:15px">${bestehen.jahr.imRahmen?" Zulassungs-Orientierung: im Rahmen von §35 Abs. 9 FOBOSO":" Achtung: Punktlage könnte die Zulassung zur Abschlussprüfung gefährden"}</strong>`}
 <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">${wasFehltNochJahr(noten).map(x=>`<div class="card"style="padding:8px 10px;background:${x.status==="ok"?"var(--soft-green)":x.status==="kritisch"?"var(--soft-orange)":x.status==="ungenuegend"?"#fbdada":"#f7fafc"}"><strong style="font-size:12px">${esc(x.label)}</strong><small style="display:block">${esc(x.text)}</small></div>`).join("")}</div>
 <p style="margin-top:14px;font-size:11px;color:var(--muted)">Orientierungshilfe nach §21, §35 Abs. 9 FOBOSO – <strong>ohne Gewähr</strong>. Die vollständige Fachabitur-Berechnung (25 Halbjahresergebnisse, 4 dreifach gewichtete Prüfungen, §35 Abs. 6 FOBOSO) mit optimalem Streichvorschlag leistet diese Übersicht bewusst nicht – dafür nutzt eure Schule den offiziellen Streichvorschlag-Rechner (z. B. der Beruflichen Oberschule Traunstein).</p>
 </div>
 </details>
 <details class="noten-collapsible">
 <summary> So wird die Fachabiturnote berechnet</summary>
 <div class="notice">
 <p style="margin:0"><strong>Kurz erklärt (§21, §31, §35 FOBOSO):</strong></p>
 <ul style="margin:8px 0 0;padding-left:18px;font-size:12px;color:var(--muted);line-height:1.6">
 <li>Je Halbjahr: Durchschnitt der sonstigen Leistungen + Schulaufgabe(n), geteilt durch die Anzahl der eingerechneten Werte.</li>
 <li>Eingebracht werden 25 Halbjahresergebnisse aus 12/2, 12/1 und 11/2 (11/1 nur bei reinen 11.-Klasse-Fächern) – maximal ein Ergebnis pro Fach darf gestrichen werden.</li>
 <li>Dazu kommen 4 Prüfungsleistungen (dreifach gewichtet) und (aus der 11. Klasse) die fachpraktische Ausbildung.</li>
 <li>Zulassung zur Abschlussprüfung: höchstens 2 Gesamtergebnisse mit 1–3 Punkten bzw. 1 mit 0 Punkten, bei kritischer Punktlage zusätzlich eine Mindestsumme von 200–240 Punkten.</li>
 <li>Durchschnittsnote: S = 17/3 − 5·E/M (E = erreichte Punktsumme, M = 600 Punkte höchstmöglich).</li>
 </ul>
 <p style="margin-top:12px;font-size:11px;color:var(--muted)">Das ist eine vereinfachte Orientierung – die exakte, optimale Berechnung (inkl. Streichvorschlag) übernimmt der offizielle Rechner eurer Schule.</p>
 </div>
 </details>
 </div>
 </div>

 <div class="kicker"style="margin:22px 0 8px">AUFGABEN & PROJEKTE</div>
 <div class="grid grid-3"><div class="card stat"><b>${tasks.filter(t=>t.ownerUid===currentUser.uid).length}</b><span>Meine
Aufgaben</span></div><div class="card stat"><b>${projects.length}</b><span>Projekte</span></div><div class="card stat">
<b>${profile?.role==="teacher"?"Lehrkraft":profile?.role==="admin"?"Admin":"Schüler/in"}</b><span>Rolle</span></div></div>
 <div class="grid grid-3"style="margin-top:12px">
 <button type="button"class="card tile-square"style="background:#fff;border:2px solid #4a90d9"onclick="openMeineAufgabenModal()">
 <span class="emoji"></span><strong>Meine Aufgaben</strong><small>${tasks.filter(t=>t.ownerUid===currentUser.uid).length} offen</small>
 </button>
 <button type="button"class="card tile-square"style="background:#fff;border:2px solid #9b59b6"onclick="openProjektFristenModal()">
 <span class="emoji"></span><strong>Meine Projektfristen</strong><small>${projectDeadlines.length} Termine</small>
 </button>
 <button type="button"class="card tile-square"style="background:#fff;border:2px solid #1a9b8e"onclick="openAktuelleProjekteModal()">
 <span class="emoji"></span><strong>Meine Projekte</strong><small>${projects.length} Projekte</small>
 </button>
 </div>
</div>${footer()}`;
}
async function openMeineAufgabenModal(){
 let tasks=[];
 try{tasks=await getCollection("tasks","deadline",false)}catch(e){}
 const meine=tasks.filter(t=>t.ownerUid===currentUser.uid);
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">MEIN KOMPASS</div><h2> Meine Aufgaben</h2>
 <div class="list">${meine.map(taskHTML).join("")||`<div class="empty"><strong>Noch keine Aufgaben</strong>Lege deine erste Aufgabe an.</div>`}</div>
 <div class="form-actions"style="margin-top:14px"><button class="primary"onclick="closeModal();openTaskForm()">＋ Aufgabe</button><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
}
async function openProjektFristenModal(){
 let projects=[];
 try{projects=await getCollection("projects")}catch(e){}
 const todayStr=new Date().toISOString().slice(0,10);
 const projectDeadlines=projects.filter(p=>p.deadline).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)));
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">MEIN KOMPASS</div><h2> Meine Projektfristen</h2>
 <p style="color:var(--muted);font-size:12px">Dein persönlicher Überblick über Projekt-Abgabetermine – erscheint bewusst nicht im allgemeinen Campus-Kalender.</p>
 <div class="list">${projectDeadlines.map(p=>{
 const overdue=String(p.deadline)<todayStr;
 return`<div class="list-item"><div><strong>${esc(p.title)}</strong><small>${esc(p.team||"")}</small></div><span class="pill${overdue?"":"green"}">${overdue?"überfällig · ":""}${esc(fmtDateOnly(p.deadline))}</span></div>`;
 }).join("")||`<div class="empty">Noch keine Projekt-Fristen eingetragen.</div>`}</div>
 <div class="form-actions"style="margin-top:14px"><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
}
async function openAktuelleProjekteModal(){
 let projects=[];
 try{projects=await getCollection("projects")}catch(e){}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">MEIN KOMPASS</div><h2> Meine Projekte</h2>
 <div class="list">${projects.map(p=>`<div class="list-item"><div><strong>${esc(p.title)}</strong><small>${esc(p.team||"")} · ${esc(p.partner||"")}</small></div><span class="pill">${Number(p.progress||0)}%</span></div>`).join("")||`<div class="empty">Noch keine Projekte.</div>`}</div>
 <div class="form-actions"style="margin-top:14px"><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
}
window.openMeineAufgabenModal=openMeineAufgabenModal;
window.openProjektFristenModal=openProjektFristenModal;
window.openAktuelleProjekteModal=openAktuelleProjekteModal;
function taskHTML(t){return`<div class="list-item"><div><strong>${esc(t.title)}</strong><small>Verantwortlich:
${esc(t.ownerName||"")} · Deadline: ${esc(t.deadline||"—")} · Nächster Schritt: ${esc(t.next||"—")}</small></div><div
class="traffic">${statusDot(t.status)}<span class="pill">${statusLabel[t.status]||"—"}</span>${(t.createdBy===currentUser.uid||isTeacher())?`<button type="button"class="secondary"style="padding:4px 8px;margin-left:6px"onclick="deleteTask('${t.id}')"title="Aufgabe löschen">✕</button>`:""}</div></div>`}
async function deleteTask(id){
 if(!confirm("Diese Aufgabe wirklich löschen?"))return;
 try{
 await deleteDoc(doc(db,"tasks",id));
 await render();
 toast("Aufgabe gelöscht.");
 }catch(e){
 console.error("Aufgabe löschen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Löschen. Bitte die Firestore-Regeln prüfen.":"Konnte nicht gelöscht werden.");
 }
}
window.deleteTask=deleteTask;

// ---- Klassenübersicht für Lehrkräfte: Lehrplan-Fortschritt + Ampel je LB --
function ampelDotHTML(status){
 if(status===null)return`<span class="ampel-dot ampel-none"title="Noch keine Daten"></span>`;
 const color=status==="green"?"#3fa66a":status==="yellow"?"#e0a324":"#d9534f";
 return`<span class="ampel-dot"style="background:${color}"title="${status==="green"?"gut":status==="yellow"?"teilweise":"braucht Unterstützung"}"></span>`;
}
async function openLehrplanKlassenuebersicht(fach){
 if(!isTeacher()){toast("Nur Lehrkräfte können die Klassenübersicht öffnen.");return}
 const fachLbl=F12SB_FAECHER.find(f=>f.key===fach)?.label||fach;
 const wochenGesamt=(LEHRPLAN_WOCHEN[fach]||[]).length;
 let students=[],fortschrittDocs=[],lsTasks=[],allAttempts=[];
 try{
 [students,fortschrittDocs,lsTasks,allAttempts]=await Promise.all([
 getAllUsersForLernstand(),
 getDocs(query(collection(db,"lehrplanFortschritt"),where("fach","==",fach))).then(s=>s.docs.map(d=>d.data())),
 getLernstandTasks(),
 getAllLernstandAttempts()
 ]);
 }catch(e){console.error("Klassenübersicht laden:",e);toast("Konnte nicht geladen werden.");return}

 const tasksByLb={1:[],2:[],3:[],4:[]};
 lsTasks.forEach(t=>{const n=t.learningArea?.match(/\d/)?.[0];if(n&&tasksByLb[n])tasksByLb[n].push(t)});

 function ampelFuerSchueler(uid,lbNum){
 const relevantIds=tasksByLb[lbNum].map(t=>t.id);
 const relevant=allAttempts.filter(a=>a.uid===uid&&relevantIds.includes(a.taskId));
 if(!relevant.length)return null;
 const neuesterProAufgabe={};
 relevant.forEach(a=>{if(!neuesterProAufgabe[a.taskId]||a.attempt>neuesterProAufgabe[a.taskId].attempt)neuesterProAufgabe[a.taskId]=a});
 const werte=Object.values(neuesterProAufgabe);
 const maxSum=werte.reduce((s,a)=>s+lernstandMaxPoints(a.taskId),0);
 const totalSum=werte.reduce((s,a)=>s+(a.total||0),0);
 return maxSum>0?lernstandStatus(totalSum,maxSum):null;
 }

 const rows=students.map(s=>{
 const abgeschlossen=fortschrittDocs.filter(f=>f.uid===s.uid&&f.abgeschlossen).length;
 const ampeln=[1,2,3,4].map(n=>ampelFuerSchueler(s.uid,n));
 return{s,abgeschlossen,ampeln};
 });

 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker"> KLASSENÜBERSICHT · NUR LEHRKRÄFTE</div>
 <h2>${esc(fachLbl)} – Fortschritt der Klasse</h2>
 <p style="color:var(--muted);font-size:12px">Lehrplan-Fortschritt (abgeschlossene Wochen im Lernpfad) und Ampel-Status je Lernbereich, basierend auf den Lernstandsmessungen.</p>
 <div style="overflow-x:auto"><table class="ls-matrix">
 <thead><tr><th>Schüler:in</th><th>Wochen</th><th>LB 1</th><th>LB 2</th><th>LB 3</th><th>LB 4</th></tr></thead>
 <tbody>${rows.map(r=>`<tr>
 <td>${esc(r.s.displayName||r.s.email||"Schüler/in")}</td>
 <td>${r.abgeschlossen} / ${wochenGesamt}</td>
 ${r.ampeln.map(a=>`<td style="text-align:center">${ampelDotHTML(a)}</td>`).join("")}
 </tr>`).join("")||`<tr><td colspan="6">Keine Schüler:innen gefunden.</td></tr>`}</tbody>
 </table></div>
 <p style="font-size:11px;color:var(--muted);margin-top:10px"><span class="ampel-dot"style="background:#3fa66a"></span> gut &nbsp; <span class="ampel-dot"style="background:#e0a324"></span> teilweise &nbsp; <span class="ampel-dot"style="background:#d9534f"></span> braucht Unterstützung &nbsp; <span class="ampel-dot ampel-none"></span> noch keine Daten</p>
 <div class="form-actions"style="margin-top:14px"><button class="secondary"onclick="closeModal()">Schließen</button></div>
 `);
}
window.openLehrplanKlassenuebersicht=openLehrplanKlassenuebersicht;

async function renderFaecherUebersicht(){
 return`${pageHead("LEHRPLAN & LERNINHALTE","Fächer 12. Klasse","Wähle ein Fach, um den Lehrplan-Zeitstrahl mit Themen, Aufträgen und Material zu öffnen.","")}
 <div class="grid grid-4">${F12SB_FAECHER.map(f=>{
 const wochen=LEHRPLAN_WOCHEN[f.key]||[];
 const c=personColor(f.key);
 return`<button class="card tile"style="background:${c.bg};border-left:4px solid ${c.border};text-align:left"onclick="openFach('${f.key}')">
 <strong style="font-size:15px;color:${c.text}">${f.label}</strong>
 <small style="display:block;margin-top:6px">${wochen.length?`${wochen.length} Lehrplan-Wochen hinterlegt`:"Lehrplan-Zeitstrahl folgt"}</small>
 </button>`;
 }).join("")}</div>
 ${footer()}`;
}

async function renderFachDetail(){
 if(!activeFach)return await renderFaecherUebersicht();
 const fach=F12SB_FAECHER.find(f=>f.key===activeFach);
 const timeline=combinedTimeline(activeFach);
 const wochenItems=timeline.filter(t=>t.kind==="woche");
 const fortschritte=await Promise.all(wochenItems.map(async w=>({id:w.id,f:await getLehrplanFortschritt(w.id)})));
 const fortschrittMap={};fortschritte.forEach(x=>fortschrittMap[x.id]=x.f);
 const heute=new Date().toISOString().slice(0,10);
 const erledigtCount=wochenItems.filter(w=>fortschrittMap[w.id]?.abgeschlossen).length;
 const fortschrittProzent=wochenItems.length?Math.round(erledigtCount/wochenItems.length*100):0;
 const naechsteIdx=timeline.findIndex(item=>item.kind==="woche"&&!fortschrittMap[item.id]?.abgeschlossen);

 return`<button class="secondary"onclick="closeFach()">← Zurück zu den Fächern</button>
 ${pageHead("LERNPFAD",fach?.label||"Fach",`Dein Weg durchs Schuljahr – ${erledigtCount} von ${wochenItems.length} Wochen geschafft.`,isTeacher()?`<button class="secondary"onclick="openLehrplanKlassenuebersicht('${activeFach}')"> Klassenübersicht</button>`:"")}
 <style>
 .lernpfad{position:relative;margin:20px 0 10px;padding-left:44px}
 .lp-linie-hinter{position:absolute;left:20px;top:6px;bottom:6px;width:5px;background:#e2eaf0;border-radius:3px}
 .lp-linie-vorne{position:absolute;left:20px;top:6px;width:5px;background:linear-gradient(180deg,#3fa66a,#5cc98a);border-radius:3px;transition:height .4s}
 .lp-node{position:relative;margin-bottom:20px}
 .lp-punkt{position:absolute;left:-44px;top:0;width:40px;height:40px;border-radius:50%;background:#fff;border:3px solid #b8c4cc;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;z-index:2;transition:.2s}
 .lp-punkt.lp-done{background:#3fa66a;border-color:#3fa66a;color:#fff}
 .lp-punkt.lp-projekt{border-color:#3fa66a;color:#3fa66a}
 .lp-punkt.lp-einzel{border-color:#e0a324;color:#e0a324}
 .lp-punkt.lp-aktuell{transform:scale(1.15);box-shadow:0 0 0 5px rgba(22,136,207,.25)}
 .lp-karte{background:#fff;border:1px solid var(--line,#e2eaf0);border-radius:14px;padding:14px 16px;cursor:pointer;transition:.15s}
 .lp-karte:hover{transform:translateX(4px);box-shadow:0 6px 16px rgba(23,56,79,.1)}
 .lp-karte-date{font-size:11px;color:var(--muted)}
 .lb-badge{font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;border:1.5px solid;white-space:nowrap}
 .lp-karte strong{display:block;font-size:13px;margin-top:2px}
 .lp-karte small{display:block;color:var(--muted);font-size:11px;margin-top:4px;line-height:1.4}
 .lp-typ-pill{margin-top:8px;display:inline-block;font-size:10px}
 .lp-legende{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px;padding:10px 14px;background:#f7fafc;border-radius:10px;font-size:11px;color:var(--muted)}
 .lp-legende-item{display:flex;align-items:center;gap:6px}
 .lp-legende-dot{width:14px;height:14px;border-radius:50%;border:2px solid;display:inline-block;flex:0 0 auto}
 .lp-legende-raute{border-radius:4px;transform:rotate(45deg);width:12px;height:12px;font-size:7px;display:flex;align-items:center;justify-content:center}
 .lp-legende-raute i{transform:rotate(-45deg);font-style:normal}
 .lp-waypoint{position:relative;margin:26px 0}
 .lp-waypoint-punkt{position:absolute;left:-44px;top:0;width:40px;height:40px;border-radius:10px;background:var(--soft-blue);border:3px solid #4a90d9;display:flex;align-items:center;justify-content:center;font-size:17px;transform:rotate(45deg);z-index:2}
 .lp-waypoint-punkt span{transform:rotate(-45deg);display:block}
 .lp-waypoint-karte{background:var(--soft-blue);border-radius:12px;padding:10px 14px;font-size:12px;cursor:pointer;transition:.15s}
 .lp-waypoint-karte:hover{transform:translateX(4px)}
 .lp-waypoint-karte strong{display:block;font-size:12.5px}
 .lp-block-head{position:relative;margin:30px 0 14px;padding-left:2px}
 .lp-block-head::before{content:"";position:absolute;left:-44px;top:50%;width:24px;height:2px;background:#b8c4cc}
 .lp-block-head strong{font-size:13px;color:#17384f;text-transform:uppercase;letter-spacing:.03em}
 .lp-block-head small{color:var(--muted);margin-left:6px}
 @media(max-width:600px){.lernpfad{padding-left:38px}.lp-punkt,.lp-waypoint-punkt{left:-38px;width:34px;height:34px}.lp-block-head::before{left:-38px;width:20px}}
 </style>
 <div class="lp-legende">
 <span class="lp-legende-item"><span class="pill"style="background:#3fa66a;color:#fff;font-size:10px"> Projekt</span></span>
 <span class="lp-legende-item"><span class="pill"style="background:#e0a324;color:#fff;font-size:10px"> Einzelthema</span></span>
 </div>
 <div class="lp-legende"style="margin-top:6px">
 ${[1,2,3,4].map(n=>`<span class="lp-legende-item"><span class="lb-badge"style="background:${LERNBEREICH_FARBEN[n].bg};border-color:${LERNBEREICH_FARBEN[n].border};color:${LERNBEREICH_FARBEN[n].text}">Lernbereich ${n}</span></span>`).join("")}
 </div>
 <div class="lernpfad">
 <div class="lp-linie-hinter"></div>
 <div class="lp-linie-vorne"style="height:${fortschrittProzent}%"></div>
 ${(()=>{let lastBlock=null;return timeline.map((item,idx)=>{
 const block=findUnterrichtsblock(activeFach,item.start);
 let blockHeadHTML="";
 if(block&&block.id!==lastBlock){
 blockHeadHTML=`<div class="lp-block-head"><strong>${esc(block.titel)}</strong><small>${esc(block.stunden)} Std.</small></div>`;
 lastBlock=block.id;
 }
 const fortschritt=fortschrittMap[item.id]||{abgeschlossen:false};
 const aktuell=idx===naechsteIdx;
 return`${blockHeadHTML}<div class="lp-node">
 <div class="lp-punkt lp-${item.typ}${fortschritt.abgeschlossen?" lp-done":""}${aktuell?" lp-aktuell":""}">${fortschritt.abgeschlossen?"✓":item.typ==="projekt"?"":""}</div>
 <div class="lp-karte"style="border-top:4px solid ${lernbereichAkzentfarbe(item.lb)}"onclick="openWocheDetail('${activeFach}','${item.id}')">
 <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
 ${lernbereichBadgeHTML(item.lb)}
 <span class="lp-karte-date">${esc(fmtDateOnly(item.start))}–${esc(fmtDateOnly(item.end))}</span>
 </div>
 <strong>${esc(item.thema)}</strong>
 <small>${esc(item.planung.slice(0,90))}${item.planung.length>90?"…":""}</small>
 <span class="pill lp-typ-pill"style="background:${item.typ==="projekt"?"#3fa66a":"#e0a324"};color:#fff">${item.typ==="projekt"?" Projekt":" Einzelthema"}</span>
 </div>
 </div>`;
 }).join("")})()||`<div class="empty"><strong>Für dieses Fach ist noch kein Lernpfad hinterlegt.</strong>Sobald die Jahresplanung vorliegt, erscheinen hier die einzelnen Stationen.</div>`}
 </div>
 ${footer()}`;
}
window.renderFaecherUebersicht=renderFaecherUebersicht;

// ---- Wochen-Detail: Auftrag/Ziele, Material, Team, Hilfe, Produkte, Lernstand
function showWocheTab(tabId){
 document.querySelectorAll(".wd-panel").forEach(el=>el.style.display=el.id===`wdPanel_${tabId}`?"block":"none");
 document.querySelectorAll(".wd-tab").forEach(el=>el.classList.toggle("wd-tab-active",el.dataset.tab===tabId));
}
window.showWocheTab=showWocheTab;

async function openWocheDetail(fach,wocheId){
 const woche=lehrplanWocheById(fach,wocheId);
 if(!woche){toast("Diese Woche wurde nicht gefunden.");return}
 const [auftrag,materialien,teams,produkte,fortschritt,lsTasks,lsAttempts]=await Promise.all([
 getLehrplanAuftrag(wocheId),getLehrplanMaterialien(wocheId),getLehrplanTeams(wocheId),
 getLehrplanProdukte(wocheId),getLehrplanFortschritt(wocheId),
 getLernstandTasks().catch(()=>[]),getMyLernstandAttempts().catch(()=>[])
 ]);
 // Verknüpfung mit der Lernstandsmessung: dieselben Aufgaben, gefiltert
 // nach dem Lernbereich dieser Woche (z. B. "LB 3" → "lb3"). Kein eigener
 // Datentopf – Ergebnisse und Versuche sind automatisch synchron, weil es
 // exakt dieselbe Datenquelle wie unter Lernwerkstatt → Lernstandsmessung ist.
 const wocheLbKeys=(woche.lb||"").match(/\d/g)?.map(n=>"lb"+n)||[];
 const relevanteTasks=lsTasks.filter(t=>wocheLbKeys.includes(t.learningArea));
 const lernstandBearbeitet=relevanteTasks.some(t=>lernstandAttemptCount(lsAttempts,t.id)>0);
 const ziele=(LEHRPLAN_ZIELE_VORSCHLAG[wocheId]||[]).map((text,i)=>({id:`z${i}`,text}));
 const alleErfuellt=ziele.length>0 && ziele.every(z=>fortschritt.zieleErfuellt?.[z.id]);
 const meinTeam=teams.find(t=>(t.mitgliederUids||[]).includes(currentUser.uid));
 const fachLbl=F12SB_FAECHER.find(f=>f.key===fach)?.label||fach;
 const meinProdukt=produkte.some(p=>p.uid===currentUser.uid);

 // Fortschritt: jeder Arbeitsschritt bekommt einen eigenen Haken, damit
 // jederzeit klar ist, wo genau man gerade steht.
 const schritte=[
 {label:"Auftrag gelesen",done:!!fortschritt.auftragGelesen,tab:"ziele"},
 {label:"Material erhalten",done:!!fortschritt.materialErhalten,tab:"material"},
 ...(woche.typ==="projekt"?[{label:"Team gebildet",done:!!meinTeam,tab:"team"}]:[]),
 {label:"Lernprodukt",done:meinProdukt,tab:"produkte"},
 {label:"Überprüfung",done:lernstandBearbeitet,tab:"lernstand"},
 {label:"Selbsteinschätzung",done:alleErfuellt,tab:"selbsteinschaetzung"},
 {label:"Fertig",done:!!fortschritt.abgeschlossen,tab:"selbsteinschaetzung"}
 ];
 let aktivIdx=schritte.findIndex(s=>!s.done);
 if(aktivIdx===-1)aktivIdx=schritte.length-1;
 const startTab=schritte[Math.min(aktivIdx,schritte.length-1)].tab;

 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">${esc(fachLbl)} · ${esc(woche.lb)} · ${esc(fmtDateOnly(woche.start))}–${esc(fmtDateOnly(woche.end))}</div>
 <h2>${esc(woche.thema)}</h2>
 <span class="pill"style="background:${woche.typ==="projekt"?"#3fa66a":"#e0a324"};color:#fff">${woche.typ==="projekt"?"Projektarbeit":"Selbstlern-/Eigenarbeit"}</span>
 <p style="margin-top:10px;color:var(--muted)">${esc(woche.planung)}</p>
 ${woche.praxis?`<div class="card"style="border-left:4px solid #4a90d9;margin-top:10px;padding:10px 12px"><strong style="font-size:12px"> Praxistransfer</strong><small style="display:block;margin-top:4px">${esc(woche.praxis)}</small></div>`:""}

 <div class="wd-stepper">
 ${schritte.map((s,i)=>`<div class="wd-step${s.done?" wd-step-done":""}${i===aktivIdx&&!s.done?" wd-step-aktiv":""}">
 <div class="wd-step-dot">${s.done?"✓":i+1}</div><small>${esc(s.label)}</small>
 </div>${i<schritte.length-1?`<div class="wd-step-line${schritte[i+1].done||s.done?" wd-step-line-done":""}"></div>`:""}`).join("")}
 </div>

 <div class="wd-tabs">
 <button type="button"class="wd-tab"data-tab="ziele"onclick="showWocheTab('ziele')"> Lernziele und Aufgaben</button>
 <button type="button"class="wd-tab"data-tab="material"onclick="showWocheTab('material')"> Lernmaterialien</button>
 <button type="button"class="wd-tab"data-tab="team"onclick="showWocheTab('team')"> ${woche.typ==="projekt"?"Team":"(Team)"}</button>
 <button type="button"class="wd-tab"data-tab="produkte"onclick="showWocheTab('produkte')"> Lernprodukte</button>
 <button type="button"class="wd-tab"data-tab="lernstand"onclick="showWocheTab('lernstand')"> Überprüfung des Lernstandes</button>
 <button type="button"class="wd-tab"data-tab="selbsteinschaetzung"onclick="showWocheTab('selbsteinschaetzung')"> Selbsteinschätzung</button>
 </div>

 <div class="wd-panel"id="wdPanel_ziele">
 <div class="wd-ziele-info">
 <strong> Lernziele laut Lehrplan</strong> <small>(${esc(woche.lb)}, LehrplanPLUS FOS 12 Pädagogik/Psychologie)</small>
 <ul>${ziele.map(z=>`<li>${esc(z.text)}</li>`).join("")||"<li>Für dieses Fach/diese Woche sind noch keine Lehrplan-Ziele hinterlegt.</li>"}</ul>
 </div>

 <h3 style="margin:18px 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:.02em;color:var(--muted)"> Konkreter Arbeitsauftrag</h3>
 <p style="font-size:11px;color:var(--muted);margin:0 0 10px">Von der Lehrkraft frei gestaltet – legt fest, WIE die Lernziele oben konkret bearbeitet werden.</p>
 ${isTeacher()?`<div class="form">
 <label>Titel<input id="auftragTitel"type="text"value="${esc(auftrag?.titel||"")}"placeholder="z. B. Fallanalyse Erziehungsstile"></label>
 <label>Beschreibung<textarea id="auftragBeschreibung"rows="4"placeholder="Was genau sollen die Schüler:innen tun?">${esc(auftrag?.beschreibung||"")}</textarea></label>
 <div class="form-actions">
 <button class="primary"onclick="saveLehrplanAuftrag('${fach}','${wocheId}')">Speichern</button>
 ${auftrag?`<button class="secondary"onclick="deleteLehrplanAuftrag('${auftrag.id}','${fach}','${wocheId}')">Löschen</button>`:""}
 </div>
 </div>`
 :!auftrag?`<div class="empty">Für diese Woche wurde noch kein Arbeitsauftrag eingetragen.</div>`
 :`<div class="card"style="border-left:4px solid #4a90d9"><strong>${esc(auftrag.titel)}</strong>${auftrag.beschreibung?`<p style="margin:6px 0 0;white-space:pre-wrap">${esc(auftrag.beschreibung)}</p>`:""}</div>`}
 ${!isTeacher()?`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:14px;font-weight:700;font-size:13px"><input type="checkbox"${fortschritt.auftragGelesen?"checked":""}onchange="toggleAuftragGelesen('${fach}','${wocheId}',this.checked)"><span> Auftrag gelesen, Ziele sind mir klar</span></label>`:""}
 <p style="font-size:11px;color:var(--muted);margin:16px 0 6px">Bevor es losgeht:</p>
 ${miniToolRow([["🧭","Lernpfad","lernpfad"],["🤔","Metakognition","metakognition"]])}
 </div>

 <div class="wd-panel"id="wdPanel_material">
 ${isTeacher()?`<div class="form"style="margin-bottom:12px">
 <div style="display:flex;gap:8px;flex-wrap:wrap">
 <select id="matKategorie">${MATERIAL_KATEGORIEN.map(k=>`<option value="${k.key}">${k.label}</option>`).join("")}</select>
 <input id="matTitel"type="text"placeholder="Titel"style="flex:1;min-width:140px">
 <input id="matUrl"type="url"placeholder="Link/URL"style="flex:1;min-width:160px">
 <button class="primary"onclick="addLehrplanMaterial('${fach}','${wocheId}')">＋ Hinzufügen</button>
 </div>
 </div>`:""}
 <div class="list">${materialien.map(m=>`<div class="list-item"style="flex-direction:column;align-items:stretch;gap:8px">
 <div style="display:flex;justify-content:space-between;align-items:center"><strong>${esc(MATERIAL_KATEGORIEN.find(k=>k.key===m.kategorie)?.label||m.kategorie)}: ${esc(m.titel)}</strong>${isTeacher()?`<button class="secondary"onclick="deleteLehrplanMaterial('${m.id}','${fach}','${wocheId}')">Löschen</button>`:""}</div>
 ${m.url?materialEmbedHTML(m):""}
 </div>`).join("")||`<div class="empty">Noch keine Lernmaterialien eingestellt.</div>`}</div>
 <p style="font-size:11px;color:var(--muted);margin-top:12px">Zum Bearbeiten des Materials:</p>
 ${miniToolRow([["🗂️","Karteikarten & Timer","lernwerkzeuge"],["🤖","KI zum Lernen","ki-lernen"],["🔗","Lernressourcen","ressourcen"],["⏱️","Uhr & Timer","uhr-timer"]])}
 ${!isTeacher()?`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:14px;font-weight:700;font-size:13px"><input type="checkbox"${fortschritt.materialErhalten?"checked":""}onchange="toggleMaterialErhalten('${fach}','${wocheId}',this.checked)"><span> Materialien erhalten/gesichtet</span></label>`:""}
 </div>

 <div class="wd-panel"id="wdPanel_team">
 <p style="color:var(--muted);margin-top:0">Team/Gruppe${woche.typ==="projekt"?" – für dieses Projekt vorgesehen":" – freiwillig (deshalb in Klammern)"}. Passende Mitstreiter:innen findest du auch über die Kompetenzwerkstatt.</p>
 <div class="list">${teams.map(t=>{const inTeam=(t.mitgliederUids||[]).includes(currentUser.uid);return`<div class="list-item"><div><strong>${esc(t.teamName)}</strong><small>${esc((t.mitgliederNamen||[]).join(", ")||"Noch niemand")}</small></div><div style="display:flex;gap:6px">${inTeam?`<button class="secondary"onclick="leaveLehrplanTeam('${t.id}','${fach}','${wocheId}')">Verlassen</button>`:`<button class="primary"onclick="joinLehrplanTeam('${t.id}','${fach}','${wocheId}')">Beitreten</button>`}${isTeacher()?`<button class="secondary"onclick="deleteLehrplanTeam('${t.id}','${fach}','${wocheId}')">Auflösen</button>`:""}</div></div>`}).join("")||`<div class="empty">Noch keine Teams gebildet.</div>`}</div>
 ${!meinTeam?`<div class="form-actions"style="margin-top:10px"><input id="neuTeamName"type="text"placeholder="Team-Name"style="flex:1"><button class="primary"onclick="createLehrplanTeam('${fach}','${wocheId}')">＋ Team gründen</button></div>`:""}
 ${miniToolRow([["🌟","Kompetenzwerkstatt","kompetenz"],["🤝","Kollaborations-Tools","kollaboration"]])}
 </div>

 <div class="wd-panel"id="wdPanel_produkte">
 <div class="list">${produkte.map(p=>`<div class="list-item"style="flex-direction:column;align-items:stretch;gap:8px">
 <div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${esc(p.titel)}</strong><small>${esc(p.name)}${p.inhalt?" · "+esc(p.inhalt.slice(0,60)):""}</small></div>${(p.uid===currentUser.uid||isTeacher())?`<button class="secondary"onclick="deleteLehrplanProdukt('${p.id}','${fach}','${wocheId}')">Löschen</button>`:""}</div>
 ${p.dateiUrl?dateiEmbedHTML(p.dateiUrl,p.dateiName):""}
 </div>`).join("")||`<div class="empty">Noch keine Lernprodukte hochgeladen.</div>`}</div>
 <p style="font-size:11px;color:var(--muted);margin-top:12px">Zum Erstellen deines Produkts:</p>
 ${miniToolRow([["🔗","Lernressourcen","ressourcen"],["🤖","KI zum Lernen","ki-lernen"],["✍️","Fachaufsatz-Training","fachaufsatz"]])}
 <div class="form-actions"style="margin-top:10px;flex-wrap:wrap">
 <input id="produktTitel"type="text"placeholder="Titel des Lernprodukts"style="flex:1;min-width:140px">
 <input id="produktInhalt"type="text"placeholder="Link oder kurze Beschreibung (optional)"style="flex:1;min-width:160px">
 </div>
 <div class="form-actions"style="margin-top:8px;flex-wrap:wrap;align-items:center">
 <label style="font-weight:700;font-size:12px">Datei (optional, max. 15 MB)<input id="produktDatei"type="file"style="display:block;margin-top:4px"></label>
 <button class="primary"onclick="addLehrplanProdukt('${fach}','${wocheId}')">＋ Hochladen</button>
 </div>
 </div>

 <div class="wd-panel"id="wdPanel_lernstand">
 <p style="color:var(--muted);margin-top:0">Dieselben Kompetenzüberprüfungen wie unter „Lernstandsmessung" in der Lernwerkstatt, hier gefiltert nach ${esc(woche.lb)}. Die Lehrkraft sieht dein Ergebnis über das Ampelsystem.</p>
 <div class="list">${relevanteTasks.map(t=>{
 const latest=lernstandLatest(lsAttempts,t.id),count=lernstandAttemptCount(lsAttempts,t.id),max=lernstandMaxPoints(t.id);
 return`<div class="list-item"><div><strong>${t.nr}. ${esc(t.title)}</strong><small>${count?`letzter Stand: ${latest.total}/${max} · Versuch ${latest.attempt}`:"noch nicht bearbeitet"}</small></div>
 <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
 ${latest?`<span class="pill ${lernstandStatus(latest.total,max)}">${lernstandStatusText(latest.total,max)}</span>`:""}
 ${count?`<button class="secondary"onclick="openLernstandResult('${t.id}')">🔓 Musterlösung</button>`:""}
 <button class="primary"onclick="openLernstand('${t.id}')">${count?"Weiter/ansehen":"Starten"} →</button>
 </div></div>`;
 }).join("")||`<div class="empty">Für ${esc(woche.lb)} sind noch keine Lernstandsmessungen hinterlegt.</div>`}</div>
 <div class="form-actions"style="margin-top:10px"><button class="secondary"onclick="closeModal();go('lernstand')"> Alle Lernstandsmessungen ansehen</button></div>
 </div>

 <div class="wd-panel"id="wdPanel_selbsteinschaetzung">
 <p style="color:var(--muted);margin-top:0">Schätz dich jetzt zum Schluss selbst ein: Welche Lernziele hast du wirklich erreicht?</p>
 <div class="list">${ziele.map(z=>`<div class="list-item"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"><input type="checkbox"${fortschritt.zieleErfuellt?.[z.id]?"checked":""}onchange="toggleZielErfuellt('${fach}','${wocheId}','${z.id}',this.checked)"><span>${esc(z.text)}</span></label></div>`).join("")||`<div class="empty">Für dieses Fach/diese Woche sind noch keine Lehrplan-Ziele hinterlegt.</div>`}</div>
 ${ziele.length?`<div class="form-actions"style="margin-top:12px">
 <button class="primary"${fortschritt.abgeschlossen?"disabled":""}onclick="markWocheAbgeschlossen('${fach}','${wocheId}')">${fortschritt.abgeschlossen?"✓ Woche abgeschlossen":alleErfuellt?"✓ Woche als abgeschlossen markieren":" Erst alle Ziele erfüllen"}</button>
 </div>`:""}
 <p style="font-size:11px;color:var(--muted);margin-top:16px">Zur Vertiefung deiner Reflexion:</p>
 ${miniToolRow([["🤔","Metakognition","metakognition"],["🧭","Lernpfad aktualisieren","lernpfad"],["💬","Lerncoaching","lerncoaching"]])}
 </div>

 <div class="wd-footer">
 <button class="secondary"onclick="closeModal()">Schließen</button>
 <span style="flex:1"></span>
 <button class="secondary"onclick="closeModal();go('forum-board')">❓ Im Forum fragen</button>
 <button class="primary"onclick="closeModal();go('forum-nachrichten')"> Lehrkraft fragen</button>
 </div>
 `);
 showWocheTab(startTab);
}
window.openWocheDetail=openWocheDetail;

async function renderLernwerkstatt(){
 const groups=[
 {title:"Dich selbst einschätzen",color:"#4a90d9",items:[
 [" ","Lernstrategien-Check","Kein Lerntyp-Test – dein Strategien-Profil in 25 Fragen.","lernstrategien"],
 [" ","Metakognitive Lernstrategien","Über das eigene Lernen nachdenken – klick dich durch.","metakognition"],
 [" ","Persönlicher Lernpfad","Ziele setzen, Lernschritte planen und Fortschritt erkennen.","lernpfad"],
 [" ","Lernstandsmessung","Kurz prüfen: Wo stehe ich und was ist mein nächster Schritt?","lernstand"]
 ]},
 {title:"Konkret lernen & üben",color:"#3fa66a",items:[
 [" ","Lernmethoden","Planung, Lernen, Zusammenarbeit und Reflexion.","methoden"],
 [" ","Lern-Werkzeuge","Karteikarten, Fokus-Timer und Glossar zum selbstständigen Lernen.","lernwerkzeuge"],
 [" ","Uhr & Timer","Aktuelle Uhrzeit im Blick, plus frei einstellbarer Timer für alle.","uhr-timer"],
 [" ","Fachaufsatz-Training","Fachaufsatz Pädagogik/Psychologie Baustein für Baustein üben.","fachaufsatz"],
 [" ","Tools für Zusammenarbeit","Padlet, Wortwolke & Co. für Gruppenarbeit und Unterricht.","kollaboration"],
 [" ","Lernressourcen","TaskCard, KI, Videos, ByCS/mebis, Canva und LearningApps.","ressourcen"],
 [" ","KI zum Lernen","KI als Lernpartner nutzen – bereitgestellte KI-Angebote der Lehrkräfte.","ki-lernen"],
 [" ","Lernimpulse","Kurze Impulse für Reflexion und Deeper Learning.","impulse"]
 ]},
 {title:"Unterstützung holen",color:"#e0a324",items:[
 [" ","Lerncoaching","Individuelle Begleitung und Kontakt zu einer Lehrkraft.","lerncoaching"],
 [" ","Fragen & Hilfe","Antworten rund um die F12Sb und das Lernen.","fragenhilfe"]
 ]}
 ];
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Lernwerkstatt","Der offene Lernraum für Lernaufträge, Methoden, Tools und KI.",`<button class="primary"onclick="openPostForm('idea')">＋ Lernimpuls</button>`)}
 <div class="kicker"style="margin-bottom:10px">LEHRPLAN & LERNINHALTE</div>
 <a class="card tile"href="#faecher"style="background:#fff;border:2px solid #4a90d9;min-height:110px;margin-bottom:22px">
 <span class="emoji"></span><strong style="font-size:16px">Fächer 12. Klasse</strong>
 <small>Lehrplan-Zeitstrahl je Fach: Themen, Aufträge, Material, Teams und Produkte – Schritt für Schritt durchs Schuljahr.</small>
 </a>
 ${groups.map(g=>`<div class="kicker"style="margin:22px 0 10px">${g.title}</div><div class="grid grid-4">${g.items.map(x=>`<a class="card tile"style="background:#fff;border:2px solid ${g.color}"href="#${x[3]}"><span class="emoji">${x[0]}</span>
<strong>${x[1]}</strong><small>${x[2]}</small></a>`).join("")}</div>`).join("")}
 ${footer()}`;
}

/* =========================================================
 TOOLS FÜR ZUSAMMENARBEIT – Übersichtsseite in der Lernwerkstatt.
 Sammelt alle kollaborativen Mini-Tools an einer Stelle. Fertige
 Tools verlinken direkt, weitere Ideen erscheinen als"in
 Vorbereitung" (gleiches Muster wie modulePlaceholder oben).
 ========================================================= */
async function renderKollaborationsTools(){
 const liveTools=[
 ["","Wortwolke","Blitzumfrage: Stichworte sammeln – je häufiger genannt, desto größer.","wortwolke",true],
 ["","Verständnis-Ampel","Live-Feedback: Wie gut wurde ein Thema verstanden?","ampel",true],
 ["","Live-Umfrage","Frage mit Antwortoptionen – Ergebnis live als Balken sichtbar.","umfrage",true],
 ["","Wer ist dran?","Zufällige Auswahl aus der Klasse oder einer eigenen Liste.","zufallspicker",true]
 ];
 const orgaTools=[
 [" ","Pinnwand","Padlet-Stil: Ideen im Raster sammeln, pinnen und gemeinsam sichten.","pinnwand",true],
 ["","Kanban-Board","Aufgaben in Spalten Offen / In Arbeit / Fertig für Projektgruppen.","kanban",true],
 ["","Terminfindung","Zeitfenster vorschlagen und als Gruppe gemeinsam abstimmen.","terminfindung",true],
 ["","Team gesucht","Pinnwand für Gruppenfindung: Wer sucht noch Mitstreiter:innen?","teamgesucht",true],
 ["✅","Gemeinsame Checkliste","Meilensteine im Projekt oder Praktikum gemeinsam abhaken.","checkliste",true]
 ];
 const toolTile=t=>`<a class="card tile"href="#${t[3]}"><span class="emoji">${t[0]}</span>
<strong>${t[1]}</strong><small>${t[2]}</small>${!t[4]?`<span class="badge"style="margin-top:8px">IN VORBEREITUNG</span>`:""}</a>`;
 return`${pageHead("ZUSAMMENARBEIT","Tools für Zusammenarbeit","Kostenlose, direkt in die F12Sb integrierte Tools für Gruppenarbeit, Brainstorming und Unterricht – ganz ohne externe Anmeldung.",`<button class="secondary"onclick="go('lernwerkstatt')">← Lernwerkstatt</button>`)}
 <h3 style="margin:0 0 10px">🔴 Live im Unterricht</h3>
 <div class="grid grid-3">${liveTools.map(toolTile).join("")}</div>
 <h3 style="margin:22px 0 10px"> Projektorganisation</h3>
 <div class="grid grid-3">${orgaTools.map(toolTile).join("")}</div>
 ${footer()}`;
}

/* =========================================================
 WORTWOLKE – Stichworte sammeln, Häufigkeit bestimmt die Größe.
 Collections: "wordclouds" (eine Frage/Impuls) und"wordcloudEntries" (Feld wordcloudId verweist auf die Wolke).
 ========================================================= */
let activeWordcloudId=null;

async function getWordclouds(){return await getCollection("wordclouds")}

async function getWordcloudEntries(wordcloudId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"wordcloudEntries"),where("wordcloudId","==",wordcloudId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Wortwolke-Beiträge laden:",e);return []}
}

function aggregateWords(entries){
 const map=new Map();
 entries.forEach(e=>{
 const w=String(e.word||"").trim();
 if(!w)return;
 const key=w.toLowerCase();
 if(!map.has(key))map.set(key,{word:w,count:0});
 map.get(key).count++;
 });
 return [...map.values()].sort((a,b)=>b.count-a.count);
}

function wordcloudCloudHTML(items){
 if(!items.length)return`<div class="empty"><strong>Noch keine Beiträge.</strong>Sei die/der Erste und ergänze ein Wort.</div>`;
 const counts=items.map(i=>i.count);
 const max=Math.max(...counts), min=Math.min(...counts);
 const palette=["#1598d1","#2f9e6f","#d1518a","#e08a1e","#6c5ce7"];
 // Wolkenartige Streuung statt Zeile-für-Zeile: Wörter werden spiralförmig
 // um die Mitte verteilt (goldener Winkel für gleichmäßige Streuung), die
 // Größe richtet sich nach der Häufigkeit. Ab dem vierten Wort wird ein
 // Teil zusätzlich senkrecht gedreht (waagrecht + senkrecht gemischt) –
 // die drei häufigsten Wörter bleiben zur besseren Lesbarkeit waagrecht.
 return`<div class="wortwolke-cloud">${items.map((it,i)=>{
 const ratio=max===min?1:(it.count-min)/(max-min);
 const size=Math.round(16+ratio*40);
 const angle=i*137.508*(Math.PI/180);
 const radius=8+Math.sqrt(i)*13;
 let left=50+radius*Math.cos(angle);
 let top=50+radius*Math.sin(angle)*0.8;
 left=Math.max(8,Math.min(92,left));
 top=Math.max(10,Math.min(90,top));
 const vertical=i>2 && (i%3===1);
 return`<span class="wortwolke-word"style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;font-size:${size}px;color:${palette[i%palette.length]};transform:translate(-50%,-50%) ${vertical?"rotate(90deg)":""}"title="${it.count}×">${esc(it.word)}</span>`;
 }).join("")}</div>`;
}

async function renderWortwolkeUebersicht(){
 const clouds=await getWordclouds();
 const canManage=isTeacher();
 return`${pageHead("ZUSAMMENARBEIT","Wortwolke","Spontane Stichwort-Sammlung – ideal für Einstieg, Brainstorming oder Blitzlicht im Unterricht.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openWordcloudForm()">＋ Neue Wortwolke</button>`)}
 <div class="grid grid-3">${clouds.map(c=>`
 <div class="card tile"style="cursor:pointer;text-align:left;position:relative"onclick="openWordcloud('${c.id}')">
 <div style="position:absolute;top:10px;right:10px;display:flex;gap:6px">
 <button class="secondary"style="padding:4px 10px;font-size:12px"onclick="event.stopPropagation();downloadWordcloudPDF('${c.id}')"> PDF</button>
 ${canManage?`<button class="secondary"style="padding:4px 10px;font-size:12px"onclick="event.stopPropagation();deleteWordcloud('${c.id}')"> Löschen</button>`:""}
 </div>
 <span class="emoji"></span>
 <strong>${esc(c.title||"Wortwolke")}</strong>
 <small>${esc(c.description||"")||"Frage oder Impuls für die Klasse."}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch keine Wortwolke.</strong>Starte die erste Frage für die Klasse.</div>`}
 </div>${footer()}`;
}

function openWordcloud(id){activeWordcloudId=id;go("wortwolke-board")}
function closeWortwolke(){activeWordcloudId=null;go("wortwolke")}

async function renderWortwolkeBoard(){
 if(!activeWordcloudId)return await renderWortwolkeUebersicht();
 let cloud=null;
 try{
 const snap=await getDoc(doc(db,"wordclouds",activeWordcloudId));
 cloud=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Wortwolke laden:",e)}
 if(!cloud){
 activeWordcloudId=null;
 toast("Diese Wortwolke wurde nicht gefunden.");
 return await renderWortwolkeUebersicht();
 }
 const entries=await getWordcloudEntries(cloud.id);
 const items=aggregateWords(entries);
 const canManage=isTeacher();
 return`${pageHead("ZUSAMMENARBEIT",esc(cloud.title||"Wortwolke"),
 esc(cloud.description||"")||"Ergänze spontan ein oder mehrere Stichworte.",`<button class="secondary"onclick="closeWortwolke()">← Wortwolken-Übersicht</button>
 <button class="secondary"onclick="downloadWordcloudPDF('${cloud.id}')"> Als PDF</button>
 ${canManage?`<button class="secondary"onclick="resetWordcloud('${cloud.id}')">Beiträge zurücksetzen</button>
 <button class="secondary"onclick="deleteWordcloud('${cloud.id}')">Wortwolke löschen</button>`:""}`)}
 <style>
 .wortwolke-cloud{position:relative;min-height:380px;padding:10px}
 .wortwolke-word{position:absolute;font-weight:800;line-height:1.1;white-space:nowrap}
 </style>
 <div class="card">
 <label>Dein Beitrag (mehrere Wörter mit Komma trennen)<input id="wwInput"maxlength="120"placeholder="z. B. Teamarbeit, Kommunikation"></label>
 <div class="form-actions"><button class="primary"onclick="submitWordcloudWord()">Hinzufügen</button></div>
 </div>
 <div class="card"style="margin-top:12px"id="wortwolkeCloudCard">${wordcloudCloudHTML(items)}</div>
 ${footer()}`;
}

// Live-Update der Wortwolke: neu berechnete Wolke ersetzt nur den Karten-Inhalt.
function subscribeWordcloudLive(wordcloudId){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"wordcloudEntries"),where("wordcloudId","==",wordcloudId)),
 snap=>{
 const entries=snap.docs.map(d=>({id:d.id,...d.data()}));
 const items=aggregateWords(entries);
 const el=$("wortwolkeCloudCard");
 if(el)el.innerHTML=wordcloudCloudHTML(items);
 },
 e=>console.error("Wortwolke-Live-Update:",e)
 );
}

function openWordcloudForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Wortwolke starten.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">WORTWOLKE</div>
 <h2>Neue Wortwolke starten</h2>
 <p>Stelle eine Frage oder einen Impuls, zu dem die Klasse Stichworte sammelt.</p>
 <div class="form">
 <label>Frage / Titel<input id="wcTitle"maxlength="150"placeholder="z. B. Was verbindest du mit Teamarbeit?"></label>
 <label>Beschreibung (optional)<textarea id="wcDescription"rows="2"maxlength="300"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addWordcloud()">Starten</button>
 </div>
 </div>`);
}

async function addWordcloud(){
 const title=$("wcTitle")?.value.trim()||"";
 const description=$("wcDescription")?.value.trim()||"";
 if(!title){toast("Bitte eine Frage oder einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"wordclouds"),{
 title,description,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Wortwolke gestartet.");
 }catch(e){
 console.error("Wortwolke anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Wortwolke konnte nicht gestartet werden.");
 }
}

async function submitWordcloudWord(){
 if(!activeWordcloudId)return;
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Wörter hinzufügen.");return}
 const raw=$("wwInput")?.value||"";
 const words=raw.split(",").map(w=>w.trim()).filter(Boolean).slice(0,5).map(w=>w.slice(0,24));
 if(!words.length){toast("Bitte mindestens ein Wort eingeben.");return}
 try{
 await Promise.all(words.map(word=>addDoc(collection(db,"wordcloudEntries"),{
 wordcloudId:activeWordcloudId,word,
 authorUid:currentUser.uid,
 createdAt:serverTimestamp()
 })));
 if($("wwInput"))$("wwInput").value="";
 await render();
 toast(words.length>1?"Wörter hinzugefügt.":"Wort hinzugefügt.");
 }catch(e){
 console.error("Wortwolke-Beitrag:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Hinzufügen. Bitte die Firestore-Regeln prüfen.":"Wort konnte nicht gespeichert werden.");
 }
}

async function deleteWordcloud(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Wortwolke löschen.");return}
 if(!confirm("Diese Wortwolke inklusive aller Beiträge wirklich löschen?"))return;
 try{
 const entries=await getWordcloudEntries(id);
 await Promise.all(entries.map(e=>deleteDoc(doc(db,"wordcloudEntries",e.id))));
 await deleteDoc(doc(db,"wordclouds",id));
 if(activeWordcloudId===id)activeWordcloudId=null;
 go("wortwolke");
 toast("Wortwolke gelöscht.");
 }catch(e){console.error("Wortwolke löschen:",e);toast("Wortwolke konnte nicht vollständig gelöscht werden.")}
}

async function downloadWordcloudPDF(wordcloudId){
 try{
 const snap=await getDoc(doc(db,"wordclouds",wordcloudId));
 const cloud=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!cloud){toast("Diese Wortwolke wurde nicht gefunden.");return}
 const entries=await getWordcloudEntries(wordcloudId);
 const items=aggregateWords(entries);
 const body=`<style>
 .wortwolke-cloud{position:relative;min-height:380px;padding:10px}
 .wortwolke-word{position:absolute;font-weight:800;line-height:1.1;white-space:nowrap}
 </style>${wordcloudCloudHTML(items)}`;
 openToolPrintWindow(
 "Wortwolke – "+(cloud.title||"Wortwolke"),
 body,"F12Sb · Wortwolke"+(cloud.description?" · "+cloud.description:"")
 );
 }catch(e){console.error("Wortwolke PDF:",e);toast("Die Wortwolke konnte nicht als PDF geöffnet werden.")}
}

async function resetWordcloud(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können Beiträge zurücksetzen.");return}
 if(!confirm("Alle Beiträge dieser Wortwolke wirklich löschen? Die Wortwolke selbst bleibt bestehen."))return;
 try{
 const entries=await getWordcloudEntries(id);
 await Promise.all(entries.map(e=>deleteDoc(doc(db,"wordcloudEntries",e.id))));
 await render();
 toast("Beiträge wurden zurückgesetzt.");
 }catch(e){console.error("Wortwolke zurücksetzen:",e);toast("Beiträge konnten nicht zurückgesetzt werden.")}
}

/* =========================================================
 KANBAN-BOARD – Aufgaben in Spalten Offen / In Arbeit / Fertig.
 Collections: "kanbanBoards" (ein Board pro Projekt/Gruppe) und"kanbanCards" (Feld boardId verweist auf das Board). Statt Drag &
 Drop bewusst Buttons zum Verschieben – robuster auf dem Handy.
 ========================================================= */
let activeKanbanId=null;
const kanbanColumns=[["offen","Offen"],["in-arbeit","In Arbeit"],["fertig","Fertig"]];

async function getKanbanBoards(){return await getCollection("kanbanBoards")}

async function getKanbanCards(boardId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"kanbanCards"),where("boardId","==",boardId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 }catch(e){console.error("Kanban-Aufgaben laden:",e);return []}
}

async function renderKanbanUebersicht(){
 const boards=await getKanbanBoards();
 return`${pageHead("ZUSAMMENARBEIT","Kanban-Board","Aufgaben für Projektgruppen in Spalten Offen / In Arbeit / Fertig organisieren.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openKanbanBoardForm()">＋ Neues Board</button>`)}
 <div class="grid grid-3">${boards.map(b=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openKanban('${b.id}')">
 <span class="emoji"></span>
 <strong>${esc(b.title||"Kanban-Board")}</strong>
 <small>${esc(b.description||"")||"Aufgaben gemeinsam organisieren."}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch kein Kanban-Board.</strong>Lege das erste Board für dein Projekt an.</div>`}
 </div>${footer()}`;
}

function openKanban(id){activeKanbanId=id;go("kanban-board")}
function closeKanban(){activeKanbanId=null;go("kanban")}

function kanbanCardHTML(c){
 const canEdit=c.createdBy===currentUser.uid||isTeacher();
 const idx=kanbanColumns.findIndex(([key])=>key===(c.status||"offen"));
 const prev=idx>0?kanbanColumns[idx-1][0]:null;
 const next=idx<kanbanColumns.length-1?kanbanColumns[idx+1][0]:null;
 return`<div class="kanban-card">
 <strong>${esc(c.title)}</strong>
 ${c.description?`<p>${esc(c.description)}</p>`:""}
 ${c.assignedTo?`<small> ${esc(c.assignedTo)}</small>`:""}
 <div class="kanban-card-actions">
 ${prev?`<button class="secondary"onclick="moveKanbanCard('${c.id}','${prev}')">←</button>`:""}
 ${next?`<button class="secondary"onclick="moveKanbanCard('${c.id}','${next}')">→</button>`:""}
 ${canEdit?`<button class="secondary"onclick="deleteKanbanCard('${c.id}')">Löschen</button>`:""}
 </div>
 </div>`;
}

async function renderKanbanBoard(){
 if(!activeKanbanId)return await renderKanbanUebersicht();
 let board=null;
 try{
 const snap=await getDoc(doc(db,"kanbanBoards",activeKanbanId));
 board=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Kanban-Board laden:",e)}
 if(!board){
 activeKanbanId=null;
 toast("Dieses Kanban-Board wurde nicht gefunden.");
 return await renderKanbanUebersicht();
 }
 const cards=await getKanbanCards(board.id);
 const canDeleteBoard=isTeacher();
 return`${pageHead("ZUSAMMENARBEIT",esc(board.title||"Kanban-Board"),
 esc(board.description||"")||"Aufgaben gemeinsam organisieren.",`<button class="secondary"onclick="closeKanban()">← Kanban-Übersicht</button>
 <button class="primary"onclick="openKanbanCardForm()">＋ Aufgabe</button>
 <button class="secondary"onclick="downloadKanbanPDF('${board.id}')"> Als PDF</button>
 ${canDeleteBoard?`<button class="secondary"onclick="deleteKanbanBoard('${board.id}')">Board löschen</button>`:""}`)}
 <style>
 .kanban-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
 @media(max-width:800px){.kanban-columns{grid-template-columns:1fr}}
 .kanban-column{background:var(--soft-green,#eef8f1);border-radius:12px;padding:12px;min-height:120px}
 .kanban-column h3{margin:0 0 10px;font-size:14px}
 .kanban-card{background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:10px;box-shadow:0 2px 5px rgba(0,0,0,.08)}
 .kanban-card p{margin:4px 0;font-size:13px;color:var(--muted)}
 .kanban-card small{display:block;margin-top:4px;opacity:.75}
 .kanban-card-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
 .kanban-card-actions button{font-size:12px;padding:5px 8px}
 </style>
 <div class="kanban-columns"id="kanbanColumnsWrap">${kanbanColumns.map(([key,label])=>`
 <div class="kanban-column"data-col="${key}">
 <h3>${label} (${cards.filter(c=>(c.status||"offen")===key).length})</h3>
 ${cards.filter(c=>(c.status||"offen")===key).map(kanbanCardHTML).join("")||`<div class="empty"style="padding:10px">Keine Aufgaben.</div>`}
 </div>`).join("")}
 </div>
 ${footer()}`;
}

// Live-Update des Kanban-Boards: alle drei Spalten neu befüllen, sobald sich
// irgendwo eine Karte ändert (verschoben, hinzugefügt, gelöscht).
function subscribeKanbanLive(boardId){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"kanbanCards"),where("boardId","==",boardId)),
 snap=>{
 const cards=snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 const wrap=$("kanbanColumnsWrap");
 if(!wrap)return;
 wrap.innerHTML=kanbanColumns.map(([key,label])=>`
 <div class="kanban-column"data-col="${key}">
 <h3>${label} (${cards.filter(c=>(c.status||"offen")===key).length})</h3>
 ${cards.filter(c=>(c.status||"offen")===key).map(kanbanCardHTML).join("")||`<div class="empty"style="padding:10px">Keine Aufgaben.</div>`}
 </div>`).join("");
 },
 e=>console.error("Kanban-Live-Update:",e)
 );
}

function openKanbanBoardForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können ein Kanban-Board anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">KANBAN-BOARD</div>
 <h2>Neues Board anlegen</h2>
 <p>Erstelle ein Board für ein Projekt oder eine Gruppenarbeit.</p>
 <div class="form">
 <label>Titel<input id="kbTitle"maxlength="120"placeholder="z. B. Projekt Marketingkonzept"></label>
 <label>Kurzbeschreibung<textarea id="kbDescription"rows="3"maxlength="300"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addKanbanBoard()">Board anlegen</button>
 </div>
 </div>`);
}

async function addKanbanBoard(){
 const title=$("kbTitle")?.value.trim()||"";
 const description=$("kbDescription")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"kanbanBoards"),{
 title,description,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Kanban-Board angelegt.");
 }catch(e){
 console.error("Kanban-Board anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Board konnte nicht angelegt werden.");
 }
}

async function deleteKanbanBoard(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können ein Kanban-Board löschen.");return}
 if(!confirm("Dieses Board inklusive aller Aufgaben wirklich löschen?"))return;
 try{
 const cards=await getKanbanCards(id);
 await Promise.all(cards.map(c=>deleteDoc(doc(db,"kanbanCards",c.id))));
 await deleteDoc(doc(db,"kanbanBoards",id));
 if(activeKanbanId===id)activeKanbanId=null;
 go("kanban");
 toast("Kanban-Board gelöscht.");
 }catch(e){console.error("Kanban-Board löschen:",e);toast("Board konnte nicht vollständig gelöscht werden.")}
}

async function downloadKanbanPDF(boardId){
 try{
 const snap=await getDoc(doc(db,"kanbanBoards",boardId));
 const board=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!board){toast("Dieses Kanban-Board wurde nicht gefunden.");return}
 const cards=await getKanbanCards(boardId);
 const body=kanbanColumns.map(([key,label])=>{
 const colCards=cards.filter(c=>(c.status||"offen")===key);
 return`<div class="col"><h2>${escPDF(label)} (${colCards.length})</h2>
 ${colCards.length?colCards.map(c=>`<div class="item">
 <strong>${escPDF(c.title)}</strong>
 ${c.description?`<div>${escPDF(c.description)}</div>`:""}
 ${c.assignedTo?`<small>Verantwortlich: ${escPDF(c.assignedTo)}</small>`:""}
 </div>`).join(""):`<p class="empty">Keine Aufgaben.</p>`}
 </div>`;
 }).join("");
 openToolPrintWindow(
 "Kanban-Board – "+(board.title||"Kanban-Board"),
 body,"F12Sb · Kanban-Board"+(board.description?" · "+board.description:"")
 );
 }catch(e){console.error("Kanban PDF:",e);toast("Das Kanban-Board konnte nicht als PDF geöffnet werden.")}
}

function openKanbanCardForm(){
 if(!activeKanbanId){toast("Bitte zuerst ein Board öffnen.");return}
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Aufgaben anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">KANBAN-BOARD</div>
 <h2>Neue Aufgabe</h2>
 <div class="form">
 <label>Titel<input id="kcTitle"maxlength="150"placeholder="Was ist zu tun?"></label>
 <label>Details (optional)<textarea id="kcDescription"rows="3"maxlength="500"></textarea></label>
 <label>Verantwortlich (optional)<input id="kcAssigned"maxlength="80"placeholder="Name"></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addKanbanCard()">Aufgabe anlegen</button>
 </div>
 </div>`);
}

async function addKanbanCard(){
 if(!activeKanbanId)return;
 const title=$("kcTitle")?.value.trim()||"";
 const description=$("kcDescription")?.value.trim()||"";
 const assignedTo=$("kcAssigned")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel für die Aufgabe eingeben.");return}
 try{
 await addDoc(collection(db,"kanbanCards"),{
 boardId:activeKanbanId,title,description,assignedTo,status:"offen",
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp(),updatedAt:serverTimestamp()
 });
 closeModal();await render();toast("Aufgabe angelegt.");
 }catch(e){
 console.error("Kanban-Aufgabe anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Aufgabe konnte nicht gespeichert werden.");
 }
}

async function moveKanbanCard(id,newStatus){
 if(!isApproved())return;
 try{
 await updateDoc(doc(db,"kanbanCards",id),{status:newStatus,updatedAt:serverTimestamp()});
 await render();
 }catch(e){
 console.error("Aufgabe verschieben:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Verschieben. Bitte die Firestore-Regeln prüfen.":"Aufgabe konnte nicht verschoben werden.");
 }
}

async function deleteKanbanCard(id){
 if(!confirm("Diese Aufgabe wirklich entfernen?"))return;
 try{await deleteDoc(doc(db,"kanbanCards",id));await render();toast("Aufgabe entfernt.");}
 catch(e){console.error("Aufgabe löschen:",e);toast("Aufgabe konnte nicht entfernt werden.")}
}

/* =========================================================
 TERMINFINDUNG – Terminvorschläge machen, Gruppe stimmt ab.
 Collection"termPolls"enthält die Terminvorschläge direkt als
 Array-Feld"slots" (je {id,label}). Jede Stimme liegt als
 eigenes Dokument in"termVotes"mit fester ID "<pollId>_<uid>",
 damit pro Person immer nur eine aktuelle Stimme existiert.
 ========================================================= */
let activeTermPollId=null;

async function getTermPolls(){return await getCollection("termPolls")}

async function getTermVotes(pollId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"termVotes"),where("pollId","==",pollId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Terminfindung-Stimmen laden:",e);return []}
}

function termSlotCounts(slots,votes){
 return (slots||[]).map(s=>({...s,count:votes.filter(v=>(v.slotIds||[]).includes(s.id)).length}));
}

async function renderTerminfindungUebersicht(){
 const polls=await getTermPolls();
 return`${pageHead("ZUSAMMENARBEIT","Terminfindung","Terminvorschläge machen und als Gruppe gemeinsam abstimmen, wann es passt.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openTermPollForm()">＋ Neue Terminfindung</button>`)}
 <div class="grid grid-3">${polls.map(p=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openTerminfindung('${p.id}')">
 <span class="emoji"></span>
 <strong>${esc(p.title||"Terminfindung")}</strong>
 <small>${esc(p.description||"")||"Termin für die Gruppe finden."}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch keine Terminfindung.</strong>Schlage die ersten Termine für deine Gruppe vor.</div>`}
 </div>${footer()}`;
}

function openTerminfindung(id){activeTermPollId=id;go("terminfindung-board")}
function closeTerminfindung(){activeTermPollId=null;go("terminfindung")}

async function renderTerminfindungBoard(){
 if(!activeTermPollId)return await renderTerminfindungUebersicht();
 let poll=null;
 try{
 const snap=await getDoc(doc(db,"termPolls",activeTermPollId));
 poll=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Terminfindung laden:",e)}
 if(!poll){
 activeTermPollId=null;
 toast("Diese Terminfindung wurde nicht gefunden.");
 return await renderTerminfindungUebersicht();
 }
 const votes=await getTermVotes(poll.id);
 const myVote=votes.find(v=>v.uid===currentUser.uid);
 const mySlotIds=new Set(myVote?.slotIds||[]);
 const slots=termSlotCounts(poll.slots,votes);
 const maxCount=Math.max(0,...slots.map(s=>s.count));
 const canManage=isTeacher();
 return`${pageHead("ZUSAMMENARBEIT",esc(poll.title||"Terminfindung"),
 esc(poll.description||"")||"Wähle alle Termine aus, die bei dir passen.",`<button class="secondary"onclick="closeTerminfindung()">← Terminfindung-Übersicht</button>
 <button class="secondary"onclick="downloadTermPollPDF('${poll.id}')"> Als PDF</button>
 ${canManage?`<button class="secondary"onclick="deleteTermPoll('${poll.id}')">Terminfindung löschen</button>`:""}`)}
 <div class="card">
 <p id="termVoteCount">${votes.length} von euch ${votes.length===1?"hat":"haben"} schon abgestimmt. Wähle deine passenden Termine und speichere.</p>
 <div class="list"id="termSlotList">${slots.map(s=>`
 <label class="check"style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line,#eee)">
 <span><input type="checkbox"value="${s.id}" ${mySlotIds.has(s.id)?"checked":""}> ${esc(s.label)}</span>
 <span class="pill${s.count>0&&s.count===maxCount?"green":""}"id="termSlotCount_${s.id}">${s.count}×</span>
 </label>`).join("")||`<div class="empty">Keine Terminvorschläge vorhanden.</div>`}
 </div>
 <div class="form-actions"style="margin-top:12px"><button class="primary"onclick="saveTermVote('${poll.id}')">Meine Auswahl speichern</button></div>
 </div>
 ${footer()}`;
}

// Live-Update der Terminfindung: nur die Zähler-Badges aktualisieren, damit
// eine noch nicht gespeicherte eigene Checkbox-Auswahl nicht überschrieben wird.
function subscribeTerminfindungLive(pollId,pollSlots){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"termVotes"),where("pollId","==",pollId)),
 snap=>{
 const votes=snap.docs.map(d=>({id:d.id,...d.data()}));
 const slots=termSlotCounts(pollSlots,votes);
 const maxCount=Math.max(0,...slots.map(s=>s.count));
 const countEl=$("termVoteCount");
 if(countEl)countEl.textContent=`${votes.length} von euch ${votes.length===1?"hat":"haben"} schon abgestimmt. Wähle deine passenden Termine und speichere.`;
 slots.forEach(s=>{
 const badge=$(`termSlotCount_${s.id}`);
 if(!badge)return;
 badge.textContent=`${s.count}×`;
 badge.className="pill"+(s.count>0&&s.count===maxCount?"green":"");
 });
 },
 e=>console.error("Terminfindung-Live-Update:",e)
 );
}

function openTermPollForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Terminfindung starten.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">TERMINFINDUNG</div>
 <h2>Neue Terminfindung starten</h2>
 <p>Schlage mindestens zwei Termine vor, zwischen denen die Gruppe abstimmen kann.</p>
 <div class="form">
 <label>Titel<input id="tpTitle"maxlength="150"placeholder="z. B. Gruppentreffen Projekt Marketingkonzept"></label>
 <label>Beschreibung (optional)<textarea id="tpDescription"rows="2"maxlength="300"></textarea></label>
 <label>Terminvorschläge (ein Vorschlag pro Zeile)<textarea id="tpSlots"rows="5"placeholder="Mo 14.10. 14:00 Uhr
Di 15.10. 16:00 Uhr
Mi 16.10. ganztägig"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addTermPoll()">Terminfindung starten</button>
 </div>
 </div>`);
}

async function addTermPoll(){
 const title=$("tpTitle")?.value.trim()||"";
 const description=$("tpDescription")?.value.trim()||"";
 const slotLines=($("tpSlots")?.value||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,10);
 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(slotLines.length<2){toast("Bitte mindestens zwei Terminvorschläge eingeben (ein Vorschlag pro Zeile).");return}
 const slots=slotLines.map((label,i)=>({id:"s"+i,label}));
 try{
 await addDoc(collection(db,"termPolls"),{
 title,description,slots,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Terminfindung gestartet.");
 }catch(e){
 console.error("Terminfindung anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Terminfindung konnte nicht gestartet werden.");
 }
}

async function saveTermVote(pollId){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können abstimmen.");return}
 const checked=[...document.querySelectorAll('#termSlotList input[type="checkbox"]:checked')].map(el=>el.value);
 try{
 await setDoc(doc(db,"termVotes",`${pollId}_${currentUser.uid}`),{
 pollId,uid:currentUser.uid,
 name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 slotIds:checked,
 updatedAt:serverTimestamp()
 });
 await render();
 toast("Deine Auswahl wurde gespeichert.");
 }catch(e){
 console.error("Terminfindung-Stimme speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Auswahl konnte nicht gespeichert werden.");
 }
}

async function deleteTermPoll(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Terminfindung löschen.");return}
 if(!confirm("Diese Terminfindung inklusive aller Stimmen wirklich löschen?"))return;
 try{
 const votes=await getTermVotes(id);
 await Promise.all(votes.map(v=>deleteDoc(doc(db,"termVotes",v.id))));
 await deleteDoc(doc(db,"termPolls",id));
 if(activeTermPollId===id)activeTermPollId=null;
 go("terminfindung");
 toast("Terminfindung gelöscht.");
 }catch(e){console.error("Terminfindung löschen:",e);toast("Terminfindung konnte nicht vollständig gelöscht werden.")}
}

async function downloadTermPollPDF(pollId){
 try{
 const snap=await getDoc(doc(db,"termPolls",pollId));
 const poll=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!poll){toast("Diese Terminfindung wurde nicht gefunden.");return}
 const votes=await getTermVotes(pollId);
 const slots=termSlotCounts(poll.slots,votes);
 const body=slots.length?slots.map(s=>`<div class="item">
 <strong>${escPDF(s.label)}</strong>
 <small>${s.count} Stimme(n)</small>
 </div>`).join(""):`<p class="empty">Keine Terminvorschläge.</p>`;
 openToolPrintWindow(
 "Terminfindung – "+(poll.title||"Terminfindung"),
 body,"F12Sb · Terminfindung · "+votes.length+"Stimme(n) insgesamt"+(poll.description?" · "+poll.description:"")
 );
 }catch(e){console.error("Terminfindung PDF:",e);toast("Die Terminfindung konnte nicht als PDF geöffnet werden.")}
}

/* =========================================================
 TEAM GESUCHT – Pinnwand für Gruppenfindung. Wer noch
 Mitstreiter:innen für ein Projekt sucht, postet ein Gesuch;
 andere zeigen mit einem Klick Interesse. Eine flache Liste
 ohne eigene Board-Detailseite genügt hier, da jedes Gesuch für
 sich steht (kein Container mit mehreren Unterelementen).
 ========================================================= */
async function getTeamAds(){return await getCollection("teamAds")}

function teamAdHTML(ad){
 const interested=Array.isArray(ad.interested)?ad.interested:[];
 const amInterested=interested.some(i=>i.uid===currentUser.uid);
 const canManage=ad.authorUid===currentUser.uid||isTeacher();
 return`<article class="card"style="margin-bottom:12px">
 <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
 <div>
 <strong>${esc(ad.title||"Team gesucht")}</strong>
 <p style="margin:6px 0 0">${esc(ad.description||"")}</p>
 <small style="display:block;margin-top:6px;opacity:.75">Von ${esc(ad.authorName||"Campus-Mitglied")}${Number(ad.spotsNeeded)>0?` · sucht noch ${Number(ad.spotsNeeded)} Person(en)`:""}</small>
 </div>
 <div style="display:flex;gap:6px;flex-shrink:0">
 <button class="secondary"onclick="openReportForm('teamAds','${ad.id}','${esc((ad.title||"").slice(0,80))}')"> Melden</button>
 ${canManage?`<button class="secondary"onclick="deleteTeamAd('${ad.id}')">Löschen</button>`:""}
 </div>
 </div>
 <div style="margin-top:10px">
 <button class="${amInterested?"secondary":"primary"}"onclick="toggleTeamInterest('${ad.id}')">${amInterested?"Nicht mehr interessiert":"Ich bin interessiert"}</button>
 ${interested.length?`<div class="chips"style="margin-top:10px">${interested.map(i=>`<span class="chip">${esc(i.name)}</span>`).join("")}</div>`:""}
 </div>
 </article>`;
}

async function renderTeamgesuchtUebersicht(){
 const ads=await getTeamAds();
 return`${pageHead("ZUSAMMENARBEIT","Team gesucht","Wer noch Mitstreiter:innen für ein Projekt sucht, postet hier – andere können direkt ihr Interesse zeigen.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openTeamAdForm()">＋ Gesuch aufgeben</button>
 <button class="secondary"onclick="downloadTeamAdsPDF()"> Als PDF</button>`)}
 <div class="list">${ads.map(teamAdHTML).join("")||`<div class="empty"><strong>Noch kein Gesuch.</strong>Suchst du noch Leute für ein Projekt? Poste es hier.</div>`}</div>
 ${footer()}`;
}

async function downloadTeamAdsPDF(){
 try{
 const ads=await getTeamAds();
 const body=ads.length?ads.map(ad=>{
 const interested=Array.isArray(ad.interested)?ad.interested:[];
 return`<div class="item">
 <strong>${escPDF(ad.title||"Team gesucht")}</strong>
 ${ad.description?`<div>${escPDF(ad.description)}</div>`:""}
 <small>Von ${escPDF(ad.authorName||"Campus-Mitglied")}${Number(ad.spotsNeeded)>0?` · sucht noch ${Number(ad.spotsNeeded)} Person(en)`:""}</small>
 ${interested.length?`<small>Interessiert: ${interested.map(i=>escPDF(i.name)).join(",")}</small>`:""}
 </div>`;
 }).join(""):`<p class="empty">Noch kein Gesuch.</p>`;
 openToolPrintWindow("Team gesucht",body,"F12Sb · Übersicht aller offenen Gesuche");
 }catch(e){console.error("Team gesucht PDF:",e);toast("Die Übersicht konnte nicht als PDF geöffnet werden.")}
}

function openTeamAdForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können ein Gesuch aufgeben.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">TEAM GESUCHT</div>
 <h2>Gesuch aufgeben</h2>
 <p>Beschreibe kurz, für welches Projekt oder Thema du noch Mitstreiter:innen suchst.</p>
 <div class="form">
 <label>Titel<input id="taTitle"maxlength="150"placeholder="z. B. Suche Team für KI-Projekt"></label>
 <label>Beschreibung<textarea id="taDescription"rows="4"maxlength="500"placeholder="Worum geht's, was bringst du mit, was suchst du?"></textarea></label>
 <label>Wie viele Personen suchst du noch? (optional)<input id="taSpots"type="number"min="1"max="20"></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addTeamAd()">Gesuch veröffentlichen</button>
 </div>
 </div>`);
}

async function addTeamAd(){
 const title=$("taTitle")?.value.trim()||"";
 const description=$("taDescription")?.value.trim()||"";
 const spotsRaw=$("taSpots")?.value;
 const spotsNeeded=spotsRaw?Math.max(1,Math.min(20,Number(spotsRaw)||0)):0;
 if(!title){toast("Bitte einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"teamAds"),{
 title,description,spotsNeeded,
 authorUid:currentUser.uid,
 authorName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 interested:[],
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Gesuch veröffentlicht.");
 }catch(e){
 console.error("Team-Gesuch anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Veröffentlichen. Bitte die Firestore-Regeln prüfen.":"Gesuch konnte nicht veröffentlicht werden.");
 }
}

async function toggleTeamInterest(id){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Interesse zeigen.");return}
 try{
 const ref=doc(db,"teamAds",id);
 const snap=await getDoc(ref);
 if(!snap.exists()){toast("Dieses Gesuch wurde nicht gefunden.");return}
 const data=snap.data()||{};
 const interested=Array.isArray(data.interested)?data.interested:[];
 const already=interested.find(i=>i.uid===currentUser.uid);
 const me={uid:currentUser.uid,name:profile?.displayName||currentUser.email||"Campus-Mitglied"};
 if(already) await updateDoc(ref,{interested:arrayRemove(already)});
 else await updateDoc(ref,{interested:arrayUnion(me)});
 await render();
 }catch(e){
 console.error("Interesse an Team-Gesuch:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert diese Änderung. Bitte die Firestore-Regeln prüfen.":"Aktion konnte nicht gespeichert werden.");
 }
}

async function deleteTeamAd(id){
 if(!confirm("Dieses Gesuch wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"teamAds",id));await render();toast("Gesuch gelöscht.");}
 catch(e){console.error("Gesuch löschen:",e);toast("Gesuch konnte nicht gelöscht werden.")}
}

/* =========================================================
 MELDEFUNKTION – Inhalte aus Forum, Pinnwand und Team gesucht
 können an Lehrkräfte gemeldet werden. Meldungen sind NUR für
 Lehrkräfte einsehbar (siehe firestore.rules), damit weder die
 gemeldete Person noch andere Schüler:innen sie sehen.
 ========================================================= */
function reportTargetLabel(col){
 return {posts:"Forum-Beitrag",boardPosts:"Pinnwand-Notiz",teamAds:"Team-gesucht-Gesuch",glossaryEntries:"Glossar-Eintrag"}[col]||col;
}
function reportTargetRoute(col){
 return {posts:"forum-board",boardPosts:"pinnwand",teamAds:"teamgesucht",glossaryEntries:"glossar"}[col]||"start";
}

function openReportForm(targetCollection,targetId,preview){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können etwas melden.");return}
 window.__reportTarget={targetCollection,targetId,preview:String(preview||"").slice(0,200)};
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">MELDEN</div>
 <h2>Inhalt melden</h2>
 <p>Deine Meldung geht ausschließlich an die Lehrkräfte – nicht an andere Schüler:innen und nicht an die gemeldete Person.</p>
 <div class="form">
 <label>Was ist das Problem? (optional)<textarea id="rpReason"rows="3"maxlength="300"placeholder="z. B. unangemessener Inhalt, Beleidigung, Spam …"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="submitReport()">Melden</button>
 </div>
 </div>`);
}

async function submitReport(){
 const target=window.__reportTarget;
 if(!target){closeModal();return}
 const reason=$("rpReason")?.value.trim()||"";
 try{
 await addDoc(collection(db,"reports"),{
 targetCollection:target.targetCollection,
 targetId:target.targetId,
 targetPreview:target.preview,
 reason,resolved:false,
 reportedBy:currentUser.uid,
 reportedByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();
 toast("Danke, deine Meldung wurde an die Lehrkräfte geschickt.");
 }catch(e){
 console.error("Meldung senden:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Senden. Bitte die Firestore-Regeln prüfen.":"Meldung konnte nicht gesendet werden.");
 }
}

async function resolveReport(id){
 if(!isTeacher())return;
 try{
 await updateDoc(doc(db,"reports",id),{resolved:true,resolvedAt:serverTimestamp(),resolvedBy:currentUser.uid});
 await render();toast("Meldung als erledigt markiert.");
 }catch(e){console.error("Meldung aktualisieren:",e);toast("Meldung konnte nicht aktualisiert werden.")}
}

async function deleteReport(id){
 if(!isTeacher())return;
 if(!confirm("Diese Meldung endgültig löschen?"))return;
 try{await deleteDoc(doc(db,"reports",id));await render();toast("Meldung gelöscht.");}
 catch(e){console.error("Meldung löschen:",e);toast("Meldung konnte nicht gelöscht werden.")}
}

/* =========================================================
 GEMEINSAME CHECKLISTE – Meilensteine im Projekt/Praktikum
 gemeinsam abhaken. Collections: "checklists" (eine Liste pro
 Projekt/Vorhaben) und"checklistItems" (Feld checklistId
 verweist auf die Liste). Abhaken darf jede/r Beteiligte, Text
 ändern/entfernen nur Ersteller:in oder Lehrkraft.
 ========================================================= */
let activeChecklistId=null;

async function getChecklists(){return await getCollection("checklists")}

async function getChecklistItems(checklistId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"checklistItems"),where("checklistId","==",checklistId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 }catch(e){console.error("Checklisten-Einträge laden:",e);return []}
}

async function renderChecklisteUebersicht(){
 const lists=await getChecklists();
 return`${pageHead("ZUSAMMENARBEIT","Gemeinsame Checkliste","Meilensteine im Projekt oder Praktikum gemeinsam abhaken.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openChecklistForm()">＋ Neue Checkliste</button>`)}
 <div class="grid grid-3">${lists.map(l=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openChecklist('${l.id}')">
 <span class="emoji">✅</span>
 <strong>${esc(l.title||"Checkliste")}</strong>
 <small>${esc(l.description||"")||"Gemeinsame Meilensteine."}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch keine Checkliste.</strong>Lege die erste Checkliste für dein Projekt an.</div>`}
 </div>${footer()}`;
}

function openChecklist(id){activeChecklistId=id;go("checkliste-board")}
function closeChecklist(){activeChecklistId=null;go("checkliste")}

function checklistItemHTML(item){
 const canEdit=item.createdBy===currentUser.uid||isTeacher();
 return`<div class="list-item">
 <label class="check"style="flex:1;display:flex;align-items:center;gap:10px;cursor:pointer">
 <input type="checkbox" ${item.done?"checked":""} onchange="toggleChecklistItem('${item.id}',this.checked)">
 <span style="${item.done?"text-decoration:line-through;opacity:.6":""}">${esc(item.text)}</span>
 </label>
 ${item.done&&item.doneByName?`<small style="opacity:.7;margin-right:8px">von ${esc(item.doneByName)}</small>`:""}
 ${canEdit?`<button class="secondary"onclick="deleteChecklistItem('${item.id}')">Entfernen</button>`:""}
 </div>`;
}

async function renderChecklisteBoard(){
 if(!activeChecklistId)return await renderChecklisteUebersicht();
 let list=null;
 try{
 const snap=await getDoc(doc(db,"checklists",activeChecklistId));
 list=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Checkliste laden:",e)}
 if(!list){
 activeChecklistId=null;
 toast("Diese Checkliste wurde nicht gefunden.");
 return await renderChecklisteUebersicht();
 }
 const items=await getChecklistItems(list.id);
 const done=items.filter(i=>i.done).length;
 const percent=items.length?Math.round((done/items.length)*100):0;
 const canDeleteList=isTeacher();
 return`${pageHead("ZUSAMMENARBEIT",esc(list.title||"Checkliste"),
 esc(list.description||"")||"Meilensteine gemeinsam abhaken.",`<button class="secondary"onclick="closeChecklist()">← Checklisten-Übersicht</button>
 <button class="primary"onclick="openChecklistItemForm()">＋ Eintrag</button>
 <button class="secondary"onclick="downloadChecklistPDF('${list.id}')"> Als PDF</button>
 ${canDeleteList?`<button class="secondary"onclick="deleteChecklist('${list.id}')">Checkliste löschen</button>`:""}`)}
 <div class="card"id="checklistProgressCard">
 <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px"><span>${done} von ${items.length} erledigt</span><b>${percent}%</b></div>
 <div class="progress"><i style="width:${percent}%"></i></div>
 </div>
 <div class="list"style="margin-top:12px"id="checklistItemsList">${items.map(checklistItemHTML).join("")||`<div class="empty"><strong>Noch keine Einträge.</strong>Füge den ersten Meilenstein hinzu.</div>`}</div>
 ${footer()}`;
}

// Live-Update der Checkliste: Fortschrittsbalken und Einträge neu befüllen.
function subscribeChecklistLive(checklistId){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"checklistItems"),where("checklistId","==",checklistId)),
 snap=>{
 const items=snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 const done=items.filter(i=>i.done).length;
 const percent=items.length?Math.round((done/items.length)*100):0;
 const progressCard=$("checklistProgressCard");
 if(progressCard)progressCard.innerHTML=`<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px"><span>${done} von ${items.length} erledigt</span><b>${percent}%</b></div><div class="progress"><i style="width:${percent}%"></i></div>`;
 const listEl=$("checklistItemsList");
 if(listEl)listEl.innerHTML=items.map(checklistItemHTML).join("")||`<div class="empty"><strong>Noch keine Einträge.</strong>Füge den ersten Meilenstein hinzu.</div>`;
 },
 e=>console.error("Checkliste-Live-Update:",e)
 );
}

function openChecklistForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Checkliste anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">GEMEINSAME CHECKLISTE</div>
 <h2>Neue Checkliste anlegen</h2>
 <div class="form">
 <label>Titel<input id="clTitle"maxlength="120"placeholder="z. B. Praktikumsbericht Meilensteine"></label>
 <label>Kurzbeschreibung<textarea id="clDescription"rows="3"maxlength="300"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addChecklist()">Checkliste anlegen</button>
 </div>
 </div>`);
}

async function addChecklist(){
 const title=$("clTitle")?.value.trim()||"";
 const description=$("clDescription")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"checklists"),{
 title,description,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Checkliste angelegt.");
 }catch(e){
 console.error("Checkliste anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Checkliste konnte nicht angelegt werden.");
 }
}

async function deleteChecklist(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Checkliste löschen.");return}
 if(!confirm("Diese Checkliste inklusive aller Einträge wirklich löschen?"))return;
 try{
 const items=await getChecklistItems(id);
 await Promise.all(items.map(i=>deleteDoc(doc(db,"checklistItems",i.id))));
 await deleteDoc(doc(db,"checklists",id));
 if(activeChecklistId===id)activeChecklistId=null;
 go("checkliste");
 toast("Checkliste gelöscht.");
 }catch(e){console.error("Checkliste löschen:",e);toast("Checkliste konnte nicht vollständig gelöscht werden.")}
}

async function downloadChecklistPDF(checklistId){
 try{
 const snap=await getDoc(doc(db,"checklists",checklistId));
 const list=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!list){toast("Diese Checkliste wurde nicht gefunden.");return}
 const items=await getChecklistItems(checklistId);
 const done=items.filter(i=>i.done).length;
 const body=items.length?items.map(i=>`<div class="item">
 <strong>${i.done?"":""} ${escPDF(i.text)}</strong>
 ${i.done&&i.doneByName?`<small>Erledigt von ${escPDF(i.doneByName)}</small>`:""}
 </div>`).join(""):`<p class="empty">Noch keine Einträge.</p>`;
 openToolPrintWindow(
 "Checkliste – "+(list.title||"Checkliste"),
 body,"F12Sb · Gemeinsame Checkliste · "+done+"von"+items.length+"erledigt"+(list.description?" · "+list.description:"")
 );
 }catch(e){console.error("Checkliste PDF:",e);toast("Die Checkliste konnte nicht als PDF geöffnet werden.")}
}

function openChecklistItemForm(){
 if(!activeChecklistId){toast("Bitte zuerst eine Checkliste öffnen.");return}
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Einträge hinzufügen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">GEMEINSAME CHECKLISTE</div>
 <h2>Neuer Eintrag</h2>
 <div class="form">
 <label>Text<input id="ciText"maxlength="200"placeholder="z. B. Interviewpartner:in anfragen"></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addChecklistItem()">Hinzufügen</button>
 </div>
 </div>`);
}

async function addChecklistItem(){
 if(!activeChecklistId)return;
 const text=$("ciText")?.value.trim()||"";
 if(!text){toast("Bitte einen Text eingeben.");return}
 try{
 await addDoc(collection(db,"checklistItems"),{
 checklistId:activeChecklistId,text,done:false,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Eintrag hinzugefügt.");
 }catch(e){
 console.error("Checklisten-Eintrag anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Hinzufügen. Bitte die Firestore-Regeln prüfen.":"Eintrag konnte nicht gespeichert werden.");
 }
}

async function toggleChecklistItem(id,checked){
 if(!isApproved())return;
 try{
 await updateDoc(doc(db,"checklistItems",id),{
 done:Boolean(checked),
 doneBy:checked?currentUser.uid:"",
 doneByName:checked?(profile?.displayName||currentUser.email||"Campus-Mitglied"):"",
 updatedAt:serverTimestamp()
 });
 await render();
 }catch(e){
 console.error("Eintrag abhaken:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert diese Änderung. Bitte die Firestore-Regeln prüfen.":"Eintrag konnte nicht aktualisiert werden.");
 }
}

async function deleteChecklistItem(id){
 if(!confirm("Diesen Eintrag wirklich entfernen?"))return;
 try{await deleteDoc(doc(db,"checklistItems",id));await render();toast("Eintrag entfernt.");}
 catch(e){console.error("Eintrag löschen:",e);toast("Eintrag konnte nicht entfernt werden.")}
}

/* =========================================================
 VERSTÄNDNIS-AMPEL – Live-Feedback: 🟢 verstanden, 🟡 teilweise,
 🔴 nicht verstanden. Collections: "ampelRounds" (eine Runde/
 Frage) und"ampelResponses" (feste Doc-ID "<roundId>_<uid>",
 damit jede Person ihre Antwort jederzeit überschreiben kann).
 ========================================================= */
let activeAmpelId=null;
let liveUnsubscribe=null;
const ampelOptions=[["green","🟢 Verstanden"],["yellow","🟡 Teilweise"],["red","🔴 Nicht verstanden"]];

async function getAmpelRounds(){return await getCollection("ampelRounds")}
async function getAmpelResponses(roundId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"ampelResponses"),where("roundId","==",roundId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Ampel-Antworten laden:",e);return []}
}

async function renderAmpelUebersicht(){
 const rounds=await getAmpelRounds();
 return`${pageHead("ZUSAMMENARBEIT","Verständnis-Ampel","Live-Feedback aus der Klasse: Wie gut wurde ein Thema verstanden?",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openAmpelForm()">＋ Neue Runde</button>`)}
 <div class="grid grid-3">${rounds.map(r=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openAmpel('${r.id}')">
 <span class="emoji"></span>
 <strong>${esc(r.title||"Verständnis-Ampel")}</strong>
 <small>${esc(r.description||"")||"Wie gut wurde es verstanden?"}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch keine Runde.</strong>Starte eine Verständnis-Abfrage für die Klasse.</div>`}
 </div>${footer()}`;
}

function openAmpel(id){activeAmpelId=id;go("ampel-board")}
function closeAmpel(){activeAmpelId=null;go("ampel")}

async function renderAmpelBoard(){
 if(!activeAmpelId)return await renderAmpelUebersicht();
 let round=null;
 try{
 const snap=await getDoc(doc(db,"ampelRounds",activeAmpelId));
 round=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Ampel-Runde laden:",e)}
 if(!round){
 activeAmpelId=null;
 toast("Diese Runde wurde nicht gefunden.");
 return await renderAmpelUebersicht();
 }
 const responses=await getAmpelResponses(round.id);
 const myResponse=responses.find(r=>r.uid===currentUser.uid);
 const total=responses.length;
 const canManage=isTeacher()||round.createdBy===currentUser.uid;
 return`${pageHead("ZUSAMMENARBEIT",esc(round.title||"Verständnis-Ampel"),
 esc(round.description||"")||"Wie gut hast du das Thema verstanden?",`<button class="secondary"onclick="closeAmpel()">← Ampel-Übersicht</button>
 <button class="secondary"onclick="downloadAmpelPDF('${round.id}')"> Als PDF</button>
 ${canManage?`<button class="secondary"onclick="editAmpelForm('${round.id}','${esc(round.title||"")}','${esc(round.description||"")}')">Bearbeiten</button>`:""}
 ${isTeacher()?`<button class="secondary"onclick="deleteAmpelRound('${round.id}')">Runde löschen</button>`:""}`)}
 <style>
 .ampel-buttons{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:10px 0 18px}
 .ampel-buttons button{flex:1;min-width:140px;padding:18px;font-size:16px;border-radius:14px;border:2px solid var(--line,#ddd);background:#fff;cursor:pointer}
 .ampel-buttons button.selected{border-color:var(--brand,#1598d1);background:#eaf6fd}
 .ampel-bars{display:flex;flex-direction:column;gap:10px}
 .ampel-bar-row{display:flex;align-items:center;gap:10px}
 .ampel-bar-track{flex:1;height:16px;border-radius:8px;background:#eee;overflow:hidden}
 .ampel-bar-fill{height:100%}
 </style>
 <div class="card">
 <p id="ampelTotalCount">${total} Antwort(en) insgesamt. Wähle, wie gut du es verstanden hast:</p>
 <div class="ampel-buttons">${ampelOptions.map(([key,label])=>`<button class="${myResponse?.value===key?"selected":""}"onclick="setAmpelResponse('${round.id}','${key}')">${label}</button>`).join("")}</div>
 </div>
 <div class="card"style="margin-top:12px">
 <h3 style="margin-top:0">Ergebnis <span class="pill"style="margin-left:6px">🔴 live</span></h3>
 <div class="ampel-bars"id="ampelBars">${ampelOptions.map(([key,label])=>{
 const count=responses.filter(r=>r.value===key).length;
 const pct=total?Math.round((count/total)*100):0;
 const color=key==="green"?"#2f9e6f":key==="yellow"?"#e0a51e":"#d1518a";
 return`<div class="ampel-bar-row"><span style="min-width:140px">${esc(label)}</span><div class="ampel-bar-track"><div class="ampel-bar-fill"style="width:${pct}%;background:${color}"></div></div><b style="min-width:70px;text-align:right">${count} · ${pct}%</b></div>`;
 }).join("")}</div>
 </div>
 ${footer()}`;
}

// Aktualisiert nur die Ergebnis-Balken und den Antworten-Zähler, ohne die
// ganze Seite neu zu rendern (verhindert Ruckeln/Springen bei Live-Updates).
function updateAmpelResultsUI(responses){
 const total=responses.length;
 const totalEl=$("ampelTotalCount");
 if(totalEl)totalEl.textContent=`${total} Antwort(en) insgesamt. Wähle, wie gut du es verstanden hast:`;
 const barsEl=$("ampelBars");
 if(!barsEl)return;
 barsEl.innerHTML=ampelOptions.map(([key,label])=>{
 const count=responses.filter(r=>r.value===key).length;
 const pct=total?Math.round((count/total)*100):0;
 const color=key==="green"?"#2f9e6f":key==="yellow"?"#e0a51e":"#d1518a";
 return`<div class="ampel-bar-row"><span style="min-width:140px">${esc(label)}</span><div class="ampel-bar-track"><div class="ampel-bar-fill"style="width:${pct}%;background:${color}"></div></div><b style="min-width:70px;text-align:right">${count} · ${pct}%</b></div>`;
 }).join("");
}
// Richtet einen Firestore-Live-Listener für eine Ampel-Runde ein. Muss vor
// jedem neuen Aufruf sauber abgemeldet werden (siehe liveUnsubscribe in render()).
function subscribeAmpelLive(roundId){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"ampelResponses"),where("roundId","==",roundId)),
 snap=>{
 const responses=snap.docs.map(d=>({id:d.id,...d.data()}));
 updateAmpelResultsUI(responses);
 },
 e=>console.error("Ampel-Live-Update:",e)
 );
}

function openAmpelForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Runde starten.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">VERSTÄNDNIS-AMPEL</div>
 <h2>Neue Runde starten</h2>
 <div class="form">
 <label>Frage / Thema<input id="apTitle"maxlength="150"placeholder="z. B. Habt ihr die Ableitungsregeln verstanden?"></label>
 <label>Beschreibung (optional)<textarea id="apDescription"rows="2"maxlength="300"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addAmpelRound()">Starten</button>
 </div>
 </div>`);
}

async function addAmpelRound(){
 const title=$("apTitle")?.value.trim()||"";
 const description=$("apDescription")?.value.trim()||"";
 if(!title){toast("Bitte eine Frage oder ein Thema eingeben.");return}
 try{
 await addDoc(collection(db,"ampelRounds"),{
 title,description,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Runde gestartet.");
 }catch(e){
 console.error("Ampel-Runde anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Runde konnte nicht gestartet werden.");
 }
}

function editAmpelForm(id,title,description){
 window.__editAmpelId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">VERSTÄNDNIS-AMPEL</div>
 <h2>Runde bearbeiten</h2>
 <div class="form">
 <label>Frage / Thema<input id="apTitle"value="${esc(title||"")}"></label>
 <label>Beschreibung (optional)<textarea id="apDescription"rows="2">${esc(description||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="updateAmpelRound()">Speichern</button>
 </div>
 </div>`);
}

async function updateAmpelRound(){
 const id=window.__editAmpelId;
 if(!id)return;
 const title=$("apTitle")?.value.trim()||"";
 if(!title){toast("Bitte eine Frage oder ein Thema eingeben.");return}
 try{
 await updateDoc(doc(db,"ampelRounds",id),{title,description:$("apDescription")?.value.trim()||""});
 closeModal();await render();toast("Runde aktualisiert.");
 }catch(e){
 console.error("Ampel-Runde aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Runde konnte nicht aktualisiert werden.");
 }
}

async function setAmpelResponse(roundId,value){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können antworten.");return}
 try{
 await setDoc(doc(db,"ampelResponses",`${roundId}_${currentUser.uid}`),{
 roundId,uid:currentUser.uid,
 name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 value,updatedAt:serverTimestamp()
 });
 await render();
 }catch(e){
 console.error("Ampel-Antwort speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Antwort konnte nicht gespeichert werden.");
 }
}

async function deleteAmpelRound(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Runde löschen.");return}
 if(!confirm("Diese Runde inklusive aller Antworten wirklich löschen?"))return;
 try{
 const responses=await getAmpelResponses(id);
 await Promise.all(responses.map(r=>deleteDoc(doc(db,"ampelResponses",r.id))));
 await deleteDoc(doc(db,"ampelRounds",id));
 if(activeAmpelId===id)activeAmpelId=null;
 go("ampel");
 toast("Runde gelöscht.");
 }catch(e){console.error("Ampel-Runde löschen:",e);toast("Runde konnte nicht vollständig gelöscht werden.")}
}

async function downloadAmpelPDF(roundId){
 try{
 const snap=await getDoc(doc(db,"ampelRounds",roundId));
 const round=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!round){toast("Diese Runde wurde nicht gefunden.");return}
 const responses=await getAmpelResponses(roundId);
 const total=responses.length;
 const body=`<table><thead><tr><th>Antwort</th><th style="text-align:right">Anzahl</th><th style="text-align:right">Anteil</th></tr></thead><tbody>
 ${ampelOptions.map(([key,label])=>{
 const count=responses.filter(r=>r.value===key).length;
 const pct=total?Math.round((count/total)*100):0;
 return`<tr><td>${escPDF(label)}</td><td style="text-align:right">${count}</td><td style="text-align:right">${pct}%</td></tr>`;
 }).join("")}
 </tbody></table>`;
 openToolPrintWindow(
 "Verständnis-Ampel – "+(round.title||"Runde"),
 body,"F12Sb · Verständnis-Ampel · "+total+"Antwort(en)"+(round.description?" · "+round.description:"")
 );
 }catch(e){console.error("Ampel PDF:",e);toast("Die Runde konnte nicht als PDF geöffnet werden.")}
}

/* =========================================================
 LIVE-UMFRAGE – Frage mit Antwortoptionen, Ergebnis live als
 Balken. Collections: "polls" (Frage + Optionen als Array) und"pollVotes" (feste Doc-ID "<pollId>_<uid>").
 ========================================================= */
let activePollId=null;

async function getPolls(){return await getCollection("polls")}
async function getPollVotes(pollId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"pollVotes"),where("pollId","==",pollId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Umfrage-Stimmen laden:",e);return []}
}

async function renderUmfrageUebersicht(){
 const polls=await getPolls();
 return`${pageHead("ZUSAMMENARBEIT","Live-Umfrage","Frage mit Antwortoptionen – das Ergebnis ist sofort für alle als Balken sichtbar.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>
 <button class="primary"onclick="openPollForm()">＋ Neue Umfrage</button>`)}
 <div class="grid grid-3">${polls.map(p=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openUmfrage('${p.id}')">
 <span class="emoji"></span>
 <strong>${esc(p.question||"Umfrage")}</strong>
 <small>${esc(p.description||"")||"Frage mit Antwortoptionen."}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch keine Umfrage.</strong>Starte die erste Frage für die Klasse.</div>`}
 </div>${footer()}`;
}

function openUmfrage(id){activePollId=id;go("umfrage-board")}
function closeUmfrage(){activePollId=null;go("umfrage")}

async function renderUmfrageBoard(){
 if(!activePollId)return await renderUmfrageUebersicht();
 let poll=null;
 try{
 const snap=await getDoc(doc(db,"polls",activePollId));
 poll=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Umfrage laden:",e)}
 if(!poll){
 activePollId=null;
 toast("Diese Umfrage wurde nicht gefunden.");
 return await renderUmfrageUebersicht();
 }
 const votes=await getPollVotes(poll.id);
 const myVote=votes.find(v=>v.uid===currentUser.uid);
 const options=poll.options||[];
 const total=votes.length;
 const maxCount=Math.max(0,...options.map(o=>votes.filter(v=>v.optionId===o.id).length));
 const canManage=isTeacher()||poll.createdBy===currentUser.uid;
 return`${pageHead("ZUSAMMENARBEIT",esc(poll.question||"Live-Umfrage"),
 esc(poll.description||"")||"Wähle eine Antwortoption.",`<button class="secondary"onclick="closeUmfrage()">← Umfrage-Übersicht</button>
 <button class="secondary"onclick="downloadPollPDF('${poll.id}')"> Als PDF</button>
 ${canManage?`<button class="secondary"onclick="editPollForm('${poll.id}','${esc(poll.question||"")}','${esc(poll.description||"")}')">Bearbeiten</button>`:""}
 ${isTeacher()?`<button class="secondary"onclick="deletePoll('${poll.id}')">Umfrage löschen</button>`:""}`)}
 <div class="card">
 <p id="pollTotalCount">${total} Stimme(n) insgesamt. Wähle deine Antwort und speichere.</p>
 <div class="list"id="pollOptionList">${options.map(o=>`
 <label class="check"style="display:flex;align-items:center;gap:10px;padding:6px 0">
 <input type="radio"name="pollOption"value="${o.id}" ${myVote?.optionId===o.id?"checked":""}> ${esc(o.label)}
 </label>`).join("")}</div>
 <div class="form-actions"style="margin-top:10px"><button class="primary"onclick="savePollVote('${poll.id}')">Meine Stimme speichern</button></div>
 </div>
 <div class="card"style="margin-top:12px">
 <h3 style="margin-top:0">Ergebnis</h3>
 <div class="ampel-bars"id="pollResultBars">${options.map(o=>{
 const count=votes.filter(v=>v.optionId===o.id).length;
 const pct=total?Math.round((count/total)*100):0;
 const leading=count>0&&count===maxCount;
 return`<div class="ampel-bar-row"><span style="min-width:140px">${esc(o.label)}</span><div class="ampel-bar-track"><div class="ampel-bar-fill"style="width:${pct}%;background:${leading?"#2f9e6f":"#1598d1"}"></div></div><b style="min-width:70px;text-align:right">${count} · ${pct}%</b></div>`;
 }).join("")}</div>
 </div>
 ${footer()}`;
}

// Live-Update der Umfrage: Stimmenzähler und Ergebnis-Balken neu berechnen.
function subscribePollLive(pollId,options){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"pollVotes"),where("pollId","==",pollId)),
 snap=>{
 const votes=snap.docs.map(d=>({id:d.id,...d.data()}));
 const total=votes.length;
 const maxCount=Math.max(0,...options.map(o=>votes.filter(v=>v.optionId===o.id).length));
 const totalEl=$("pollTotalCount");
 if(totalEl)totalEl.textContent=`${total} Stimme(n) insgesamt. Wähle deine Antwort und speichere.`;
 const barsEl=$("pollResultBars");
 if(barsEl)barsEl.innerHTML=options.map(o=>{
 const count=votes.filter(v=>v.optionId===o.id).length;
 const pct=total?Math.round((count/total)*100):0;
 const leading=count>0&&count===maxCount;
 return`<div class="ampel-bar-row"><span style="min-width:140px">${esc(o.label)}</span><div class="ampel-bar-track"><div class="ampel-bar-fill"style="width:${pct}%;background:${leading?"#2f9e6f":"#1598d1"}"></div></div><b style="min-width:70px;text-align:right">${count} · ${pct}%</b></div>`;
 }).join("");
 },
 e=>console.error("Umfrage-Live-Update:",e)
 );
}

function openPollForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Umfrage starten.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">LIVE-UMFRAGE</div>
 <h2>Neue Umfrage starten</h2>
 <div class="form">
 <label>Frage<input id="poQuestion"maxlength="150"placeholder="z. B. Welches Thema wollt ihr vertiefen?"></label>
 <label>Beschreibung (optional)<textarea id="poDescription"rows="2"maxlength="300"></textarea></label>
 <label>Antwortoptionen (eine pro Zeile, 2–6)<textarea id="poOptions"rows="4"placeholder="Option A
Option B
Option C"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addPoll()">Starten</button>
 </div>
 </div>`);
}

async function addPoll(){
 const question=$("poQuestion")?.value.trim()||"";
 const description=$("poDescription")?.value.trim()||"";
 const lines=($("poOptions")?.value||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,6);
 if(!question){toast("Bitte eine Frage eingeben.");return}
 if(lines.length<2){toast("Bitte mindestens zwei Antwortoptionen eingeben (eine pro Zeile).");return}
 const options=lines.map((label,i)=>({id:"o"+i,label}));
 try{
 await addDoc(collection(db,"polls"),{
 question,description,options,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Umfrage gestartet.");
 }catch(e){
 console.error("Umfrage anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Umfrage konnte nicht gestartet werden.");
 }
}

function editPollForm(id,question,description){
 window.__editPollId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">LIVE-UMFRAGE</div>
 <h2>Umfrage bearbeiten</h2>
 <p style="color:var(--muted);font-size:12px">Die Antwortoptionen können hier nicht mehr geändert werden, damit bereits abgegebene Stimmen gültig bleiben.</p>
 <div class="form">
 <label>Frage<input id="poQuestion"value="${esc(question||"")}"></label>
 <label>Beschreibung (optional)<textarea id="poDescription"rows="2">${esc(description||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="updatePoll()">Speichern</button>
 </div>
 </div>`);
}

async function updatePoll(){
 const id=window.__editPollId;
 if(!id)return;
 const question=$("poQuestion")?.value.trim()||"";
 if(!question){toast("Bitte eine Frage eingeben.");return}
 try{
 await updateDoc(doc(db,"polls",id),{question,description:$("poDescription")?.value.trim()||""});
 closeModal();await render();toast("Umfrage aktualisiert.");
 }catch(e){
 console.error("Umfrage aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Umfrage konnte nicht aktualisiert werden.");
 }
}

async function savePollVote(pollId){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können abstimmen.");return}
 const checked=document.querySelector('#pollOptionList input[name="pollOption"]:checked');
 if(!checked){toast("Bitte eine Antwortoption auswählen.");return}
 try{
 await setDoc(doc(db,"pollVotes",`${pollId}_${currentUser.uid}`),{
 pollId,uid:currentUser.uid,
 name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 optionId:checked.value,updatedAt:serverTimestamp()
 });
 await render();
 toast("Deine Stimme wurde gespeichert.");
 }catch(e){
 console.error("Umfrage-Stimme speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Stimme konnte nicht gespeichert werden.");
 }
}

async function deletePoll(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Umfrage löschen.");return}
 if(!confirm("Diese Umfrage inklusive aller Stimmen wirklich löschen?"))return;
 try{
 const votes=await getPollVotes(id);
 await Promise.all(votes.map(v=>deleteDoc(doc(db,"pollVotes",v.id))));
 await deleteDoc(doc(db,"polls",id));
 if(activePollId===id)activePollId=null;
 go("umfrage");
 toast("Umfrage gelöscht.");
 }catch(e){console.error("Umfrage löschen:",e);toast("Umfrage konnte nicht vollständig gelöscht werden.")}
}

async function downloadPollPDF(pollId){
 try{
 const snap=await getDoc(doc(db,"polls",pollId));
 const poll=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!poll){toast("Diese Umfrage wurde nicht gefunden.");return}
 const votes=await getPollVotes(pollId);
 const options=poll.options||[];
 const total=votes.length;
 const body=`<table><thead><tr><th>Option</th><th style="text-align:right">Anzahl</th><th style="text-align:right">Anteil</th></tr></thead><tbody>
 ${options.map(o=>{
 const count=votes.filter(v=>v.optionId===o.id).length;
 const pct=total?Math.round((count/total)*100):0;
 return`<tr><td>${escPDF(o.label)}</td><td style="text-align:right">${count}</td><td style="text-align:right">${pct}%</td></tr>`;
 }).join("")}
 </tbody></table>`;
 openToolPrintWindow(
 "Live-Umfrage – "+(poll.question||"Umfrage"),
 body,"F12Sb · Live-Umfrage · "+total+"Stimme(n)"+(poll.description?" · "+poll.description:"")
 );
 }catch(e){console.error("Umfrage PDF:",e);toast("Die Umfrage konnte nicht als PDF geöffnet werden.")}
}

/* =========================================================
 ZUFALLS-PICKER "WER IST DRAN?" – zieht zufällig eine Person aus
 der Klasse (ohne Wiederholung, bis zurückgesetzt wird – nur
 lokal im Browser gemerkt) ODER aus einer eigenen, in Firestore
 gespeicherten Liste (z. B. Projektthemen, Gruppen).
 ========================================================= */
let pickedStudentUids=[];
let lastPickedStudentName="";

async function getRandomLists(){return await getCollection("randomPickerLists")}

async function renderZufallspicker(){
 const lists=await getRandomLists();
 return`${pageHead("ZUSAMMENARBEIT","Wer ist dran?","Zufällige Auswahl aus der Klasse oder aus einer eigenen Liste – z. B. für Aufrufen oder Themenverteilung.",`<button class="secondary"onclick="go('kollaboration')">← Tools für Zusammenarbeit</button>`)}
 <div class="card">
 <h3 style="margin-top:0"> Zufällige Person aus der Klasse</h3>
 <p>Ausgewählt werden nur bereits freigeschaltete Klassenmitglieder. Schon gezogene Personen werden bis zum Zurücksetzen ausgeschlossen (nur auf diesem Gerät gemerkt).</p>
 <div class="form-actions">
 <button class="primary"onclick="pickRandomStudent()"> Person auslosen</button>
 <button class="secondary"onclick="resetPickedStudents()">Zurücksetzen (${pickedStudentUids.length} schon dran)</button>
 </div>
 ${lastPickedStudentName?`<div class="notice"style="margin-top:14px"><strong> ${esc(lastPickedStudentName)}</strong></div>`:""}
 </div>
 <div class="card"style="margin-top:12px">
 <div class="page-head"style="margin-bottom:10px"><div><h3 style="margin:0">Eigene Listen</h3><p style="margin:4px 0 0">Themen, Gruppen oder andere Auswahllisten, die ihr wiederverwenden könnt.</p></div>
 <button class="secondary"onclick="openRandomListForm()">＋ Neue Liste</button></div>
 <div class="list">${lists.map(l=>{
 const items=Array.isArray(l.items)?l.items:[];
 const canEdit=isTeacher()||l.createdBy===currentUser.uid;
 return`<div class="list-item"style="flex-direction:column;align-items:stretch;gap:8px">
 <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
 <div><strong>${esc(l.title||"Liste")}</strong><small>${items.length} Einträge</small></div>
 <div style="display:flex;gap:6px;flex-shrink:0">
 <button class="primary"onclick="pickFromRandomList('${l.id}')"> Losen</button>
 ${canEdit?`<button class="secondary"onclick="editRandomListForm('${l.id}','${esc(l.title||"")}','${esc(items.join("\\n"))}')">Bearbeiten</button>`:""}
 ${canEdit?`<button class="secondary"onclick="deleteRandomList('${l.id}')">Löschen</button>`:""}
 </div>
 </div>
 ${l.lastPick?`<div class="notice"style="margin:0"><strong> ${esc(l.lastPick)}</strong></div>`:""}
 </div>`;
 }).join("")||`<div class="empty">Noch keine eigene Liste angelegt.</div>`}</div>
 </div>
 ${footer()}`;
}

async function pickRandomStudent(){
 try{
 const snap=await getDocs(collection(db,"users"));
 const students=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.status==="approved");
 const remaining=students.filter(u=>!pickedStudentUids.includes(u.uid));
 const pool=remaining.length?remaining:students;
 if(!pool.length){toast("Keine freigeschalteten Klassenmitglieder gefunden.");return}
 const pick=pool[Math.floor(Math.random()*pool.length)];
 if(!remaining.length)pickedStudentUids=[];
 pickedStudentUids.push(pick.uid);
 lastPickedStudentName=pick.displayName||pick.email||"Campus-Mitglied";
 await render();
 }catch(e){console.error("Zufallsauswahl:",e);toast("Auswahl war nicht möglich.")}
}

function resetPickedStudents(){
 pickedStudentUids=[];
 lastPickedStudentName="";
 render();
}

function openRandomListForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Liste anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">WER IST DRAN?</div>
 <h2>Neue Liste anlegen</h2>
 <div class="form">
 <label>Titel<input id="rlTitle"maxlength="120"placeholder="z. B. Projektthemen 12a"></label>
 <label>Einträge (einer pro Zeile)<textarea id="rlItems"rows="5"placeholder="Thema A
Thema B
Thema C"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addRandomList()">Liste anlegen</button>
 </div>
 </div>`);
}

async function addRandomList(){
 const title=$("rlTitle")?.value.trim()||"";
 const items=($("rlItems")?.value||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,50);
 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(!items.length){toast("Bitte mindestens einen Eintrag eingeben.");return}
 try{
 await addDoc(collection(db,"randomPickerLists"),{
 title,items,lastPick:"",
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Liste angelegt.");
 }catch(e){
 console.error("Liste anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Liste konnte nicht angelegt werden.");
 }
}

function editRandomListForm(id,title,itemsText){
 window.__editRandomListId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">WER IST DRAN?</div>
 <h2>Liste bearbeiten</h2>
 <div class="form">
 <label>Titel<input id="rlTitle"value="${esc(title||"")}"></label>
 <label>Einträge (einer pro Zeile)<textarea id="rlItems"rows="5">${esc(itemsText||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="updateRandomList()">Speichern</button>
 </div>
 </div>`);
}

async function updateRandomList(){
 const id=window.__editRandomListId;
 if(!id)return;
 const title=$("rlTitle")?.value.trim()||"";
 const items=($("rlItems")?.value||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,50);
 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(!items.length){toast("Bitte mindestens einen Eintrag eingeben.");return}
 try{
 await updateDoc(doc(db,"randomPickerLists",id),{title,items});
 closeModal();await render();toast("Liste aktualisiert.");
 }catch(e){
 console.error("Liste aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Liste konnte nicht aktualisiert werden.");
 }
}

async function pickFromRandomList(id){
 try{
 const snap=await getDoc(doc(db,"randomPickerLists",id));
 if(!snap.exists()){toast("Diese Liste wurde nicht gefunden.");return}
 const items=snap.data().items||[];
 if(!items.length){toast("Diese Liste hat keine Einträge.");return}
 const pick=items[Math.floor(Math.random()*items.length)];
 await updateDoc(doc(db,"randomPickerLists",id),{lastPick:pick});
 await render();
 }catch(e){
 console.error("Losen aus Liste:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Losen. Bitte die Firestore-Regeln prüfen.":"Losen war nicht möglich.");
 }
}

async function deleteRandomList(id){
 if(!confirm("Diese Liste wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"randomPickerLists",id));await render();toast("Liste gelöscht.");}
 catch(e){console.error("Liste löschen:",e);toast("Liste konnte nicht gelöscht werden.")}
}

/* =========================================================
 LERN-WERKZEUGE – neuer Hub in der Lernwerkstatt für
 individuelles Lernen (Karteikarten, Fokus-Timer, Glossar).
 ========================================================= */
async function renderLernWerkzeuge(){
 const tools=[
 ["","Karteikarten","Karten mit Frage und Antwort erstellen und zum Wiederholen durchklicken.","karteikarten",true],
 ["⏱","Fokus-Timer","Pomodoro-Technik: fokussiert arbeiten, dann bewusst Pause machen.","fokus-timer",true],
 ["","Glossar","Gemeinsames Nachschlagewerk für Fachbegriffe – von der Klasse befüllt.","glossar",true]
 ];
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Lern-Werkzeuge","Kostenlose Werkzeuge fürs eigene Lernen – Wiederholen, Fokussieren und Nachschlagen.",`<button class="secondary"onclick="go('lernwerkstatt')">← Lernwerkstatt</button>`)}
 <div class="grid grid-3">${tools.map(t=>`<a class="card tile"href="#${t[3]}"><span class="emoji">${t[0]}</span>
<strong>${t[1]}</strong><small>${t[2]}</small></a>`).join("")}</div>
 ${footer()}`;
}

/* =========================================================
 KARTEIKARTEN / VOKABELTRAINER – Decks mit Frage/Antwort-Karten,
 zum Wiederholen durchklicken. Collections: "flashcardDecks"
 (ein Deck) und"flashcards" (Feld deckId verweist auf das Deck).
 ========================================================= */
let activeDeckId=null;
let studyIndex=0, studyFlipped=false, studyOrder=[];

async function getFlashcardDecks(){return await getCollection("flashcardDecks")}
async function getFlashcards(deckId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"flashcards"),where("deckId","==",deckId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 }catch(e){console.error("Karteikarten laden:",e);return []}
}

async function renderKarteikartenUebersicht(){
 const decks=await getFlashcardDecks();
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Karteikarten","Erstelle Karten mit Frage und Antwort und wiederhole sie zum Lernen.",`<button class="secondary"onclick="go('lernwerkzeuge')">← Lern-Werkzeuge</button>
 <button class="primary"onclick="openDeckForm()">＋ Neues Deck</button>`)}
 <div class="grid grid-3">${decks.map(d=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openDeck('${d.id}')">
 <span class="emoji"></span>
 <strong>${esc(d.title||"Deck")}</strong>
 <small>${esc(d.description||"")||"Karteikarten-Deck."}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch kein Deck.</strong>Lege dein erstes Karteikarten-Deck an.</div>`}
 </div>${footer()}`;
}

function openDeck(id){activeDeckId=id;studyIndex=0;studyFlipped=false;studyOrder=[];go("karteikarten-board")}
function closeDeck(){activeDeckId=null;go("karteikarten")}

async function renderKarteikartenBoard(){
 if(!activeDeckId)return await renderKarteikartenUebersicht();
 let deck=null;
 try{
 const snap=await getDoc(doc(db,"flashcardDecks",activeDeckId));
 deck=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Deck laden:",e)}
 if(!deck){
 activeDeckId=null;
 toast("Dieses Deck wurde nicht gefunden.");
 return await renderKarteikartenUebersicht();
 }
 const cards=await getFlashcards(deck.id);
 if(!studyOrder.length||studyOrder.length!==cards.length)studyOrder=cards.map((c,i)=>i);
 const canManage=isTeacher()||deck.createdBy===currentUser.uid;
 const idx=Math.min(studyIndex,Math.max(0,cards.length-1));
 const current=cards.length?cards[studyOrder[idx]]:null;
 return`${pageHead("SELBSTSTÄNDIG LERNEN",esc(deck.title||"Deck"),
 esc(deck.description||"")||"Karteikarten-Deck.",`<button class="secondary"onclick="closeDeck()">← Karteikarten-Übersicht</button>
 <button class="primary"onclick="openCardForm()">＋ Karte</button>
 <button class="secondary"onclick="downloadDeckPDF('${deck.id}')"> Als PDF</button>
 ${canManage?`<button class="secondary"onclick="editDeckForm('${deck.id}','${esc(deck.title||"")}','${esc(deck.description||"")}')">Deck bearbeiten</button>`:""}
 ${isTeacher()?`<button class="secondary"onclick="deleteDeck('${deck.id}')">Deck löschen</button>`:""}`)}
 <style>
 .flash-card{min-height:220px;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font-size:20px;font-weight:700;cursor:pointer;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
 .flash-card small{display:block;margin-top:14px;font-size:12px;font-weight:400;color:var(--muted)}
 .flash-nav{display:flex;justify-content:center;gap:12px;margin-top:14px}
 </style>
 ${current?`
 <div class="card"><div class="flash-card"onclick="flipStudyCard()">
 ${studyFlipped?esc(current.back):esc(current.front)}
 <small>${studyFlipped?"Antwort · Klicken für Frage":"Frage · Klicken für Antwort"} · Karte ${idx+1} von ${cards.length}</small>
 </div>
 <div class="flash-nav">
 <button class="secondary"onclick="studyPrevCard()">← Zurück</button>
 <button class="secondary"onclick="shuffleDeck()"> Mischen</button>
 <button class="primary"onclick="studyNextCard()">Weiter →</button>
 </div></div>
 <div class="card"style="margin-top:12px"><h3 style="margin-top:0">Alle Karten (${cards.length})</h3><div class="list">${cards.map(c=>{
 const cardCanEdit=isTeacher()||c.createdBy===currentUser.uid;
 return`<div class="list-item"><div><strong>${esc(c.front)}</strong><small>${esc(c.back)}</small></div>${cardCanEdit?`<div style="display:flex;gap:6px"><button class="secondary"onclick="editCardForm('${c.id}','${esc(c.front)}','${esc(c.back)}')">Bearbeiten</button><button class="secondary"onclick="deleteCard('${c.id}')">Löschen</button></div>`:""}</div>`;
 }).join("")}</div></div>`
 :`<div class="empty"><strong>Noch keine Karten in diesem Deck.</strong>Füge die erste Karteikarte hinzu.</div>`}
 ${footer()}`;
}

function flipStudyCard(){studyFlipped=!studyFlipped;render()}
function studyNextCard(){
 const cards=studyOrder.length;
 studyIndex=cards?(studyIndex+1)%cards:0;
 studyFlipped=false;render();
}
function studyPrevCard(){
 const cards=studyOrder.length;
 studyIndex=cards?(studyIndex-1+cards)%cards:0;
 studyFlipped=false;render();
}
function shuffleDeck(){
 for(let i=studyOrder.length-1;i>0;i--){
 const j=Math.floor(Math.random()*(i+1));
 [studyOrder[i],studyOrder[j]]=[studyOrder[j],studyOrder[i]];
 }
 studyIndex=0;studyFlipped=false;render();
}

function openDeckForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können ein Deck anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">KARTEIKARTEN</div>
 <h2>Neues Deck anlegen</h2>
 <div class="form">
 <label>Titel<input id="fdTitle"maxlength="120"placeholder="z. B. BWL-Fachbegriffe"></label>
 <label>Kurzbeschreibung<textarea id="fdDescription"rows="2"maxlength="300"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addDeck()">Deck anlegen</button>
 </div>
 </div>`);
}

async function addDeck(){
 const title=$("fdTitle")?.value.trim()||"";
 const description=$("fdDescription")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"flashcardDecks"),{
 title,description,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Deck angelegt.");
 }catch(e){
 console.error("Deck anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Deck konnte nicht angelegt werden.");
 }
}

function editDeckForm(id,title,description){
 window.__editDeckId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">KARTEIKARTEN</div>
 <h2>Deck bearbeiten</h2>
 <div class="form">
 <label>Titel<input id="fdTitle"value="${esc(title||"")}"></label>
 <label>Kurzbeschreibung<textarea id="fdDescription"rows="2">${esc(description||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="updateDeck()">Speichern</button>
 </div>
 </div>`);
}

async function updateDeck(){
 const id=window.__editDeckId;
 if(!id)return;
 const title=$("fdTitle")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 try{
 await updateDoc(doc(db,"flashcardDecks",id),{title,description:$("fdDescription")?.value.trim()||""});
 closeModal();await render();toast("Deck aktualisiert.");
 }catch(e){
 console.error("Deck aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Deck konnte nicht aktualisiert werden.");
 }
}

async function deleteDeck(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können ein Deck löschen.");return}
 if(!confirm("Dieses Deck inklusive aller Karten wirklich löschen?"))return;
 try{
 const cards=await getFlashcards(id);
 await Promise.all(cards.map(c=>deleteDoc(doc(db,"flashcards",c.id))));
 await deleteDoc(doc(db,"flashcardDecks",id));
 if(activeDeckId===id)activeDeckId=null;
 go("karteikarten");
 toast("Deck gelöscht.");
 }catch(e){console.error("Deck löschen:",e);toast("Deck konnte nicht vollständig gelöscht werden.")}
}

function openCardForm(){
 if(!activeDeckId){toast("Bitte zuerst ein Deck öffnen.");return}
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Karten hinzufügen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">KARTEIKARTEN</div>
 <h2>Neue Karte</h2>
 <div class="form">
 <label>Frage (Vorderseite)<textarea id="fcFront"rows="2"maxlength="300"></textarea></label>
 <label>Antwort (Rückseite)<textarea id="fcBack"rows="2"maxlength="300"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addCard()">Karte hinzufügen</button>
 </div>
 </div>`);
}

async function addCard(){
 if(!activeDeckId)return;
 const front=$("fcFront")?.value.trim()||"";
 const back=$("fcBack")?.value.trim()||"";
 if(!front||!back){toast("Bitte Frage und Antwort eingeben.");return}
 try{
 await addDoc(collection(db,"flashcards"),{
 deckId:activeDeckId,front,back,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();studyOrder=[];await render();showMotivationsBild();toast("Karte hinzugefügt.");
 }catch(e){
 console.error("Karte anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Hinzufügen. Bitte die Firestore-Regeln prüfen.":"Karte konnte nicht gespeichert werden.");
 }
}

function editCardForm(id,front,back){
 window.__editCardId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">KARTEIKARTEN</div>
 <h2>Karte bearbeiten</h2>
 <div class="form">
 <label>Frage (Vorderseite)<textarea id="fcFront"rows="2">${esc(front||"")}</textarea></label>
 <label>Antwort (Rückseite)<textarea id="fcBack"rows="2">${esc(back||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="updateCard()">Speichern</button>
 </div>
 </div>`);
}

async function updateCard(){
 const id=window.__editCardId;
 if(!id)return;
 const front=$("fcFront")?.value.trim()||"";
 const back=$("fcBack")?.value.trim()||"";
 if(!front||!back){toast("Bitte Frage und Antwort eingeben.");return}
 try{
 await updateDoc(doc(db,"flashcards",id),{front,back});
 closeModal();await render();toast("Karte aktualisiert.");
 }catch(e){
 console.error("Karte aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Karte konnte nicht aktualisiert werden.");
 }
}

async function deleteCard(id){
 if(!confirm("Diese Karte wirklich entfernen?"))return;
 try{await deleteDoc(doc(db,"flashcards",id));studyOrder=[];await render();toast("Karte entfernt.");}
 catch(e){console.error("Karte löschen:",e);toast("Karte konnte nicht entfernt werden.")}
}

async function downloadDeckPDF(deckId){
 try{
 const snap=await getDoc(doc(db,"flashcardDecks",deckId));
 const deck=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!deck){toast("Dieses Deck wurde nicht gefunden.");return}
 const cards=await getFlashcards(deckId);
 const body=cards.length?cards.map(c=>`<div class="item">
 <strong>${escPDF(c.front)}</strong>
 <div>${escPDF(c.back)}</div>
 </div>`).join(""):`<p class="empty">Noch keine Karten.</p>`;
 openToolPrintWindow(
 "Karteikarten – "+(deck.title||"Deck"),
 body,"F12Sb · Karteikarten · "+cards.length+"Karte(n)"+(deck.description?" · "+deck.description:"")
 );
 }catch(e){console.error("Karteikarten PDF:",e);toast("Das Deck konnte nicht als PDF geöffnet werden.")}
}

/* =========================================================
 FOKUS-TIMER (POMODORO) – rein clientseitig, keine Firestore-
 Collection nötig. Zustand liegt in Modul-Variablen; da render()
 das #content-HTML komplett ersetzt, wird der Zähler über die
 Element-ID im DOM aktualisiert und stoppt sich selbst, sobald
 die Seite verlassen wurde (Element nicht mehr vorhanden).
 ========================================================= */
let pomodoroSecondsLeft=25*60, pomodoroPhase="fokus", pomodoroRunning=false, pomodoroInterval=null;
let pomodoroWorkMin=25, pomodoroBreakMin=5;

// ---- Uhr & Timer (frei einstellbar für Lehrkräfte und Schüler) ----------
// ---- Datei-Upload (Firebase Storage) – gemeinsam für Lernprodukte und
// Pinnwand-Notizen genutzt. Max. 15 MB pro Datei.
const DATEI_MAX_BYTES=15*1024*1024;
async function uploadCampusDatei(file,pfadPrefix){
 if(!storage)await loadFirebase();
 if(!storage)throw new Error("Firebase Storage konnte nicht geladen werden (Netzwerk/Verbindung prüfen).");
 if(file.size>DATEI_MAX_BYTES)throw new Error("Datei ist zu groß (max. 15 MB).");
 const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
 const path=`${pfadPrefix}/${currentUser.uid}_${Date.now()}_${safeName}`;
 try{
 const fileRef=storageRef(storage,path);
 await uploadBytes(fileRef,file);
 const url=await getDownloadURL(fileRef);
 return {url,name:file.name,path};
 }catch(e){
 console.error("Datei-Upload:",e);
 if(e?.code==="storage/unauthorized")throw new Error("Firebase blockiert den Upload (storage/unauthorized) – die storage.rules wurden vermutlich noch nicht in der Firebase-Konsole veröffentlicht.");
 if(e?.code==="storage/unknown"||e?.code==="storage/retry-limit-exceeded")throw new Error("Firebase Storage antwortet nicht – ist Storage im Firebase-Projekt bereits aktiviert (Konsole → Storage → Erste Schritte)?");
 throw new Error(`Upload fehlgeschlagen (${e?.code||e?.message||"unbekannter Fehler"}).`);
 }
}
function dateiIstBild(name){return /\.(jpe?g|png|gif|webp|svg)$/i.test(name||"")}
function dateiIstVideo(name){return /\.(mp4|webm|mov|m4v)$/i.test(name||"")}
function dateiIstAudio(name){return /\.(mp3|wav|ogg|m4a)$/i.test(name||"")}
// ---- Mini-Werkzeug-Kacheln: passende Lernwerkstatt-Tools direkt im
// jeweiligen Arbeitsschritt startbar machen ----------------------------
function miniToolRow(tools){
 return `<div class="mini-tool-row">${tools.map(([icon,label,route])=>
 `<a href="#${route}"class="mini-tool-tile"onclick="closeModal()"><span class="mini-tool-icon">${icon}</span><span class="mini-tool-label">${label}</span></a>`
 ).join("")}</div>`;
}

function dateiEmbedHTML(url,name){
 if(dateiIstBild(name))return`<img src="${esc(url)}"alt="${esc(name)}"style="max-width:100%;border-radius:8px">`;
 if(dateiIstVideo(name))return`<video controls style="width:100%;border-radius:8px;max-height:240px"src="${esc(url)}"></video>`;
 if(dateiIstAudio(name))return`<audio controls style="width:100%"src="${esc(url)}"></audio>`;
 return`<a href="${esc(url)}"target="_blank"rel="noopener"class="pill"> ${esc(name)} öffnen ↗</a>`;
}

function analogClockSVG(size){
 const s=size||90;
 const marks=Array.from({length:12},(_,i)=>{
 const angle=i*30*Math.PI/180;
 const x1=50+42*Math.sin(angle),y1=50-42*Math.cos(angle);
 const x2=50+(i%3===0?36:38)*Math.sin(angle),y2=50-(i%3===0?36:38)*Math.cos(angle);
 return `<line x1="${x1.toFixed(1)}"y1="${y1.toFixed(1)}"x2="${x2.toFixed(1)}"y2="${y2.toFixed(1)}"stroke="#8a99a3"stroke-width="${i%3===0?2:1}"stroke-linecap="round"/>`;
 }).join("");
 return `<svg class="analog-clock"viewBox="0 0 100 100"width="${s}"height="${s}">
 <circle cx="50"cy="50"r="47"fill="#fff"stroke="#d6e2ea"stroke-width="2"/>
 ${marks}
 <line class="clock-hand-h"x1="50"y1="50"x2="50"y2="28"stroke="#17384f"stroke-width="4"stroke-linecap="round"></line>
 <line class="clock-hand-m"x1="50"y1="50"x2="50"y2="16"stroke="#17384f"stroke-width="3"stroke-linecap="round"></line>
 <line class="clock-hand-s"x1="50"y1="50"x2="50"y2="12"stroke="#e8890c"stroke-width="1.5"stroke-linecap="round"></line>
 <circle cx="50"cy="50"r="3.5"fill="#17384f"/>
 </svg>`;
}
let __globalClockInterval=null;
function ensureGlobalClock(){
 if(__globalClockInterval)return;
 const tick=()=>{
 const now=new Date();
 const h=now.getHours()%12,m=now.getMinutes(),s=now.getSeconds();
 const hDeg=h*30+m*0.5, mDeg=m*6+s*0.1, sDeg=s*6;
 document.querySelectorAll(".clock-hand-h").forEach(el=>el.setAttribute("transform",`rotate(${hDeg} 50 50)`));
 document.querySelectorAll(".clock-hand-m").forEach(el=>el.setAttribute("transform",`rotate(${mDeg} 50 50)`));
 document.querySelectorAll(".clock-hand-s").forEach(el=>el.setAttribute("transform",`rotate(${sDeg} 50 50)`));
 const dateStr=now.toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long"});
 document.querySelectorAll(".live-clock-date").forEach(el=>el.textContent=dateStr);
 };
 tick();
 __globalClockInterval=setInterval(tick,1000);
}
let simpleTimerMinutes=10;
let simpleTimerSecondsLeft=600;
let simpleTimerRunning=false;
let simpleTimerInterval=null;
function simpleTimerFormat(sec){const m=Math.floor(sec/60),s=sec%60;return`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function startSimpleTimer(){
 if(simpleTimerRunning)return;
 if(simpleTimerSecondsLeft<=0){
 const mins=Math.max(1,Math.min(180,parseInt($("simpleTimerInput")?.value,10)||10));
 simpleTimerMinutes=mins;simpleTimerSecondsLeft=mins*60;
 }
 simpleTimerRunning=true;
 const btn=$("simpleTimerStartBtn");if(btn)btn.textContent="Läuft …";
 simpleTimerInterval=setInterval(()=>{
 simpleTimerSecondsLeft--;
 const disp=$("simpleTimerDisplay");if(disp)disp.textContent=simpleTimerFormat(simpleTimerSecondsLeft);
 if(simpleTimerSecondsLeft<=0){
 clearInterval(simpleTimerInterval);simpleTimerRunning=false;
 toast(" Zeit ist um!");
 const b=$("simpleTimerStartBtn");if(b)b.textContent="▶ Start";
 }
 },1000);
}
function pauseSimpleTimer(){
 clearInterval(simpleTimerInterval);simpleTimerRunning=false;
 const btn=$("simpleTimerStartBtn");if(btn)btn.textContent="▶ Weiter";
}
function resetSimpleTimer(){
 clearInterval(simpleTimerInterval);simpleTimerRunning=false;
 const mins=Math.max(1,Math.min(180,parseInt($("simpleTimerInput")?.value,10)||10));
 simpleTimerMinutes=mins;simpleTimerSecondsLeft=mins*60;
 const disp=$("simpleTimerDisplay");if(disp)disp.textContent=simpleTimerFormat(simpleTimerSecondsLeft);
 const btn=$("simpleTimerStartBtn");if(btn)btn.textContent="▶ Start";
}
window.startSimpleTimer=startSimpleTimer;window.pauseSimpleTimer=pauseSimpleTimer;window.resetSimpleTimer=resetSimpleTimer;
function renderUhrTimer(){
 ensureGlobalClock();
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Uhr & Timer","Aktuelle Uhrzeit im Blick behalten oder einen frei einstellbaren Timer starten.",`<button class="secondary"onclick="go('lernwerkstatt')">← Lernwerkstatt</button>`)}
 <div class="grid grid-2"style="gap:16px">
 <div class="card"style="text-align:center">
 <div class="kicker">AKTUELLE UHRZEIT</div>
 <div style="display:flex;justify-content:center;margin-top:10px">${analogClockSVG(160)}</div>
 <div class="pomo-phase live-clock-date"style="margin-top:8px">${new Date().toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long"})}</div>
 </div>
 <div class="card"style="text-align:center">
 <div class="kicker">TIMER</div>
 <div class="pomo-display"id="simpleTimerDisplay"style="margin-top:10px">${simpleTimerFormat(simpleTimerSecondsLeft)}</div>
 <div class="pomo-actions">
 <button class="primary"id="simpleTimerStartBtn"onclick="startSimpleTimer()">${simpleTimerRunning?"Läuft …":"▶ Start"}</button>
 <button class="secondary"onclick="pauseSimpleTimer()">⏸ Pause</button>
 <button class="secondary"onclick="resetSimpleTimer()">↺ Zurücksetzen</button>
 </div>
 <div class="pomo-settings">
 <label>Minuten<input id="simpleTimerInput"type="number"min="1"max="180"value="${simpleTimerMinutes}"></label>
 </div>
 <small style="display:block;margin-top:10px;color:var(--muted)">Lehrkräfte und Schüler:innen können die Minuten frei einstellen – z. B. für Prüfungssimulationen, Gruppenarbeiten oder eigene Lernphasen.</small>
 </div>
 </div>
 ${footer()}`;
}
window.renderUhrTimer=renderUhrTimer;

function renderFokusTimer(){
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Fokus-Timer","Pomodoro-Technik: fokussiert arbeiten, dann bewusst Pause machen.",`<button class="secondary"onclick="go('lernwerkzeuge')">← Lern-Werkzeuge</button>`)}
 <style>
 .pomo-display{font-size:64px;font-weight:800;text-align:center;margin:10px 0}
 .pomo-phase{text-align:center;font-size:14px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
 .pomo-actions{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
 .pomo-settings{display:flex;gap:14px;justify-content:center;margin-top:18px;flex-wrap:wrap}
 .pomo-settings label{display:flex;flex-direction:column;font-size:12px;color:var(--muted);gap:4px}
 .pomo-settings input{width:80px}
 </style>
 <div class="card">
 <div class="pomo-phase"id="pomodoroPhaseLabel">${pomodoroPhase==="fokus"?"Fokus-Phase":"Pause"}</div>
 <div class="pomo-display"id="pomodoroDisplay">${pomodoroFormat(pomodoroSecondsLeft)}</div>
 <div class="pomo-actions">
 <button class="primary"id="pomodoroStartBtn"onclick="startPomodoro()">${pomodoroRunning?"Läuft …":"▶ Start"}</button>
 <button class="secondary"onclick="pausePomodoro()">⏸ Pause</button>
 <button class="secondary"onclick="resetPomodoro()">↺ Zurücksetzen</button>
 </div>
 <div class="pomo-settings">
 <label>Fokus (Minuten)<input id="pomodoroWorkInput"type="number"min="1"max="90"value="${pomodoroWorkMin}"></label>
 <label>Pause (Minuten)<input id="pomodoroBreakInput"type="number"min="1"max="30"value="${pomodoroBreakMin}"></label>
 </div>
 </div>
 ${footer()}`;
}

function pomodoroFormat(sec){
 const m=Math.floor(sec/60), s=sec%60;
 return`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function initPomodoroTimer(){
 const workInput=$("pomodoroWorkInput"), breakInput=$("pomodoroBreakInput");
 workInput?.addEventListener("change",()=>{
 pomodoroWorkMin=Math.max(1,Math.min(90,Number(workInput.value)||25));
 if(!pomodoroRunning&&pomodoroPhase==="fokus"){pomodoroSecondsLeft=pomodoroWorkMin*60;pomodoroUpdateDisplay()}
 });
 breakInput?.addEventListener("change",()=>{
 pomodoroBreakMin=Math.max(1,Math.min(30,Number(breakInput.value)||5));
 if(!pomodoroRunning&&pomodoroPhase==="pause"){pomodoroSecondsLeft=pomodoroBreakMin*60;pomodoroUpdateDisplay()}
 });
}

function pomodoroUpdateDisplay(){
 const el=$("pomodoroDisplay");
 if(!el){clearInterval(pomodoroInterval);pomodoroInterval=null;return false}
 el.textContent=pomodoroFormat(pomodoroSecondsLeft);
 const label=$("pomodoroPhaseLabel");if(label)label.textContent=pomodoroPhase==="fokus"?"Fokus-Phase":"Pause";
 const btn=$("pomodoroStartBtn");if(btn)btn.textContent=pomodoroRunning?"Läuft …":"▶ Start";
 return true;
}

function pomodoroTick(){
 if(!pomodoroUpdateDisplay())return;
 if(!pomodoroRunning)return;
 pomodoroSecondsLeft--;
 if(pomodoroSecondsLeft<0){
 pomodoroPhase=pomodoroPhase==="fokus"?"pause":"fokus";
 pomodoroSecondsLeft=(pomodoroPhase==="fokus"?pomodoroWorkMin:pomodoroBreakMin)*60;
 toast(pomodoroPhase==="fokus"?"Pause vorbei – weiter geht's mit Fokus!":"Fokus-Phase geschafft – Zeit für eine Pause!");
 }
 pomodoroUpdateDisplay();
}

function startPomodoro(){
 if(pomodoroRunning)return;
 pomodoroRunning=true;
 if(!pomodoroInterval)pomodoroInterval=setInterval(pomodoroTick,1000);
 pomodoroUpdateDisplay();
}

function pausePomodoro(){pomodoroRunning=false;pomodoroUpdateDisplay()}

function resetPomodoro(){
 pomodoroRunning=false;
 pomodoroPhase="fokus";
 pomodoroSecondsLeft=pomodoroWorkMin*60;
 pomodoroUpdateDisplay();
}

/* =========================================================
 GLOSSAR / FACHBEGRIFFE-WIKI – gemeinsames, durchsuchbares
 Nachschlagewerk. Flache Liste (keine Übersicht/Detail-Trennung
 nötig), alphabetisch sortiert. Collection"glossaryEntries".
 ========================================================= */
async function getGlossaryEntries(){return await getCollection("glossaryEntries")}

function glossaryEntryHTML(g){
 const canEdit=isTeacher()||g.createdBy===currentUser.uid;
 const searchKey=esc(((g.term||"")+" "+(g.definition||"")).toLowerCase());
 return`<div class="card glossary-entry"data-search="${searchKey}"style="margin-bottom:10px">
 <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
 <div><strong>${esc(g.term||"Begriff")}</strong><p style="margin:6px 0 0">${esc(g.definition||"")}</p></div>
 <div style="display:flex;gap:6px;flex-shrink:0">
 <button class="secondary"onclick="openReportForm('glossaryEntries','${g.id}','${esc((g.term||"")+": "+(g.definition||"")).slice(0,80)}')"> Melden</button>
 ${canEdit?`<button class="secondary"onclick="editGlossaryForm('${g.id}','${esc(g.term||"")}','${esc(g.definition||"")}')">Bearbeiten</button>
 <button class="secondary"onclick="deleteGlossaryEntry('${g.id}')">Löschen</button>`:""}
 </div>
 </div>
 </div>`;
}

function filterGlossary(){
 const q=($("glossarySearch")?.value||"").toLowerCase().trim();
 document.querySelectorAll("#glossaryList .glossary-entry").forEach(el=>{
 el.hidden=Boolean(q) && !(el.dataset.search||"").includes(q);
 });
}

async function renderGlossar(){
 const entries=(await getGlossaryEntries()).sort((a,b)=>String(a.term||"").localeCompare(String(b.term||""),"de"));
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Glossar","Gemeinsames Nachschlagewerk für Fachbegriffe – von der Klasse befüllt.",`<button class="secondary"onclick="go('lernwerkzeuge')">← Lern-Werkzeuge</button>
 <button class="primary"onclick="openGlossaryForm()">＋ Begriff hinzufügen</button>
 <button class="secondary"onclick="downloadGlossaryPDF()"> Als PDF</button>`)}
 <input class="search"id="glossarySearch"placeholder="Begriff oder Erklärung suchen …"style="margin-bottom:14px">
 <div id="glossaryList">${entries.map(glossaryEntryHTML).join("")||`<div class="empty"><strong>Noch keine Begriffe.</strong>Ergänze den ersten Fachbegriff.</div>`}</div>
 ${footer()}`;
}

function openGlossaryForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können einen Begriff ergänzen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">GLOSSAR</div>
 <h2>Begriff hinzufügen</h2>
 <div class="form">
 <label>Begriff<input id="glTerm"maxlength="100"placeholder="z. B. Deckungsbeitrag"></label>
 <label>Erklärung<textarea id="glDefinition"rows="3"maxlength="500"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addGlossaryEntry()">Hinzufügen</button>
 </div>
 </div>`);
}

async function addGlossaryEntry(){
 const term=$("glTerm")?.value.trim()||"";
 const definition=$("glDefinition")?.value.trim()||"";
 if(!term||!definition){toast("Bitte Begriff und Erklärung eingeben.");return}
 try{
 await addDoc(collection(db,"glossaryEntries"),{
 term,definition,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();showMotivationsBild();toast("Begriff hinzugefügt.");
 }catch(e){
 console.error("Glossar-Eintrag anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Hinzufügen. Bitte die Firestore-Regeln prüfen.":"Begriff konnte nicht gespeichert werden.");
 }
}

function editGlossaryForm(id,term,definition){
 window.__editGlossaryId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">GLOSSAR</div>
 <h2>Begriff bearbeiten</h2>
 <div class="form">
 <label>Begriff<input id="glTerm"value="${esc(term||"")}"></label>
 <label>Erklärung<textarea id="glDefinition"rows="3">${esc(definition||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="updateGlossaryEntry()">Speichern</button>
 </div>
 </div>`);
}

async function updateGlossaryEntry(){
 const id=window.__editGlossaryId;
 if(!id)return;
 const term=$("glTerm")?.value.trim()||"";
 const definition=$("glDefinition")?.value.trim()||"";
 if(!term||!definition){toast("Bitte Begriff und Erklärung eingeben.");return}
 try{
 await updateDoc(doc(db,"glossaryEntries",id),{term,definition});
 closeModal();await render();toast("Begriff aktualisiert.");
 }catch(e){
 console.error("Glossar-Eintrag aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Begriff konnte nicht aktualisiert werden.");
 }
}

async function deleteGlossaryEntry(id){
 if(!confirm("Diesen Begriff wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"glossaryEntries",id));await render();toast("Begriff gelöscht.");}
 catch(e){console.error("Begriff löschen:",e);toast("Begriff konnte nicht gelöscht werden.")}
}

async function downloadGlossaryPDF(){
 try{
 const entries=(await getGlossaryEntries()).sort((a,b)=>String(a.term||"").localeCompare(String(b.term||""),"de"));
 const body=entries.length?entries.map(g=>`<div class="item">
 <strong>${escPDF(g.term)}</strong>
 <div>${escPDF(g.definition)}</div>
 </div>`).join(""):`<p class="empty">Noch keine Begriffe.</p>`;
 openToolPrintWindow("Glossar",body,"F12Sb · Fachbegriffe-Glossar · "+entries.length+"Begriff(e)");
 }catch(e){console.error("Glossar PDF:",e);toast("Das Glossar konnte nicht als PDF geöffnet werden.")}
}

/* =========================================================
 FACHAUFSATZ-TRAINING – Fachaufsatz Pädagogik/Psychologie
 Baustein für Baustein üben (Einleitung, Theorie allgemein,
 Theorie am Fall analysieren, Beurteilung), gegliedert nach den
 vier Lernbereichen aus LehrplanPLUS FOS 12 Pädagogik/Psychologie.
 Fallbeispiele können als Text und/oder als Link zu einer bereits
 gehosteten PDF (z. B. Google Drive) hinterlegt werden – kein
 eigener Datei-Upload, damit kein Firebase Storage nötig ist.
 Collections: "essayCases" (Fallbeispiele, für alle sichtbar) und"essayEntries" (eigene Übungstexte, PRIVAT – nur die schreibende
 Person und Lehrkräfte dürfen sie lesen, exakt wie beim
 Lernjournal). Feste Doc-ID "<caseId>_<type>_<uid>", damit pro
 Fall/Baustein/Person immer nur eine aktuelle Fassung existiert.
 Rückmeldung: Schüler:in fordert sie gezielt pro Baustein an,
 Lehrkraft schreibt einen Kommentar zurück, der direkt beim
 Baustein angezeigt wird. Echte automatische Bewertung würde eine
 kostenpflichtige externe KI benötigen und ist daher bewusst nicht
 eingebaut.
 ========================================================= */
let activeEssayCaseId=null;
const essayParts=[
 ["einleitung","Einleitung",["Thema/Fragestellung kurz benennen","Fallbeispiel in 1–2 Sätzen anreißen","Bezug zur Theorie andeuten","Aufbau des Aufsatzes kurz ankündigen","Sachlich, prägnant (ca. 5–8 Sätze)"],
 ["Hast du Thema und Fragestellung ähnlich klar benannt?","Ist dein Fallbezug ähnlich kurz und treffend?"]],
 ["theorie","Theorie allgemein",["Fachbegriffe korrekt und präzise definieren","Theorie in eigenen Worten darstellen","Kernaussagen/Modell vollständig und strukturiert erklären","Noch KEIN Bezug zum Fallbeispiel","Fachsprache durchgehend korrekt verwenden"],
 ["Hast du die gleichen Kernbegriffe korrekt definiert?","Ist deine Darstellung ähnlich vollständig und strukturiert?"]],
 ["analyse","Theorie am Fall analysieren",["Konkrete Stellen/Verhaltensweisen aus dem Fall aufgreifen","Jede Beobachtung mit der Theorie begründen","Klarer Bezug: „Dies zeigt sich im Fall daran, dass …“","Roter Faden zwischen Theorie und Analyse erkennbar"],
 ["Hast du ähnliche Textstellen/Beobachtungen aus dem Fall aufgegriffen?","Ist dein Theoriebezug ähnlich präzise begründet?"]],
 ["beurteilung","Beurteilung",["Eigene fachliche Einschätzung abgeben","Chancen UND Grenzen benennen","Ggf. Handlungsempfehlungen ableiten","Sachlich begründen, kurzes Fazit am Ende"],
 ["Hast du sowohl Chancen als auch Grenzen benannt wie im Muster?","Ist deine Einschätzung ähnlich sachlich begründet?"]]
];
const essayLernbereiche=[
 ["11.1","Pädagogik/Psychologie als Wissenschaft"],
 ["11.2","Grundlagen des Erlebens, Verhaltens, Handelns"],
 ["11.3","Erziehungs- und Bildungsprozesse"],
 ["11.4","Lernen als steuerbarer Prozess"]
];
function essayLernbereichLabel(code){
 const found=essayLernbereiche.find(l=>l[0]===code);
 return found?`${found[0]} – ${found[1]}`:(code||"Ohne Lernbereich");
}
function essayPartLabel(type){
 const found=essayParts.find(p=>p[0]===type);
 return found?found[1]:type;
}
// Berechnet aus der Selbsteinschätzung eine Ampel: grün = alle Kriterien
// erfüllt, gelb = teilweise, rot = größtenteils nicht erfüllt,
// grau/leer = noch keine Selbsteinschätzung abgegeben.
function essaySelfCheckStatus(entry,criteriaCount){
 if(!entry?.selfCheck)return {color:"",label:"Noch keine Selbsteinschätzung"};
 const vals=Array.from({length:criteriaCount},(_,i)=>!!entry.selfCheck[i]);
 const metCount=vals.filter(Boolean).length;
 if(metCount===criteriaCount)return {color:"green",label:`✅ Alle ${criteriaCount} Kriterien selbst erfüllt`};
 if(metCount===0)return {color:"red",label:"🔴 Noch keine Kriterien erfüllt (Selbsteinschätzung)"};
 return {color:"yellow",label:`🟡 ${metCount}/${criteriaCount} Kriterien selbst erfüllt`};
}

// Fest eingebaute Beispiel-Fallbeispiele (aktuell keine für F12Sb hinterlegt –
// die App unterstützt sie aber genauso wie F12Sb, falls später gewünscht).
const ESSAY_SEED_CASES=[];

async function getEssayCases(){
 const stored=await getCollection("essayCases");
 const storedTitles=new Set(stored.map(c=>c.title));
 const seeds=ESSAY_SEED_CASES.filter(s=>!storedTitles.has(s.title));
 return [...seeds,...stored];
}

async function getMyEssayEntries(caseId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"essayEntries"),where("caseId","==",caseId),where("uid","==",currentUser.uid)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Eigene Übungen laden:",e);return []}
}

async function getAllEssayEntriesForCase(caseId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"essayEntries"),where("caseId","==",caseId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Alle Übungen laden:",e);return []}
}

function essayCaseTileHTML(c){
 return`<div class="card tile"style="cursor:pointer;text-align:left"onclick="openEssayCase('${c.id}')">
 <span class="emoji"></span>
 <strong>${esc(c.title||"Fallbeispiel")}</strong>
 <small>${esc(c.theoryArea||"")||"Fachaufsatz-Training"}</small>
 </div>`;
}

async function renderFachaufsatzUebersicht(){
 const cases=await getEssayCases();
 const grouped=essayLernbereiche.map(([code,label])=>({code,label,cases:cases.filter(c=>c.lernbereich===code)}));
 const ungrouped=cases.filter(c=>!c.lernbereich||!essayLernbereiche.some(l=>l[0]===c.lernbereich));
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Fachaufsatz-Training","Fachaufsatz in Pädagogik/Psychologie üben – Baustein für Baustein, gegliedert nach den Lernbereichen 11.1–11.4.",`<button class="secondary"onclick="go('lernwerkstatt')">← Lernwerkstatt</button>
 <button class="primary"onclick="openEssayCaseForm()">＋ Neues Fallbeispiel</button>`)}
 <div class="notice"><strong>Deine Übungstexte sind privat.</strong><p style="margin-bottom:0">Nur du selbst und Lehrkräfte können sehen, was du hier schreibst – nicht deine Mitschüler:innen.</p></div>
 ${grouped.map(g=>`
 <h3 style="margin:20px 0 10px">${esc(g.code)} – ${esc(g.label)}</h3>
 <div class="grid grid-3">${g.cases.map(essayCaseTileHTML).join("")||`<div class="empty">Noch kein Fallbeispiel in diesem Lernbereich.</div>`}</div>`).join("")}
 ${ungrouped.length?`<h3 style="margin:20px 0 10px">Ohne Lernbereich</h3><div class="grid grid-3">${ungrouped.map(essayCaseTileHTML).join("")}</div>`:""}
 ${footer()}`;
}

function openEssayCase(id){activeEssayCaseId=id;go("fachaufsatz-board")}
function closeEssayCase(){activeEssayCaseId=null;go("fachaufsatz")}

async function renderFachaufsatzBoard(){
 if(!activeEssayCaseId)return await renderFachaufsatzUebersicht();
 let c=null;
 if(activeEssayCaseId.startsWith("seed-")){
 c=ESSAY_SEED_CASES.find(s=>s.id===activeEssayCaseId)||null;
 }else{
 try{
 const snap=await getDoc(doc(db,"essayCases",activeEssayCaseId));
 c=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Fallbeispiel laden:",e)}
 }
 if(!c){
 activeEssayCaseId=null;
 toast("Dieses Fallbeispiel wurde nicht gefunden.");
 return await renderFachaufsatzUebersicht();
 }
 const myEntries=await getMyEssayEntries(c.id);
 const byType={};myEntries.forEach(e=>byType[e.type]=e);
 const canManage=!c.isSeed&&(isTeacher()||c.createdBy===currentUser.uid);
 const teacherEntries=isTeacher()?await getAllEssayEntriesForCase(c.id):[];
 return`${pageHead("SELBSTSTÄNDIG LERNEN",esc(c.title||"Fallbeispiel"),
 essayLernbereichLabel(c.lernbereich)+(c.theoryArea?" · "+esc(c.theoryArea):""),`<button class="secondary"onclick="closeEssayCase()">← Fallbeispiel-Übersicht</button>
 <button class="secondary"onclick="downloadEssayPDF('${c.id}')"> Meinen Aufsatz als PDF</button>
 ${canManage?`<button class="secondary"onclick="openEssayModelAnswersForm('${c.id}')"> Musterlösungen bearbeiten</button>`:""}
 ${canManage?`<button class="secondary"onclick="deleteEssayCase('${c.id}')">Fall löschen</button>`:""}`)}
 <div class="card">
 <h3 style="margin-top:0">Fallbeispiel</h3>
 ${c.caseText?`<p style="white-space:pre-wrap">${esc(c.caseText)}</p>`:""}
 ${c.pdfUrl?`<a href="${esc(c.pdfUrl)}"target="_blank"rel="noopener noreferrer"class="secondary"style="display:inline-block;text-decoration:none;padding:8px 14px;border-radius:8px;border:1px solid var(--line,#ddd);margin-top:${c.caseText?"10px":"0"}"> Fallbeispiel-PDF öffnen</a>`:""}
 ${!c.caseText&&!c.pdfUrl?`<p class="empty">Kein Fallbeispiel-Text oder -Link hinterlegt.</p>`:""}
 </div>
 ${essayParts.map(([type,label,criteria])=>{
 const entry=byType[type];
 const hasModel=!!(c.modelAnswers?.[type]||"").trim();
 return`<div class="card"style="margin-top:14px">
 <h3 style="margin-top:0">${esc(label)}</h3>
 <p style="margin:0 0 8px;color:var(--muted);font-size:12px">Erfolgskriterien – nach dem Schreiben selbst ankreuzen, was du erreicht hast:</p>
 <div class="ls-kprim-list"style="margin-bottom:12px">${criteria.map((cr,i)=>`<label class="ls-kprim-row"><input type="checkbox"data-selfcheck-type="${type}"data-selfcheck-index="${i}" ${entry?.selfCheck?.[i]?"checked":""}><span>${esc(cr)}</span></label>`).join("")}</div>
 <textarea id="essayText_${type}"rows="8"placeholder="Hier deinen Text schreiben …">${esc(entry?.text||"")}</textarea>
 <div class="form-actions"style="margin-top:8px;align-items:center">
 <button class="primary"onclick="saveEssayEntry('${c.id}','${type}')">Speichern</button>
 ${entry?.updatedAt?`<small style="color:var(--muted)">Zuletzt gespeichert: ${fmtDate(entry.updatedAt)}</small>`:""}
 ${entry&&!entry.feedbackRequested?`<button class="secondary"onclick="requestEssayFeedback('${c.id}','${type}')"> Zur Korrektur einreichen</button>`:""}
 ${entry?.feedbackRequested?`<span class="pill"> Rückmeldung angefragt</span>`:""}
 ${entry&&hasModel?`<button class="secondary"onclick="openEssayModelCompare('${c.id}','${type}')"> Mit Musterbeispiel vergleichen</button>`:""}
 </div>
 ${entry?.feedback?`<div class="notice"style="margin-top:10px"><strong> Rückmeldung von ${esc(entry.feedbackBy||"Lehrkraft")}</strong><p style="margin-bottom:0;white-space:pre-wrap">${esc(entry.feedback)}</p></div>`:""}
 </div>`;
 }).join("")}
 ${isTeacher()?`<div class="card"style="margin-top:14px">
 <h3 style="margin-top:0"> Für Lehrkräfte: Abgaben der Klasse</h3>
 <p style="color:var(--muted);font-size:12px;margin-top:-6px">Übungstexte sind privat. Die Ampel zeigt die Selbsteinschätzung – so siehst du auf einen Blick, wo ein Blick sich lohnt, ohne jeden Text vollständig lesen zu müssen.</p>
 <div class="list">${teacherEntries.map(e=>{
 const criteriaCount=(essayParts.find(p=>p[0]===e.type)?.[2]||[]).length;
 const st=essaySelfCheckStatus(e,criteriaCount);
 return`<div class="list-item">
 <div><strong>${esc(e.name||"Campus-Mitglied")}</strong><small>${esc(essayPartLabel(e.type))}${e.feedbackRequested?" · Rückmeldung angefragt":e.feedback?" · ✅ Rückmeldung gegeben":""}</small></div>
 <div style="display:flex;align-items:center;gap:8px">${st.color?`<span class="pill${st.color==="green"?"green":""}"style="${st.color==="yellow"?"background:#fdecb8;color:#916d0b":st.color==="red"?"background:#fad2d5;color:#b32b32":""}"title="${esc(st.label)}">${st.color==="green"?"🟢":st.color==="yellow"?"🟡":"🔴"}</span>`:`<span class="pill"title="Noch keine Selbsteinschätzung"></span>`}<button class="secondary"onclick="openTeacherFeedbackForm('${e.id}','${esc(e.name||"Campus-Mitglied")}','${esc(essayPartLabel(e.type))}','${esc(e.text||"")}','${esc(e.feedback||"")}')">${e.feedback?"Rückmeldung bearbeiten":"Antworten"}</button></div>
 </div>`;
 }).join("")||`<div class="empty">Noch keine Abgaben.</div>`}</div>
 </div>`:""}
 ${footer()}`;
}

function openEssayCaseForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können ein Fallbeispiel anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">FACHAUFSATZ-TRAINING</div>
 <h2>Neues Fallbeispiel</h2>
 <div class="form">
 <label>Titel<input id="ecTitle"maxlength="150"placeholder="z. B. Der Kindergarten-Konflikt"></label>
 <label>Lernbereich<select id="ecLernbereich">${essayLernbereiche.map(([code,label])=>`<option value="${code}">${esc(code)} – ${esc(label)}</option>`).join("")}</select></label>
 <label>Theoriebereich (optional)<input id="ecTheoryArea"maxlength="150"placeholder="z. B. Bindungstheorie nach Bowlby"></label>
 <label>Fallbeispiel-Text (optional, falls kein PDF-Link)<textarea id="ecCaseText"rows="6"maxlength="3000"placeholder="Beschreibung des Falls …"></textarea></label>
 <label>Link zur Fallbeispiel-PDF (optional, z. B. Google Drive)<input id="ecPdfUrl"type="url"placeholder="https://…"></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addEssayCase()">Anlegen</button>
 </div>
 </div>`);
}

async function addEssayCase(){
 const title=$("ecTitle")?.value.trim()||"";
 const lernbereich=$("ecLernbereich")?.value||"";
 const theoryArea=$("ecTheoryArea")?.value.trim()||"";
 const caseText=$("ecCaseText")?.value.trim()||"";
 const pdfUrlRaw=$("ecPdfUrl")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(!caseText&&!pdfUrlRaw){toast("Bitte entweder einen Fallbeispiel-Text oder einen PDF-Link angeben.");return}
 const pdfUrl=pdfUrlRaw?normalizeExternalUrl(pdfUrlRaw):"";
 try{
 await addDoc(collection(db,"essayCases"),{
 title,lernbereich,theoryArea,caseText,pdfUrl,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Fallbeispiel angelegt.");
 }catch(e){
 console.error("Fallbeispiel anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Fallbeispiel konnte nicht angelegt werden.");
 }
}

async function deleteEssayCase(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können ein Fallbeispiel löschen.");return}
 if(!confirm("Dieses Fallbeispiel inklusive aller Übungstexte der Klasse wirklich löschen?"))return;
 try{
 const entries=await getAllEssayEntriesForCase(id);
 await Promise.all(entries.map(e=>deleteDoc(doc(db,"essayEntries",e.id))));
 await deleteDoc(doc(db,"essayCases",id));
 if(activeEssayCaseId===id)activeEssayCaseId=null;
 go("fachaufsatz");
 toast("Fallbeispiel gelöscht.");
 }catch(e){console.error("Fallbeispiel löschen:",e);toast("Fallbeispiel konnte nicht vollständig gelöscht werden.")}
}

async function saveEssayEntry(caseId,type){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Texte speichern.");return}
 const text=$(`essayText_${type}`)?.value.trim()||"";
 if(!text){toast("Bitte einen Text eingeben, bevor du speicherst.");return}
 const criteria=(essayParts.find(p=>p[0]===type)?.[2])||[];
 const selfCheck={};
 criteria.forEach((_,i)=>{selfCheck[i]=!!document.querySelector(`[data-selfcheck-type="${CSS.escape(type)}"][data-selfcheck-index="${i}"]`)?.checked});
 try{
 await setDoc(doc(db,"essayEntries",`${caseId}_${type}_${currentUser.uid}`),{
 caseId,type,uid:currentUser.uid,
 name:profile?.displayName||currentUser.email||"Campus-Mitglied",
 text,selfCheck,selfCheckAt:serverTimestamp(),updatedAt:serverTimestamp()
 },{merge:true});
 await render();
 showMotivationsBild();
 toast("Gespeichert.");
 }catch(e){
 console.error("Fachaufsatz-Baustein speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Text konnte nicht gespeichert werden.");
 }
}

// Zeigt den eigenen Text neben dem Musterbeispiel der Lehrkraft, mit
// gezielten Vergleichsfragen statt einer einfachen Musterlösung zum Abschreiben.
async function openEssayModelCompare(caseId,type){
 try{
 let c=null;
 if(caseId.startsWith("seed-")){
 c=ESSAY_SEED_CASES.find(s=>s.id===caseId)||null;
 }else{
 const snap=await getDoc(doc(db,"essayCases",caseId));
 c=snap.exists()?{id:snap.id,...snap.data()}:null;
 }
 if(!c){toast("Dieses Fallbeispiel wurde nicht gefunden.");return}
 const model=(c.modelAnswers?.[type]||"").trim();
 if(!model){toast("Für diesen Baustein ist noch kein Musterbeispiel hinterlegt.");return}
 const myEntries=await getMyEssayEntries(caseId);
 const myText=myEntries.find(e=>e.type===type)?.text||"";
 const part=essayParts.find(p=>p[0]===type);
 const compareQuestions=part?.[3]||[];
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">FACHAUFSATZ-TRAINING · SELBSTVERGLEICH</div>
 <h2>${esc(essayPartLabel(type))} – Vergleich mit dem Musterbeispiel</h2>
 <p style="color:var(--muted);font-size:12px">Lies zuerst deinen eigenen Text nochmal durch, dann das Musterbeispiel. Die Fragen unten helfen dir beim Vergleichen.</p>
 <div class="card"style="background:#f7fafc;margin-bottom:10px"><strong>Dein Text</strong><p style="white-space:pre-wrap;margin:6px 0 0">${esc(myText)||"(kein Text gespeichert)"}</p></div>
 <div class="card"style="border-left:4px solid #3fa66a;margin-bottom:10px"><strong> Musterbeispiel</strong><p style="white-space:pre-wrap;margin:6px 0 0">${esc(model)}</p></div>
 ${compareQuestions.length?`<div class="notice"><strong>Zum Vergleichen</strong><ul style="margin:8px 0 0;padding-left:18px">${compareQuestions.map(q=>`<li>${esc(q)}</li>`).join("")}</ul></div>`:""}
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
 }catch(e){console.error("Musterbeispiel-Vergleich:",e);toast("Der Vergleich konnte nicht geöffnet werden.")}
}

// Lehrkraft: pro Fallbeispiel für jeden der vier Bausteine ein Musterbeispiel
// hinterlegen, das Schüler:innen zum Selbstvergleich nutzen können.
async function openEssayModelAnswersForm(caseId){
 if(!isTeacher()){toast("Nur Lehrkräfte können Musterlösungen hinterlegen.");return}
 const snap=await getDoc(doc(db,"essayCases",caseId));
 const c=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!c){toast("Dieses Fallbeispiel wurde nicht gefunden.");return}
 window.__essayModelCaseId=caseId;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">FACHAUFSATZ-TRAINING · MUSTERLÖSUNGEN</div>
 <h2>${esc(c.title||"Fallbeispiel")}</h2>
 <p style="color:var(--muted);font-size:12px">Diese Musterbeispiele sehen Schüler:innen erst, nachdem sie ihren eigenen Baustein geschrieben haben – zum Selbstvergleich, nicht zum Abschreiben.</p>
 <div class="form">${essayParts.map(([type,label])=>`<label>${esc(label)}<textarea id="emaText_${type}"rows="6"placeholder="Musterbeispiel für diesen Baustein …">${esc(c.modelAnswers?.[type]||"")}</textarea></label>`).join("")}
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="saveEssayModelAnswers()">Speichern</button>
 </div>
 </div>`);
}

async function saveEssayModelAnswers(){
 const caseId=window.__essayModelCaseId;
 if(!caseId||!isTeacher())return;
 const modelAnswers={};
 essayParts.forEach(([type])=>{modelAnswers[type]=$(`emaText_${type}`)?.value.trim()||""});
 try{
 await updateDoc(doc(db,"essayCases",caseId),{modelAnswers,updatedAt:serverTimestamp()});
 closeModal();await render();toast("Musterlösungen gespeichert.");
 }catch(e){
 console.error("Musterlösungen speichern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Musterlösungen konnten nicht gespeichert werden.");
 }
}

async function requestEssayFeedback(caseId,type){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Rückmeldung anfordern.");return}
 try{
 await updateDoc(doc(db,"essayEntries",`${caseId}_${type}_${currentUser.uid}`),{
 feedbackRequested:true,feedbackRequestedAt:serverTimestamp()
 });
 await render();
 toast("Zur Korrektur eingereicht.");
 }catch(e){
 console.error("Rückmeldung anfordern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Anfrage. Bitte die Firestore-Regeln prüfen.":"Anfrage konnte nicht gesendet werden.");
 }
}

function openTeacherFeedbackForm(entryId,name,partLabel,text,existingFeedback){
 window.__feedbackEntryId=entryId;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">FACHAUFSATZ-TRAINING</div>
 <h2>Rückmeldung: ${esc(name)} – ${esc(partLabel)}</h2>
 <div class="card"style="background:#f7f7f7;margin-bottom:14px"><p style="white-space:pre-wrap;margin:0">${esc(text)}</p></div>
 <div class="form">
 <label>Deine Rückmeldung<textarea id="fbText"rows="5"maxlength="1500">${esc(existingFeedback||"")}</textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="submitTeacherFeedback()">Rückmeldung senden</button>
 </div>
 </div>`);
}

async function submitTeacherFeedback(){
 const id=window.__feedbackEntryId;
 if(!id)return;
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Rückmeldung geben.");return}
 const feedback=$("fbText")?.value.trim()||"";
 if(!feedback){toast("Bitte eine Rückmeldung eingeben.");return}
 try{
 await updateDoc(doc(db,"essayEntries",id),{
 feedback,
 feedbackBy:profile?.displayName||currentUser.email||"Lehrkraft",
 feedbackAt:serverTimestamp(),
 feedbackRequested:false
 });
 closeModal();await render();toast("Rückmeldung gesendet.");
 }catch(e){
 console.error("Rückmeldung senden:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Senden. Bitte die Firestore-Regeln prüfen.":"Rückmeldung konnte nicht gespeichert werden.");
 }
}

async function downloadEssayPDF(caseId){
 try{
 const snap=await getDoc(doc(db,"essayCases",caseId));
 const c=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!c){toast("Dieses Fallbeispiel wurde nicht gefunden.");return}
 const myEntries=await getMyEssayEntries(caseId);
 const byType={};myEntries.forEach(e=>byType[e.type]=e);
 const body=essayParts.map(([type,label])=>`<div class="item">
 <strong>${escPDF(label)}</strong>
 <div>${byType[type]?escPDF(byType[type].text).replace(/\n/g,"<br>"):"<em>Noch nicht geschrieben.</em>"}</div>
 </div>`).join("");
 openToolPrintWindow(
 "Fachaufsatz – "+(c.title||"Fallbeispiel"),
 body,"F12Sb · Fachaufsatz-Training"+(c.theoryArea?" · "+c.theoryArea:"")
 );
 }catch(e){console.error("Fachaufsatz PDF:",e);toast("Der Aufsatz konnte nicht als PDF geöffnet werden.")}
}



async function getKILearningLinks(){
 const rows=await getCollection("kiLernwerkstattLinks","createdAt",true);
 return rows.filter(x=>x.url&&x.title);
}

function normalizeExternalUrl(value){
 const raw=String(value||"").trim();
 if(!raw)return"";
 return /^https?:\/\//i.test(raw)?raw:"https://"+raw;
}

async function renderKILernen(){
 let links=[];
 try{links=await getKILearningLinks()}catch(e){console.error("KI-Lernwerkstatt:",e)}

 const categories=[
 {id:"lernen",icon:"",title:"Mit KI lernen",text:"Themen erklären lassen, Zusammenhänge verstehen und Wissen aufbauen."},
 {id:"ueben",icon:"",title:"Mit KI üben",text:"Fragen, Aufgaben, Quiz und Prüfungssituationen zum Üben nutzen."},
 {id:"partner",icon:"",title:"KI als Lernpartner",text:"Tutor, Coach, Prüfer oder Sparringspartner gezielt einsetzen."},
 {id:"bewusst",icon:"",title:"KI bewusst nutzen",text:"Prompts verbessern, Antworten prüfen und KI-Nutzung reflektieren."}
 ];

 const categoryLinks=id=>links.filter(x=>x.category===id);

 const teacherAction=isTeacher()
 ?`<button class="primary"onclick="openKILearningLinkForm()">＋ KI-Angebot bereitstellen</button>`
 : "";

 return`${pageHead(
 "KI ZUM LERNEN","Lernwerkstatt · KI zum Lernen","Lehrkräfte stellen geprüfte KI-Angebote bereit. Schülerinnen und Schüler nutzen die bereitgestellten Links zum Lernen.",
 teacherAction
 )}
 <style>
 .ki-learn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
 .ki-learn-tile{min-width:0}
 .ki-learn-tile-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:14px}
 .ki-learn-icon{font-size:34px;line-height:1}
 .ki-learn-links{display:flex;flex-direction:column;gap:8px;margin-top:14px}
 .ki-learn-link{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:1px solid var(--line,#ddd);border-radius:10px;background:#fff;text-decoration:none;color:inherit}
 .ki-learn-link:hover{transform:translateY(-1px)}
 .ki-learn-link-main{min-width:0}
 .ki-learn-link-main strong{display:block}
 .ki-learn-link-main small{display:block;margin-top:3px;color:var(--muted);overflow:hidden;text-overflow:ellipsis}
 .ki-learn-link-open{white-space:nowrap;font-weight:700}
 .ki-learn-admin{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
 .ki-learn-admin button{font-size:12px;padding:6px 9px}
 .ki-learn-empty{padding:12px;border:1px dashed var(--line,#ddd);border-radius:10px;color:var(--muted);margin-top:14px}
 .ki-learn-note{margin-top:16px}
 @media(max-width:800px){.ki-learn-grid{grid-template-columns:1fr}}
 </style>

 <div class="card"style="margin-bottom:16px;border-left:4px solid #4a90d9">
 <span class="badge"> LEHRKRAFTGESTEUERT</span>
 <h2>KI-Angebote für dein Lernen</h2>
 <p>Hier findest du nur KI-Angebote, die von Lehrkräften für den Campus bereitgestellt wurden. Öffne ein Angebot und nutze es direkt zum Lernen.</p>
 ${isTeacher()?`<p style="margin-bottom:0"><strong>Lehrkräfte:</strong> Du kannst unten in jeder Kachel passende KI-Angebote hinzufügen und verwalten.</p>`:""}
 </div>

 <div class="ki-learn-grid">
 ${categories.map(c=>{
 const rows=categoryLinks(c.id);
 return`<section class="card ki-learn-tile">
 <div class="ki-learn-tile-head">
 <span class="ki-learn-icon">${c.icon}</span>
 <div><h2 style="margin:0 0 5px">${c.title}</h2><p style="margin:0">${c.text}</p></div>
 </div>
 <div class="ki-learn-links">
 ${rows.map(r=>`<div>
 <a class="ki-learn-link"href="${esc(normalizeExternalUrl(r.url))}"target="_blank"rel="noopener noreferrer">
 <span class="ki-learn-link-main"><strong>${esc(r.title)}</strong>${r.description?`<small>${esc(r.description)}</small>`:""}</span>
 <span class="ki-learn-link-open">Öffnen ↗</span>
 </a>
 ${isTeacher()?`<div class="ki-learn-admin"><button class="secondary"onclick="openKILearningLinkForm('${r.id}')">Bearbeiten</button><button class="secondary"onclick="deleteKILearningLink('${r.id}')">Entfernen</button></div>`:""}
 </div>`).join("")}
 </div>
 ${!rows.length?`<div class="ki-learn-empty">${isTeacher()?"Noch kein KI-Angebot in dieser Kategorie. Füge eines hinzu.":"Noch kein KI-Angebot bereitgestellt."}</div>`:""}
 ${isTeacher()?`<button class="secondary"style="margin-top:14px"onclick="openKILearningLinkForm('','${c.id}')">＋ Angebot für diese Kachel</button>`:""}
 </section>`;
 }).join("")}
 </div>

 <div class="card ki-learn-note">
 <h3> Grundsatz</h3>
 <p>KI unterstützt dein Lernen – sie ersetzt nicht dein eigenes Denken. Prüfe Antworten, hinterfrage Ergebnisse und nutze KI so, dass du selbst etwas dazulernst.</p>
 </div>
 ${footer()}`;
}

function openKILearningLinkForm(id="",prefillCategory="lernen"){
 if(!isTeacher()){toast("Nur Lehrkräfte können KI-Angebote bereitstellen.");return}
 const load=async()=>{
 let item={};
 if(id){
 const rows=await getKILearningLinks();
 item=rows.find(x=>x.id===id)||{};
 }
 const categories=[
 ["lernen","Mit KI lernen"],
 ["ueben","Mit KI üben"],
 ["partner","KI als Lernpartner"],
 ["bewusst","KI bewusst nutzen"]
 ];
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker"> KI ZUM LERNEN</div>
 <h2>${id?"KI-Angebot bearbeiten":"KI-Angebot bereitstellen"}</h2>
 <p>Nur Lehrkräfte können Angebote einstellen. Schülerinnen und Schüler können die bereitgestellten Links öffnen, aber keine eigenen Links hinzufügen.</p>
 <div class="form">
 <label>Kategorie<select id="kiLearnCategory">${categories.map(c=>`<option value="${c[0]}" ${(item.category||prefillCategory)===c[0]?"selected":""}>${c[1]}</option>`).join("")}</select></label>
 <label>Name des KI-Angebots<input id="kiLearnTitle"value="${esc(item.title||"")}"placeholder="z. B. fobizz KI-Tools"></label>
 <label>Link<input id="kiLearnUrl"value="${esc(item.url||"")}"placeholder="https://…"></label>
 <label>Kurze Beschreibung<textarea id="kiLearnDescription"rows="3"placeholder="Wofür können Schülerinnen und Schüler dieses Angebot nutzen?">${esc(item.description||"")}</textarea></label>
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="saveKILearningLink('${id}')">${id?"Änderungen speichern":"Bereitstellen"}</button></div>
 </div>`);
 };
 load().catch(e=>{console.error(e);toast("KI-Angebot konnte nicht geöffnet werden.")});
}

async function saveKILearningLink(id=""){
 if(!isTeacher()){toast("Nur Lehrkräfte können KI-Angebote bereitstellen.");return}
 const category=$("kiLearnCategory")?.value||"lernen";
 const title=$("kiLearnTitle")?.value.trim()||"";
 const url=normalizeExternalUrl($("kiLearnUrl")?.value||"");
 const description=$("kiLearnDescription")?.value.trim()||"";
 if(!title||!url){toast("Bitte Name und Link eintragen.");return}
 if(!/^https?:\/\//i.test(url)){toast("Bitte einen gültigen Link eingeben.");return}
 try{
 const data={category,title,url,description,updatedBy:currentUser.uid,updatedAt:serverTimestamp()};
 if(id) await updateDoc(doc(db,"kiLernwerkstattLinks",id),data);
 else await addDoc(collection(db,"kiLernwerkstattLinks"),{...data,createdBy:currentUser.uid,createdAt:serverTimestamp()});
 closeModal();await render();toast(id?"KI-Angebot aktualisiert.":"KI-Angebot bereitgestellt.");
 }catch(e){console.error("KI-Lernangebot:",e);toast("KI-Angebot konnte nicht gespeichert werden.")}
}

async function deleteKILearningLink(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können KI-Angebote entfernen.");return}
 if(!confirm("Dieses KI-Angebot wirklich entfernen?"))return;
 try{await deleteDoc(doc(db,"kiLernwerkstattLinks",id));await render();toast("KI-Angebot entfernt.");}
 catch(e){console.error(e);toast("KI-Angebot konnte nicht entfernt werden.")}
}

/* =========================================================
 CAMPUS-FORUM – Übersicht (zwei klar getrennte Bereiche)
 ========================================================= */
let activeConversationUid=null, activeConversationName="";
let messageReplyTo=null, editingMessageId=null, currentThreadMessages=[];

// Landing-Seite des Campus-Forums: zwei Kacheln, die jeweils auf eine
// eigene Unterseite führen – klar getrennt statt Tabs in einer Ansicht.
async function renderForum(){
 const unread=await getUnreadMessageCount();
 return`${pageHead("GEMEINSCHAFT","Campus-Forum","Wähle einen Bereich: gemeinsamer Austausch im Forum oder persönliche Nachrichten.","")}
 <div class="grid grid-2"style="gap:18px;margin-top:4px">
 <a class="card tile"href="#forum-board"style="min-height:180px;background:#fff;border:2px solid #4a90d9">
 <span class="emoji"></span>
 <strong>Forum</strong>
 <small>Gemeinsam denken, fragen, austauschen und unterstützen – für die ganze F12Sb sichtbar.</small>
 </a>
 <a class="card tile"href="#forum-nachrichten"style="min-height:180px;background:#fff;border:2px solid #1a9b8e">
 <span class="emoji"></span>
 <strong>Persönliche Nachrichten${unread?` <span class="badge">${unread}</span>`:""}</strong>
 <small>Schreibe direkt mit einem Schüler oder einer Lehrkraft – nur ihr beide seht die Unterhaltung.</small>
 </a>
 </div>${footer()}`;
}

const forumBackButton=`<button class="secondary"onclick="go('forum')">← Campus-Forum</button>`;

function filterForumPosts(){
 const q=($("forumSearch")?.value||"").toLowerCase().trim();
 document.querySelectorAll("#forumList .forum-post").forEach(el=>{
 el.hidden=Boolean(q) && !(el.dataset.search||"").includes(q);
 });
}

async function renderForumBoard(){
 const posts=await getCollection("posts");
 return`${pageHead("GEMEINSCHAFT","Forum","Gemeinsam denken, fragen, austauschen und unterstützen.",`${forumBackButton}<button class="primary"onclick="openPostForm()">＋ Beitrag schreiben</button>`)}
 <div class="toolbar"><div class="chips"><span class="chip">Alle</span><span class="chip"> Fragen</span><span class="chip">
Infos</span><span class="chip"> Ideen</span><span class="chip"> Projekte</span><span class="chip"> Praxis</span></div>
<input class="search"id="forumSearch"placeholder="Beiträge durchsuchen …"></div>
 <div class="list"id="forumList">${posts.map(postHTML).join("")||`<div class="empty"><strong>Noch keine
Beiträge</strong>Schreibe den ersten Beitrag.</div>`}</div>
 <div class="card"style="margin-top:12px;border-left:4px solid #3fa66a"><h3> Campus hilft</h3><p>Du kannst anderen bei einem
Thema helfen? Teile dein Wissen.</p><button class="secondary"style="margin-top:10px"onclick="openHelpForm()">Hilfe
anbieten</button></div>${footer()}`;
}

/* ---------------------------------------------------------
 NACHRICHTEN – persönliche Konversationen (eigene Unterseite)
 --------------------------------------------------------- */
function conversationIdFor(a,b){return a<b?`${a}_${b}`:`${b}_${a}`;}

async function getUnreadMessageCount(){
 if(!db||!currentUser)return 0;
 try{
 const snap=await getDocs(query(collection(db,"messages"),where("toUid","==",currentUser.uid)));
 return snap.docs.filter(d=>{
 const v=d.data();
 return !v.read && !(v.deletedFor||[]).includes(currentUser.uid);
 }).length;
 }catch(e){console.error("Ungelesene Nachrichten:",e);return 0}
}

async function getApprovedUserDirectory(){
 try{
 const snap=await getDocs(collection(db,"users"));
 return snap.docs.map(d=>({uid:d.id,...d.data()}))
 .filter(u=>u.uid!==currentUser.uid && u.status==="approved")
 .sort((a,b)=>String(a.displayName||a.email||"").localeCompare(String(b.displayName||b.email||""),"de"));
 }catch(e){console.error("Nutzerverzeichnis:",e);return []}
}

async function getMyConversations(){
 try{
 const [sentSnap,receivedSnap]=await Promise.all([
 getDocs(query(collection(db,"messages"),where("fromUid","==",currentUser.uid))),
 getDocs(query(collection(db,"messages"),where("toUid","==",currentUser.uid)))
 ]);
 const all=[...sentSnap.docs,...receivedSnap.docs].map(d=>({id:d.id,...d.data()}))
 .filter(m=>!(m.deletedFor||[]).includes(currentUser.uid));
 const latestByConv={},unreadByConv={};
 all.forEach(m=>{
 const prev=latestByConv[m.conversationId];
 if(!prev||(m.createdAt?.seconds||0)>(prev.createdAt?.seconds||0)) latestByConv[m.conversationId]=m;
 if(m.toUid===currentUser.uid && !m.read) unreadByConv[m.conversationId]=(unreadByConv[m.conversationId]||0)+1;
 });
 return Object.values(latestByConv).map(m=>{
 const mine=m.fromUid===currentUser.uid;
 return {
 conversationId:m.conversationId,
 otherUid:mine?m.toUid:m.fromUid,
 otherName:mine?m.toName:m.fromName,
 lastText:m.text,lastAt:m.createdAt,
 unread:unreadByConv[m.conversationId]||0
 };
 }).sort((a,b)=>(b.lastAt?.seconds||0)-(a.lastAt?.seconds||0));
 }catch(e){console.error("Konversationen laden:",e);return []}
}

async function renderForumMessages(){
 if(activeConversationUid) return await renderConversationView();
 const conversations=await getMyConversations();
 return`${pageHead("GEMEINSCHAFT","Persönliche Nachrichten","Schreibe Schüler/innen oder Lehrkräften direkt eine persönliche Nachricht.",`${forumBackButton}<button class="primary"onclick="openNewMessagePicker()">＋ Neue Nachricht</button>`)}
 <div class="list"id="conversationList">${conversations.map(c=>`
 <article class="card"style="cursor:pointer"onclick="openConversation('${c.otherUid}')">
 <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
 <div><strong>${esc(c.otherName||"Campus-Mitglied")}</strong><p style="margin:4px 0 0;color:var(--muted)">${esc((c.lastText||"").slice(0,80))}</p></div>
 <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
 <div style="text-align:right"><small>${fmtDate(c.lastAt)}</small>${c.unread?`<div class="badge"style="margin-top:4px">${c.unread}</div>`:""}</div>
 <button class="secondary"title="Unterhaltung aus meiner Übersicht entfernen"onclick="event.stopPropagation();deleteConversation('${c.otherUid}','${esc(c.otherName||"")}')">Löschen</button>
 </div>
 </div>
 </article>`).join("")||`<div class="empty"><strong>Noch keine Nachrichten.</strong><p>Schreibe jemandem aus der F12Sb eine persönliche Nachricht.</p></div>`}
 </div>${footer()}`;
}

// Entfernt eine komplette Unterhaltung aus der EIGENEN Bibliothek.
// Die andere Person behält ihre Ansicht unverändert.
async function deleteConversation(otherUid,otherName){
 if(!confirm(`Unterhaltung mit ${otherName||"diesem Campus-Mitglied"} aus deiner Übersicht entfernen?\n\nDie Nachrichten verschwinden nur bei dir – beim Gegenüber bleiben sie erhalten.`))return;
 try{
 const msgs=await getConversationMessages(otherUid);
 if(!msgs.length){toast("Diese Unterhaltung enthält keine Nachrichten mehr.");await render();return}
 await Promise.all(msgs.map(m=>updateDoc(doc(db,"messages",m.id),{deletedFor:arrayUnion(currentUser.uid)})));
 if(activeConversationUid===otherUid){activeConversationUid=null;activeConversationName="";}
 await render();toast("Unterhaltung aus deiner Übersicht entfernt.");
 }catch(e){
 console.error("Unterhaltung löschen:",e);
 toast(`Unterhaltung konnte nicht entfernt werden${e?.code?` (${e.code})`:""}.`);
 }
}

// Blendet eine einzelne empfangene Nachricht nur für den aktuellen Nutzer aus.
async function hideMessage(id){
 if(!confirm("Diese Nachricht aus deiner Ansicht entfernen?\n\nBeim Absender bleibt sie erhalten."))return;
 try{
 await updateDoc(doc(db,"messages",id),{deletedFor:arrayUnion(currentUser.uid)});
 await render();toast("Nachricht aus deiner Ansicht entfernt.");
 }catch(e){
 console.error("Nachricht ausblenden:",e);
 toast(`Nachricht konnte nicht entfernt werden${e?.code?` (${e.code})`:""}.`);
 }
}

async function openNewMessagePicker(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Nachrichten schreiben.");return}
 const users=await getApprovedUserDirectory();
 if(!users.length){toast("Keine anderen freigeschalteten Campus-Mitglieder gefunden.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> NEUE NACHRICHT</div><h2>Person auswählen</h2>
 <div class="form">
 <label>Empfänger:in<select id="messageRecipientSelect">
 <option value="">Bitte auswählen …</option>
 ${users.map(u=>`<option value="${u.uid}">${esc(u.displayName||u.email||"Campus-Mitglied")} ${u.role==="teacher"?"(Lehrkraft)":u.role==="admin"?"(Admin)":"(Schüler/in)"}</option>`).join("")}
 </select></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="startNewConversation()">Nachricht schreiben</button>
 </div>
 </div>`);
}

async function markConversationRead(otherUid){
 try{
 const convId=conversationIdFor(currentUser.uid,otherUid);
 // Nur empfangene Nachrichten abfragen (toUid == eigene UID) – diese
 // Abfrageform erfüllt die Firestore-Regel nachweisbar.
 const snap=await getDocs(query(collection(db,"messages"),where("toUid","==",currentUser.uid)));
 const unread=snap.docs.filter(d=>{
 const v=d.data();
 return v.conversationId===convId && !v.read;
 });
 await Promise.all(unread.map(d=>updateDoc(doc(db,"messages",d.id),{read:true,readAt:serverTimestamp()})));
 }catch(e){console.error("Nachrichten als gelesen markieren:",e)}
}

function startNewConversation(){
 openConversation($("messageRecipientSelect")?.value);
}
window.startNewConversation=startNewConversation;
async function openConversation(otherUid){
 if(!otherUid){toast("Bitte eine Person auswählen.");return}
 const users=window.__messageDirectory||await getApprovedUserDirectory();
 const other=users.find(u=>u.uid===otherUid);
 activeConversationUid=otherUid;
 activeConversationName=other?.displayName||other?.email||"Campus-Mitglied";
 messageReplyTo=null;editingMessageId=null;
 closeModal();
 await markConversationRead(otherUid);
 await render();
}

function closeConversation(){
 activeConversationUid=null;activeConversationName="";messageReplyTo=null;editingMessageId=null;
 render();
}

// Lädt alle Nachrichten einer Unterhaltung.
// WICHTIG: Firestore prüft Security Rules gegen die Abfrage selbst, nicht
// gegen einzelne Dokumente. Eine Abfrage nur nach conversationId kann die
// Regel (fromUid == uid || toUid == uid) nicht garantieren und wird komplett
// mit"permission-denied"abgelehnt. Deshalb wird über die eigenen gesendeten
// und empfangenen Nachrichten abgefragt und danach clientseitig gefiltert.
async function getConversationMessages(otherUid){
 const convId=conversationIdFor(currentUser.uid,otherUid);
 const [sentSnap,receivedSnap]=await Promise.all([
 getDocs(query(collection(db,"messages"),where("fromUid","==",currentUser.uid))),
 getDocs(query(collection(db,"messages"),where("toUid","==",currentUser.uid)))
 ]);
 const seen=new Set(),msgs=[];
 [...sentSnap.docs,...receivedSnap.docs].forEach(d=>{
 if(seen.has(d.id))return;
 seen.add(d.id);
 const v=d.data();
 if(v.conversationId===convId && !(v.deletedFor||[]).includes(currentUser.uid)) msgs.push({id:d.id,...v});
 });
 return msgs.sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
}

async function renderConversationView(){
 let msgs=[];
 try{
 msgs=await getConversationMessages(activeConversationUid);
 }catch(e){
 console.error("Konversation laden:",e);
 toast(`Unterhaltung konnte nicht geladen werden${e?.code?` (${e.code})`:""}.`);
 }
 currentThreadMessages=msgs;
 return`${pageHead("GEMEINSCHAFT",esc(activeConversationName||"Nachricht"),"Persönliche Unterhaltung.",`<button class="secondary"onclick="closeConversation()">← Alle Nachrichten</button><button class="secondary"onclick="deleteConversation('${activeConversationUid}','${esc(activeConversationName||"")}')"> Unterhaltung löschen</button>${forumBackButton}`)}
 <div class="card"style="margin-top:12px">
 <div class="comments"id="messageThread">${msgs.map(messageHTML).join("")||`<div class="empty">Noch keine Nachrichten in dieser Unterhaltung.</div>`}</div>
 ${messageReplyTo?`<div class="notice"style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:10px">
 <span><strong>Antwort an ${esc(messageReplyTo.fromName)}:</strong> ${esc((messageReplyTo.text||"").slice(0,120))}</span>
 <button class="secondary"onclick="cancelMessageReply()"></button></div>`:""}
 <div class="comment-box"style="margin-top:10px;flex-direction:column;align-items:stretch;gap:8px">
 <textarea id="messageComposeText"rows="2"placeholder="Nachricht schreiben …"></textarea>
 <div style="display:flex;justify-content:space-between;align-items:center">
 ${emojiPickerHTML("messageComposeText","emojiPickerMessage")}
 <button class="primary"onclick="sendMessage()">Senden</button>
 </div>
 </div>
 </div>${footer()}`;
}

function messageHTML(m){
 const mine=m.fromUid===currentUser.uid;
 const bg=mine?"var(--soft-green)":"var(--soft-blue)";
 const indent=mine?"":"margin-right:12%";
 const who=mine?`An ${esc(m.toName||"Campus-Mitglied")}`:`Von ${esc(m.fromName||"Campus-Mitglied")}`;
 if(editingMessageId===m.id){
 return`<div class="comment"style="background:${bg};${indent}">
 <b>${who}</b>
 <textarea id="editMessageText_${m.id}"rows="2"style="width:100%;margin-top:6px">${esc(m.text)}</textarea>
 <div class="form-actions"><button class="secondary"onclick="cancelEditMessage()">Abbrechen</button><button
class="primary"onclick="saveEditMessage('${m.id}')">Speichern</button></div>
 </div>`;
 }
 return`<div class="comment"style="background:${bg};${indent}">
 ${m.replyToId?`<div class="notice"style="margin-bottom:6px;padding:6px 10px"><small>Antwort auf ${esc(m.replyToName||"")}: „${esc(m.replyToText||"")}“</small></div>`:""}
 <b>${who}</b> <small>${fmtDate(m.createdAt)}${m.edited?" · bearbeitet":""}</small>
 <p style="margin:4px 0;white-space:pre-wrap">${esc(m.text)}</p>
 <div class="post-actions">
 <button onclick="replyToMessage('${m.id}')">Antworten</button>
 ${mine
 ?`<button onclick="editMessage('${m.id}')">Bearbeiten</button><button onclick="deleteMessage('${m.id}')">Löschen</button>`
 :`<button onclick="hideMessage('${m.id}')">Löschen</button>`}
 </div>
 </div>`;
}

function replyToMessage(id){
 const m=currentThreadMessages.find(x=>x.id===id);
 if(!m)return;
 messageReplyTo={id:m.id,fromName:m.fromName,text:m.text};
 render().then(()=>$("messageComposeText")?.focus());
}
function cancelMessageReply(){messageReplyTo=null;render();}

function editMessage(id){editingMessageId=id;render();}
function cancelEditMessage(){editingMessageId=null;render();}

async function saveEditMessage(id){
 const val=$("editMessageText_"+id)?.value.trim();
 if(!val){toast("Nachricht darf nicht leer sein.");return}
 try{
 await updateDoc(doc(db,"messages",id),{text:val,edited:true,updatedAt:serverTimestamp()});
 editingMessageId=null;await render();toast("Nachricht aktualisiert.");
 }catch(e){console.error("Nachricht bearbeiten:",e);toast("Nachricht konnte nicht gespeichert werden.")}
}

async function deleteMessage(id){
 if(!confirm("Diese Nachricht wirklich löschen?"))return;
 try{
 await deleteDoc(doc(db,"messages",id));
 await render();toast("Nachricht gelöscht.");
 }catch(e){console.error("Nachricht löschen:",e);toast("Nachricht konnte nicht gelöscht werden.")}
}

let sendingMessage=false;
async function sendMessage(){
 if(sendingMessage)return;
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Nachrichten senden. Bitte prüfe deinen Freischaltungsstatus (status: \"approved\") in Firestore.");return}
 const text=$("messageComposeText")?.value.trim();
 if(!text){toast("Bitte eine Nachricht eingeben.");return}
 if(!activeConversationUid){toast("Keine Unterhaltung ausgewählt.");return}
 sendingMessage=true;
 const btn=document.querySelector('[onclick="sendMessage()"]');
 if(btn){btn.disabled=true;btn.textContent="Wird gesendet …";}
 try{
 const convId=conversationIdFor(currentUser.uid,activeConversationUid);
 await addDoc(collection(db,"messages"),{
 conversationId:convId,
 fromUid:currentUser.uid,fromName:profile?.displayName||currentUser?.email||"Campus-Mitglied",
 toUid:activeConversationUid,toName:activeConversationName||"Campus-Mitglied",
 text,
 replyToId:messageReplyTo?.id||null,
 replyToText:messageReplyTo?.text?String(messageReplyTo.text).slice(0,120):null,
 replyToName:messageReplyTo?.fromName||null,
 read:false,edited:false,
 createdAt:serverTimestamp(),updatedAt:serverTimestamp()
 });
 messageReplyTo=null;
 await render();
 }catch(e){
 console.error("Nachricht senden:",e);
 toast(`Nachricht konnte nicht gesendet werden${e?.code?` (${e.code})`:""}.`);
 }finally{
 sendingMessage=false;
 }
}
function postHTML(p){const comments=Array.isArray(p.comments)?p.comments:[];const searchKey=esc(((p.authorName||"")+" "+(p.text||"")).toLowerCase());return`<article class="forum-post"data-search="${searchKey}"><div class="post- head"><div class="avatar">${p.authorUid===currentUser.uid?" ":" "}</div><div class="post-meta">
<strong>${esc(p.authorName||"Campus-Mitglied")}</strong><small>${fmtDate(p.createdAt)}</small></div><span
class="pill">${labels[p.type]||p.type||"Beitrag"}</span></div><div class="post-body">${esc(p.text)}</div><div class="post- actions"><button type="button"class="forum-like-btn"data-like-post="${p.id}"onclick="likePost('${p.id}');return false;"style="pointer-events:auto;cursor:pointer"> Gefällt mir (${Number(p.likes||0)})</button><button
onclick="focusComment('${p.id}')"> Antworten (${comments.length})</button>${(p.authorUid===currentUser.uid||isTeacher())?`<button onclick="deletePost('${p.id}')">Löschen</button>`:""}<button onclick="openReportForm('posts','${p.id}','${esc((p.text||"").slice(0,80))}')"> Melden</button></div><div class="comments">${comments.map(c=>`<div
class="comment"><b>${esc(c.name)}:</b> ${esc(c.text)}</div>`).join("")}<div class="comment-box"><input id="comment-${p.id}"placeholder="Antwort schreiben …"><button onclick="commentPost('${p.id}')">Senden</button></div></div></article>`}

/* =========================================================
 PINNWAND – Padlet-artige Raster-Boards für Gruppenarbeit
 Jedes Board (Collection"boards") sammelt Notizen in der
 Collection"boardPosts" (Feld boardId verweist auf das Board).
 Layout: CSS-Spalten (Raster im Pinterest-Stil), reine Textnotizen
 mit optionalem Link und Farbe – ohne Bild-Upload, da die App
 bisher keine Firebase-Storage-Anbindung nutzt.
 ========================================================= */
const noteColors=[
 {id:"gelb",bg:"#fff3b0"},
 {id:"gruen",bg:"#c8f2d4"},
 {id:"blau",bg:"#cfe8ff"},
 {id:"rosa",bg:"#ffd6e8"},
 {id:"orange",bg:"#ffe0b8"}
];
function noteColorBg(id){return (noteColors.find(c=>c.id===id)||noteColors[0]).bg}

async function getBoards(){return await getCollection("boards")}

async function getBoardPosts(boardId){
 if(!db)return [];
 try{
 const snap=await getDocs(query(collection(db,"boardPosts"),where("boardId","==",boardId)));
 return snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 }catch(e){console.error("Pinnwand-Notizen laden:",e);return []}
}

async function renderPinnwandUebersicht(){
 const boards=await getBoards();
 return`${pageHead("ZUSAMMENARBEIT","Pinnwand","Digitale Pinnwände für Ideen, Brainstorming und Gruppenarbeit – im Raster, für die ganze F12Sb sichtbar.",`<button class="primary"onclick="openBoardForm()">＋ Neue Pinnwand</button>`)}
 <div class="grid grid-3">${boards.map(b=>`
 <div class="card tile"style="cursor:pointer;text-align:left"onclick="openBoard('${b.id}')">
 <span class="emoji"></span>
 <strong>${esc(b.title||"Pinnwand")}</strong>
 <small>${esc(b.description||"")||"Gemeinsame Ideensammlung."}</small>
 <small style="display:block;margin-top:6px;opacity:.7">Angelegt von ${esc(b.createdByName||"Campus-Mitglied")}</small>
 </div>`).join("")||`<div class="empty"><strong>Noch keine Pinnwand.</strong>Lege die erste Pinnwand für deine Gruppe oder ein Thema an.</div>`}
 </div>${footer()}`;
}

function openBoard(id){activeBoardId=id;go("pinnwand-board")}
function closePinnwandBoard(){activeBoardId=null;go("pinnwand")}

function boardNoteHTML(p){
 const canDelete=p.authorUid===currentUser.uid||isTeacher();
 let mediaHTML="";
 if(p.url&&p.mediaType==="bild")mediaHTML=`<img src="${esc(p.url)}"alt=""class="pin-note-media"loading="lazy">`;
 else if(p.url&&p.mediaType==="video"){
 const ytMatch=p.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
 mediaHTML=ytMatch?`<iframe class="pin-note-media"src="https://www.youtube.com/embed/${ytMatch[1]}"loading="lazy"allowfullscreen></iframe>`:`<video class="pin-note-media"controls src="${esc(p.url)}"></video>`;
 }
 else if(p.url&&p.mediaType==="audio")mediaHTML=`<audio class="pin-note-media-audio"controls src="${esc(p.url)}"></audio>`;
 return`<div class="pin-note"style="background:${noteColorBg(p.color)}">
 <p class="pin-note-text">${esc(p.text)}</p>
 ${mediaHTML}
 ${p.url&&(!p.mediaType||p.mediaType==="link")?`<a class="pin-note-link"href="${esc(p.url)}"target="_blank"rel="noopener noreferrer"> Link öffnen</a>`:""}
 <div class="pin-note-meta"><small>${esc(p.authorName||"Campus-Mitglied")} · ${fmtDate(p.createdAt)}</small>
 <span>
 <button class="pin-note-delete"title="Melden"onclick="openReportForm('boardPosts','${p.id}','${esc((p.text||"").slice(0,80))}')"></button>
 ${canDelete?`<button class="pin-note-delete"title="Notiz entfernen"onclick="deleteBoardPost('${p.id}')"></button>`:""}
 </span></div>
 </div>`;
}

async function renderPinnwandBoard(){
 if(!activeBoardId) return await renderPinnwandUebersicht();
 let board=null;
 try{
 const snap=await getDoc(doc(db,"boards",activeBoardId));
 board=snap.exists()?{id:snap.id,...snap.data()}:null;
 }catch(e){console.error("Pinnwand laden:",e)}
 if(!board){
 activeBoardId=null;
 toast("Diese Pinnwand wurde nicht gefunden.");
 return await renderPinnwandUebersicht();
 }
 const posts=await getBoardPosts(board.id);
 const canDeleteBoard=isTeacher();
 return`${pageHead("ZUSAMMENARBEIT",esc(board.title||"Pinnwand"),
 esc(board.description||"")||"Gemeinsame Ideensammlung für die Gruppe.",`<button class="secondary"onclick="closePinnwandBoard()">← Pinnwand-Übersicht</button>
 <button class="primary"onclick="openBoardPostForm()">＋ Notiz hinzufügen</button>
 <button class="secondary"onclick="downloadBoardPDF('${board.id}')"> Als PDF</button>
 ${canDeleteBoard?`<button class="secondary"onclick="deleteBoard('${board.id}')">Pinnwand löschen</button>`:""}`)}
 <style>
 .pin-board{column-count:1;column-gap:14px}
 @media(min-width:640px){.pin-board{column-count:2}}
 @media(min-width:980px){.pin-board{column-count:3}}
 @media(min-width:1300px){.pin-board{column-count:4}}
 .pin-note{break-inside:avoid;-webkit-column-break-inside:avoid;margin:0 0 14px;padding:14px 14px 10px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.08);color:#2a2a2a}
 .pin-note-text{margin:0 0 8px;white-space:pre-wrap;word-break:break-word}
 .pin-note-link{display:inline-block;margin-bottom:8px;font-weight:700;color:inherit;text-decoration:underline}
 .pin-note-media{display:block;width:100%;border-radius:8px;margin-bottom:8px;max-height:220px;object-fit:cover}
 iframe.pin-note-media{height:160px;border:0}
 video.pin-note-media{max-height:220px}
 .pin-note-media-audio{width:100%;margin-bottom:8px}
 .pin-note-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;opacity:.75}
 .pin-note-delete{background:none;border:none;cursor:pointer;font-size:14px;padding:2px 6px;opacity:.6}
 .pin-note-delete:hover{opacity:1}
 </style>
 <div class="pin-board"id="pinBoardNotes">${posts.map(boardNoteHTML).join("")||`<div class="empty"><strong>Noch keine Notizen.</strong>Hefte die erste Idee an diese Pinnwand.</div>`}</div>
 ${footer()}`;
}

// Live-Update der Pinnwand: neue/entfernte Notizen erscheinen automatisch.
function subscribePinnwandLive(boardId){
 liveUnsubscribe=onSnapshot(
 query(collection(db,"boardPosts"),where("boardId","==",boardId)),
 snap=>{
 const posts=snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 const el=$("pinBoardNotes");
 if(el)el.innerHTML=posts.map(boardNoteHTML).join("")||`<div class="empty"><strong>Noch keine Notizen.</strong>Hefte die erste Idee an diese Pinnwand.</div>`;
 },
 e=>console.error("Pinnwand-Live-Update:",e)
 );
}

function openBoardForm(){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können eine Pinnwand anlegen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">PINNWAND</div>
 <h2>Neue Pinnwand anlegen</h2>
 <p>Erstelle eine gemeinsame Pinnwand für ein Projekt, ein Thema oder eine Gruppenarbeit.</p>
 <div class="form">
 <label>Titel<input id="boardTitle"maxlength="120"placeholder="z. B. Projektideen 12a"></label>
 <label>Kurzbeschreibung<textarea id="boardDescription"rows="3"maxlength="300"placeholder="Wofür ist diese Pinnwand gedacht?"></textarea></label>
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addBoard()">Pinnwand anlegen</button>
 </div>
 </div>`);
}

async function addBoard(){
 const title=$("boardTitle")?.value.trim()||"";
 const description=$("boardDescription")?.value.trim()||"";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 try{
 await addDoc(collection(db,"boards"),{
 title,description,
 createdBy:currentUser.uid,
 createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();toast("Pinnwand angelegt.");
 }catch(e){
 console.error("Pinnwand anlegen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Anlegen. Bitte die Firestore-Regeln prüfen.":"Pinnwand konnte nicht angelegt werden.");
 }
}

async function deleteBoard(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können eine Pinnwand löschen.");return}
 if(!confirm("Diese Pinnwand inklusive aller Notizen wirklich löschen?"))return;
 try{
 const posts=await getBoardPosts(id);
 await Promise.all(posts.map(p=>deleteDoc(doc(db,"boardPosts",p.id))));
 await deleteDoc(doc(db,"boards",id));
 if(activeBoardId===id)activeBoardId=null;
 go("pinnwand");
 toast("Pinnwand gelöscht.");
 }catch(e){console.error("Pinnwand löschen:",e);toast("Pinnwand konnte nicht vollständig gelöscht werden.")}
}

async function downloadBoardPDF(boardId){
 try{
 const snap=await getDoc(doc(db,"boards",boardId));
 const board=snap.exists()?{id:snap.id,...snap.data()}:null;
 if(!board){toast("Diese Pinnwand wurde nicht gefunden.");return}
 const posts=await getBoardPosts(boardId);
 const body=posts.length?posts.map(p=>`<div class="item">
 <div>${escPDF(p.text)}</div>
 ${p.url?`<small>Link: ${escPDF(p.url)}</small>`:""}
 <small>${escPDF(p.authorName||"Campus-Mitglied")} · ${escPDF(fmtDate(p.createdAt))}</small>
 </div>`).join(""):`<p class="empty">Noch keine Notizen.</p>`;
 openToolPrintWindow(
 "Pinnwand – "+(board.title||"Pinnwand"),
 body,"F12Sb · Pinnwand"+(board.description?" · "+board.description:"")
 );
 }catch(e){console.error("Pinnwand PDF:",e);toast("Die Pinnwand konnte nicht als PDF geöffnet werden.")}
}

function openBoardPostForm(){
 if(!activeBoardId){toast("Bitte zuerst eine Pinnwand öffnen.");return}
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Notizen hinzufügen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">PINNWAND</div>
 <h2>Neue Notiz</h2>
 <div class="form">
 <label>Text<textarea id="bpText"rows="4"maxlength="500"placeholder="Deine Idee, Frage oder dein Beitrag …"></textarea></label>
 <label>Medium (optional)<select id="bpMediaType"onchange="$('bpUrl').placeholder=this.value==='bild'?'Bild-URL (…jpg/png)':this.value==='video'?'Video-URL (auch YouTube)':this.value==='audio'?'Audio-URL (…mp3)':'https://…'">
 <option value="link">Nur Link</option>
 <option value="bild">Bild</option>
 <option value="video">Video</option>
 <option value="audio">Audio</option>
 </select></label>
 <label>Link/URL (optional)<input id="bpUrl"type="url"placeholder="https://…"></label>
 <label>Oder Datei hochladen (optional, max. 15 MB)<input id="bpDatei"type="file"></label>
 <label>Farbe</label>
 <div class="chips"id="bpColorPicker"style="margin:2px 0 10px">
 ${noteColors.map((c,i)=>`<span class="chip"data-color="${c.id}"style="background:${c.bg};cursor:pointer;color:#2a2a2a;${i===0?"outline:2px solid var(--brand,#1598d1)":""}"onclick="selectBoardNoteColor('${c.id}')">${c.id}</span>`).join("")}
 </div>
 <input type="hidden"id="bpColor"value="${noteColors[0].id}">
 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="addBoardPost()">Notiz anheften</button>
 </div>
 </div>`);
}

function selectBoardNoteColor(id){
 const field=$("bpColor");
 if(field)field.value=id;
 document.querySelectorAll("#bpColorPicker [data-color]").forEach(el=>{
 el.style.outline=el.dataset.color===id?"2px solid var(--brand,#1598d1)":"none";
 });
}

async function addBoardPost(){
 if(!activeBoardId)return;
 const text=$("bpText")?.value.trim()||"";
 let url=$("bpUrl")?.value.trim()||"";
 let mediaType=$("bpMediaType")?.value||"link";
 const color=$("bpColor")?.value||noteColors[0].id;
 const file=$("bpDatei")?.files?.[0]||null;
 if(!text){toast("Bitte einen Text für die Notiz eingeben.");return}
 if(url&&file){toast("Bitte entweder einen Link ODER eine Datei angeben, nicht beides.");return}
 if(url){
 url=/^https?:\/\//i.test(url)?url:"https://"+url;
 try{const u=new URL(url);if(!/^https?:$/.test(u.protocol))throw new Error("protocol")}
 catch(e){toast("Bitte einen gültigen Link eingeben oder das Feld leer lassen.");return}
 }
 try{
 if(file){
 toast("Datei wird hochgeladen …");
 const up=await uploadCampusDatei(file,`boardPosts/${activeBoardId}`);
 url=up.url;
 mediaType=dateiIstBild(up.name)?"bild":dateiIstVideo(up.name)?"video":dateiIstAudio(up.name)?"audio":"link";
 }
 await addDoc(collection(db,"boardPosts"),{
 boardId:activeBoardId,text,url,mediaType,color,
 authorUid:currentUser.uid,
 authorName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp()
 });
 closeModal();await render();showMotivationsBild();toast("Notiz angeheftet.");
 }catch(e){
 console.error("Notiz anheften:",e);
 toast("Fehler: "+(e?.message||e));
 }
}

async function deleteBoardPost(id){
 if(!isApproved())return;
 if(!confirm("Diese Notiz wirklich entfernen?"))return;
 try{await deleteDoc(doc(db,"boardPosts",id));await render();toast("Notiz entfernt.");}
 catch(e){console.error("Notiz löschen:",e);toast("Notiz konnte nicht entfernt werden.")}
}

async function renderProjekte(){
 const projects=await getCollection("projects");
 const projectPalette=["var(--soft-blue)","var(--soft-green)","var(--soft-purple)","var(--soft-orange)","var(--soft-teal)","var(--soft-pink)"];
 return`${pageHead("DEEPER LEARNING","Projekte","Projektideen, Teams, Ziele, Fortschritt und Ergebnisse.",`<button
class="primary"onclick="openProjectForm()">＋ Projekt</button>`)}
 <div class="grid grid-3">${projects.map((p,i)=>{
 const canEdit=isTeacher()||p.createdBy===currentUser.uid;
 return`<div class="card"style="background:${projectPalette[i%projectPalette.length]}"><div class="status-card">${statusDot(p.status||"green")}<div>
<h3>${esc(p.title)}</h3><p>${esc(p.goal||"")}</p></div></div><div style="margin-top:12px"><div style="display:flex;justify- content:space-between;font-size:9px;color:var(--muted);margin-bottom:5px"><span>${esc(p.team||"")} · ${esc(p.partner||"")}</span>
<b>${Number(p.progress||0)}%</b></div><div class="progress"><i style="width:${Number(p.progress||0)}%"></i></div></div>
${p.deadline?`<small style="display:block;margin-top:8px;opacity:.8"> Frist: ${esc(fmtDateOnly(p.deadline))}</small>`:""}
<div class="form-actions"style="margin-top:10px">
${canEdit?`<button class="secondary"onclick="editProjectForm('${p.id}','${esc(p.title||"")}','${esc(p.team||"")}','${esc(p.partner||"")}','${esc(p.goal||"")}',${Number(p.progress||0)},'${esc(p.deadline||"")}')">Bearbeiten</button>`:""}
${isTeacher()?`<button class="secondary"onclick="deleteCampusEntry('projects','${p.id}','Projekt')">Löschen</button>`:""}
</div>
</div>`;
 }).join("")||`<div class="empty">Noch keine Projekte.</div>`}</div>${footer()}`;
}
async function renderKompetenz(){
 let data=[],networkAvailable=true;
 try{
 const snap=isTeacher()
 ? await getDocs(collection(db,"competencies"))
 : await getDocs(query(collection(db,"competencies"),where("uid","==",currentUser.uid),limit(100)));
 data=snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){
 console.error("Kompetenznetzwerk:",e);networkAvailable=false;
 try{
 const mine=await getDocs(query(collection(db,"competencies"),where("uid","==",currentUser.uid)));
 data=mine.docs.map(d=>({id:d.id,...d.data()}));
 }catch(inner){console.error(inner)}
 }

 const categories=[
 ["","Auftreten & Kommunikation"],["","Schreiben & Sprache"],
 ["","Lernen & Denken"],["","Mathematik & analytisches Denken"],
 ["","Kreativität & Gestaltung"],["","Digital & KI"],
 ["","Zusammenarbeit"],["","Persönliche Stärken"],
 ["","Musik & Ausdruck"],["","Sport & Bewegung"],
 ["","Praktisches & Handwerk"],["","Sonstiges"]
 ];
 const mine=data.filter(x=>x.uid===currentUser.uid);

 return`${pageHead("GEMEINSAM STÄRKER","Kompetenznetzwerk","Jeder kann etwas. Niemand kann alles. Gemeinsam können wir mehr.",`<button class="primary"onclick="openCompetenceForm()">＋ Meine Kompetenz</button>`)}
 <section class="hero competency-hero">
 <div><span class="badge"> CAMPUS KANN WAS</span><h1>Was kannst du gut?</h1>
 <p>Trage ein, was du kannst – von Präsentieren und Rechnen bis Canva, Singen, Schreiben oder anderen Menschen etwas erklären. So entsteht ein Netzwerk, in dem wir uns gegenseitig helfen können.</p></div>
 <div class="competency-motto"><strong>„Jeder kann etwas.<br>Gemeinsam können wir mehr.“</strong></div>
 </section>
 ${!networkAvailable?`<div class="notice"><strong>ℹ Gemeinsames Netzwerk noch nicht vollständig erreichbar.</strong><p>Deine eigenen Einträge werden trotzdem angezeigt. Falls Firestore den gemeinsamen Zugriff noch nicht erlaubt, müssen die Regeln angepasst werden.</p></div>`:""}
 <div class="grid grid-4 competency-stats">
 <div class="card stat"><b>${data.length}</b><span>Kompetenzen</span></div>
 <div class="card stat"><b>${data.filter(x=>x.canHelp).length}</b><span>Hilfe-Angebote</span></div>
 <div class="card stat"><b>${mine.length}</b><span>Meine Kompetenzen</span></div>
 <div class="card stat"><b>${new Set(data.map(x=>x.uid)).size}</b><span>Mitglieder</span></div>
 </div>
 <div class="card"style="margin-top:12px"><div class="page-head"style="margin-bottom:10px">
 <div><div class="kicker"> MEINE KOMPETENZEN</div><h2>Was bringe ich mit?</h2><p>Auch kleine Fähigkeiten können für andere wertvoll sein.</p></div>
 <button class="secondary"onclick="openCompetenceForm()">＋ Ergänzen</button>
 </div>
 ${mine.length?`<div class="grid grid-3">${mine.map(c=>competencyCard(c,true)).join("")}</div>`:`<div class="empty"><strong>Dein Kompetenzprofil ist noch leer.</strong><p>Füge deine erste Kompetenz hinzu.</p><button class="primary"onclick="openCompetenceForm()"> Erste Kompetenz eintragen</button></div>`}</div>

 <div class="card"style="margin-top:12px"><div class="kicker"> CAMPUS HILFT</div><h2>Wer kann was?</h2><p>Finde jemanden, der dich mit seinem Können unterstützen kann.</p>
 <div class="competency-legend">${categories.map(([,name])=>{const cc=competencyCategoryColor(name);return `<span class="competency-legend-item"style="background:${cc.pill};border-color:${cc.border}">${esc(name)}</span>`}).join("")}</div>
 <div class="toolbar competency-toolbar">
 <input class="search"id="competencySearch"placeholder="Kompetenz oder Name suchen …">
 <select id="competencyCategory"><option value="all">Alle Bereiche</option>${categories.map(c=>`<option value="${esc(c[1])}">${c[0]} ${esc(c[1])}</option>`).join("")}</select>
 <label class="competency-check"><input id="competencyHelpersOnly"type="checkbox"> Nur „Ich kann helfen“</label>
 </div>
 <div class="competency-grid"id="competencyNetwork">${data.map(c=>competencyCard(c,false)).join("")||`<div class="empty"><strong>Noch keine Kompetenzen im Netzwerk.</strong><p>Sei die erste Person.</p></div>`}</div>
 </div>
 <div class="card"style="margin-top:12px;border-left:4px solid #3fa66a"><span class="badge"> UNSER CAMPUS-GEDANKE</span><h2>Wissen teilen ist eine Stärke.</h2><p>Du musst nicht alles können. Vielleicht kannst du etwas, das jemand anderes gerade braucht – und umgekehrt.</p><p><strong>„Ich kann dir helfen. Du kannst mir helfen. Zusammen kommen wir weiter.“</strong></p></div>
 ${footer()}`;
}
// Ein fester, sanft abgestimmter Farbton pro Kompetenz-Kategorie (gleicher
// Abstand auf dem Farbkreis, einheitliche Sättigung/Helligkeit für ein
// insgesamt ruhiges, balanciertes Gesamtbild statt bunt gemischter Töne.
const COMPETENCY_CATEGORY_HUES={
 "Auftreten & Kommunikation":200,
 "Schreiben & Sprache":230,
 "Lernen & Denken":260,
 "Mathematik & analytisches Denken":290,
 "Kreativität & Gestaltung":320,
 "Digital & KI":350,
 "Zusammenarbeit":20,
 "Persönliche Stärken":50,
 "Musik & Ausdruck":80,
 "Sport & Bewegung":110,
 "Praktisches & Handwerk":140,
 "Sonstiges":170
};
function competencyCategoryColor(category){
 const hue=COMPETENCY_CATEGORY_HUES[category]??170;
 return {bg:`hsl(${hue},55%,96%)`,border:`hsl(${hue},42%,58%)`,pill:`hsl(${hue},50%,89%)`};
}
async function deleteCompetency(id){
 if(!confirm("Diese Kompetenz wirklich löschen?"))return;
 try{
 await deleteDoc(doc(db,"competencies",id));
 await render();
 toast("Kompetenz gelöscht.");
 }catch(e){
 console.error("Kompetenz löschen:",e);
 toast("Konnte nicht gelöscht werden.");
 }
}
window.deleteCompetency=deleteCompetency;
function competencyCard(c,mine){
 const level=Math.max(1,Math.min(5,Number(c.level)||1)),bars="●".repeat(level)+"○".repeat(5-level);
 const initials=String(c.ownerName||"Campus").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
 const cat=competencyCategoryColor(c.category||"Sonstiges");
 return`<article class="card competency-card"style="background:${cat.bg};border-left:4px solid ${cat.border}"data-name="${esc((c.ownerName||"")+" "+(c.name||""))}"data-category="${esc(c.category||"Sonstiges")}"data-help="${c.canHelp?"yes":"no"}">
 <div class="competency-card-head"><div class="competency-avatar">${esc(initials||"C")}</div><div><strong>${esc(c.name||"Kompetenz")}</strong><small>${esc(c.ownerName||"Campus-Mitglied")}</small></div></div>
 <span class="pill"style="background:${cat.pill}">${esc(c.category||"Sonstiges")}</span><div class="competency-level">${bars}</div>
 ${c.description?`<p>${esc(c.description)}</p>`:""}
 ${c.canHelp?`<div class="notice competency-help"><strong> Ich kann helfen</strong>${c.helpText?`<p>${esc(c.helpText)}</p>`:""}</div>`:`<div class="competency-no-help"> Lernt bzw. entwickelt sich weiter</div>`}
 <div class="competency-owner-actions">
 ${mine?`<span class="pill">Meine Kompetenz</span>`:(c.canHelp?`<button class="primary competency-contact"onclick="openCompetencyHelp('${c.ownerUid}','${esc(c.ownerName||"Campus-Mitglied")}','${esc(c.name||"Kompetenz")}')"> Hilfe anfragen</button>`:"")}
 ${(mine||isTeacher())?`<button class="secondary competency-contact"onclick="deleteCompetency('${c.id}')">Löschen</button>`:""}
 </div>
 </article>`;
}
function filterCompetencyNetwork(){
 const q=($("competencySearch")?.value||"").toLowerCase().trim(),cat=$("competencyCategory")?.value||"all",only=$("competencyHelpersOnly")?.checked;
 document.querySelectorAll("#competencyNetwork .competency-card").forEach(card=>{
 card.hidden=!((!q||card.dataset.name.toLowerCase().includes(q))&&(cat==="all"||card.dataset.category===cat)&&(!only||card.dataset.help==="yes"));
 });
}
function openCompetencyHelp(uid,name,competency){
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> CAMPUS HILFT</div><h2>Hilfe anfragen</h2><p>Du möchtest <strong>${esc(name)}</strong> zu <strong>${esc(competency)}</strong> ansprechen.</p><label>Deine Nachricht<textarea id="competencyHelpMessage"rows="5"placeholder="Wobei brauchst du Hilfe?"></textarea></label><div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="createCompetencyHelpPost('${uid}','${esc(name)}','${esc(competency)}')"> Hilfeanfrage erstellen</button></div>`);
}
async function createCompetencyHelpPost(uid,name,competency){
 const text=$("competencyHelpMessage")?.value.trim();if(!text){toast("Bitte kurz beschreiben, wobei du Hilfe brauchst.");return}
 try{await addDoc(collection(db,"posts"),{authorUid:currentUser.uid,authorName:profile?.displayName||currentUser?.email||"Campus-Mitglied",type:"question",text:"Hilfe gesucht bei „"+competency+"“ – @"+name+": "+text,likes:0,comments:[],createdAt:serverTimestamp()});closeModal();toast("Hilfeanfrage wurde im Campus-Forum erstellt.");}
 catch(e){console.error(e);toast("Hilfeanfrage konnte nicht erstellt werden.")}
}
async function renderJournal(){
 let data=[];

 try{
 // Deliberately load the journal collection without a composite index.
 // This avoids the common Firestore index error that otherwise makes the
 // whole journal page disappear.
 const snap=await getDocs(
 query(collection(db,"journal"),where("uid","==",currentUser.uid),limit(100))
 );
 data=snap.docs.map(d=>({id:d.id,...d.data()}));

 data.sort((a,b)=>{
 const ad=a.journalDate||"";
 const bd=b.journalDate||"";
 if(ad!==bd)return bd.localeCompare(ad);
 return (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0);
 });
 }catch(error){
 console.error("Lernjournale konnten nicht geladen werden:",error);
 return`${pageHead(
 "REFLEXION","Lernjournal","Dein Lernweg, Reflexionen und nächste Schritte.",
 isTeacher()?`<button class="secondary"onclick="openTeacherJournalOverview()"> Schüler-Lernjournale</button>`:""
 )}
 <div class="card">
 <span class="badge">LERNJOURNAL</span>
 <h2>Lernjournal momentan nicht verfügbar</h2>
 <p>Die Lernjournal-Daten konnten nicht geladen werden.</p>
 <button class="primary"onclick="render()">Erneut versuchen</button>
 </div>
 ${footer()}`;
 }

 const teacherButton=isTeacher()
 ?`<button class="secondary"onclick="openTeacherJournalOverview()"> Schüler-Lernjournale</button>`
 : "";

 const rows=data.map(j=>`
 <div class="journal-library-row">
 <div class="journal-library-date">${esc(journalDisplayDate(j))}</div>
 <button type="button"class="journal-library-title"onclick="openJournalEntry('${esc(j.id)}')">
 ${esc(j.title||"Lernjournal")}
 </button>
 <button type="button"class="journal-pdf-btn"onclick="printJournalEntry('${esc(j.id)}')"> PDF</button>
 </div>
 `).join("");

 return`
 <style>
 .journal-two-tiles{
 display:grid;
 grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);
 gap:16px;
 align-items:start;
 }
 .journal-tile{min-width:0}
 .journal-tile-head{
 display:flex;
 justify-content:space-between;
 align-items:flex-start;
 gap:14px;
 margin-bottom:16px;
 }
 .journal-tile-head h2{margin:4px 0 5px}
 .journal-tile-head p{margin:0;color:var(--muted)}
 .journal-form-grid{
 display:grid;
 grid-template-columns:1fr 1fr;
 gap:12px;
 }
 .journal-form-grid .full{grid-column:1/-1}
 .journal-library{
 overflow:hidden;
 border:1px solid var(--line,#ddd);
 border-radius:12px;
 }
 .journal-library-head,
 .journal-library-row{
 display:grid;
 grid-template-columns:105px minmax(0,1fr) 68px;
 gap:10px;
 align-items:center;
 padding:11px 12px;
 }
 .journal-library-head{
 background:var(--soft-green);
 color:var(--muted);
 font-size:12px;
 font-weight:700;
 text-transform:uppercase;
 letter-spacing:.04em;
 }
 .journal-library-row{
 border-top:1px solid var(--line,#ddd);
 background:#fff;
 }
 .journal-library-date{
 color:var(--muted);
 font-size:13px;
 }
 .journal-library-title{
 border:0;
 background:none;
 padding:0;
 min-width:0;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
 text-align:left;
 font:inherit;
 font-weight:700;
 cursor:pointer;
 }
 .journal-library-title:hover{text-decoration:underline}
 .journal-pdf-btn{
 border:1px solid var(--line,#ddd);
 background:#fff;
 border-radius:8px;
 padding:7px 6px;
 cursor:pointer;
 white-space:nowrap;
 }
 .journal-empty{
 padding:24px 16px;
 text-align:center;
 color:var(--muted);
 }
 .journal-detail{
 margin-top:12px;
 padding:14px;
 border:1px solid var(--line,#ddd);
 border-left:4px solid #b8c4cc;
 border-radius:6px 10px 10px 6px;
 }
 .journal-detail strong{display:block;margin-bottom:6px}
 .journal-detail p{margin:0;white-space:pre-wrap}
 .journal-c-blau{background:var(--soft-blue);border-left-color:#4a90d9}
 .journal-c-gruen{background:var(--soft-green);border-left-color:#3fa66a}
 .journal-c-orange{background:var(--soft-orange);border-left-color:#e0a324}
 .journal-c-lila{background:var(--soft-purple);border-left-color:#9b59b6}
 .journal-c-teal{background:var(--soft-teal);border-left-color:#1a9b8e}
 label.journal-c-blau,label.journal-c-gruen,label.journal-c-orange,label.journal-c-lila,label.journal-c-teal{
 padding:12px;border-radius:6px 10px 10px 6px;border-left:4px solid;
 }
 @media(max-width:800px){
 .journal-two-tiles{grid-template-columns:1fr}
 .journal-form-grid{grid-template-columns:1fr}
 .journal-form-grid .full{grid-column:auto}
 }
 @media(max-width:520px){
 .journal-library-head,.journal-library-row{
 grid-template-columns:78px minmax(0,1fr) 54px;
 gap:7px;
 padding:10px 8px;
 }
 .journal-library-head{font-size:10px}
 .journal-library-date{font-size:11px}
 .journal-pdf-btn{font-size:10px;padding:6px 3px}
 }
 </style>

 ${pageHead(
 "REFLEXION","Lernjournal","Dein Lernweg, Reflexionen und nächste Schritte.",
 teacherButton
 )}

 <div class="journal-two-tiles">

 <section class="card journal-tile">
 <div class="journal-tile-head">
 <div>
 <span class="badge"> LERNJOURNAL</span>
 <h2>Mein Lernjournal</h2>
 <p>Halte deinen Lernprozess ausführlich fest.</p>
 </div>
 </div>

 <div class="form journal-form-grid">

 ${data[0]?.nextStep?`<div class="full notice">
 <strong>Dein letztes Ziel war:</strong> ${esc(data[0].nextStep)}
 <label style="margin-top:10px;display:block">Hast du dieses Ziel erreicht?
 <select id="jGoalAchieved">
 <option value="">– nicht angegeben –</option>
 <option value="Ja, erreicht">Ja, erreicht</option>
 <option value="Teilweise erreicht">Teilweise erreicht</option>
 <option value="Nicht erreicht">Nicht erreicht</option>
 </select>
 </label>
 </div>`:""}

 <label>Datum
 <input id="jDate"type="date"value="${new Date().toISOString().slice(0,10)}">
 </label>

 <label>Titel
 <input id="jTitle"type="text"placeholder="z. B. Mein Lernfortschritt heute">
 </label>

 <label class="full">Woran habe ich heute gearbeitet?
 <textarea id="jWorkedOn"rows="3"placeholder="Thema, Aufgabe, Projekt oder Lernziel …"></textarea>
 </label>

 <label class="journal-c-gruen">Was habe ich verstanden oder gelernt?
 <textarea id="jLearned"rows="4"placeholder="Was ist mir heute klarer geworden? Was kann ich jetzt besser?"></textarea>
 </label>

 <label class="journal-c-orange">Was war schwierig?
 <textarea id="jDifficult"rows="4"placeholder="Was war schwierig oder ist noch unklar?"></textarea>
 </label>

 <label class="journal-c-blau">Was hat mir geholfen? Welche Methode/Strategie hat funktioniert?
 <textarea id="jHelpful"rows="4"placeholder="Methode, Person, Material, Erklärung oder Strategie …"></textarea>
 </label>

 <label class="full journal-c-lila">Ein Gedanke über mein Lernen <small style="font-weight:400;color:var(--muted)">(optional, metakognitiv)</small>
 <textarea id="jMetaThought"rows="3"placeholder="Was ist dir heute über dein eigenes Lernen aufgefallen? Z. B.: Wie gut konntest du vorher einschätzen, was schwer wird? Wie hast du gemerkt, ob du etwas wirklich verstanden hast?"></textarea>
 </label>

 <label class="journal-c-teal">Mein nächster Lernschritt
 <textarea id="jNextStep"rows="4"placeholder="Was mache ich als Nächstes?"></textarea>
 </label>

 <label>Befinden beim Lernen
 <select id="jMood">
 <option value="Gut">Gut</option>
 <option value="Eher gut">Eher gut</option>
 <option value="Ausgeglichen">Ausgeglichen</option>
 <option value="Eher schwierig">Eher schwierig</option>
 <option value="Schwierig">Schwierig</option>
 </select>
 </label>

 <label>Zufriedenheit mit meinem Lernfortschritt
 <select id="jSatisfaction">
 <option value="Noch nicht zufrieden">Noch nicht zufrieden</option>
 <option value="Teilweise zufrieden">Teilweise zufrieden</option>
 <option value="Zufrieden"selected>Zufrieden</option>
 <option value="Sehr zufrieden">Sehr zufrieden</option>
 <option value="Sehr zufrieden und einen Schritt weiter">Sehr zufrieden und einen Schritt weiter</option>
 </select>
 </label>

 <div class="full form-actions">
 <button type="button"class="primary"onclick="addJournal()">Lernjournal speichern</button>
 </div>
 </div>
 </section>

 <section class="card journal-tile">
 <div class="journal-tile-head">
 <div>
 <span class="badge"> BIBLIOTHEK</span>
 <h2>Meine Lernjournale</h2>
 <p>Alle gespeicherten Lernjournale auf einen Blick.</p>
 </div>
 ${data.length?`<button type="button"class="secondary"onclick="printMyJournals()"> Alle PDF</button>`:""}
 </div>

 <div class="journal-library">
 <div class="journal-library-head">
 <span>Datum</span>
 <span>Titel</span>
 <span>PDF</span>
 </div>
 ${rows||`
 <div class="journal-empty">
 <strong>Noch kein Lernjournal vorhanden.</strong><br>
 Erstelle links deinen ersten Eintrag.
 </div>
 `}
 </div>
 </section>

 </div>
 ${footer()}`;
}

function journalDisplayDate(j){
 if(j?.journalDate){
 const d=new Date(j.journalDate+"T00:00:00");
 if(!isNaN(d.getTime()))return d.toLocaleDateString("de-DE");
 }
 return fmtDate(j?.createdAt);
}

async function getTeacherJournalData(){
 if(!isTeacher()){
 throw new Error("Nur Lehrkräfte dürfen die Schüler-Lernjournale öffnen.");
 }

 const snap=await getDocs(
 query(collection(db,"journal"),limit(1000))
 );
 const journals=snap.docs.map(d=>({id:d.id,...d.data()}));

 // Namen aus den Nutzerprofilen ergänzen. Falls ein Profil nicht gelesen
 // werden kann, bleibt die UID als technische Fallback-Anzeige.
 const uids=[...new Set(journals.map(j=>j.uid).filter(Boolean))];
 const users={};

 await Promise.all(uids.map(async uid=>{
 try{
 const us=await getDoc(doc(db,"users",uid));
 if(us.exists()){
 const u=us.data();
 users[uid]=u.displayName||u.email||uid;
 }
 }catch(e){
 console.warn("Profil konnte nicht geladen werden:",uid,e);
 }
 }));

 journals.forEach(j=>{
 j.studentName=users[j.uid]||j.displayName||j.authorName||j.uid||"Unbekannter Schüler";
 });

 journals.sort((a,b)=>{
 const ta=a.createdAt?.seconds||0;
 const tb=b.createdAt?.seconds||0;
 return tb-ta;
 });

 return journals;
}

async function openTeacherStudentJournalEntries(uid,name){
 if(!isTeacher()){toast("Dieser Bereich ist nur für Lehrkräfte.");return}
 try{
 const journals=await getTeacherJournalData();
 const entries=journals.filter(j=>j.uid===uid);
 modal(`
 <button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker"> LEHRKRAFT</div>
 <h2>Lernjournal-Einträge von ${esc(name)}</h2>
 <div class="teacher-journal-list">
 ${entries.map(j=>`<div class="teacher-journal-row">
 <div><strong>${esc(journalDisplayDate(j))}</strong><small style="display:block">${esc(j.title||"Lernjournal")}</small></div>
 <button class="secondary"onclick="deleteJournalEntryAsTeacher('${esc(j.id)}','${esc(uid)}','${esc(name)}')">Löschen</button>
 </div>`).join("")||`<div class="empty">Noch keine Einträge.</div>`}
 </div>
 <div class="form-actions"style="margin-top:14px"><button class="secondary"onclick="closeModal()">Schließen</button></div>
 `);
 }catch(e){
 console.error("Schüler-Lernjournal-Einträge laden:",e);
 toast("Einträge konnten nicht geladen werden.");
 }
}
async function deleteJournalEntryAsTeacher(id,uid,name){
 if(!confirm("Diesen Lernjournal-Eintrag wirklich löschen?"))return;
 try{
 await deleteDoc(doc(db,"journal",id));
 toast("Eintrag gelöscht.");
 await openTeacherStudentJournalEntries(uid,name);
 }catch(e){
 console.error("Lernjournal löschen (Lehrkraft):",e);
 toast("Eintrag konnte nicht gelöscht werden.");
 }
}
window.openTeacherStudentJournalEntries=openTeacherStudentJournalEntries;
window.deleteJournalEntryAsTeacher=deleteJournalEntryAsTeacher;

async function openTeacherJournalOverview(){
 if(!isTeacher()){
 toast("Dieser Bereich ist nur für Lehrkräfte.");
 return;
 }

 try{
 const journals=await getTeacherJournalData();
 const groups={};

 journals.forEach(j=>{
 if(!groups[j.uid]) groups[j.uid]={
 uid:j.uid,
 name:j.studentName,
 entries:[]
 };
 groups[j.uid].entries.push(j);
 });

 const students=Object.values(groups).sort((a,b)=>a.name.localeCompare(b.name,"de"));

 modal(`
 <button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker"> LEHRKRAFT</div>
 <h2>Schüler-Lernjournale</h2>
 <p>Wähle einen Schüler aus. Das Lernjournal kann anschließend als PDF ausgegeben werden.</p>

 ${students.length?`
 <div class="teacher-journal-list">
 ${students.map((s,i)=>`
 <div class="teacher-journal-row">
 <div>
 <strong>${esc(s.name)}</strong>
 <small>${s.entries.length} ${s.entries.length===1?"Eintrag":"Einträge"}</small>
 </div>
 <div style="display:flex;gap:6px">
 <button class="secondary"onclick="openTeacherStudentJournalEntries('${esc(s.uid)}','${esc(s.name)}')">
 Einträge
 </button>
 <button class="primary"onclick="downloadStudentJournalPDF('${esc(s.uid)}')">
 PDF
 </button>
 </div>
 </div>
 `).join("")}
 </div>

 <div class="form-actions"style="margin-top:14px">
 <button class="secondary"onclick="downloadAllJournalsPDF()">
 Alle Lernjournale als PDF
 </button>
 <button class="secondary"onclick="closeModal()">Schließen</button>
 </div>
 `:`<div class="empty"><strong>Noch keine Lernjournale vorhanden.</strong></div>`}
 `);
 }catch(e){
 console.error("Lehrkraft-Lernjournale:",e);
 toast("Die Schüler-Lernjournale konnten nicht geladen werden.");
 }
}

function journalPDFDate(value){
 if(!value)return"";
 if(value.seconds)return new Date(value.seconds*1000).toLocaleDateString("de-DE");
 const d=new Date(value);
 return isNaN(d)?"":d.toLocaleDateString("de-DE");
}

function journalPDFTime(value){
 if(!value)return"";
 if(value.seconds)return new Date(value.seconds*1000).toLocaleString("de-DE");
 const d=new Date(value);
 return isNaN(d)?"":d.toLocaleString("de-DE");
}

function openJournalPrintWindow(title,students){
 const win=window.open("","_blank","width=900,height=800");
 if(!win){
 toast("Das PDF-Fenster wurde vom Browser blockiert. Bitte Pop-ups für die Campus-App erlauben.");
 return;
 }

 const studentSections=students.map(student=>`
 <section class="student-section">
 <h1>${escPDF(student.name)}</h1>
 <div class="meta">F12Sb · Persönliches Lernjournal</div>
 ${student.entries.length
 ? student.entries.map(j=>`
 <article class="entry">
 <div class="date">${escPDF(journalDisplayDate(j))}</div>
 <h2>${escPDF(j.title||"Lernjournal")}</h2>
 ${j.mood?`<div class="mood">Befinden: ${escPDF(j.mood)}</div>`:""}
 ${j.satisfaction?`<div class="print-satisfaction">Zufriedenheit: ${escPDF(j.satisfaction)}</div>`:""}
 ${j.goalAchieved?`<div class="field"><h3>Zielerreichung (letztes Ziel)</h3><p>${escPDF(j.goalAchieved)}</p></div>`:""}
 ${j.workedOn?`<div class="field"><h3>Woran habe ich heute gearbeitet?</h3><p>${escPDF(j.workedOn).replace(/\n/g,"<br>")}</p></div>`:""}
 ${j.learned?`<div class="field"><h3>Was habe ich verstanden oder gelernt?</h3><p>${escPDF(j.learned).replace(/\n/g,"<br>")}</p></div>`:""}
 ${j.difficult?`<div class="field"><h3>Was war schwierig?</h3><p>${escPDF(j.difficult).replace(/\n/g,"<br>")}</p></div>`:""}
 ${j.helpful?`<div class="field"><h3>Was hat mir geholfen? Welche Methode/Strategie hat funktioniert?</h3><p>${escPDF(j.helpful).replace(/\n/g,"<br>")}</p></div>`:""}
 ${j.metaThought?`<div class="field"><h3>Ein Gedanke über mein Lernen</h3><p>${escPDF(j.metaThought).replace(/\n/g,"<br>")}</p></div>`:""}
 ${j.nextStep?`<div class="field"><h3>Mein nächster Lernschritt</h3><p>${escPDF(j.nextStep).replace(/\n/g,"<br>")}</p></div>`:""}
 </article>
 `).join("")
 : `<p class="empty">Noch keine Einträge.</p>`
 }
 </section>
 `).join("");

 win.document.write(`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>${escPDF(title)}</title>
<style>
 @page{size:A4;margin:18mm}
 *{box-sizing:border-box}
 body{font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.55;margin:0}
 h1{font-size:28px;margin:0 0 4px}
 h2{font-size:18px;margin:6px 0 10px}
 .meta{color:#666;font-size:12px;margin-bottom:24px}
 .student-section{page-break-after:always}
 .student-section:last-child{page-break-after:auto}
 .entry{border:1px solid #ddd;border-radius:10px;padding:14px;margin:0 0 14px;break-inside:avoid}
 .date{font-size:11px;color:#777}
 .mood{font-size:22px;margin:4px 0}
 .print-satisfaction{color:#666;font-size:12px;margin-bottom:14px}
 .field{margin:14px 0 0}
 .field h3{font-size:13px;margin:0 0 5px;color:#444}
 .field p{margin:0}
 .empty{color:#777}
 .print-note{background:#f3f3f3;padding:10px;border-radius:8px;margin-bottom:20px;font-size:12px}
 @media print{.print-note{display:none}}
</style>
</head>
<body>
<div class="print-note">Lernjournal für die Dokumentation und pädagogische Begleitung. Im Druckdialog „Als PDF sichern“ bzw. „PDF“ auswählen.</div>
${studentSections}
<script>
window.onload=function(){setTimeout(function(){window.print()},300)}
<\/script>
</body>
</html>`);
 win.document.close();
}

function escPDF(value){
 return String(value??"")
 .replace(/&/g,"&amp;")
 .replace(/</g,"&lt;")
 .replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;")
 .replace(/'/g,"&#039;");
}

/* =========================================================
 PDF-EXPORT FÜR DIE TOOLS FÜR ZUSAMMENARBEIT
 Gleiches Muster wie beim Lernjournal-PDF: ein Druckfenster
 öffnen, per window.print() den Druckdialog auslösen – dort"Als PDF speichern"wählen. Keine zusätzliche Bibliothek
 nötig, funktioniert also kostenlos auf GitHub Pages.
 ========================================================= */
function openToolPrintWindow(title,bodyHTML,metaLine){
 const win=window.open("","_blank","width=900,height=800");
 if(!win){
 toast("Das PDF-Fenster wurde vom Browser blockiert. Bitte Pop-ups für die Campus-App erlauben.");
 return;
 }
 win.document.write(`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>${escPDF(title)}</title>
<style>
 @page{size:A4;margin:18mm}
 *{box-sizing:border-box}
 body{font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.55;margin:0}
 h1{font-size:26px;margin:0 0 4px}
 h2{font-size:16px;margin:20px 0 8px}
 .meta{color:#666;font-size:12px;margin-bottom:20px}
 .print-note{background:#f3f3f3;padding:10px;border-radius:8px;margin-bottom:20px;font-size:12px}
 @media print{.print-note{display:none}}
 .col{margin-bottom:18px}
 .item{border:1px solid #ddd;border-radius:10px;padding:12px 14px;margin:0 0 10px;break-inside:avoid}
 .item small{color:#777;display:block;margin-top:4px}
 .item div{margin-top:4px}
 table{width:100%;border-collapse:collapse}
 th,td{text-align:left;padding:5px 4px;border-bottom:1px solid #eee}
 .empty{color:#777}
</style>
</head>
<body>
<div class="print-note">Im Druckdialog „Als PDF sichern"bzw. „PDF"auswählen.</div>
<h1>${escPDF(title)}</h1>
${metaLine?`<div class="meta">${escPDF(metaLine)}</div>`:""}
${bodyHTML}
<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>
</body>
</html>`);
 win.document.close();
}

async function downloadStudentJournalPDF(uid){
 if(!isTeacher()){
 toast("Dieser Bereich ist nur für Lehrkräfte.");
 return;
 }

 try{
 const journals=await getTeacherJournalData();
 const entries=journals.filter(j=>j.uid===uid);
 const name=entries[0]?.studentName||"Schüler/in";

 closeModal();
 openJournalPrintWindow(
 "Lernjournal – "+name,
 [{uid,name,entries}]
 );
 }catch(e){
 console.error(e);
 toast("Das Lernjournal konnte nicht als PDF geöffnet werden.");
 }
}

async function downloadAllJournalsPDF(){
 if(!isTeacher()){
 toast("Dieser Bereich ist nur für Lehrkräfte.");
 return;
 }

 try{
 const journals=await getTeacherJournalData();
 const groups={};

 journals.forEach(j=>{
 if(!groups[j.uid]) groups[j.uid]={
 uid:j.uid,
 name:j.studentName,
 entries:[]
 };
 groups[j.uid].entries.push(j);
 });

 const students=Object.values(groups).sort((a,b)=>a.name.localeCompare(b.name,"de"));

 closeModal();
 openJournalPrintWindow(
 "F12Sb – Lernjournale",
 students
 );
 }catch(e){
 console.error(e);
 toast("Die Lernjournale konnten nicht als PDF geöffnet werden.");
 }
}

// Körperliche Stress-Anzeichen mit je einem festen, sanften Farbton
// (gleichmäßig über den Farbkreis verteilt), analog zur Kompetenz-Kategorie-Farbe.
const STRESS_SIGNS=[
 {label:"Herzschlag / Puls",hue:0},
 {label:"Atmung wird schneller",hue:40},
 {label:"Muskelspannung / Schultern",hue:80},
 {label:"Schwitzige Hände",hue:120},
 {label:"Druckgefühl im Bauch",hue:160},
 {label:"Trockener Mund",hue:200},
 {label:"Gedanken kreisen",hue:240},
 {label:"Unruhe / Gereiztheit",hue:280},
 {label:"Konzentration fällt schwer",hue:320}
];
function toggleStressSign(el,bg,border){
 const active=el.dataset.active==="1";
 el.dataset.active=active?"0":"1";
 el.style.background=active?"":bg;
 el.style.borderColor=active?"":border;
}
window.toggleStressSign=toggleStressSign;

async function renderResilienz(){
 const skills=[
 {id:"atem",icon:"",title:"Resonanzatmung",desc:"4 s einatmen · 6 s ausatmen",tag:"Regulation"},
 {id:"boden",icon:"",title:"Boden spüren",desc:"Über Körper und Sinne im Hier und Jetzt ankommen",tag:"Körper"},
 {id:"distanz",icon:"",title:"Distanzierung",desc:"Eine belastende Situation aus kosmischer Distanz betrachten",tag:"Gedanken"},
 {id:"leicht",icon:"",title:"Leichtigkeit",desc:"Das Gefühl von Leichtigkeit im Körper erzeugen",tag:"Körper"},
 {id:"bewegung",icon:"",title:"Panoramablick",desc:"Den Blick weiten und den Raum um dich wahrnehmen",tag:"Körper"},
 {id:"summen",icon:"",title:"Summen",desc:"Die Stimme nutzen, um innerlich ruhiger zu werden",tag:"Regulation"},
 {id:"ressource",icon:"",title:"Ressource aktivieren",desc:"Eine eigene Stärke oder hilfreiche Erfahrung aktivieren",tag:"Ressourcen"},
 {id:"kontakt",icon:"",title:"Verbindung",desc:"Soziale Unterstützung bewusst nutzen",tag:"Beziehungen"},
 {id:"fokus",icon:"",title:"Aufmerksamkeitsfokussierung",desc:"Wahrnehmen, wo sich gerade etwas leichter anfühlt",tag:"Gedanken"},
 {id:"gutedinge",icon:"",title:"Drei gute Dinge",desc:"Drei kleine positive Momente des Tages bewusst festhalten",tag:"Ressourcen"},
 {id:"mitgefuehl",icon:"",title:"Die Mitgefühls-Pause",desc:"Dir selbst so begegnen wie einem guten Freund",tag:"Gedanken"},
 {id:"zeitreise",icon:"",title:"Der Zeitreisende",desc:"Eine Situation aus zeitlichem Abstand betrachten",tag:"Gedanken"},
 {id:"sinne",icon:"",title:"5-4-3-2-1",desc:"Mit allen Sinnen im Hier und Jetzt ankommen",tag:"Körper"},
 {id:"wachstum",icon:"",title:"Die Wachstumsbrille",desc:"Eine Schwierigkeit als Übung statt als Bedrohung sehen",tag:"Gedanken"},
 {id:"nametrick",icon:"",title:"Der Name-Trick",desc:"Mit dir selbst wie mit einer anderen Person sprechen",tag:"Regulation"}
 ];
 const favorites=await getMyResilienzSchaetze();
 const favCount=favorites.length;

 return`${pageHead(
 "RESILIENZ & RESPRESSI","Resilienz & Respressi","Finde heraus, was dir gerade helfen könnte – und probiere es direkt aus.",`<button class="primary"onclick="resilienzImpuls()"> Impuls für mich</button>`
 )}
 <div class="card" style="border-left:4px solid #e0629e;margin-bottom:16px;text-align:center;padding:22px">
 <p style="font-size:21px;font-style:italic;font-weight:700;color:var(--ink);margin:0">„Guck in das Leuchten der Augen des anderen!“</p>
 <p style="margin:8px 0 0;color:var(--muted);font-weight:700">— Dr. Gunther Schmidt</p>
 </div>
 <style>
 .res-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
 .res-card{text-align:left;min-height:105px;padding:14px 14px 15px;cursor:pointer;transition:.25s cubic-bezier(.2,.8,.2,1);color:var(--ink);font:inherit;border-radius:16px;border:1px solid var(--line,#e2eaf0);box-shadow:0 2px 8px rgba(23,56,79,.05);position:relative;overflow:hidden}
 .res-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--blue-dark),var(--green));transform:scaleX(0);transform-origin:left;transition:transform .3s ease}
 .res-card:hover{transform:translateY(-3px);box-shadow:0 10px 20px rgba(23,56,79,.13);border-color:transparent}
 .res-card:hover::before{transform:scaleX(1)}
 .res-card h3{font-size:12.5px;color:var(--blue-dark);margin:2px 0 4px;font-weight:800;line-height:1.25}
 .res-card p{font-size:10px;color:var(--muted);line-height:1.4;margin:0}
 .res-icon{font-size:31px;margin-bottom:8px}.res-tag{display:inline-block;margin-top:6px;border-radius:999px;font-size:9.5px;padding:3px 9px}
 .res-layout{display:grid;grid-template-columns:1.35fr .65fr;gap:18px}
 .res-scale{width:100%;accent-color:#168fd0}
 .vstress-row{display:flex;gap:20px;align-items:flex-start;margin:20px 0;flex-wrap:wrap}
 .vstress-wrap{display:flex;align-items:center;gap:16px;margin:0}
 .vstress-row .skill-suggest{margin:0;min-width:220px}
 .vstress-num{font-size:32px;font-weight:800;color:#c0392b;line-height:1}
 .vstress-track{position:relative;width:54px;height:220px;border-radius:27px;background:#f0f3f5;border:1px solid var(--line,#e2eaf0);overflow:hidden}
 .vstress-fill{position:absolute;bottom:0;left:0;width:100%;border-radius:0 0 27px 27px;transition:height .12s ease,background .12s ease}
 .vstress-input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;writing-mode:vertical-lr;direction:rtl;-webkit-appearance:slider-vertical}
 .vstress-scale{display:flex;flex-direction:column;justify-content:space-between;height:220px;font-size:11px;color:var(--muted)}
 .stress-value{font-size:40px;font-weight:900;line-height:1;background:linear-gradient(90deg,var(--blue-dark),var(--green));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
 .stress-face{font-size:30px}
 .stress-signs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
 .stress-sign{border:1px solid var(--line,#ddd);border-radius:14px;padding:12px;background:#fff;transition:.2s;cursor:pointer;user-select:none}
 .stress-sign:hover{box-shadow:0 6px 16px rgba(23,56,79,.08);transform:translateY(-2px)}
 .skill-suggest{margin-top:14px;padding:18px;border-radius:18px;background:linear-gradient(135deg,#eef8fd,#e3f3fb);border:1px solid #b9dff0;box-shadow:0 4px 14px rgba(22,136,207,.08)}
 .treasure{min-height:260px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);font:inherit;border-radius:20px;transition:.3s cubic-bezier(.2,.8,.2,1);background:linear-gradient(160deg,#f4fbee,#e2f4d6);border:2px dashed #b9dea0;overflow:hidden;position:relative}
 .treasure::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 70% 15%,rgba(184,222,140,.4),transparent 60%)}
 .treasure-gem{position:absolute;width:16px;height:16px;transform:rotate(45deg);border-radius:3px;box-shadow:0 2px 4px rgba(0,0,0,.15)}
 .treasure-gem-tl{top:12px;left:12px;background:linear-gradient(135deg,#7fd4c1,#4fae9a)}
 .treasure-gem-tr{top:12px;right:12px;background:linear-gradient(135deg,#f4b6d2,#e07fa8)}
 .treasure-gem-bl{bottom:12px;left:12px;background:linear-gradient(135deg,#ffd66b,#e8a83c)}
 .treasure-gem-br{bottom:12px;right:12px;background:linear-gradient(135deg,#9ecbf5,#5f9fd6)}
 .treasure:hover{transform:translateY(-6px)scale(1.015);box-shadow:0 18px 34px rgba(120,170,80,.22)}
 .treasure:hover .chest{transform:rotate(-3deg)scale(1.06)}
 .treasure h2{position:relative;font-size:18px;color:#3d7a3a;margin:0 0 6px;font-weight:800}
 .treasure p{position:relative;font-size:12px;color:#5c7a52;line-height:1.5;margin:0 0 8px}
 .treasure small{position:relative;font-size:11px;color:#6f8f63}
 .chest{position:relative;margin:10px 0;filter:drop-shadow(0 10px 10px rgba(150,90,10,.18));transition:transform .3s cubic-bezier(.2,.8,.2,1)}
 .chest-sparkle{transform-origin:center;animation:chest-twinkle 2.4s ease-in-out infinite}
 .chest-sparkle-2{animation-delay:.5s}
 .chest-sparkle-3{animation-delay:1.1s}
 @keyframes chest-twinkle{0%,100%{opacity:.35;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
 .treasure-count{position:relative;margin-top:6px;border-radius:999px;background:#ffd66b;color:#7a4a1e;font-weight:800;border:none}
 .schatz-btn-active{background:#ffb648 !important;border-color:#e8890c !important;color:#5c3a0e !important;font-weight:800;box-shadow:0 0 0 3px rgba(255,182,72,.35)}
 .schatz-remove{position:absolute;top:6px;right:6px;padding:2px 8px;font-size:11px;line-height:1;border-radius:999px}
 .res-week{margin-top:16px}.res-checks{display:flex;flex-wrap:wrap;gap:8px}
 .breath-wrap{text-align:center;padding:4px 0}
 .breath-circle{width:154px;height:154px;border-radius:50%;margin:18px auto;display:flex;align-items:center;justify-content:center;border:4px solid currentColor;transform:scale(.84);transition:transform 4s linear,color .6s ease,background .6s ease;box-shadow:0 8px 24px rgba(23,56,79,.1)}
 .breath-circle.inhale{transform:scale(1.16);color:#1688cf;background:rgba(22,136,207,.08)}
 .breath-circle.exhale{transform:scale(.84);color:#e8890c;background:rgba(232,137,12,.08)}
 .breath-phase{font-size:21px;font-weight:800}.breath-time{font-size:40px;font-weight:800;margin-top:8px}
 .breath-hint{font-size:17px;line-height:1.5;min-height:52px}.breath-progress{height:9px;border-radius:99px;background:rgba(0,0,0,.08);overflow:hidden;margin:16px 0}
 .breath-progress>div{height:100%;width:0%;background:currentColor;transition:width .1s linear}
 .res-task{padding:18px;border:1px solid var(--line,#ddd);border-radius:16px;margin-top:16px;background:#fff;box-shadow:0 2px 8px rgba(23,56,79,.05)}.res-task textarea{width:100%;min-height:90px;border-radius:10px}
 @media(max-width:1000px){.res-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.res-layout{grid-template-columns:1fr}}
 @media(max-width:600px){.res-grid,.stress-signs{grid-template-columns:1fr}}
 </style>

 <div class="res-layout">
 <div class="card">
 <div class="kicker">DEIN MOMENT</div>
 <h2> Hast du Stress? Woran merkst du es?</h2>
 <p style="color:var(--muted);font-size:12px;margin-top:-6px">Tippe an, was gerade zutrifft.</p>
 <div class="stress-signs"id="resStressSigns">${STRESS_SIGNS.map(s=>`<div class="stress-sign"data-active="0"onclick="toggleStressSign(this,'hsl(${s.hue},55%,90%)','hsl(${s.hue},42%,55%)')"> ${s.label}</div>`).join("")}</div>

 <h2 style="margin-top:22px"> Wie hoch ist dein Stress gerade?</h2>
 <p>Schätze deinen momentanen Stress von <b>0</b> (ruhig) bis <b>10</b> (sehr angespannt) ein. Es gibt dabei kein „richtig“ oder „falsch“.</p>

 <div class="vstress-row">
 <div class="vstress-wrap">
 <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
 <div class="vstress-num"id="resStressValue">5</div>
 <div class="vstress-track">
 <div class="vstress-fill"id="resStressFill"style="height:50%;background:rgb(63,166,106)"></div>
 <input id="resStress"type="range"min="0"max="10"step="1"value="5"oninput="updateResilienzStress(this.value)"class="vstress-input">
 </div>
 </div>
 <div class="vstress-scale"><span>10 · sehr hoch</span><span>5 · angespannt</span><span>0 · ruhig</span></div>
 </div>

 <div class="skill-suggest"id="resSkillSuggest"style="flex:1">
 <strong> Deine passenden Skills</strong>
 <p style="margin-bottom:8px">Stell den Regler ein – dann schlägt dir die App passende Übungen vor.</p>
 <div id="resSkillButtons"></div>
 </div>
 </div>
 </div>

 <button class="card treasure"onclick="openResilienzSchatzkiste()">
 <div class="treasure-gem treasure-gem-tl"></div>
 <div class="treasure-gem treasure-gem-tr"></div>
 <div class="treasure-gem treasure-gem-bl"></div>
 <div class="treasure-gem treasure-gem-br"></div>
 <div class="kicker">MEIN PERSÖNLICHER WERKZEUGKASTEN</div>
 <div class="chest">
 <svg viewBox="0 0 120 100"width="88"height="74">
 <ellipse cx="60"cy="90"rx="42"ry="7"fill="#e8890c"opacity=".12"/>
 <path d="M14 46 h92 v34 a6 6 0 0 1-6 6 H20 a6 6 0 0 1-6-6 Z"fill="#c9782e"/>
 <path d="M14 46 h92 v10 H14 Z"fill="#a85f22"/>
 <path d="M10 30 Q60 6 110 30 L108 48 H12 Z"fill="#e0973f"/>
 <path d="M10 30 Q60 6 110 30 L109 39 Q60 16 11 39 Z"fill="#f2ad5e"/>
 <rect x="52"y="40"width="16"height="20"rx="3"fill="#7a4a1e"/>
 <circle cx="60"cy="49"r="3.4"fill="#ffd66b"/>
 <path class="chest-sparkle chest-sparkle-1"d="M22 18 l2.4 5.6 5.6 2.4-5.6 2.4L22 34l-2.4-5.6L14 26l5.6-2.4Z"fill="#ffd66b"/>
 <path class="chest-sparkle chest-sparkle-2"d="M98 14 l1.6 3.8 3.8 1.6-3.8 1.6-1.6 3.8-1.6-3.8-3.8-1.6 3.8-1.6Z"fill="#ffb648"/>
 <path class="chest-sparkle chest-sparkle-3"d="M92 58 l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3Z"fill="#ffd66b"/>
 </svg>
 </div>
 <h2>Meine Resilienz-Schatzkiste</h2>
 <p>Hier sammelst du die Übungen, die dir persönlich helfen.</p>
 <span class="pill treasure-count">${favCount} Schätze gespeichert</span>
 <small style="margin-top:10px">Klicke, um die Schatzkiste zu öffnen.</small>
 </button>
 </div>

 <div class="card"style="margin-top:16px">
 <div class="kicker">RESPRESSI · MINI-ÜBUNGEN</div>
 <h2> Deine Resilienz-Skills</h2>
 <p>Jede Übung dauert nur wenige Minuten und kann direkt ausprobiert werden.</p>
 <div class="res-grid">${skills.map(x=>{const c=resilienzTagColor(x.tag);return`
 <button class="card res-card"style="background:${c.bg};border-left:4px solid ${c.border}"onclick="startResilienzSkill('${x.id}')">
 <h3>${x.title}</h3><p>${x.desc}</p><span class="pill res-tag"style="background:${c.pill}">${x.tag}</span>
 </button>`}).join("")}</div>
 </div>

 <div class="card res-week">
 <div class="kicker">MEINE RESILIENZ-WOCHE</div><h2> Was hat mir gutgetan?</h2>
 <p>Markiere Strategien, die du diese Woche ausprobiert hast.</p>
 <div class="res-checks">${["Bewegung","Pause","Atemübung","Kontakt","Humor","Natur","Musik","Hilfe annehmen","Schlaf","Dankbarkeit","Kreativität"].map(x=>`<button class="secondary"onclick="resilienzCheckin('${x}')">${x}</button>`).join("")}</div>
 </div>${footer()}`;
}

// Farbverlauf des Stress-Reglers: 0 = leicht transparentes Grün, 5 = volles
// Grün, 5–10 = sanfter Übergang zu Rot.
function stressFarbe(v){
 const gruen=[63,166,106],rot=[214,58,58];
 if(v<=5){
 const t=v/5;
 const alpha=(0.12+t*0.88).toFixed(2);
 return`rgba(${gruen[0]},${gruen[1]},${gruen[2]},${alpha})`;
 }
 const t=(v-5)/5;
 const r=Math.round(gruen[0]+(rot[0]-gruen[0])*t);
 const g=Math.round(gruen[1]+(rot[1]-gruen[1])*t);
 const b=Math.round(gruen[2]+(rot[2]-gruen[2])*t);
 return`rgb(${r},${g},${b})`;
}
function updateResilienzStress(value){
 const v=Number(value);
 const val=$("resStressValue"),box=$("resSkillButtons"),fill=$("resStressFill");
 if(val)val.textContent=v;
 if(fill){
 fill.style.height=`${v*10}%`;
 fill.style.background=stressFarbe(v);
 }
 const ids=v<=2?["fokus","ressource","leicht"]:v<=5?["boden","bewegung","fokus","kontakt"]:v<=7?["atem","boden","distanz","bewegung"]:["atem","boden","pause","kontakt"];
 if(box)box.innerHTML=ids.slice(0,3).map(id=>{
 const s=resilienzSkillData(id);
 return`<button class="primary"style="margin:4px"onclick="startResilienzSkill('${id}')">${s[0]} ${s[1]}</button>`;
 }).join("");
}
function resilienzSkillData(id){
 const d={
 atem:["","Resonanzatmung","4 Sekunden ein · 6 Sekunden aus"],
 boden:["","Boden spüren","Körper und Sinne"],
 distanz:["","Distanzierung","aus kosmischer Distanz betrachten"],
 leicht:["","Leichtigkeit","Gefühl von Leichtigkeit erzeugen"],
 bewegung:["","Panoramablick","Blick weiten"],
 summen:["","Summen","Stimme zur Beruhigung nutzen"],
 ressource:["","Ressource aktivieren","eigene Stärke"],
 kontakt:["","Verbindung","Unterstützung nutzen"],
 fokus:["","Aufmerksamkeitsfokussierung","wo es leichter wird"],
 gutedinge:["","Drei gute Dinge","positive Momente festhalten"],
 mitgefuehl:["","Die Mitgefühls-Pause","wie ein guter Freund"],
 zeitreise:["","Der Zeitreisende","zeitlicher Abstand"],
 sinne:["","5-4-3-2-1","alle Sinne nutzen"],
 wachstum:["","Die Wachstumsbrille","Schwierigkeit als Übung sehen"],
 nametrick:["","Der Name-Trick","mit dir wie mit anderen sprechen"],
 pause:["","Bewusste Pause","kurz unterbrechen"]
 }; return d[id]||d.atem;
}
function resilienzImpuls(){
 const ids=["atem","boden","distanz","leicht","bewegung","summen","ressource","kontakt","fokus","gutedinge","mitgefuehl","zeitreise","sinne","wachstum","nametrick"];
 startResilienzSkill(ids[Math.floor(Math.random()*ids.length)]);
}
async function startResilienzSkill(id){
 if(id==="atem"){await openResonanzatmung();return;}
 const d=resilienzSkillData(id);
 const tasks={
 boden:["Stell beide Füße auf den Boden. Spüre Druck, Temperatur und Kontakt. Schau anschließend drei Dinge im Raum bewusst an.","Was hast du wahrgenommen?","z. B. „Meine Schultern sind gerade etwas lockerer …“"],
 distanz:["Stell dir vor, du bist ein Stern, weit weg im Weltall, und siehst auf dich herab. Wie fühlt sich das nun an?","Wie fühlt sich das an?","z. B. „Es wirkt kleiner und weiter weg …“"],
 leicht:["Gehe Arme schwenkend umher und fühle dich in dieses Gefühl ein. Mache das 2 Minuten lang. Genieß die Leichtigkeit.","Wie hat sich die Leichtigkeit angefühlt?","z. B. „Meine Schultern sind lockerer, ich fühle mich freier …“"],
 bewegung:["Stell dir vor, du blickst auf eine weite Landschaft. Was siehst du alles in der Weite?","Wie fühlt sich der weite Blick an?","z. B. „Ich fühle mich ruhiger und weiter …“"],
 summen:["Summe für ein bis zwei Minuten eine ruhige Melodie oder einen einzelnen, gehaltenen Ton. Spüre die Vibration in Brust und Kehle.","Was hast du bemerkt?","z. B. „Ich atme ruhiger, die Kehle entspannt sich …“"],
 ressource:["Denke an eine Situation, die du trotz einer Schwierigkeit bewältigt hast. Welche Stärke kannst du heute nutzen?","Welche Ressource nimmst du mit?","z. B. Geduld, Humor, Durchhaltevermögen …"],
 kontakt:["Überlege: Wer könnte dir gerade guttun oder dich unterstützen? Du entscheidest selbst, ob du diese Person ansprichst.","Wer oder was könnte dich unterstützen?","Name oder Art der Unterstützung …"],
 fokus:["Den Stress kann man gut spüren, das ist o.k. Aber wo fühlt es sich ein bisschen leichter an? Kannst du etwas finden? Setze den Fokus darauf.","Wo fühlt es sich etwas leichter an?","z. B. „In den Schultern ist es etwas leichter …“"],
 gutedinge:["Denk an drei Dinge, die heute gut gelaufen sind – auch kleine. Überlege kurz, was dazu beigetragen hat.","Was waren deine drei guten Dinge?","1. … 2. … 3. …"],
 mitgefuehl:["Leg eine Hand auf die Brust oder den Arm. Sag dir: „Das ist gerade schwer. Andere kennen das auch. Was würde ich jetzt einer guten Freundin sagen?“ Sag dir genau das.","Was hast du dir gesagt?","z. B. „Das darf gerade so sein, ich bin nicht allein damit …“"],
 zeitreise:["Frag dich: Wie wichtig wird mir das in 10 Minuten erscheinen? In 10 Monaten? In 10 Jahren?","Was verändert sich durch den Blick aus der Zukunft?","z. B. „In 10 Jahren wird das vermutlich kaum noch eine Rolle spielen …“"],
 sinne:["Finde: 5 Dinge, die du siehst. 4 Dinge, die du hörst. 3 Dinge, die du spürst. 2 Dinge, die du riechst. 1 Ding, das du schmeckst (oder dir vorstellst).","Was ist dir dabei aufgefallen?","z. B. „Ich bin ruhiger geworden, während ich gesucht habe …“"],
 wachstum:["Setz dir gedanklich eine „Wachstumsbrille“ auf: Was könntest du aus dieser Situation lernen, egal wie sie ausgeht?","Was nimmst du zum Lernen mit?","z. B. „Ich merke, dass ich mehr aushalte, als ich dachte …“"],
 nametrick:["Sprich innerlich mit dir selbst, als wärst du eine andere Person – nutze deinen eigenen Namen statt „ich“. Z. B.: „[Name], das schaffst du.“","Wie hat sich das angefühlt?","z. B. „Es fühlte sich klarer und ruhiger an …“"]
 };
 const t=tasks[id];
 let saved=false;
 try{const snap=await getDoc(doc(db,"resilienzSchaetze",`${currentUser.uid}_${id}`));saved=snap.exists()}catch(e){console.error("Schatzkiste-Status prüfen:",e)}
 modal(`<button class="modal-close"type="button"data-close-impuls-modal aria-label="Impuls schließen">×</button>
 <div class="kicker">RESPRESSI · SKILL</div><h2>${d[0]} ${d[1]}</h2>
 <p style="font-size:18px;line-height:1.55">${t[0]}</p>
 <div class="res-task"><label><strong>${t[1]}</strong></label><textarea id="resTaskInput"placeholder="${t[2]}"></textarea></div>
 <div class="form-actions"><button class="secondary"onclick="closeResilienzModal()">Schließen</button>
 <button id="schatzBtn_${id}"class="${saved?"primary schatz-btn-active":"secondary"}"onclick="toggleResilienzSchatz('${id}')">${saved?"★ In der Schatzkiste":"☆ In meine Schatzkiste"}</button>
 <button class="primary"onclick="resilienzSkillDone()"> Geschafft</button></div>`);
}
function resilienzSkillDone(){toast("Gut. Nimm kurz wahr, was sich verändert hat.");closeResilienzModal();}
function closeResilienzModal(){stopResonanzTimer();closeModal();}
// Lädt ausschließlich die eigenen gespeicherten Übungen – Firestore-Regeln
// erlauben ohnehin nur Lesezugriff auf die eigenen Dokumente.
// Ein fester, sanft abgestimmter Farbton pro Skill-Tag (gleicher Abstand auf
// dem Farbkreis, einheitliche Sättigung/Helligkeit), damit die Resilienz-Skills
// sowohl in der Übersicht als auch in der Schatzkiste ruhig und ausgewogen
// wirken statt bunt gemischt zu sein.
const RESILIENZ_TAG_HUES={
 "Regulation":200,
 "Körper":130,
 "Gedanken":260,
 "Ressourcen":40,
 "Beziehungen":330
};
const RESILIENZ_SKILL_TAGS={
 atem:"Regulation",boden:"Körper",distanz:"Gedanken",leicht:"Körper",bewegung:"Körper",
 summen:"Regulation",ressource:"Ressourcen",kontakt:"Beziehungen",fokus:"Gedanken",
 gutedinge:"Ressourcen",mitgefuehl:"Gedanken",zeitreise:"Gedanken",sinne:"Körper",
 wachstum:"Gedanken",nametrick:"Regulation"
};
function resilienzTagColor(tag){
 const hue=RESILIENZ_TAG_HUES[tag]??200;
 return {bg:`hsl(${hue},55%,96%)`,border:`hsl(${hue},42%,58%)`,pill:`hsl(${hue},50%,89%)`};
}
async function getMyResilienzSchaetze(){
 if(!db||!currentUser)return [];
 try{
 const snap=await getDocs(query(collection(db,"resilienzSchaetze"),where("uid","==",currentUser.uid)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){
 console.error("Resilienz-Schatzkiste laden:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Laden der Schatzkiste. Bitte die Firestore-Regeln prüfen.":"Schatzkiste konnte nicht geladen werden.");
 return [];
 }
}
const resilienzSchatzInFlight=new Set();
async function toggleResilienzSchatz(skillId){
 if(!isApproved()){toast("Nur freigeschaltete Nutzer können Übungen speichern.");return}
 if(resilienzSchatzInFlight.has(skillId))return;
 resilienzSchatzInFlight.add(skillId);
 const docId=`${currentUser.uid}_${skillId}`;
 const btn=$(`schatzBtn_${skillId}`);
 try{
 const ref=doc(db,"resilienzSchaetze",docId);
 const snap=await getDoc(ref);
 if(snap.exists()){
 await deleteDoc(ref);
 toast("Aus der Schatzkiste entfernt.");
 if(btn){btn.className="secondary";btn.textContent="☆ In meine Schatzkiste"}
 }else{
 await setDoc(ref,{uid:currentUser.uid,skillId,createdAt:serverTimestamp()});
 toast("In deine Resilienz-Schatzkiste gelegt.");
 if(btn){btn.className="primary schatz-btn-active";btn.textContent="★ In der Schatzkiste"}
 }
 await refreshTreasureCount();
 }catch(e){
 console.error("Resilienz-Schatzkiste ändern:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Speichern. Bitte die Firestore-Regeln prüfen.":"Konnte nicht gespeichert werden.");
 }finally{
 resilienzSchatzInFlight.delete(skillId);
 }
}
// Aktualisiert die "X Schätze gespeichert"-Anzeige auf der Kachel sofort,
// ohne die ganze Resilienz-Seite neu zu laden (verhindert, dass eine
// laufende Übung dabei unterbrochen wird).
async function refreshTreasureCount(){
 const badge=document.querySelector(".treasure-count");
 if(!badge)return;
 try{
 const favorites=await getMyResilienzSchaetze();
 badge.textContent=`${favorites.length} Schätze gespeichert`;
 }catch(e){console.error("Schatzkisten-Zähler aktualisieren:",e)}
}
async function openResilienzSchatzkiste(){
 const favorites=await getMyResilienzSchaetze();
 const cards=favorites.map(f=>{const d=resilienzSkillData(f.skillId);const c=resilienzTagColor(RESILIENZ_SKILL_TAGS[f.skillId]);return`<div class="card res-card"style="position:relative;cursor:pointer;background:${c.bg};border-left:4px solid ${c.border}"onclick="startResilienzSkill('${f.skillId}')">
 <button type="button"class="secondary schatz-remove"onclick="event.stopPropagation();removeFromResilienzSchatzkiste('${f.skillId}')"title="Aus der Schatzkiste entfernen">✕</button>
 <h3>${d[1]}</h3><p>${d[2]}</p>
 </div>`}).join("");
 modal(`<button class="modal-close"onclick="closeResilienzModal()">×</button><div class="kicker">MEINE RESILIENZ-SCHATZKISTE</div>
 <h2> Meine Schätze</h2><p>Übungen, die du für dich als hilfreich ausgewählt hast. Nur du kannst das hier sehen – nicht einmal Lehrkräfte. Tippe ✕, um etwas zu entfernen.</p>
 <div class="res-grid">${cards||`<div class="empty">Deine Schatzkiste ist noch leer. Probiere eine Übung aus und lege sie anschließend hier hinein.</div>`}</div>
 <div class="form-actions"><button class="secondary"onclick="closeResilienzModal()">Schließen</button></div>`);
}
async function removeFromResilienzSchatzkiste(skillId){
 try{
 await deleteDoc(doc(db,"resilienzSchaetze",`${currentUser.uid}_${skillId}`));
 toast("Aus der Schatzkiste entfernt.");
 await openResilienzSchatzkiste();
 await refreshTreasureCount();
 }catch(e){
 console.error("Aus Schatzkiste entfernen:",e);
 toast("Konnte nicht entfernt werden.");
 }
}
window.removeFromResilienzSchatzkiste=removeFromResilienzSchatzkiste;
let resonanzTimer=null,resonanzRunning=false,resonanzEnd=0,resonanzStart=0;
async function openResonanzatmung(){
 stopResonanzTimer();
 let saved=false;
 try{const snap=await getDoc(doc(db,"resilienzSchaetze",`${currentUser.uid}_atem`));saved=snap.exists()}catch(e){console.error("Schatzkiste-Status prüfen:",e)}
 modal(`<button class="modal-close"onclick="closeResilienzModal()">×</button>
 <div class="kicker">RESPRESSI · RESONANZATMUNG</div><h2> 4 Sekunden ein · 6 Sekunden aus</h2>
 <p style="font-size:17px;line-height:1.5">Der Kreis zeigt dir den Rhythmus. Einatmen: 4 Sekunden. Ausatmen: 6 Sekunden. Atme ruhig und ohne Druck.</p>
 <div class="breath-wrap">
 <div id="breathCircle"class="breath-circle"><span id="breathPhase"class="breath-phase">Bereit</span></div>
 <div id="breathClock"class="breath-time">02:00</div>
 <div id="breathHint"class="breath-hint">Drücke Start. Die erste Phase beginnt mit dem Einatmen.</div>
 <div class="breath-progress"><div id="breathProgress"></div></div>
 <button class="primary"id="breathStart"onclick="toggleResonanzTimer()">▶ Start</button>
 </div>
 <div class="form-actions"><button class="secondary"onclick="closeResilienzModal()">Schließen</button>
 <button id="schatzBtn_atem"class="${saved?"primary schatz-btn-active":"secondary"}"onclick="toggleResilienzSchatz('atem')">${saved?"★ In der Schatzkiste":"☆ In meine Schatzkiste"}</button></div>`);
}
function toggleResonanzTimer(){
 const btn=$("breathStart");if(!btn)return;
 if(resonanzRunning){resonanzRunning=false;if(resonanzTimer){clearInterval(resonanzTimer);resonanzTimer=null}btn.textContent="▶ Weiter";return;}
 if(!resonanzEnd)resonanzEnd=Date.now()+120000;
 resonanzRunning=true;btn.textContent="⏸ Pause";updateResonanzTimer();
 resonanzTimer=setInterval(updateResonanzTimer,100);
}
function updateResonanzTimer(){
 const left=Math.max(0,resonanzEnd-Date.now()), elapsed=120000-left;
 const total=Math.ceil(left/1000),m=String(Math.floor(total/60)).padStart(2,"0"),s=String(total%60).padStart(2,"0");
 const clock=$("breathClock"),progress=$("breathProgress"),circle=$("breathCircle"),phase=$("breathPhase"),hint=$("breathHint");
 if(clock)clock.textContent=`${m}:${s}`;
 if(progress)progress.style.width=`${Math.min(100,(elapsed/120000)*100)}%`;
 if(left<=0){
 stopResonanzTimer();if(phase)phase.textContent="Geschafft";if(hint)hint.textContent="Nimm kurz wahr: Was hat sich verändert?";
 const b=$("breathStart");if(b){b.textContent="Beendet";b.disabled=true} return;
 }
 const cycle=elapsed%10000;
 if(cycle<4000){
 if(circle){circle.classList.add("inhale");circle.classList.remove("exhale")}
 if(phase)phase.textContent=`Einatmen · ${Math.ceil((4000-cycle)/1000)} s`;
 if(hint)hint.textContent="Langsam einatmen …";
 }else{
 if(circle){circle.classList.add("exhale");circle.classList.remove("inhale")}
 if(phase)phase.textContent=`Ausatmen · ${Math.ceil((10000-cycle)/1000)} s`;
 if(hint)hint.textContent="Langsam und entspannt ausatmen …";
 }
}
function stopResonanzTimer(){
 if(resonanzTimer){clearInterval(resonanzTimer);resonanzTimer=null}
 resonanzRunning=false;resonanzEnd=0;resonanzStart=0;
}
function resilienzCheckin(name){try{localStorage.setItem("campus_resilienz_"+name,new Date().toISOString())}catch(e){}toast(name+": für diese Woche eingetragen.");}


async function renderFragenHilfe(){
 const faqs=[
 ["Was ist die F12Sb?","Die F12Sb verbindet selbstständiges Lernen, Projekte, Praxis, Kompetenzentwicklung und Gemeinschaft. Du arbeitest zunehmend eigenverantwortlich und kannst deinen Lernweg aktiv mitgestalten."],
 ["Wie funktioniert das Lernen?","Du setzt Ziele, planst deine nächsten Schritte, bearbeitest Lernaufträge und reflektierst deinen Lernweg. Die Lernwerkstatt unterstützt dich dabei mit Methoden, Lernressourcen, Lernimpulsen und KI-Angeboten."],
 ["Wo finde ich meine Aufgaben?","Im Campus-Kompass findest du deine persönlichen Aufgaben, Projekte, Ziele und deinen aktuellen Lernweg."],
 ["Was ist die Lernwerkstatt?","Die Lernwerkstatt ist dein Bereich für selbstständiges Lernen. Dort findest du Lernpfade, Lernressourcen, Lernimpulse, Lernstandsmessungen, KI zum Lernen und diese Fragen-&-Hilfe-Seite."],
 ["Wie nutze ich KI zum Lernen?","KI soll dich beim Verstehen, Üben, Prüfen und Reflektieren unterstützen – nicht einfach fertige Lösungen liefern. Du kannst KI zum Beispiel um Erklärungen, Fragen, Feedback oder Gegenargumente bitten."],
 ["Was mache ich, wenn ich nicht weiterkomme?","Formuliere möglichst konkret, woran du gerade arbeitest und an welcher Stelle du nicht weiterkommst. Nutze dann passende Lernressourcen, KI als Lernpartner oder wende dich an eine Lehrkraft bzw. Mitschülerinnen und Mitschüler."],
 ["Was ist Deeper Learning?","Deeper Learning bedeutet, dass du Wissen nicht nur aufnimmst, sondern es verstehst, anwendest, auf neue Situationen überträgst, Probleme löst, gemeinsam arbeitest und deine Ergebnisse reflektierst."],
 ["Was ist ein Lernjournal?","Im Lernjournal hältst du deinen Lernweg fest: Was habe ich gelernt? Was hat funktioniert? Wo gab es Schwierigkeiten? Was ist mein nächster Schritt?"],
 ["Was sind Lernstandsmessungen?","Sie helfen dir zu erkennen, wo du bei deinen Kompetenzen stehst und woran du als Nächstes arbeiten solltest. Die Ergebnisse können deine Kompetenzentwicklung sichtbar machen."],
 ["Wo finde ich Termine?","Im Campus-Kalender findest du die wichtigen Termine der F12Sb. Dort sind auch die Schulferien von Bayern für das Schuljahr 2026/27 markiert."],
 ["Was mache ich bei Fragen zur F12Sb?","Wenn deine Frage hier nicht beantwortet wird, wende dich an deine Lehrkraft bzw. das Klassenteam. Die Seite soll dir zunächst schnelle Orientierung zu F12Sb und Lernen geben."]
 ];

 return`${pageHead("ORIENTIERUNG","Fragen & Hilfe","Antworten rund um die F12Sb, selbstständiges Lernen und deinen Lernweg.")}
 <div class="card"style="margin-bottom:16px;border-left:4px solid #3fa66a">
 <span class="badge"> ORIENTIERUNG</span>
 <h2>Du hast eine Frage?</h2>
 <p>Hier findest du schnelle Antworten zu den wichtigsten Fragen rund um die F12Sb und das Lernen. Nutze die Themen als erste Orientierung.</p>
 </div>
 <div class="grid grid-2">
 ${faqs.map(([q,a])=>`<details class="card"style="margin:0 0 12px">
 <summary style="cursor:pointer;font-weight:700;font-size:16px">${q}</summary>
 <p style="margin:12px 0 0">${a}</p>
 </details>`).join("")}
 </div>
 ${footer()}`;
}

/* =========================================================
 KALENDER-EXPORT FÜRS HANDY (.ics)
 Erzeugt eine iCalendar-Datei, die sich in jeder Handy-Kalender-
 App (iPhone Kalender, Google Kalender, Outlook …) importieren
 lässt. Keine externe Bibliothek nötig – reines Textformat.
 ========================================================= */
function escapeICS(text){
 return String(text||"")
 .replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
}

function buildICS(events,calName){
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//F12Sb//Kalender//DE","CALSCALE:GREGORIAN",`X-WR-CALNAME:${escapeICS(calName||"F12Sb Kalender")}`];
 const stamp=new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
 events.forEach((e,i)=>{
 const raw=e.start||e.date||e.startDate;
 if(!raw)return;
 const dateStr=(typeof raw==="object"&&raw.seconds)?new Date(raw.seconds*1000).toISOString().slice(0,10):String(raw).slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))return;
 const dt=dateStr.replace(/-/g,"");
 const endBase=e.rangeEnd?String(e.rangeEnd).slice(0,10):dateStr;
 const nd=new Date(endBase+"T00:00:00");
 if(isNaN(nd))return;
 nd.setDate(nd.getDate()+1);
 const dtEnd=`${nd.getFullYear()}${String(nd.getMonth()+1).padStart(2,"0")}${String(nd.getDate()).padStart(2,"0")}`;
 lines.push("BEGIN:VEVENT");
 lines.push(`UID:${e.id||("ck-"+i+"-"+dt)}@f12sb-weilheim`);
 lines.push(`DTSTAMP:${stamp}`);
 lines.push(`DTSTART;VALUE=DATE:${dt}`);
 lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
 lines.push(`SUMMARY:${escapeICS(e.title||e.name||"Termin")}`);
 if(e.description||e.text)lines.push(`DESCRIPTION:${escapeICS(e.description||e.text||"")}`);
 if(e.location)lines.push(`LOCATION:${escapeICS(e.location)}`);
 lines.push("END:VEVENT");
 });
 lines.push("END:VCALENDAR");
 return lines.join("\r\n");
}

function downloadICS(events,filename,calName){
 const content=buildICS(events,calName);
 const blob=new Blob([content],{type:"text/calendar;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download=filename||"kalender.ics";
 document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},0);
}

async function exportCampusCalendarICS(){
 try{
 let events=[];
 try{events=await getCollection("events","start",false)}catch(e){console.error(e)}
 if(!events.length){
 try{events=await getCollection("calendar","date",false)}catch(e){console.error(e)}
 }
 let birthdayEvents=[];
 try{birthdayEvents=await getBirthdayEvents()}catch(e){console.error(e)}
 const ferienZeitraeume=[
 ["2026-08-03","2026-09-14","Sommerferien 2026"],
 ["2026-11-02","2026-11-06","Herbstferien / unterrichtsfreie Tage um Allerheiligen"],
 ["2026-12-24","2027-01-08","Weihnachtsferien 2026/27"],
 ["2027-02-08","2027-02-12","Frühjahrsferien 2027"],
 ["2027-03-22","2027-04-02","Osterferien 2027"],
 ["2027-05-18","2027-05-28","Pfingstferien 2027"],
 ["2027-08-02","2027-09-13","Sommerferien 2027"]
 ];
 const ferienRangeEvents=ferienZeitraeume.map(([start,end,label])=>(
 {start,rangeEnd:end,title:label,description:"Schulferien in Bayern"}
 ));
 const pruefungsTermineICS=[
 ["2027-05-12","Deutsch – Fachabiturprüfung"],
 ["2027-05-14","Profilfach (Pädagogik/Psychologie) – Fachabiturprüfung"],
 ["2027-06-01","Englisch – Fachabiturprüfung"],
 ["2027-06-03","Mathematik – Fachabiturprüfung"]
 ].map(([start,title])=>({start,title,description:"Zentraler Prüfungstermin lt. Kultusministerium."}));
 downloadICS([...events,...birthdayEvents,...ferienRangeEvents,...pruefungsTermineICS],"campuskalender.ics","F12Sb Kalender");
 toast("Kalender wird heruntergeladen – Datei öffnen, um sie zum Handy-Kalender hinzuzufügen.");
 }catch(e){console.error("Kalender-Export:",e);toast("Der Kalender konnte nicht exportiert werden.")}
}

function exportCalendarDayICS(y,m,d){
 const events=window._campusCalendarEvents||[];
 const day=events.filter(e=>{
 const raw=e.start||e.date||e.startDate;
 const x=raw&&raw.seconds?new Date(raw.seconds*1000):new Date(String(raw||"").slice(0,10)+"T00:00:00");
 return !isNaN(x)&&x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;
 });
 if(!day.length){toast("An diesem Tag gibt es keinen Termin zum Exportieren.");return}
 downloadICS(day,`termin-${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}.ics`,"F12Sb Termin");
}

async function renderKalender(){
 let events=[];
 try{events=(await getCollection("events","start",false)).map(e=>({...e,collection:"events"}))}catch(e){console.error("Kalender events:",e)}
 if(!events.length){
 try{events=(await getCollection("calendar","date",false)).map(e=>({...e,collection:"calendar"}))}catch(e){console.error("Kalender calendar:",e)}
 }

 const typeMeta={
 schulaufgabe:{label:"Schulaufgabe",className:"cal-blue"},
 kurzarbeit:{label:"Kurzarbeit",className:"cal-red"},
 projektvorstellung:{label:"Projektvorstellung",className:"cal-green"},
 referat:{label:"Referat",className:"cal-yellow"},
 praesentation:{label:"Präsentation",className:"cal-purple"},
 sonstiges:{label:"Sonstiger Termin",className:"cal-grey"},
 geburtstag:{label:"Geburtstag",className:"cal-birthday"},
 ferien:{label:"Schulferien Bayern",className:"cal-holiday"},
 pruefung:{label:"Abschlussprüfung",className:"cal-gold"}
 };

 // Schulferien Bayern – Schuljahr 2026/27.
 const ferienZeitraeume=[
 ["2026-08-03","2026-09-14","Sommerferien 2026"],
 ["2026-11-02","2026-11-06","Herbstferien / unterrichtsfreie Tage um Allerheiligen"],
 ["2026-12-24","2027-01-08","Weihnachtsferien 2026/27"],
 ["2027-02-08","2027-02-12","Frühjahrsferien 2027"],
 ["2027-03-22","2027-04-02","Osterferien 2027"],
 ["2027-05-18","2027-05-28","Pfingstferien 2027"],
 ["2027-08-02","2027-09-13","Sommerferien 2027"]
 ];
 const ferienEvents=[];
 ferienZeitraeume.forEach(([von,bis,label])=>{
 const start=new Date(von+"T00:00:00");
 const end=new Date(bis+"T00:00:00");
 for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
 ferienEvents.push({
 start:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
 type:"ferien",
 title:label,
 description:"Schulferien in Bayern"
 });
 }
 });
 // Schriftliche Fachabiturprüfung 2027 – zentrale Prüfungstermine für alle
 // FOSBOS Bayern (Bekanntmachung des Kultusministeriums, BayMBl. 2025 Nr. 320).
 const pruefungsTermine=[
 ["2027-05-12","Deutsch – Fachabiturprüfung"],
 ["2027-05-14","Profilfach (Pädagogik/Psychologie) – Fachabiturprüfung"],
 ["2027-06-01","Englisch – Fachabiturprüfung"],
 ["2027-06-03","Mathematik – Fachabiturprüfung"]
 ];
 const pruefungsEvents=pruefungsTermine.map(([datum,titel])=>({
 start:datum,type:"pruefung",title:titel,
 description:"Zentraler Prüfungstermin lt. Kultusministerium – gilt für alle Beruflichen Oberschulen Bayerns."
 }));
 let birthdayEvents=[];
 try{birthdayEvents=await getBirthdayEvents()}catch(e){console.error("Kalender Geburtstage:",e)}
 events=[...events,...birthdayEvents,...ferienEvents,...pruefungsEvents];

 const normalizeType=e=>{
 const raw=String(e?.type||e?.eventType||e?.category||"sonstiges").toLowerCase().trim();
 return raw==="präsentation"?"praesentation":(typeMeta[raw]?raw:"sonstiges");
 };
 const dateVal=e=>{
 const raw=e?.start||e?.date||e?.startDate;
 if(!raw)return null;
 if(typeof raw==="object"&&raw.seconds)return new Date(raw.seconds*1000);
 const d=new Date(String(raw).slice(0,10)+"T00:00:00");
 return isNaN(d)?null:d;
 };
 const eventsForDay=(y,m,d)=>events.filter(e=>{
 const x=dateVal(e);
 return x&&x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;
 });

 const months=[
 {m:8,y:2026,name:"September 2026"},{m:9,y:2026,name:"Oktober 2026"},
 {m:10,y:2026,name:"November 2026"},{m:11,y:2026,name:"Dezember 2026"},
 {m:0,y:2027,name:"Januar 2027"},{m:1,y:2027,name:"Februar 2027"},
 {m:2,y:2027,name:"März 2027"},{m:3,y:2027,name:"April 2027"},
 {m:4,y:2027,name:"Mai 2027"},{m:5,y:2027,name:"Juni 2027"},{m:6,y:2027,name:"Juli 2027"},
 {m:7,y:2027,name:"August 2027"}
 ];
 const week=["Mo","Di","Mi","Do","Fr","Sa","So"];

 const monthHTML=(y,m,name)=>{
 const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=(first.getDay()+6)%7,cells=[];
 for(let i=0;i<offset;i++)cells.push('<div class="cal-day empty"></div>');
 for(let d=1;d<=days;d++){
 const ds=eventsForDay(y,m,d);
 const firstType=ds.length?normalizeType(ds[0]):"";
 const meta=firstType?typeMeta[firstType]:null;
 cells.push(`<button type="button"class="cal-day ${meta?`has-event ${meta.className}`:""}"onclick="openCalendarDay(${y},${m},${d})">
 <span class="cal-num">${d}</span>
 ${meta?`<span class="cal-event-type">${esc(meta.label)}</span>${ds.length>1?`<span class="cal-count">+${ds.length-1}</span>`:""}`:""}
 </button>`);
 }
 while(cells.length%7)cells.push('<div class="cal-day empty"></div>');
 return`<section class="card cal-month">
 <div class="cal-month-head"><h2>${name}</h2></div>
 <div class="cal-week">${week.map(x=>`<div>${x}</div>`).join("")}</div>
 <div class="cal-grid">${cells.join("")}</div>
 </section>`;
 };

 window._campusCalendarEvents=events;
 const addButton=isTeacher()?'<button id="calendarAddBtn"class="primary"type="button">＋ Termin eintragen</button>':"";
 const birthdayButton='<button id="calendarBirthdayBtn"class="secondary"type="button"> Meinen Geburtstag eintragen</button>';
 const exportButton='<button class="secondary"type="button"onclick="exportCampusCalendarICS()"> Kalender aufs Handy exportieren</button>';
 const legend=Object.entries(typeMeta).map(([k,v])=>
 `<span class="cal-legend-item"><i class="cal-legend-dot ${v.className}"></i>${esc(v.label)}</span>`
 ).join("");

 const html=`${pageHead("ORGANISATION","Campus-Kalender","Das Schuljahr 26/27 auf einen Blick. Termine sind je nach Terminart farblich gekennzeichnet.",`${addButton}${birthdayButton}${exportButton}`)}
 <style>
 .cal-months{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
 .cal-month{padding:18px}.cal-month-head{margin-bottom:10px}
 .cal-week,.cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
 .cal-week{font-size:12px;color:var(--muted);text-align:center}
 .cal-day{min-height:76px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:7px;text-align:left;cursor:pointer;position:relative;display:flex;flex-direction:column}
 .cal-day.empty{border:0;background:transparent;cursor:default}
 .cal-day.has-event{border:2px solid rgba(0,0,0,.16)}
 .cal-num{display:block;font-size:14px;flex:0 0 auto}
 .cal-event-type{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;font-size:9.5px;line-height:1.25;margin-top:4px;font-weight:700;word-break:break-word}
 .cal-count{position:absolute;right:5px;bottom:5px;font-size:10px;background:rgba(255,255,255,.8);border-radius:10px;padding:1px 5px}
 .cal-blue{background:#dbeafe!important}.cal-red{background:#fee2e2!important}.cal-green{background:#dcfce7!important}
 .cal-yellow{background:#fef3c7!important}.cal-purple{background:#ede9fe!important}.cal-grey{background:#e5e7eb!important}
 .cal-holiday{background:#e3f5da!important;border-color:#8bc34a!important}
 .cal-birthday{background:#ffe4ec!important;border-color:#f472b6!important}
 .cal-gold{background:#fdf0c8!important;border-color:#d4a017!important;font-weight:700!important}
 .cal-legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
 .cal-legend-item{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;padding:6px 10px;background:#fff;font-size:12px}
 .cal-legend-dot{width:13px;height:13px;border-radius:3px;border:1px solid rgba(0,0,0,.12)}
 @media(max-width:800px){.cal-months{grid-template-columns:1fr}}
 </style>
 <div class="card"style="margin-bottom:16px">
 <strong>Campus-Kalender</strong>
 <p>Termine werden im gemeinsamen Kalender gespeichert. Klicke auf einen Tag, um die Details zu sehen.</p>
 <div class="cal-legend">${legend}</div>
 </div>
 <div class="cal-months">${months.map(x=>monthHTML(x.y,x.m,x.name)).join("")}</div>${footer()}`;
 setTimeout(()=>{
 const b=$("calendarAddBtn");if(b)b.addEventListener("click",openCalendarForm);
 const bb=$("calendarBirthdayBtn");if(bb)bb.addEventListener("click",openBirthdayForm);
 },0);
 return html;
}

// Liest die Geburtstage (nur Tag/Monat, kein Jahr) aller freigeschalteten
// Campus-Mitglieder aus users/{uid}.birthday ("MM-DD") und wandelt sie in
// synthetische Kalendereinträge für das aktuelle Schuljahr 26/27 um.
// Ermittelt für die Startseiten-Kachel entweder: "heute hat jemand Geburtstag"
// (inkl. Namen, falls mehrere am selben Tag) oder den/die nächsten anstehenden
// Geburtstag(e), basierend auf users/{uid}.birthday ("MM-DD").
async function getUpcomingBirthdayInfo(){
 try{
 const snap=await getDocs(collection(db,"users"));
 const users=snap.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.status==="approved"&&u.birthday);
 if(!users.length)return null;
 const today=new Date();today.setHours(0,0,0,0);
 const todayMMDD=`${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

 const todayPeople=users.filter(u=>String(u.birthday)===todayMMDD);
 if(todayPeople.length){
 const people=todayPeople.map(u=>({name:u.displayName||u.email||"Campus-Mitglied",uid:u.uid}));
 return {isToday:true,people,names:people.map(p=>p.name)};
 }

 let bestDays=Infinity,bestGroup=[],bestDate=null;
 users.forEach(u=>{
 const [mmStr,ddStr]=String(u.birthday).split("-");
 const mm=parseInt(mmStr,10),dd=parseInt(ddStr,10);
 if(!mm||!dd)return;
 let next=new Date(today.getFullYear(),mm-1,dd);
 if(next<today)next=new Date(today.getFullYear()+1,mm-1,dd);
 const days=Math.round((next-today)/86400000);
 const person={name:u.displayName||u.email||"Campus-Mitglied",uid:u.uid};
 if(days<bestDays){bestDays=days;bestGroup=[person];bestDate=next}
 else if(days===bestDays)bestGroup.push(person);
 });
 if(!bestGroup.length)return null;
 return {isToday:false,people:bestGroup,names:bestGroup.map(p=>p.name),days:bestDays,date:bestDate};
 }catch(e){console.error("Nächster Geburtstag laden:",e);return null}
}

async function getBirthdayEvents(){
 try{
 const snap=await getDocs(collection(db,"users"));
 // Angezeigter Zeitraum: September 2026 bis August 2027.
 const yearFor=mm=>mm>=9?2026:2027; // Sept–Dez 2026, Jan–Aug 2027
 return snap.docs
 .map(d=>({uid:d.id,...d.data()}))
 .filter(u=>u.status==="approved" && u.birthday)
 .map(u=>{
 const [mmStr,ddStr]=String(u.birthday).split("-");
 const mm=parseInt(mmStr,10),dd=parseInt(ddStr,10);
 if(!mm||!dd)return null;
 const dateStr=`${yearFor(mm)}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
 return {
 uid:u.uid,start:dateStr,type:"geburtstag",
 title:` ${u.displayName||u.email||"Campus-Mitglied"} hat Geburtstag`,
 description:"Herzlichen Glückwunsch von der ganzen F12Sb!"
 };
 }).filter(Boolean);
 }catch(e){console.error("Geburtstage laden:",e);return []}
}

function openBirthdayForm(){
 const current=profile?.birthday||"";
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">CAMPUS-KALENDER</div><h2> Meinen Geburtstag eintragen</h2>
 <div class="form">
 <label>Geburtstag (Tag &amp; Monat)<input id="birthdayInput"type="date"value="${current?`2000-${current}`:""}"></label>
 <p style="color:var(--muted);font-size:12px;margin-top:4px">Nur Tag und Monat werden gespeichert und im Campus-Kalender für alle sichtbar angezeigt – dein Geburtsjahr bleibt privat.</p>
 <div class="form-actions"><button class="secondary"type="button"onclick="closeModal()">Abbrechen</button>
 ${current?`<button class="secondary"type="button"onclick="removeBirthday()">Löschen</button>`:""}
 <button id="birthdaySaveBtn"class="primary"type="button">Speichern</button></div>
 </div>`);
 $("birthdaySaveBtn").addEventListener("click",saveBirthday);
}

async function removeBirthday(){
 if(!confirm("Deinen eingetragenen Geburtstag wirklich wieder entfernen?"))return;
 try{
 await updateDoc(doc(db,"users",currentUser.uid),{birthday:"",updatedAt:serverTimestamp()});
 if(profile)profile.birthday="";
 closeModal();toast("Geburtstag entfernt.");await render();
 }catch(e){console.error("Geburtstag löschen:",e);toast("Konnte nicht entfernt werden.")}
}
window.removeBirthday=removeBirthday;

async function adminRemoveBirthday(uid){
 if(!isTeacher()){toast("Nur Lehrkräfte können fremde Geburtstage entfernen.");return}
 if(!confirm("Diesen Geburtstag wirklich entfernen?"))return;
 try{
 await updateDoc(doc(db,"users",uid),{birthday:"",updatedAt:serverTimestamp()});
 toast("Geburtstag entfernt.");
 await render();
 }catch(e){
 console.error("Geburtstag (fremd) löschen:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert das Entfernen. Bitte die Firestore-Regeln prüfen.":"Konnte nicht entfernt werden.");
 }
}
window.adminRemoveBirthday=adminRemoveBirthday;

async function saveBirthday(){
 const val=$("birthdayInput")?.value||"";
 if(!val){toast("Bitte ein Datum auswählen.");return}
 const mmdd=val.slice(5,10); // "MM-DD"const btn=$("birthdaySaveBtn");if(btn){btn.disabled=true;btn.textContent="Speichert …"}
 try{
 await updateDoc(doc(db,"users",currentUser.uid),{birthday:mmdd,updatedAt:serverTimestamp()});
 if(profile)profile.birthday=mmdd;
 closeModal();toast("Geburtstag gespeichert.");await render();
 }catch(e){
 console.error("Geburtstag speichern:",e);
 if(btn){btn.disabled=false;btn.textContent="Speichern"}
 toast("Geburtstag konnte nicht gespeichert werden.");
 }
}

function calendarTypeMeta(e){
 const raw=String(e?.type||e?.eventType||e?.category||"sonstiges").toLowerCase().trim();
 const key=raw==="präsentation"?"praesentation":raw;
 return ({
 schulaufgabe:{label:"Schulaufgabe",className:"cal-blue"},
 kurzarbeit:{label:"Kurzarbeit",className:"cal-red"},
 projektvorstellung:{label:"Projektvorstellung",className:"cal-green"},
 referat:{label:"Referat",className:"cal-yellow"},
 praesentation:{label:"Präsentation",className:"cal-purple"},
 sonstiges:{label:"Sonstiger Termin",className:"cal-grey"},
 geburtstag:{label:"Geburtstag",className:"cal-birthday"},
 ferien:{label:"Schulferien Bayern",className:"cal-holiday"},
 pruefung:{label:"Abschlussprüfung",className:"cal-gold"}
 })[key]||{label:"Sonstiger Termin",className:"cal-grey"};
}

function openCalendarDay(y,m,d){
 const events=window._campusCalendarEvents||[];
 const day=events.filter(e=>{
 const raw=e.start||e.date||e.startDate;
 const x=raw&&raw.seconds?new Date(raw.seconds*1000):new Date(String(raw||"").slice(0,10)+"T00:00:00");
 return !isNaN(x)&&x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d;
 });
 const title=new Date(y,m,d).toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">CAMPUS-KALENDER</div><h2>${esc(title)}</h2>
 <div class="list">${day.map(e=>{
 const meta=calendarTypeMeta(e);
 return`<div class="card ${meta.className}"style="margin-bottom:10px">
 <span class="pill">${esc(meta.label)}</span>
 <h3>${esc(e.title||e.name||"Termin")}</h3>
 ${e.time?`<p><strong>Uhrzeit:</strong> ${esc(e.time)}</p>`:""}
 ${e.location?`<p><strong>Ort:</strong> ${esc(e.location)}</p>`:""}
 <p style="white-space:pre-wrap">${esc(e.description||e.text||"")}</p>
 ${isTeacher() && e.id && e.type!=="ferien" && e.type!=="geburtstag" && e.type!=="pruefung"?`<div class="form-actions"style="margin-top:10px">
 <button class="secondary"onclick="editCalendarEntry('${e.collection||"events"}','${e.id}','${esc(String(e.title||e.name||"").replace(/\n/g,"\\n"))}','${esc(String(e.type||"sonstiges"))}','${esc(String(e.date||e.start||"").slice(0,10))}','${esc(String(e.time||""))}','${esc(String(e.location||"").replace(/\n/g,"\\n"))}','${esc(String(e.description||e.text||"").replace(/\n/g,"\\n"))}')">Bearbeiten</button>
 <button class="secondary"onclick="deleteCalendarEntry('${e.collection||"events"}','${e.id}')">Termin löschen</button>
 </div>`:""}
 ${e.type==="geburtstag" && e.uid && (e.uid===currentUser.uid||isTeacher())?`<div class="form-actions"style="margin-top:10px">
 <button class="secondary"onclick="${e.uid===currentUser.uid?"removeBirthday()":`adminRemoveBirthday('${e.uid}')`}">Termin löschen</button>
 </div>`:""}
 </div>`;
 }).join("")||`<div class="empty">An diesem Tag ist noch kein Termin eingetragen.</div>`}</div>
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Schließen</button>
 ${day.length?`<button class="secondary"onclick="exportCalendarDayICS(${y},${m},${d})"> Diesen Tag exportieren</button>`:""}
 ${isTeacher()?`<button class="primary"onclick="closeModal();setTimeout(openCalendarForm,50)">＋ Termin eintragen</button>`:""}
 </div>`);
}

async function renderTeam(){
 if(!isTeacher()){
 // Do not expose the teacher area to students and keep navigation safely available.
 return renderStart();
 }
 let updates=[];
 try{updates=await getCollection("classTeamUpdates","createdAt",true)}catch(e){console.error("Klassenteam:",e)}
 let reports=[];
 try{reports=await getCollection("reports")}catch(e){console.error("Meldungen laden:",e)}
 const openReports=reports.filter(r=>!r.resolved);
 const resolvedReports=reports.filter(r=>r.resolved);

 const typeMeta={
 info:"Information",vorkommnis:"Vorkommnis",vereinbarung:"Vereinbarung",
 beobachtung:"Beobachtung",wichtig:"Wichtig",sonstiges:"Sonstiges"
 };

 return`${pageHead("LEHRKRÄFTE","Lehrkräfte Klassenteam","Interne Informationen für das Klassenteam – dokumentieren, informieren und später nachvollziehen.",`<button class="primary"onclick="openClassTeamUpdateForm()">＋ Information posten</button>`)}
 <style>
 .team-info-grid{display:grid;grid-template-columns:minmax(280px,1fr) minmax(0,1.8fr);gap:16px}
 .team-history-item{border:1px solid var(--line);border-radius:12px;padding:15px;margin-bottom:10px;background:#fff}
 .team-history-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
 .team-history-meta{font-size:12px;color:var(--muted);margin-top:5px}
 .team-history-text{white-space:pre-wrap;margin:10px 0 0}
 @media(max-width:850px){.team-info-grid{grid-template-columns:1fr}}
 </style>
 <div class="team-info-grid">
 <section class="card"style="border-left:4px solid #4a90d9">
 <div class="kicker">KLASSENTEAM</div>
 <h2>Interne Informationen</h2>
 <p>Hier können Lehrkräfte wichtige Beobachtungen, Vorkommnisse, Vereinbarungen und Informationen für das Klassenteam dokumentieren.</p>
 <div class="notice"><strong>Nur für Lehrkräfte</strong><p style="margin-bottom:0">Schülerinnen und Schüler haben keinen Zugang zu diesem Bereich.</p></div>
 <div style="margin-top:14px"><button class="primary"onclick="openClassTeamUpdateForm()">＋ Neue Information</button></div>
 </section>
 <section class="card"style="border-left:4px solid #3fa66a">
 <div class="kicker">BIBLIOTHEK</div><h2>Historie</h2>
 <p>Alle bisherigen Informationen werden chronologisch gesammelt.</p>
 <div class="list">
 ${updates.map(u=>{
 const type=typeMeta[u.type]||"Sonstiges";
 const date=u.date||fmtDate(u.createdAt);
 return`<article class="team-history-item">
 <div class="team-history-head">
 <div><span class="pill">${esc(type)}</span><h3 style="margin:8px 0 0">${esc(u.title||"Information")}</h3></div>
 <small>${esc(date)}</small>
 </div>
 <div class="team-history-meta">Gepostet von ${esc(u.authorName||"Lehrkraft")}</div>
 <p class="team-history-text">${esc(u.text||"")}</p>
 ${u.followUp?`<div class="notice"style="margin-top:10px"><strong>Nächster Schritt / Vereinbarung</strong><p style="margin-bottom:0;white-space:pre-wrap">${esc(u.followUp)}</p></div>`:""}
 <div class="form-actions"style="margin-top:10px"><button class="secondary"onclick="deleteCampusEntry('classTeamUpdates','${u.id}','Information')">Löschen</button></div>
 </article>`;
 }).join("")||`<div class="empty">Noch keine Informationen dokumentiert.</div>`}
 </div>
 </section>
 </div>
 <section class="card"style="margin-top:16px;border-left:4px solid #e0a324">
 <div class="kicker">MODERATION</div>
 <h2>Gemeldete Inhalte ${openReports.length?`<span class="badge">${openReports.length}</span>`:""}</h2>
 <p>Meldungen aus Campus-Forum, Pinnwand und Team gesucht – nur für Lehrkräfte sichtbar, nicht für die gemeldete Person oder andere Schüler:innen.</p>
 <div class="list">
 ${openReports.map(r=>`<div class="list-item">
 <div><strong>${esc(reportTargetLabel(r.targetCollection))}</strong><small>„${esc(r.targetPreview||"")}" · gemeldet von ${esc(r.reportedByName||"Campus-Mitglied")} · ${fmtDate(r.createdAt)}</small>${r.reason?`<small style="display:block;margin-top:3px">Grund: ${esc(r.reason)}</small>`:""}</div>
 <div style="display:flex;gap:6px;flex-shrink:0"><button class="secondary"onclick="go('${reportTargetRoute(r.targetCollection)}')">Ansehen</button><button class="primary"onclick="resolveReport('${r.id}')">Erledigt</button></div>
 </div>`).join("")||`<div class="empty">Keine offenen Meldungen.</div>`}
 </div>
 ${resolvedReports.length?`<details style="margin-top:14px"><summary style="cursor:pointer;color:var(--muted)">Erledigte Meldungen (${resolvedReports.length})</summary><div class="list"style="margin-top:8px">${resolvedReports.map(r=>`<div class="list-item"><div><strong>${esc(reportTargetLabel(r.targetCollection))}</strong><small>„${esc(r.targetPreview||"")}" · ${fmtDate(r.createdAt)}</small></div><button class="secondary"onclick="deleteReport('${r.id}')">Meldung löschen</button></div>`).join("")}</div></details>`:""}
 </section>
 ${footer()}`;
}

function openClassTeamUpdateForm(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Informationen posten.");return}
 const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">LEHRKRÄFTE KLASSENTEAM</div><h2>Information posten</h2>
 <div class="form">
 <label>Datum<input id="ctDate"type="date"value="${today.toISOString().slice(0,10)}"></label>
 <label>Art<select id="ctType">
 <option value="info">Information</option><option value="vorkommnis">Vorkommnis</option>
 <option value="vereinbarung">Vereinbarung</option><option value="beobachtung">Beobachtung</option>
 <option value="wichtig">Wichtig</option><option value="sonstiges">Sonstiges</option>
 </select></label>
 <label>Titel<input id="ctTitle"placeholder="Kurze Überschrift"required></label>
 <label>Information<textarea id="ctText"rows="6"placeholder="Was sollte das Klassenteam wissen?"required></textarea></label>
 <div style="margin-top:-8px;margin-bottom:10px">${emojiPickerHTML("ctText","emojiPickerClassTeam")}</div>
 <label>Nächster Schritt / Vereinbarung (optional)<textarea id="ctFollowUp"rows="3"></textarea></label>
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button>
 <button class="primary"onclick="saveClassTeamUpdate()">Veröffentlichen</button></div>
 </div>`);
}

async function saveClassTeamUpdate(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Informationen posten.");return}
 const title=$("ctTitle")?.value.trim()||"", body=$("ctText")?.value.trim()||"";
 if(!title||!body){toast("Bitte Titel und Information ausfüllen.");return}
 try{
 await addDoc(collection(db,"classTeamUpdates"),{
 date:$("ctDate")?.value||new Date().toISOString().slice(0,10),
 type:$("ctType")?.value||"info",title,text:body,
 followUp:$("ctFollowUp")?.value.trim()||"",
 authorUid:currentUser.uid,authorName:profile?.displayName||currentUser?.email||"Lehrkraft",
 createdAt:serverTimestamp(),updatedAt:serverTimestamp()
 });
 closeModal();await render();toast("Information für das Klassenteam gespeichert.");
 }catch(e){console.error("Klassenteam speichern:",e);toast("Information konnte nicht gespeichert werden.");}
}


const LERNMETHODEN=[
 {icon:"",name:"Aktives Erinnern",tag:"Lernen",text:"Statt nur nochmal zu lesen: Buch/Skript zuklappen und aus dem Gedächtnis aufschreiben oder laut erklären, was du weißt. Fehlerstellen zeigen dir genau, wo du nochmal ran musst."},
 {icon:"",name:"Verteiltes Lernen",tag:"Planung",text:"Lieber mehrmals kurz als einmal lange lernen. Wiederhole einen Stoff nach 1 Tag, dann nach 3 Tagen, dann nach einer Woche – das merkt sich dein Gehirn deutlich nachhaltiger als Pauken am Stück."},
 {icon:"",name:"Feynman-Technik",tag:"Lernen",text:"Erkläre ein Thema in ganz einfachen Worten, als würdest du es einem Kind beibringen. Überall, wo du ins Stocken gerätst, hast du eine Lücke gefunden – genau da nochmal nachlesen."},
 {icon:"",name:"Pomodoro-Technik",tag:"Planung",text:"25 Minuten fokussiert arbeiten, dann 5 Minuten Pause – nach vier Runden eine längere Pause. Hilft gegen Aufschieben, weil 25 Minuten machbar wirken statt „den ganzen Nachmittag lernen“."},
 {icon:"",name:"Mindmapping",tag:"Lernen",text:"Thema in die Mitte, Unterthemen als Äste drumherum, mit Stichworten statt ganzen Sätzen. Macht Zusammenhänge sichtbar und eignet sich gut, um vor einer Prüfung den Überblick zu behalten."},
 {icon:"",name:"Cornell-Methode",tag:"Lernen",text:"Blatt in drei Bereiche teilen: rechts normale Mitschrift, links Stichworte/Fragen dazu, unten eine kurze Zusammenfassung in eigenen Worten. Macht spätere Wiederholung deutlich schneller."},
 {icon:"",name:"Gegenseitiges Erklären",tag:"Zusammenarbeit",text:"Mit einer Mitschülerin/einem Mitschüler abwechselnd Themen erklären. Wer erklärt, merkt am schnellsten, was er wirklich verstanden hat – und wer zuhört, lernt aus einer anderen Perspektive."},
 {icon:"",name:"Lernreflexion",tag:"Reflexion",text:"Nach dem Lernen kurz festhalten: Was hat heute gut geklappt? Was war schwer? Was mache ich nächstes Mal anders? Drei Minuten reichen – bringt aber mehr als stures Weiterlernen ohne Innehalten."}
];

async function renderLernmethoden(){
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Lernmethoden","Planung, Lernen, Zusammenarbeit und Reflexion – acht bewährte Methoden zum Ausprobieren.")}
 <div class="grid grid-4">${LERNMETHODEN.map(m=>`<div class="card"><span class="emoji">${m.icon}</span><strong>${esc(m.name)}</strong><small style="display:block;margin:2px 0 6px;color:var(--muted)">${esc(m.tag)}</small><p style="margin:0;font-size:13px;color:var(--muted)">${esc(m.text)}</p></div>`).join("")}</div>

 <section class="card"style="margin-top:20px">
 <div class="kicker"> BESONDERS HÄUFIG: AUFSCHIEBERITIS</div>
 <h2 style="margin-top:4px">Warum wir Dinge vor uns herschieben – und wie der Einstieg gelingt</h2>
 <p style="color:var(--muted)">Aufschieben hat nichts mit Faulheit zu tun. Es ist ein Weg, unangenehme Gefühle kurzfristig loszuwerden – der langfristig aber mehr Stress erzeugt, als er nimmt.</p>

 <div class="grid grid-3"style="margin-top:14px">
 <div class="card"style="background:#f5f7f8">
 <strong>Was beim Aufschieben passiert</strong>
 <p style="font-size:13px;color:var(--muted);margin:8px 0 0">Eine Aufgabe löst ein unangenehmes Gefühl aus – Angst zu versagen, Langeweile, das Gefühl „das schaff ich eh nicht". Dein Gehirn sucht sofort Erleichterung und lenkt dich auf etwas ab, das sich gerade besser anfühlt (Handy, aufräumen, andere Aufgaben). Das wirkt – aber nur für ein paar Minuten. Danach wächst meist ein schlechtes Gewissen, das die nächste Aufgabe noch unangenehmer macht. So entsteht ein Kreislauf.</p>
 </div>
 <div class="card"style="background:#f5f7f8">
 <strong>Welches Bedürfnis dahintersteckt</strong>
 <p style="font-size:13px;color:var(--muted);margin:8px 0 0">Im Kern geht es fast immer um den Wunsch, sich JETZT gut zu fühlen – auf Kosten von später. Der Psychotherapieforscher Klaus Grawe beschreibt vier menschliche Grundbedürfnisse, die dabei oft eine Rolle spielen:</p>
 <ul style="font-size:13px;color:var(--muted);margin:8px 0 0;padding-left:18px">
 <li><strong>Bindung:</strong> Angst, andere zu enttäuschen oder abgelehnt zu werden</li>
 <li><strong>Orientierung & Kontrolle:</strong> Unklarheit, wie die Aufgabe anzugehen ist, oder Gefühl von Kontrollverlust</li>
 <li><strong>Selbstwerterhöhung & -schutz:</strong> Angst, nicht gut genug zu sein (Perfektionismus)</li>
 <li><strong>Lustgewinn & Unlustvermeidung:</strong> die Aufgabe fühlt sich einfach unangenehm an, etwas anderes fühlt sich gerade besser an</li>
 </ul>
 </div>
 <div class="card"style="background:#f5f7f8">
 <strong>Wie der Einstieg gelingt</strong>
 <ul style="font-size:13px;color:var(--muted);margin:8px 0 0;padding-left:18px">
 <li><strong>5-Minuten-Regel:</strong> Nur 5 Minuten anfangen, mehr nicht versprechen. Meist fällt danach das Weitermachen leichter als gedacht.</li>
 <li><strong>Aufgabe verkleinern:</strong> Nicht „Referat schreiben", sondern „nur die Überschrift und einen ersten Satz tippen".</li>
 <li><strong>Gefühl benennen:</strong> Kurz zugeben „ich hab gerade keine Lust/Angst davor"nimmt dem Gefühl oft schon die Schärfe.</li>
 <li><strong>Ablenkung wegräumen:</strong> Handy in einen anderen Raum, statt auf Willenskraft zu setzen.</li>
 <li><strong>Milde statt Selbstkritik:</strong> Wer sich fürs Aufschieben selbst fertigmacht, schiebt erwiesenermaßen beim nächsten Mal noch mehr auf. Ein „ist okay, ich fang jetzt einfach an"wirkt besser als Vorwürfe.</li>
 </ul>
 </div>
 </div>
 </section>

 <section class="card"style="margin-top:20px">
 <div class="kicker"> KLEINES TOOL · NACH FRAUKE NIEHUES</div>
 <h2 style="margin-top:4px">Welches Gefühl brauchst du, um anzufangen?</h2>
 <p style="color:var(--muted)">Die Psychotherapeutin Frauke Niehues sagt: Aufschieben lässt sich selten mit reiner Disziplin überwinden – der Kern ist, dass eine Aufgabe mit einem unangenehmen Gefühl verknüpft ist. Effektiver ist es, gezielt herauszufinden, welches Gefühl dir helfen würde – und Wege zu finden, genau dieses Gefühl zu erzeugen.</p>

 <p style="font-weight:700;margin:16px 0 8px">1. Welches Gefühl ist gerade da, wenn du an die Aufgabe denkst?</p>
 <div id="prokGefuehlChips"style="display:flex;flex-wrap:wrap;gap:8px"></div>

 <p style="font-weight:700;margin:18px 0 8px">2. Welches Gefühl würde dir stattdessen helfen anzufangen?</p>
 <div id="prokZielChips"style="display:flex;flex-wrap:wrap;gap:8px"></div>

 <div id="prokResult"style="margin-top:16px"></div>
 </section>
 ${footer()}`;
}

const META_ITEMS=[
 {id:"m_planen1",phase:"planung",text:"Bevor ich mit einer Aufgabe beginne, überlege ich kurz, was genau ich erreichen will."},
 {id:"m_planen2",phase:"planung",text:"Ich schätze vorher ein, wie viel Zeit ich ungefähr brauchen werde."},
 {id:"m_planen3",phase:"planung",text:"Ich überlege mir vorab, welche Methode oder Strategie für diese Aufgabe passt."},
 {id:"m_ueberwachen1",phase:"ueberwachung",text:"Während ich lerne, merke ich selbst, wenn ich etwas nicht verstanden habe."},
 {id:"m_ueberwachen2",phase:"ueberwachung",text:"Ich frage mich zwischendurch: „Könnte ich das gerade jemandem erklären?“"},
 {id:"m_ueberwachen3",phase:"ueberwachung",text:"Ich vergleiche mein Gefühl von „ich hab's verstanden“ regelmäßig mit einer echten Übungsaufgabe."},
 {id:"m_bewerten1",phase:"bewertung",text:"Nach dem Lernen überlege ich kurz, was gut geklappt hat und was nicht."},
 {id:"m_bewerten2",phase:"bewertung",text:"Wenn eine Methode nicht funktioniert hat, überlege ich mir bewusst eine andere für nächstes Mal."},
 {id:"m_bewerten3",phase:"bewertung",text:"Ich ziehe aus Fehlern konkrete Konsequenzen für die Zukunft, statt sie einfach abzuhaken."}
];
const META_PHASES={
 planung:{label:"Planung",icon:"",short:"Vor dem Lernen: Ziel klären, Strategie wählen, Zeit einschätzen."},
 ueberwachung:{label:"Überwachung",icon:"",short:"Während des Lernens: Verständnis prüfen, dranbleiben."},
 bewertung:{label:"Bewertung & Regulation",icon:"",short:"Nach dem Lernen: Ergebnis einschätzen, Strategie anpassen."}
};
const META_SCENARIOS=[
 {text:"Du überlegst dir vor dem Lernen, wie viel Zeit du ungefähr brauchst.",phase:"planung"},
 {text:"Du merkst beim Lesen, dass du gerade gedanklich nicht mehr folgen kannst.",phase:"ueberwachung"},
 {text:"Nach der Prüfung überlegst du, was du beim nächsten Mal anders machen würdest.",phase:"bewertung"},
 {text:"Du fragst dich mitten im Lernen: „Könnte ich das gerade jemandem erklären?“",phase:"ueberwachung"},
 {text:"Du entscheidest vorab, mit welcher Methode du ein Thema angehst.",phase:"planung"},
 {text:"Du merkst, dass eine Methode nicht funktioniert hat, und wechselst bewusst zu einer anderen.",phase:"bewertung"}
];
let metaAnswers={},metaOpenPhase=null,metaScenarioAnswers={};
function togglePhase(ph){
 metaOpenPhase=metaOpenPhase===ph?null:ph;
 renderMetaPhases();
}
function renderMetaPhases(){
 const el=$("metaPhases");if(!el)return;
 el.innerHTML=Object.entries(META_PHASES).map(([ph,p])=>{
 const open=metaOpenPhase===ph;
 const items=META_ITEMS.filter(it=>it.phase===ph);
 return`<div class="card"style="margin-bottom:10px">
 <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center"onclick="togglePhase('${ph}')">
 <div><span class="emoji">${p.icon}</span> <strong>${esc(p.label)}</strong><br><small style="color:var(--muted)">${esc(p.short)}</small></div>
 <span style="font-size:20px">${open?"–":"+"}</span>
 </div>
 ${open?`<div style="margin-top:14px;border-top:1px solid var(--line,#eee);padding-top:12px">${items.map(it=>`<div style="padding:8px 0">
 <p style="margin:0 0 6px;font-size:13px">${esc(it.text)}</p>
 <div style="display:flex;flex-wrap:wrap;gap:6px">${LIST_SCALE.map(([val,label])=>`<button type="button"class="pill"style="cursor:pointer;padding:5px 10px;${metaAnswers[it.id]===val?"background:var(--blue,#1688cf);color:#fff":""}"onclick="event.stopPropagation();setMetaAnswer('${it.id}','${val}')">${esc(label)}</button>`).join("")}</div>
 </div>`).join("")}${metaAllPhaseAnswered(ph)?metaPhaseBar(ph):""}</div>`:""}
 </div>`;
 }).join("");
}
function metaAllPhaseAnswered(ph){
 return META_ITEMS.filter(it=>it.phase===ph).every(it=>metaAnswers[it.id]!==undefined);
}
function metaPhaseBar(ph){
 const items=META_ITEMS.filter(it=>it.phase===ph);
 const sum=items.reduce((s,it)=>s+Number(metaAnswers[it.id]),0);
 const pct=Math.round((sum/(items.length*3))*100);
 const color=pct>=75?"#10a94a":pct>=40?"#e8890c":"#d92c34";
 return`<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span>Dein Stand hier</span><span>${pct}%</span></div><div style="height:10px;background:#e4e9ed;border-radius:5px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${color};border-radius:5px"></div></div></div>`;
}
function setMetaAnswer(id,val){metaAnswers[id]=val;renderMetaPhases()}
function answerScenario(idx,chosen){
 metaScenarioAnswers[idx]=chosen;
 renderMetaScenarios();
}
function renderMetaScenarios(){
 const el=$("metaScenarios");if(!el)return;
 el.innerHTML=META_SCENARIOS.map((s,idx)=>{
 const answered=metaScenarioAnswers[idx];
 const correct=answered===s.phase;
 return`<div class="card"style="margin-bottom:10px">
 <p style="margin:0 0 8px;font-size:14px">${esc(s.text)}</p>
 <div style="display:flex;flex-wrap:wrap;gap:6px">${Object.entries(META_PHASES).map(([ph,p])=>{
 let style="";
 if(answered){
 if(ph===s.phase)style="background:#dcf1c8;color:#24783c";
 else if(ph===answered)style="background:#fad2d5;color:#b32b32";
 }
 return`<button type="button"class="pill"style="cursor:pointer;padding:6px 12px;${style}"onclick="answerScenario(${idx},'${ph}')" ${answered?"disabled":""}>${p.icon} ${esc(p.label)}</button>`;
 }).join("")}</div>
 ${answered?`<p style="margin:8px 0 0;font-size:12px;font-weight:700;color:${correct?"#24783c":"#b32b32"}">${correct?"✅ Richtig!":`❌ Das war eher ${META_PHASES[s.phase].icon} ${esc(META_PHASES[s.phase].label)}.`}</p>`:""}
 </div>`;
 }).join("");
}
window.togglePhase=togglePhase;window.setMetaAnswer=setMetaAnswer;window.answerScenario=answerScenario;

async function renderMetakognition(){
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Metakognitive Lernstrategien","Über das eigene Lernen nachdenken – klick dich durch.")}
 <section class="card">
 <p style="margin:0;font-size:14px">Metakognition heißt: dein eigenes Lernen bewusst steuern statt einfach drauflos zu lernen. Klick dich durch die drei Phasen und schätz dich gleich dort selbst ein.</p>
 </section>

 <div id="metaPhases"style="margin-top:16px"></div>

 <section class="card"style="margin-top:16px">
 <div class="kicker"> SZENARIO-QUIZ</div>
 <h2 style="margin-top:4px">Welche Phase ist das?</h2>
 <div id="metaScenarios"style="margin-top:10px"></div>
 </section>
 ${footer()}`;
}

async function renderLernstrategienTest(){
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Lernstrategien-Check","Kein Lerntyp-Test – ein kurzer Strategien-Check.")}
 <section class="card">
 <div class="kicker"> SELBSTTEST · WIE LERNST DU AKTUELL?</div>
 <h2 style="margin-top:4px">Kein Lerntyp-Test – ein Strategien-Check</h2>
 <p style="color:var(--muted)">Ob man eher „visuell"oder „auditiv"lernt, ist wissenschaftlich nicht belegt. Was dagegen nachweislich mit besserem Lernerfolg zusammenhängt: <strong>welche Lernstrategien man tatsächlich einsetzt</strong>. Dieser kurze Check orientiert sich an der Struktur des LIST-Fragebogens (Wild & Schiefele), einem etablierten Instrument zur Erfassung von Lernstrategien bei Studierenden. Kreuze bei jeder Aussage an, wie oft das auf dich zutrifft.</p>
 <div id="listItems"style="margin-top:14px"></div>
 <div class="form-actions"style="margin-top:14px">
 <button class="primary"onclick="evaluateListTest()">Auswertung anzeigen</button>
 </div>
 <div id="listResult"style="margin-top:16px"></div>
 </section>
 ${footer()}`;
}

const LIST_SCALE=[["0","so gut wie nie"],["1","manchmal"],["2","oft"],["3","fast immer"]];
const LIST_ITEMS=[
 {id:"wiederholen1",cat:"kognitiv",text:"Ich wiederhole Lernstoff mehrmals über mehrere Tage verteilt, statt nur einmal kurz vorher."},
 {id:"wiederholen2",cat:"kognitiv",text:"Ich gehe frühere Lerninhalte gezielt nochmal durch, auch wenn gerade keine Prüfung ansteht."},
 {id:"verknuepfen1",cat:"kognitiv",text:"Ich verknüpfe neuen Lernstoff bewusst mit Dingen, die ich schon weiß."},
 {id:"verknuepfen2",cat:"kognitiv",text:"Ich überlege mir eigene Beispiele, um einen abstrakten Inhalt besser zu verstehen."},
 {id:"organisieren1",cat:"kognitiv",text:"Ich bringe Lerninhalte in eine übersichtliche Struktur (z. B. Mindmap, Gliederung, Tabelle)."},
 {id:"organisieren2",cat:"kognitiv",text:"Ich fasse längere Texte in eigenen Worten kurz zusammen."},
 {id:"kritisch1",cat:"kognitiv",text:"Ich hinterfrage, ob ich einen Inhalt wirklich verstanden habe, statt ihn nur auswendig zu wiederholen."},
 {id:"kritisch2",cat:"kognitiv",text:"Ich vergleiche neue Informationen mit dem, was ich schon zu wissen glaube, und prüfe, ob es zusammenpasst."},
 {id:"planen1",cat:"metakognitiv",text:"Bevor ich anfange zu lernen, überlege ich kurz, was ich in dieser Einheit schaffen will."},
 {id:"planen2",cat:"metakognitiv",text:"Ich plane vorab, in welcher Reihenfolge ich die Themen bearbeite."},
 {id:"ueberwachen1",cat:"metakognitiv",text:"Während des Lernens merke ich selbst, wenn ich etwas nicht verstanden habe."},
 {id:"ueberwachen2",cat:"metakognitiv",text:"Ich überprüfe zwischendurch, ob ich noch bei der Sache bin oder gedanklich abgeschweift bin."},
 {id:"regulieren1",cat:"metakognitiv",text:"Wenn eine Methode nicht funktioniert, wechsle ich bewusst zu einer anderen."},
 {id:"regulieren2",cat:"metakognitiv",text:"Wenn ich merke, dass ich zu wenig Zeit eingeplant habe, passe ich meinen Plan an."},
 {id:"zeitmanagement1",cat:"ressourcen",text:"Ich plane meine Lernzeit im Voraus, statt spontan zu entscheiden, wann ich lerne."},
 {id:"zeitmanagement2",cat:"ressourcen",text:"Ich halte mich weitgehend an selbst gesetzte Lernzeiten."},
 {id:"konzentration1",cat:"ressourcen",text:"Es fällt mir leicht, mich beim Lernen über längere Zeit auf eine Sache zu konzentrieren."},
 {id:"konzentration2",cat:"ressourcen",text:"Wenn meine Gedanken abschweifen, hole ich mich selbst zurück zum Lernstoff."},
 {id:"anstrengung1",cat:"ressourcen",text:"Auch bei schwierigen oder langweiligen Themen bleibe ich dran, statt aufzugeben."},
 {id:"anstrengung2",cat:"ressourcen",text:"Ich gebe mir Mühe, auch wenn mich ein Thema nicht interessiert."},
 {id:"umgebung1",cat:"ressourcen",text:"Ich sorge bewusst für eine ablenkungsfreie Umgebung, wenn ich lerne (z. B. Handy weg)."},
 {id:"umgebung2",cat:"ressourcen",text:"Ich suche mir einen Lernort, an dem ich ungestört arbeiten kann."},
 {id:"mitlernen1",cat:"ressourcen",text:"Ich tausche mich mit anderen aus, um Lerninhalte besser zu verstehen (erklären, Fragen stellen)."},
 {id:"mitlernen2",cat:"ressourcen",text:"Ich hole mir Hilfe von Mitschüler:innen, wenn ich bei etwas nicht weiterkomme."},
 {id:"ressourcen1",cat:"ressourcen",text:"Ich nutze gezielt zusätzliche Materialien (Bücher, Videos, Übungsaufgaben), wenn mir etwas unklar ist."}
];
const LIST_CATEGORIES={
 kognitiv:{label:"Kognitive Strategien",icon:"",desc:"Wie du mit dem Lernstoff selbst umgehst.",
 tips:["Nutze Aktives Erinnern: Buch zuklappen und aus dem Gedächtnis aufschreiben, statt nur nochmal zu lesen.","Verteile Wiederholungen über mehrere Tage, statt am Stück zu pauken (Verteiltes Lernen).","Erkläre dir schwierige Inhalte laut selbst, als würdest du sie jemandem beibringen (Feynman-Technik).","Bring Struktur rein mit einer Mindmap oder der Cornell-Methode, statt Text einfach nur zu markieren."]},
 metakognitiv:{label:"Metakognitive Strategien",icon:"",desc:"Wie gut du dein eigenes Lernen planst und steuerst.",
 tips:["Setz dir vor jeder Lerneinheit ein kurzes, konkretes Ziel – auch nur zwei Sätze reichen.","Nutze die Lernreflexion am Ende einer Einheit: Was hat geklappt, was nicht?","Frag dich zwischendurch aktiv: „Könnte ich das gerade jemandem erklären?“ – wenn nicht, nochmal ran.","Wenn ein Plan nicht aufgeht, passe ihn bewusst an, statt stur weiterzumachen."]},
 ressourcen:{label:"Ressourcenbezogene Strategien",icon:"",desc:"Wie du Zeit, Umgebung und Unterstützung nutzt.",
 tips:["Probier die Pomodoro-Technik für festere Zeitstrukturen mit eingebauten Pausen.","Tausch dich mit anderen aus – Gegenseitiges Erklären hilft oft mehr als alleine grübeln.","Schau bei den Lernressourcen vorbei, wenn dir zu einem Thema Material fehlt.","Fällt dir das Dranbleiben schwer? Wirf einen Blick ins Aufschieberitis-Modul weiter oben."]}
};
let listAnswers={};
function renderListItems(){
 const el=$("listItems");if(!el)return;
 el.innerHTML=LIST_ITEMS.map(it=>`<div style="padding:10px 0;border-bottom:1px solid var(--line,#eee)">
 <p style="margin:0 0 8px;font-size:14px">${esc(it.text)}</p>
 <div style="display:flex;flex-wrap:wrap;gap:6px">${LIST_SCALE.map(([val,label])=>`<button type="button"class="pill"style="cursor:pointer;padding:6px 12px;${listAnswers[it.id]===val?"background:var(--blue,#1688cf);color:#fff":""}"onclick="setListAnswer('${it.id}','${val}')">${esc(label)}</button>`).join("")}</div>
 </div>`).join("");
}
function setListAnswer(id,val){listAnswers[id]=val;renderListItems()}
function evaluateListTest(){
 const missing=LIST_ITEMS.filter(it=>listAnswers[it.id]===undefined);
 const el=$("listResult");if(!el)return;
 if(missing.length){toast(`Bitte noch ${missing.length} Aussage${missing.length===1?"":"n"} beantworten.`);return}
 const byCat={};
 Object.keys(LIST_CATEGORIES).forEach(cat=>{
 const items=LIST_ITEMS.filter(it=>it.cat===cat);
 const sum=items.reduce((s,it)=>s+Number(listAnswers[it.id]),0);
 const pct=Math.round((sum/(items.length*3))*100);
 byCat[cat]=pct;
 });
 const barColor=pct=>pct>=75?"#10a94a":pct>=40?"#e8890c":"#d92c34";
 el.innerHTML=`<div class="card"style="background:#f5f7f8;margin-bottom:14px">${Object.entries(LIST_CATEGORIES).map(([cat,c])=>{
 const pct=byCat[cat];
 return`<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:5px"><strong>${c.icon} ${esc(c.label)}</strong><span>${pct}%</span></div><div style="height:14px;background:#e4e9ed;border-radius:7px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${barColor(pct)};border-radius:7px"></div></div></div>`;
 }).join("")}</div>
 <div class="grid grid-3">${Object.entries(LIST_CATEGORIES).map(([cat,c])=>{
 const pct=byCat[cat];
 const level=pct>=75?"green":pct>=40?"yellow":"red";
 const levelText=pct>=75?"Gut ausgeprägt":pct>=40?"Ausbaufähig":"Hier lohnt sich ein Blick";
 return`<div class="card"style="background:#f5f7f8"><span class="emoji">${c.icon}</span><strong>${esc(c.label)}</strong><p style="margin:4px 0 8px;font-size:12px;color:var(--muted)">${esc(c.desc)}</p><span class="pill ${level}">${pct}% · ${levelText}</span><p style="margin:10px 0 4px;font-size:12px;font-weight:700">Woran du arbeiten könntest:</p><ul style="margin:0;padding-left:18px;font-size:12px;color:var(--muted)">${c.tips.map(t=>`<li style="margin-bottom:4px">${esc(t)}</li>`).join("")}</ul></div>`;
 }).join("")}</div>`;
}
window.setListAnswer=setListAnswer;window.evaluateListTest=evaluateListTest;

const PROK_GEFUEHLE=["Angst zu versagen","Langeweile","Überforderung","Unklar, wie ich anfange","Gefühl, verglichen zu werden","Frust/Ärger über mich selbst","Erschöpfung, keine Energie","Schamgefühl"];
const PROK_GRAWE={
 "Angst zu versagen":["Selbstwerterhöhung & -schutz","Die Aufgabe fühlt sich wie ein Test an, bei dem du „nicht gut genug“ sein könntest."],"Langeweile":["Lustgewinn & Unlustvermeidung","Die Aufgabe fühlt sich unangenehm an – etwas anderes verspricht gerade mehr Vergnügen."],"Überforderung":["Orientierung & Kontrolle","Die Aufgabe wirkt zu groß oder unübersichtlich – das Gefühl, sie nicht im Griff zu haben."],"Unklar, wie ich anfange":["Orientierung & Kontrolle","Ohne einen klaren ersten Schritt fehlt die Orientierung, wo überhaupt loslegen."],"Gefühl, verglichen zu werden":["Bindung & Selbstwerterhöhung","Sorge, vor anderen schlecht dazustehen oder abgelehnt zu werden."],"Frust/Ärger über mich selbst":["Selbstwerterhöhung & -schutz","Unzufriedenheit mit dir selbst erhöht meist den Druck, statt beim Anfangen zu helfen."],"Erschöpfung, keine Energie":["Lustgewinn & Unlustvermeidung","Kopf oder Körper sind gerade leer – dadurch wirkt die Aufgabe anstrengender, als sie eigentlich ist."],"Schamgefühl":["Bindung & Selbstwerterhöhung","Sorge, dass andere schlecht über dich denken könnten, wenn sie sähen, woran du gerade scheiterst."]
};
const PROK_ZIELE={
 "Ruhe":["Die Aufgabe in einen klar begrenzten Zeitabschnitt packen – z. B. nur 15 Minuten, danach bewusst Pause.","Vor dem Start kurz durchatmen oder eine entspannte Körperhaltung einnehmen.","Dir bewusst eine ruhige Grundstimmung holen, bevor du anfängst – z. B. kurz rausgehen oder Musik, die dich runterbringt.","Dir sagen: „Ich muss nicht alles auf einmal schaffen, nur den nächsten Schritt.“"],"Leichtigkeit":["Die Aufgabe in einen winzigen ersten Schritt zerlegen, der nichts mit „fertig werden“ zu tun hat – z. B. nur die Überschrift tippen.","Dir bewusst machen: Gerade zählt nur der erste Schritt, nicht das ganze Ergebnis.","Dir direkt nach dem ersten Schritt eine kleine Belohnung gönnen (kurze Pause, etwas Schönes).","Dir einen angenehmen Lernort oder bequeme Kleidung gönnen, statt es dir schwerer zu machen als nötig."],"Neugier":["Dich fragen: „Was könnte ich hier Neues lernen oder entdecken?“ statt ans Endergebnis zu denken.","Mit dem Teil anfangen, der dich am meisten interessiert – nicht zwingend mit Punkt eins.","Dir eine Frage stellen, auf die du selbst noch keine Antwort weißt, und die Aufgabe als Weg dorthin sehen.","Dir kurz vorstellen, wofür du das Wissen später gebrauchen könntest."],"Zuversicht":["Dich an eine Aufgabe erinnern, die dir früher auch schwer vorkam und am Ende doch geklappt hat.","Dir ein realistisches statt perfektes Ziel setzen – „gut genug“ statt „perfekt“.","Dir bewusst machen, welche Fähigkeiten du für diese Aufgabe eigentlich schon mitbringst.","Dir kurzes, konkretes Feedback von jemandem holen, um zu sehen, dass du auf einem guten Weg bist."],"Stolz aufs Anfangen":["Bewusst wahrnehmen, dass du angefangen hast – nicht erst feiern, wenn alles fertig ist.","Jemandem kurz Bescheid geben, dass du jetzt anfängst – das erhöht die Verbindlichkeit ein bisschen.","Nach jedem kleinen Fortschritt kurz innehalten und dir selbst anerkennend „gut gemacht“ sagen.","Fortschritte sichtbar machen (z. B. abhaken, Liste führen), statt sie einfach verstreichen zu lassen."],"Verbundenheit":["Mit jemandem zusammen lernen oder zumindest parallel arbeiten – auch per Videocall.","Dir aufschreiben oder vorstellen, für wen oder wofür du das eigentlich machst.","Jemandem kurz von deinem Vorhaben erzählen, bevor du anfängst.","Nach dem Lernen kurz mit jemandem teilen, was du geschafft hast."],"Freude":["Dir während des Lernens etwas gönnen, das dir Spaß macht (Musik, Lieblingsgetränk).","Dir bewusst machen, was dich an dem Thema eigentlich interessiert oder wofür es gut ist.","Die Aufgabe spielerischer angeben – z. B. dir selbst ein kleines Zeitrennen stellen.","Dich nach dem Lernen mit etwas belohnen, auf das du dich schon vorher freust."]
};
let prokSelectedGefuehl=null, prokSelectedZiel=null;
function renderProkChips(){
 const gEl=$("prokGefuehlChips"),zEl=$("prokZielChips");
 if(!gEl||!zEl)return;
 gEl.innerHTML=PROK_GEFUEHLE.map(g=>`<button type="button"class="pill"style="cursor:pointer;padding:8px 14px;font-size:13px;${prokSelectedGefuehl===g?"background:var(--blue,#1688cf);color:#fff":""}"onclick="selectProkGefuehl('${g.replace(/'/g,"\\'")}')">${g}</button>`).join("");
 zEl.innerHTML=Object.keys(PROK_ZIELE).map(z=>`<button type="button"class="pill"style="cursor:pointer;padding:8px 14px;font-size:13px;${prokSelectedZiel===z?"background:var(--green,#82b83b);color:#fff":""}"onclick="selectProkZiel('${z.replace(/'/g,"\\'")}')">${z}</button>`).join("");
 updateProkResult();
}
function selectProkGefuehl(g){prokSelectedGefuehl=g;renderProkChips()}
function selectProkZiel(z){prokSelectedZiel=z;renderProkChips()}
function updateProkResult(){
 const el=$("prokResult");if(!el)return;
 let html="";
 if(prokSelectedGefuehl&&PROK_GRAWE[prokSelectedGefuehl]){
 const [need,explain]=PROK_GRAWE[prokSelectedGefuehl];
 html+=`<div class="notice"><strong> Dahinter steckt vermutlich: ${esc(need)}</strong><p style="margin:6px 0 0">${esc(explain)}</p></div>`;
 }
 if(prokSelectedZiel){
 const tips=PROK_ZIELE[prokSelectedZiel]||[];
 html+=`<div class="notice"style="margin-top:${prokSelectedGefuehl?"10px":"0"}"><strong>${prokSelectedGefuehl?`Von „${esc(prokSelectedGefuehl)}“ zu „${esc(prokSelectedZiel)}“`:`Um „${esc(prokSelectedZiel)}“ zu erzeugen`}</strong><ul style="margin:8px 0 0;padding-left:18px">${tips.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`;
 }
 el.innerHTML=html;
}
window.selectProkGefuehl=selectProkGefuehl;window.selectProkZiel=selectProkZiel;

async function renderLerncoaching(){
 const email="BERATUNGSLEHRKRAFT@SCHULE.DE";
 const subject=encodeURIComponent("Anfrage Lerncoaching");
 const body=encodeURIComponent(
 "Hallo,\n\n" +
 "ich würde gerne ein Lerncoaching vereinbaren.\n\n" +
 "Mein Anliegen:\n\n\n" +
 "Viele Grüße"
 );
 const mail=`mailto:${email}?subject=${subject}&body=${body}`;

 return`${pageHead(
 "BEGLEITUNG","Lerncoaching","Gemeinsam den eigenen Lernweg klären, Ziele entwickeln und nächste Schritte finden.",`<a class="primary"href="${mail}"> Lerncoaching anfragen</a>`
 )}
 <div class="grid grid-2">
 <div class="card">
 <span class="badge"> INDIVIDUELLE BEGLEITUNG</span>
 <h2>Du musst deinen Lernweg nicht allein planen.</h2>
 <p>Im Lerncoaching kannst du gemeinsam mit einer Lehrkraft auf deine aktuelle Lernsituation schauen, Ziele klären und einen
passenden nächsten Schritt entwickeln.</p>
 <h3>Ein Lerncoaching kann helfen, wenn du …</h3>
 <div class="list">
 <div class="list-item"><strong> ein Lernziel klären möchtest</strong><span class="pill">Ziel</span></div>
 <div class="list-item"><strong> deinen Lernweg planen möchtest</strong><span class="pill">Planung</span></div>
 <div class="list-item"><strong> bei einer Lernaufgabe feststeckst</strong><span class="pill">Klären</span></div>
 <div class="list-item"><strong> mehr Struktur oder Motivation suchst</strong><span class="pill">Stärkung</span></div>
 <div class="list-item"><strong> deinen nächsten Lernschritt finden möchtest</strong><span class="pill">Nächster
Schritt</span></div>
 </div>
 </div>
 <div class="card">
 <span class="badge"> KONTAKT</span>
 <h2>Eine Lehrkraft anschreiben</h2>
 <p>Du möchtest ein Lerncoaching? Dann kannst du direkt eine E-Mail an die zuständige Lehrkraft schreiben.</p>
 <a class="primary"href="${mail}"> E-Mail an Lerncoaching</a>
 <div class="notice"style="margin-top:16px">
 <strong>Du musst dein Anliegen nicht perfekt formulieren.</strong>
 <p style="margin-bottom:0">Schreibe einfach kurz, wobei du Unterstützung möchtest.</p>
 </div>
 </div>
 </div>
 <div class="card"style="margin-top:12px">
 <h3> So kann ein Lerncoaching ablaufen</h3>
 <div class="lp-flow">
 <span>1. Anliegen klären</span><b>→</b>
 <span>2. Situation anschauen</span><b>→</b>
 <span>3. Ziel formulieren</span><b>→</b>
 <span>4. nächsten Schritt planen</span>
 </div>
 </div>
 <div class="card"style="margin-top:12px">
 <h3> Wichtig</h3>
 <p>Du musst für ein Lerncoaching noch keine fertige Lösung haben. Gemeinsam wird sortiert, was gerade wichtig ist und welcher
nächste Schritt sinnvoll sein kann.</p>
 <p>Die Kontaktaufnahme erfolgt ausschließlich per E-Mail.</p>
 </div>
 ${footer()}`;
}


/* =========================================================
 F12Sb – LERNIMPULSE
 Zwei Zugänge:
 1. Gezielte Auswahl
 2. Lern-Glücksrad
 ========================================================= */

const lernImpulseKategorien=[
 {id:"quick",icon:" ",title:"Quick Impulse",text:"Ein kleiner Lernschritt für zwischendurch."},
 {id:"verstehen",icon:" ",title:"Verstehen",text:"Zusammenhänge erkennen statt nur auswendig lernen."},
 {id:"nachdenken",icon:" ",title:"Nachdenken",text:"Den eigenen Lernweg bewusst wahrnehmen."},
 {id:"anwenden",icon:" ",title:"Anwenden",text:"Wissen in einer konkreten Situation nutzen."},
 {id:"wiederholen",icon:" ",title:"Wiederholen",text:"Wichtiges aktiv aus dem Gedächtnis holen."},
 {id:"challenge",icon:" ",title:"Challenge",text:"Eine kleine Herausforderung annehmen."},
 {id:"haengt",icon:" ",title:"Wenn du hängst",text:"Einen Weg aus einer Lernblockade finden."},
 {id:"ueberraschung",icon:" ",title:"Überraschungsimpuls",text:"Ein zufälliger Impuls für deinen Lernweg."}
];

const lernImpulse=[
 {id:"q1",cat:"quick",title:"60-Sekunden-Start",task:"Öffne deine aktuelle Lernaufgabe. Schreibe in einem Satz auf: Was soll am Ende herauskommen?",hint:"Noch nicht lösen – nur das Ziel klären.",next:"Formuliere danach den ersten konkreten Arbeitsschritt."},
 {id:"q2",cat:"quick",title:"Ein Begriff",task:"Wähle einen wichtigen Begriff aus deinem aktuellen Thema und erkläre ihn mit maximal 12 Wörtern.",hint:"So, dass ihn eine Mitschülerin oder ein Mitschüler verstehen würde.",next:"Prüfe danach deine Erklärung am Material."},
 {id:"q3",cat:"quick",title:"Ein Satz",task:"Schreibe: „Das Wichtigste, das ich heute verstanden habe, ist …“",hint:"Ein klarer Satz reicht.",next:"Markiere anschließend die passende Stelle im Material."},
 {id:"q4",cat:"quick",title:"Nächster Schritt",task:"Benenne genau eine Sache, die du jetzt als Nächstes erledigst.",hint:"Nicht fünf Dinge – genau eines.",next:"Setze diesen Schritt sofort für fünf Minuten um."},
 {id:"q5",cat:"quick",title:"Lernumgebung",task:"Verändere genau eine Sache an deinem Arbeitsplatz, die dich gerade ablenkt.",hint:"Zum Beispiel Tabs schließen, Handy weglegen oder Material bereitlegen.",next:"Starte danach direkt mit deiner Aufgabe."},

 {id:"v1",cat:"verstehen",title:"Warum?",task:"Wähle eine Aussage aus deinem aktuellen Thema und frage dreimal hintereinander: „Warum ist das so?“",hint:"Versuche bei jeder Antwort eine Ebene tiefer zu kommen.",next:"Formuliere den Zusammenhang in einem eigenen Satz."},
 {id:"v2",cat:"verstehen",title:"Erklären statt abschreiben",task:"Erkläre einen schwierigen Inhalt laut, als würdest du ihn jemandem erklären, der noch nichts darüber weiß.",hint:"Verwende nur Fachbegriffe, die du erklären kannst.",next:"Notiere den Punkt, an dem du ins Stocken kommst."},
 {id:"v3",cat:"verstehen",title:"Zusammenhang finden",task:"Nimm zwei Begriffe aus deinem Thema. Was haben sie miteinander zu tun?",hint:"Auch Unterschiede oder Ursache-Wirkungs-Beziehungen zählen.",next:"Zeichne oder formuliere die Verbindung."},
 {id:"v4",cat:"verstehen",title:"Beispiel bauen",task:"Finde selbst ein konkretes Beispiel, an dem dein aktueller Lerninhalt sichtbar wird.",hint:"Ein gutes Beispiel macht den Inhalt anschaulich.",next:"Prüfe, ob das Beispiel auch jemand anderes verstehen würde."},
 {id:"v5",cat:"verstehen",title:"Kernidee",task:"Reduziere deine Notizen auf maximal drei zentrale Aussagen.",hint:"Alles Unwichtige darf weg.",next:"Ordne die drei Aussagen sinnvoll."},

 {id:"n1",cat:"nachdenken",title:"Was kann ich schon?",task:"Bewerte deinen aktuellen Lernstand spontan von 1 bis 10. Was macht deine Zahl aus?",hint:"Es gibt keine richtige Zahl.",next:"Benenne einen Punkt, der deine Zahl um einen Schritt erhöhen könnte."},
 {id:"n2",cat:"nachdenken",title:"Mein Lernweg",task:"Was hat dir beim letzten Lernen tatsächlich geholfen?",hint:"Denke an eine konkrete Situation.",next:"Überlege, wie du diesen Ansatz heute nutzen kannst."},
 {id:"n3",cat:"nachdenken",title:"Fehler mit Nutzen",task:"Denke an einen Fehler. Was kannst du daraus über deinen Denkweg lernen?",hint:"Nicht nur: „Ich habe es falsch gemacht.“",next:"Formuliere eine Regel für deinen nächsten Versuch."},
 {id:"n4",cat:"nachdenken",title:"Energie-Check",task:"Wie viel Energie hast du gerade für deine Aufgabe – niedrig, mittel oder hoch?",hint:"Beobachte dich, ohne dich zu bewerten.",next:"Passe deine Aufgabe daran an."},
 {id:"n5",cat:"nachdenken",title:"Was brauche ich?",task:"Vervollständige: „Damit ich weiterkomme, brauche ich gerade … “",hint:"Vielleicht Wissen, Zeit, Ruhe, Erklärung oder Feedback.",next:"Suche genau diese Unterstützung."},

 {id:"a1",cat:"anwenden",title:"Auf echte Situation übertragen",task:"Übertrage einen Lerninhalt auf eine Situation aus Alltag, Praktikum oder späterem Beruf.",hint:"Was würde sich dort mit diesem Wissen anders betrachten lassen?",next:"Beschreibe die konkrete Situation."},
 {id:"a2",cat:"anwenden",title:"Mini-Fall",task:"Erfinde einen kurzen Fall, bei dem du dein aktuelles Wissen anwenden musst.",hint:"Der Fall sollte eine echte Entscheidung oder Lösung verlangen.",next:"Löse deinen eigenen Fall."},
 {id:"a3",cat:"anwenden",title:"Zeig es",task:"Zeige einen Lerninhalt als Skizze, Ablauf, Tabelle oder Beispiel.",hint:"Wähle die Darstellungsform, die den Zusammenhang am besten sichtbar macht.",next:"Prüfe, ob die Darstellung verständlich ist."},
 {id:"a4",cat:"anwenden",title:"Transferfrage",task:"Frage dich: „Wo könnte mir dieses Wissen außerhalb der Schule nützlich sein?“",hint:"Nimm eine konkrete Situation.",next:"Beschreibe, wie du es dort nutzen würdest."},
 {id:"a5",cat:"anwenden",title:"Entscheiden",task:"Nimm ein aktuelles Problem und entscheide dich für eine Lösung auf Grundlage deines Lernwissens.",hint:"Begründe mit mindestens einem Fachargument.",next:"Prüfe, ob es eine alternative Lösung gibt."},

 {id:"w1",cat:"wiederholen",title:"Buch zu",task:"Schließe dein Material. Schreibe aus dem Kopf alles auf, was du noch weißt.",hint:"Nicht nachschauen.",next:"Vergleiche danach und markiere nur die fehlenden Punkte."},
 {id:"w2",cat:"wiederholen",title:"Drei Fragen",task:"Formuliere drei Prüfungsfragen zu deinem Thema: leicht, mittel und schwierig.",hint:"Die Fragen sollen wirklich prüfbar sein.",next:"Beantworte alle drei ohne Material."},
 {id:"w3",cat:"wiederholen",title:"Karteikarten-Test",task:"Erkläre drei wichtige Begriffe aus dem Kopf.",hint:"Ergänze zu jeder Erklärung ein Beispiel.",next:"Prüfe danach deine Antworten."},
 {id:"w4",cat:"wiederholen",title:"Was fehlt?",task:"Schreibe die fünf wichtigsten Punkte deines Themas aus dem Kopf auf.",hint:"Erst danach vergleichen.",next:"Ergänze genau das, was dir gefehlt hat."},
 {id:"w5",cat:"wiederholen",title:"Morgen-Test",task:"Formuliere eine Frage, die du dir morgen ohne Unterlagen stellen kannst.",hint:"Die Antwort muss überprüfbar sein.",next:"Speichere die Frage in deinen Lernnotizen."},

 {id:"c1",cat:"challenge",title:"Ohne Vorlage",task:"Löse einen kleinen Teil deiner aktuellen Aufgabe ohne Musterlösung.",hint:"Erst selbst denken, dann vergleichen.",next:"Finde genau eine Abweichung."},
 {id:"c2",cat:"challenge",title:"60-Sekunden-Erklärung",task:"Erkläre dein Thema in höchstens 60 Sekunden.",hint:"Nur Kernidee, Zusammenhang und ein Beispiel.",next:"Streiche alles, was nicht unbedingt nötig ist."},
 {id:"c3",cat:"challenge",title:"Schwierigste Frage",task:"Formuliere die schwierigste sinnvolle Frage zu deinem Thema.",hint:"Keine Fangfrage – eine echte Denkfrage.",next:"Versuche sie selbst zu beantworten."},
 {id:"c4",cat:"challenge",title:"Gegenposition",task:"Finde zu deiner eigenen Aussage ein gutes Gegenargument.",hint:"Das Gegenargument muss ernst zu nehmen sein.",next:"Entscheide, welche Position dich stärker überzeugt und warum."},
 {id:"c5",cat:"challenge",title:"Ein Schritt weiter",task:"Verändere eine Bedingung einer Aufgabe, die du bereits kannst. Was passiert?",hint:"Mache aus einer bekannten Aufgabe eine neue.",next:"Löse die veränderte Aufgabe."},

 {id:"h1",cat:"haengt",title:"Problem kleiner machen",task:"Zerlege die Aufgabe, an der du hängst, in drei kleinere Schritte.",hint:"Der erste Schritt darf sehr klein sein.",next:"Bearbeite nur Schritt 1."},
 {id:"h2",cat:"haengt",title:"Was genau ist unklar?",task:"Vervollständige: „Ich komme nicht weiter, weil ich …“",hint:"So wird aus einem diffusen Problem eine konkrete Frage.",next:"Formuliere daraus eine Frage an Material, KI, Mitschüler oder Lehrkraft."},
 {id:"h3",cat:"haengt",title:"Letzter sicherer Punkt",task:"Gehe zurück zu dem Punkt, an dem du noch sicher warst.",hint:"Von dort aus Schritt für Schritt weiter.",next:"Finde den ersten Punkt, an dem die Unsicherheit beginnt."},
 {id:"h4",cat:"haengt",title:"Hilfe richtig holen",task:"Formuliere deine Frage so konkret, dass eine andere Person direkt antworten kann.",hint:"Nicht: „Ich verstehe das nicht.“",next:"Stelle die Frage tatsächlich."},
 {id:"h5",cat:"haengt",title:"5-Minuten-Reset",task:"Unterbrich die Aufgabe für fünf Minuten und komme danach mit einem einzigen nächsten Schritt zurück.",hint:"Die Pause ist Teil der Strategie.",next:"Starte nach der Pause nur mit diesem einen Schritt."},

 {id:"u1",cat:"ueberraschung",title:"Erkläre es mit einem Bild",task:"Finde ein Bild, eine Metapher oder einen Vergleich für einen Lerninhalt.",hint:"Je ungewöhnlicher, desto besser – solange der Zusammenhang stimmt.",next:"Erkläre, warum der Vergleich passt."},
 {id:"u2",cat:"ueberraschung",title:"Lerninhalt als Schlagzeile",task:"Formuliere dein aktuelles Thema als Zeitungsüberschrift.",hint:"Neugierig machend und fachlich passend.",next:"Erkläre in einem Satz, was dahintersteckt."},
 {id:"u3",cat:"ueberraschung",title:"Perspektivwechsel",task:"Betrachte deinen Lerninhalt aus der Perspektive einer anderen Person.",hint:"Zum Beispiel Kind, Kunde, Patient oder Praxispartner.",next:"Formuliere eine Frage aus dieser Perspektive."},
 {id:"u4",cat:"ueberraschung",title:"Falsche Antwort",task:"Erfinde eine plausible, aber falsche Antwort zu deinem Thema.",hint:"Sie soll zunächst überzeugend wirken.",next:"Erkläre genau, warum sie falsch ist."},
 {id:"u5",cat:"ueberraschung",title:"Das würde ich fragen",task:"Wenn du nur eine einzige Frage zu deinem Thema stellen dürftest: Welche wäre es?",hint:"Wähle eine Frage, die deinen Lernweg wirklich weiterbringt.",next:"Suche die Antwort und prüfe sie."}
];

function lernImpulseDone(){
 try{return JSON.parse(localStorage.getItem("f12sb_lernimpulse_done")||"[]")}catch(e){return []}
}
function lernImpulseSaveDone(ids){
 try{localStorage.setItem("f12sb_lernimpulse_done",JSON.stringify(ids))}catch(e){}
}
function lernImpulseCategory(id){return lernImpulseKategorien.find(x=>x.id===id)}
function renderLernimpulsCard(i){
 const c=lernImpulseCategory(i.cat);
 return`<button class="card tile impulse-card"onclick="openLernimpuls('${i.id}')"><span class="emoji">${c.icon}</span>
<strong>${esc(i.title)}</strong><small>${esc(i.task)}</small><span class="pill">${esc(c.title)}</span></button>`;
}

async function renderLernimpulse(){
 const done=lernImpulseDone();
 const pct=Math.round(done.length/lernImpulse.length*100);
 return`${pageHead("SELBSTSTÄNDIG LERNEN","Lernimpulse","Du hast zwei Möglichkeiten: gezielt wählen oder dich überraschen lassen.",`<button class="primary"onclick="openRandomLernimpuls(true)"> Impuls drehen</button>`)}
 <div class="grid grid-2 impulse-choice-grid">
 <div class="card">
 <span class="badge"> GEZIELT WÄHLEN</span>
 <h2>Ich weiß, was ich gerade brauche.</h2>
 <p>Wähle einen Bereich, der zu deiner aktuellen Lernsituation passt.</p>
 <div class="grid grid-2">
 ${lernImpulseKategorien.filter(c=>c.id!=="ueberraschung").map(c=>`<button class="card tile impulse-category"onclick="filterLernimpulse('${c.id}')"><span class="emoji">${c.icon}</span><strong>${esc(c.title)}</strong><small>${esc(c.text)}
</small></button>`).join("")}
 </div>
 </div>
 <div class="card impulse-wheel-card">
 <span class="badge"> ÜBERRASCHUNG</span>
 <div class="impulse-wheel"id="impulseWheel"><div class="impulse-wheel-pointer">▼</div><div class="impulse-wheel-inner">
<span> </span><strong>Überrasch<br>mich!</strong></div></div>
 <h2>Lass dich überraschen.</h2>
 <p>Ein zufälliger Impuls wird ausgewählt. Wenn du ihn bekommst, ist er jetzt dran.</p>
 <button class="primary"onclick="openRandomLernimpuls(true)"> Jetzt drehen</button>
 </div>
 </div>
 <div class="card impulse-progress-card"><div class="impulse-progress-head"><h3> Dein Fortschritt</h3><strong>${pct}%</strong>
</div><p>${done.length} von ${lernImpulse.length} Impulsen ausprobiert.</p><div class="progress"><i style="width:${pct}%"></i>
</div></div>
 <div id="impulseList"class="impulse-section"><div class="impulse-section-head"><div class="kicker">GEZIELTE AUSWAHL</div>
<h2>Was passt gerade zu dir?</h2></div><div class="grid grid-3"id="impulseCards">${lernImpulse.map(renderLernimpulsCard).join("")}</div></div>${footer()}`;
}

function filterLernimpulse(cat){
 const list=$("impulseCards");if(!list)return;
 list.innerHTML=(cat==="all"?lernImpulse:lernImpulse.filter(i=>i.cat===cat)).map(renderLernimpulsCard).join("");
 $("impulseList")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function openRandomLernimpuls(fromWheel=false){
 const wheel=$("impulseWheel");
 if(fromWheel&&wheel){
 wheel.classList.remove("is-spinning");
 void wheel.offsetWidth;
 wheel.classList.add("is-spinning");
 }
 const done=lernImpulseDone();
 const open=lernImpulse.filter(i=>!done.includes(i.id));
 const pool=open.length?open:lernImpulse;
 const i=pool[Math.floor(Math.random()*pool.length)];
 setTimeout(()=>openLernimpuls(i.id,fromWheel),fromWheel?850:0);
}

function openLernimpuls(id,fromWheel=false){
 const i=lernImpulse.find(x=>x.id===id);if(!i)return;
 const c=lernImpulseCategory(i.cat);
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">${fromWheel?"ZUFALLSIMPULS":"GEZIELTER IMPULS"} · ${c.icon} ${esc(c.title)}</div>
 <h2>${esc(i.title)}</h2>
 ${fromWheel?`<div class="notice"><strong> Dieser Impuls ist jetzt dran.</strong><p>Du hast dich überraschen lassen –
probiere genau diesen Impuls aus.</p></div>`:""}
 <div class="card"><span class="badge">DEINE AUFGABE</span><p style="font-size:19px;line-height:1.55;margin- top:10px">${esc(i.task)}</p></div>
 <div class="notice"><strong> Hinweis</strong><p>${esc(i.hint)}</p></div>
 <label> Deine kurze Notiz<textarea id="impulseAnswer"rows="4"placeholder="Was hast du gemacht, erkannt oder herausgefunden?"></textarea></label>
 <div class="notice"><strong> Danach</strong><p>${esc(i.next)}</p></div>
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Später</button><button class="primary"onclick="completeLernimpuls('${i.id}')"> Impuls gemacht</button></div>`);
}

function completeLernimpuls(id){
 const answer=$("impulseAnswer")?.value.trim()||"";
 const done=lernImpulseDone();
 if(!done.includes(id))done.push(id);
 lernImpulseSaveDone(done);
 const i=lernImpulse.find(x=>x.id===id);
 closeModal();
 toast("Impuls geschafft – gut gemacht!");
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> GESCHAFFT</div><h2>Du hast ihn
gemacht.</h2><p><strong>${esc(i?.title||"Lernimpuls")}</strong> ist erledigt.</p>${answer?`<div class="card"><strong>Deine
Notiz</strong><p>${esc(answer)}</p></div>`:""}<div class="notice"><strong> Dein nächster Schritt</strong>
<p>${esc(i?.next||"Weiterlernen.")}</p></div><div class="form-actions"><button class="secondary"onclick="closeModal()">Fertig</button><button class="primary"onclick="closeModal();openRandomLernimpuls(true)"> Nächsten
Impuls drehen</button></div>`);
}

window.openLernimpuls=openLernimpuls;
window.openRandomLernimpuls=openRandomLernimpuls;
window.filterLernimpulse=filterLernimpulse;
window.completeLernimpuls=completeLernimpuls;


/* =========================================================
 F12Sb – LERNSTANDSMESSUNG PP 11
 26 Lernstandsmessungen
 5 identische Kompetenzdimensionen × 3 Punkte = 15 Punkte
 ========================================================= */

const LERNSTAND_COMPETENCIES = [
 {id:"fachwissen",label:"Fachwissen",short:"Wissen"},
 {id:"erkennen",label:"Erkennen & Zuordnen",short:"Erkennen"},
 {id:"anwenden",label:"Anwenden & Erklären",short:"Anwenden"},
 {id:"analysieren",label:"Analysieren & Beurteilen",short:"Analysieren"},
 {id:"reflektieren",label:"Reflektieren & Handeln",short:"Handeln"}
];

const LERNSTAND_AREAS = {
 lb1:{title:"Wissenschaftliche Pädagogik & Psychologie",icon:""},
 lb2:{title:"Grundlagen des Erlebens & Verhaltens",icon:""},
 lb3:{title:"Erziehungsprozesse",icon:""},
 lb4:{title:"Lernen",icon:""}
};

const LERNSTAND_DEFAULTS = [
 {
 "id": "ls01","nr": 1,"learningArea": "lb1","areaTitle": "Wissenschaftliche Pädagogik & Psychologie","title": "Gegenstandsbereiche von Pädagogik und Psychologie","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls02","nr": 2,"learningArea": "lb1","areaTitle": "Wissenschaftliche Pädagogik & Psychologie","title": "Wissenschaftliche Pädagogik/Psychologie vs. Alltagspsychologie","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls03","nr": 3,"learningArea": "lb1","areaTitle": "Wissenschaftliche Pädagogik & Psychologie","title": "Experiment als wissenschaftliche Methode","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls04","nr": 4,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Wahrnehmungsprozess","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls05","nr": 5,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Einflussfaktoren auf Wahrnehmung","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls06","nr": 6,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Mehrspeichermodell des Gedächtnisses","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls07","nr": 7,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Speichersysteme des Langzeitgedächtnisses","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls08","nr": 8,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Strategien zum Wissenserwerb","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls09","nr": 9,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Emotionen und ihre Komponenten","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls10","nr": 10,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Emotionsregulation","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls11","nr": 11,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Motivation","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls12","nr": 12,"learningArea": "lb2","areaTitle": "Grundlagen des Erlebens und Verhaltens","title": "Attributionstheorie nach Weiner","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls13","nr": 13,"learningArea": "lb3","areaTitle": "Erziehungsprozesse","title": "Merkmale von Erziehung","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls14","nr": 14,"learningArea": "lb3","areaTitle": "Erziehungsprozesse","title": "Mündigkeit nach Roth","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls15","nr": 15,"learningArea": "lb3","areaTitle": "Erziehungsprozesse","title": "Erziehungsmaßnahmen","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls16","nr": 16,"learningArea": "lb3","areaTitle": "Erziehungsprozesse","title": "Erziehungsstile nach Baumrind","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls17","nr": 17,"learningArea": "lb3","areaTitle": "Erziehungsprozesse","title": "Frühe Bildung und Erziehung","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls18","nr": 18,"learningArea": "lb4","areaTitle": "Lernen","title": "Begriff und Merkmale des Lernens","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls19","nr": 19,"learningArea": "lb4","areaTitle": "Lernen","title": "Klassisches Konditionieren – Grundlagen","description": "Beispielhafte Kompetenzüberprüfung: klassisches Konditionieren. Nach drei Versuchen werden die Musterlösungen sichtbar.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Erkläre die Begriffe neutraler Reiz, unkonditionierter Reiz, unkonditionierte Reaktion, konditionierter Reiz und konditionierte Reaktion.","solution": "Neutraler Reiz: löst zunächst keine relevante gelernte Reaktion aus. Unkonditionierter Reiz: löst eine Reaktion ohne vorheriges Lernen aus. Unkonditionierte Reaktion: angeborene/nicht gelernte Reaktion. Konditionierter Reiz: ursprünglich neutraler Reiz, der durch Kopplung gelernt wurde. Konditionierte Reaktion: gelernte Reaktion auf den konditionierten Reiz."
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Ein Schüler bekommt vor einer Klassenarbeit wiederholt einen bestimmten Signalton kurz vor dem Austeilen der Aufgaben zu hören. Nach mehreren Wiederholungen wird er bereits beim Signalton nervös. Ordne Signalton, Klassenarbeit und Nervosität den Elementen der klassischen Konditionierung zu.","solution": "Der Signalton ist zunächst ein neutraler Reiz und wird nach der Kopplung zum konditionierten Reiz. Die Klassenarbeit fungiert im Beispiel als unkonditionierter Reiz, die ursprüngliche Prüfungsreaktion als unkonditionierte Reaktion. Die Nervosität beim Signalton ist die konditionierte Reaktion."
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Erkläre mit dem Ablauf der klassischen Konditionierung, warum der Schüler nach mehreren Kopplungen bereits beim Signalton nervös wird.","solution": "Der zunächst neutrale Signalton wird wiederholt mit dem auslösenden Reiz der Klassenarbeit gekoppelt. Durch die Lernvorgänge erhält der Signalton die Funktion eines konditionierten Reizes. Er kann anschließend allein die gelernte konditionierte Reaktion der Nervosität auslösen."
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Analysiere den Fall. Zeige, welche Aussage über den Lernprozess durch die Konditionierung erklärt werden kann und welche Aspekte damit nicht vollständig erklärt sind.","solution": "Die Konditionierung erklärt die gelernte Verbindung zwischen Signalton und Nervosität. Sie erklärt aber nicht automatisch alle Ursachen der Prüfungsangst, etwa Gedanken, persönliche Bewertungen, Vorerfahrungen oder soziale Einflüsse. Eine fachlich gute Analyse grenzt die Erklärungskraft des Modells ein."
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Entwickle zwei pädagogisch sinnvolle Möglichkeiten, wie der Schüler die gelernte Reaktion auf den Signalton abschwächen könnte. Begründe beide Vorschläge fachlich.","solution": "Möglich sind beispielsweise eine schrittweise Gegenkonditionierung bzw. neue positive Kopplungen mit dem Signalton sowie eine Veränderung der Situation durch wiederholte, sichere Erfahrungen ohne unmittelbar anschließende negative Konsequenz. Entscheidend ist die fachliche Begründung und die nachvollziehbare Verbindung zum Konditionierungsprozess."
 }
 ]
 },
 {
 "id": "ls20","nr": 20,"learningArea": "lb4","areaTitle": "Lernen","title": "Erweiterungen des klassischen Konditionierens","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls21","nr": 21,"learningArea": "lb4","areaTitle": "Lernen","title": "Thorndike / Versuch-Irrtum-Lernen","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls22","nr": 22,"learningArea": "lb4","areaTitle": "Lernen","title": "Operantes Konditionieren / Verstärkung","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls23","nr": 23,"learningArea": "lb4","areaTitle": "Lernen","title": "Verstärkung pädagogisch einsetzen","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls24","nr": 24,"learningArea": "lb4","areaTitle": "Lernen","title": "Sozial-kognitive Theorie nach Bandura","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls25","nr": 25,"learningArea": "lb4","areaTitle": "Lernen","title": "Modelllernen / Teilprozesse","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 },
 {
 "id": "ls26","nr": 26,"learningArea": "lb4","areaTitle": "Lernen","title": "Medien und Lernen","description": "Kompetenzüberprüfung mit fünf einheitlichen Kompetenzdimensionen.","tasks": [
 {
 "id": "fachwissen","label": "Fachwissen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "erkennen","label": "Erkennen & Zuordnen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "anwenden","label": "Anwenden & Erklären","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "analysieren","label": "Analysieren & Beurteilen","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 },
 {
 "id": "reflektieren","label": "Reflektieren & Handeln","points": 3,"prompt": "Aufgabe wird später eingetragen.","solution": ""
 }
 ]
 }
];

function lernstandStatus(points,max){
 const m=Number(max)||15;
 const pct=m>0?(Number(points)||0)/m:0;
 return pct>=0.8?"green":pct>=0.53?"yellow":"red";
}
function lernstandStatusText(points,max){
 return statusLabel[lernstandStatus(points,max)]||"—";
}
function lernstandTaskById(id){
 return LERNSTAND_DEFAULTS.find(x=>x.id===id);
}
function lernstandMaxPoints(id){
 const t=lernstandTaskById(id);
 return t?t.tasks.reduce((sum,q)=>sum+(Number(q.points)||0),0):15;
}
// Wertet eine K-Prim-Aufgabe automatisch aus: checked = Array von Booleans
// (eine Angabe pro Aussage, true = "als richtig angekreuzt").
function kprimGrade(task,checked){
 const statements=task.statements||[];
 let errors=0;
 statements.forEach((s,i)=>{ if(!!checked[i]!==!!s.correct) errors++; });
 const total=statements.length;
 const allCorrect=errors===0;
 const maxPoints=Number(task.points)||3;
 let points;
 if(errors===0)points=maxPoints;
 else if(errors===1)points=Math.round(maxPoints*2/3);
 else if(errors===2)points=Math.round(maxPoints*1/3);
 else points=0;
 return {errors,total,allCorrect,points};
}
function lernstandStoredTasks(){
 try{return JSON.parse(localStorage.getItem("campus_lernstand_tasks")||"{}")}catch(e){return {}}
}
function lernstandMergeTask(base,override){
 if(!override)return base;
 return {...base,...override,tasks:(base.tasks||[]).map(t=>{
 const o=(override.tasks||[]).find(x=>x.id===t.id);
 return o?{...t,...o}:t;
 })};
}
async function getLernstandTasks(){
 const local=lernstandStoredTasks();
 let remote=[];
 try{
 const snap=await getDocs(collection(db,"lernstandMessungen"));
 remote=snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.warn("Lernstand-Messungen:",e)}
 return LERNSTAND_DEFAULTS.map(base=>{
 const r=remote.find(x=>x.taskId===base.id);
 return lernstandMergeTask(base,local[base.id]||r||null);
 });
}
async function getMyLernstandAttempts(){
 try{
 const snap=await getDocs(
 query(collection(db,"lernstandVersuche"),where("uid","==",currentUser.uid),limit(100))
 );
 return snap.docs.map(d=>({id:d.id,...d.data()}))
 .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 }catch(e){console.error("Lernstand-Versuche:",e);return []}
}
function lernstandAttemptCount(attempts,taskId){
 return attempts.filter(x=>x.taskId===taskId).length;
}
function lernstandLatest(attempts,taskId){
 return attempts.filter(x=>x.taskId===taskId).sort((a,b)=>(b.attempt||0)-(a.attempt||0))[0]||null;
}
function lernstandTrend(attempts,taskId){
 return attempts.filter(x=>x.taskId===taskId).sort((a,b)=>(a.attempt||0)-(b.attempt||0))
 .map(x=>Number(x.total)||0);
}
function lernstandCompetenceSeries(attempts,dimension){
 return attempts.filter(x=>x.competencies&&x.competencies[dimension]!==undefined)
 .sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0))
 .map(x=>Number(x.competencies[dimension])||0);
}
function lernstandOverallSeries(attempts){
 return attempts.sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0))
 .map(x=>Number(x.total)||0);
}
function lernstandBar(points,max=3){
 const p=Math.max(0,Math.min(max,Number(points)||0));
 return`<span class="ls-mini-bar"><i style="width:${Math.round(p/max*100)}%"></i></span>`;
}

async function getAllUsersForLernstand(){
 if(!isTeacher()) throw new Error("Nur Lehrkräfte dürfen die Schülerübersicht öffnen.");
 try{
 const snap=await getDocs(collection(db,"users"));
 return snap.docs.map(d=>({uid:d.id,...d.data()}))
 .filter(u=>u.role!=="teacher"&&u.role!=="admin")
 .sort((a,b)=>String(a.displayName||a.email||"").localeCompare(String(b.displayName||b.email||""),"de"));
 }catch(e){
 console.error("Schülerliste Lernstand:",e);
 return [];
 }
}

async function getAllLernstandAttempts(){
 if(!isTeacher()) return [];
 try{
 const snap=await getDocs(collection(db,"lernstandVersuche"));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(e){console.error("Alle Lernstand-Versuche:",e);return []}
}

function lernstandAttemptStatus(attempts,taskId,uid){
 const rows=attempts.filter(x=>x.taskId===taskId&&x.uid===uid);
 if(!rows.length)return"offen";
 const latest=rows.sort((a,b)=>(b.attempt||0)-(a.attempt||0))[0];
 return latest.status==="bewertet"?"bewertet":"abgegeben";
}
function lernstandStatusPill(status){
 if(status==="bewertet")return`<span class="pill green"> Bewertet</span>`;
 if(status==="abgegeben")return`<span class="pill yellow">● Abgegeben</span>`;
 return`<span class="pill">○ Offen</span>`;
}
function lernstandAttemptNumber(attempts,taskId,uid){
 return attempts.filter(x=>x.taskId===taskId&&x.uid===uid).length;
}

async function renderLernstand(){
 const tasks=await getLernstandTasks();
 const byArea={lb1:[],lb2:[],lb3:[],lb4:[]};
 tasks.forEach(t=>{if(byArea[t.learningArea])byArea[t.learningArea].push(t)});
 const ownAttempts=await getMyLernstandAttempts();
 const latestAll=ownAttempts.slice().sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 const latest=latestAll[0];

 let teacherOverview="";
 if(isTeacher()){
 const students=await getAllUsersForLernstand();
 const allAttempts=await getAllLernstandAttempts();
 const submitted=new Set(allAttempts.map(a=>`${a.uid}|${a.taskId}`));
 const graded=new Set(allAttempts.filter(a=>a.status==="bewertet").map(a=>`${a.uid}|${a.taskId}`));
 const totalSlots=students.length*tasks.length;
 const submittedCount=submitted.size;
 const gradedCount=graded.size;
 teacherOverview=`
 <div class="card ls-teacher-dashboard"style="margin-bottom:16px">
 <div class="page-head"style="margin-bottom:12px">
 <div><div class="kicker"> LEHRKRAFT · ÜBERSICHT</div><h2>Lernstand der Klasse</h2><p>Überblick über Bearbeitung, Abgabe und Bewertung. Für Details kannst du einen einzelnen Schüler öffnen.</p></div>
 <button class="primary"onclick="openLernstandTeacherOverview()">Schülerübersicht öffnen →</button>
 </div>
 <div class="ls-teacher-stats">
 <div class="card stat"><b>${students.length}</b><span>Schüler/innen</span></div>
 <div class="card stat"><b>${submittedCount}</b><span>Messungen abgegeben</span></div>
 <div class="card stat"><b>${gradedCount}</b><span>Messungen bewertet</span></div>
 <div class="card stat"><b>${Math.max(0,totalSlots-submittedCount)}</b><span>Noch offen</span></div>
 </div>
 </div>`;
 }

 return`${pageHead(
 "LERNSTAND · PÄDAGOGIK & PSYCHOLOGIE","Lernstandsmessung","26 Kompetenzüberprüfungen – mit einem einheitlichen Kompetenzprofil, damit deine Entwicklung sichtbar wird.",
 isTeacher()?`<button class="primary"onclick="openLernstandEditor()">＋ Aufgaben verwalten</button>`:""
 )}
 <style>
 .ls-intro{display:grid;grid-template-columns:1.35fr .65fr;gap:16px;margin-bottom:16px}.ls-intro-card{min-height:170px}
 .ls-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:14px}.ls-flow div{padding:12px;border:1px solid var(--line,#ddd);border-radius:12px;background:#fff}.ls-flow b{display:block;margin-bottom:4px}
 .ls-area-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.ls-area{min-width:0}.ls-area-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.ls-area-head h2{margin:3px 0 4px}
 .ls-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 0;border-top:1px solid var(--line,#ddd)}.ls-item-main{min-width:0}.ls-item-main strong{display:block}.ls-item-main small{display:block;color:var(--muted);margin-top:3px}.ls-item-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}
 .ls-competence-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.ls-comp-card{border:1px solid var(--line,#ddd);border-radius:12px;padding:11px;background:#fff}.ls-comp-card strong{font-size:12px;display:block}.ls-comp-card small{color:var(--muted)}.ls-mini-bar{display:block;height:6px;background:#edf0f2;border-radius:99px;overflow:hidden;margin-top:8px}.ls-mini-bar i{display:block;height:100%;background:var(--brand,#168fd0)}
 .ls-task-box{border:1px solid var(--line,#ddd);border-radius:12px;padding:14px;margin-top:10px;background:#fff}.ls-task-box h4{margin:0 0 7px}.ls-points{font-weight:800}.ls-progress{display:flex;gap:5px;margin:10px 0}.ls-progress span{height:7px;flex:1;border-radius:99px;background:#e9ecef}.ls-progress span.on{background:var(--brand,#168fd0)}.ls-solution{margin-top:10px;padding:12px;border-radius:10px;background:#f5f7f8;border:1px solid var(--line,#ddd)}
 .ls-teacher-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.ls-teacher-stats .card{margin:0}.ls-student-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ls-student-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px;border:1px solid var(--line,#ddd);border-radius:12px;background:#fff}.ls-student-row small{display:block;color:var(--muted);margin-top:3px}.ls-detail-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}.ls-matrix{width:100%;border-collapse:collapse}.ls-matrix th,.ls-matrix td{padding:9px;border-bottom:1px solid var(--line,#ddd);text-align:left;font-size:12px}.ls-matrix th{color:var(--muted)}.ls-matrix td.num{text-align:center;font-weight:800}.ls-overview-scroll{overflow:auto}.ls-grade-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.ls-grade-grid label{font-size:12px}.ls-grade-grid input{width:100%}
 @media(max-width:900px){.ls-intro{grid-template-columns:1fr}.ls-area-grid,.ls-detail-grid,.ls-student-grid{grid-template-columns:1fr}.ls-flow{grid-template-columns:1fr}.ls-competence-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ls-teacher-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ls-grade-grid{grid-template-columns:1fr 1fr}}
 @media(max-width:600px){.ls-competence-grid,.ls-teacher-stats,.ls-grade-grid{grid-template-columns:1fr}.ls-item,.ls-student-row{align-items:flex-start;flex-direction:column}.ls-item-actions{justify-content:flex-start}}
 </style>
 ${teacherOverview}
 <div class="ls-intro">
 <section class="card ls-intro-card"><span class="badge">WAS IST DAS?</span><h2>Dein Lernstand wird sichtbar.</h2><p>Nach jedem abgeschlossenen Thema kannst du deinen Lernstand überprüfen. Jede Messung prüft dieselben fünf Kompetenzdimensionen. Dadurch werden Fortschritte über das Schuljahr hinweg vergleichbar.</p><div class="ls-flow">${LERNSTAND_COMPETENCIES.map((c,i)=>`<div><b>${i+1}. ${c.label}</b><small>bis 3 Punkte</small></div>`).join("")}</div></section>
 <section class="card ls-intro-card"><span class="badge">BIS ZU 15 PUNKTE</span><h2>Einheitliches Bewertungsschema</h2><p>Jede Kompetenzaufgabe wird mit bis zu <strong>3 Punkten</strong> bewertet. Die meisten Themen umfassen fünf Aufgaben (max. 15 Punkte), einzelne Themen können mehr Aufgaben enthalten.</p><div class="list"><div class="list-item"><strong>ab 80 %</strong><span class="pill green">Auf Kurs</span></div><div class="list-item"><strong>53–79 %</strong><span class="pill yellow">Klärungsbedarf</span></div><div class="list-item"><strong>unter 53 %</strong><span class="pill red">Handlungsbedarf</span></div></div></section>
 </div>
 <div class="card"style="margin-bottom:16px"><div class="kicker">KOMPETENZENTWICKLUNG</div><h2>Entwicklung über das Schuljahr</h2><p>Jede abgegebene und bewertete Messung wird dem eigenen Profil zugeordnet. Die fünf Kompetenzdimensionen können dadurch über mehrere Themen hinweg verglichen werden.</p><div class="ls-competence-grid">${LERNSTAND_COMPETENCIES.map(c=>{const series=lernstandCompetenceSeries(ownAttempts,c.id);const last=series.length?series[series.length-1]:null;return`<div class="ls-comp-card"><strong>${esc(c.label)}</strong><small>${last===null?"Noch kein Ergebnis":last+"/3 Punkte zuletzt"}</small>${last===null?"":lernstandBar(last,3)}</div>`}).join("")}</div>${latest?`<div class="notice"style="margin-top:14px"><strong>Letzter Lernstand: ${latest.total}/${lernstandMaxPoints(latest.taskId)} · ${lernstandStatusText(latest.total,lernstandMaxPoints(latest.taskId))}</strong><p style="margin-bottom:0">Versuch ${latest.attempt} bei „${esc(latest.title||"Lernstandsmessung")}".</p></div>`:`<div class="notice"style="margin-top:14px"><strong>Noch keine Lernstandsmessung abgeschlossen.</strong><p style="margin-bottom:0">Starte nach dem nächsten Thema mit der passenden Kompetenzüberprüfung.</p></div>`}</div>
 <div class="ls-area-grid">${["lb1","lb2","lb3","lb4"].map(areaId=>`<section class="card ls-area"><div class="ls-area-head"><div><span class="badge">${LERNSTAND_AREAS[areaId].icon} LERNBEREICH</span><h2>${esc(LERNSTAND_AREAS[areaId].title)}</h2></div><span class="pill">${byArea[areaId].length} Messungen</span></div>${byArea[areaId].map(t=>{const a=lernstandLatest(ownAttempts,t.id);const count=lernstandAttemptCount(ownAttempts,t.id);const max=lernstandMaxPoints(t.id);return`<div class="ls-item"><div class="ls-item-main"><strong>${t.nr}. ${esc(t.title)}</strong><small>${count?`letzter Stand: ${a.total}/${max} · Versuch ${a.attempt}`:"noch nicht bearbeitet"}</small></div><div class="ls-item-actions">${a?`<span class="pill ${lernstandStatus(a.total,max)}">${lernstandStatusText(a.total,max)}</span>`:""}${count?`<button class="secondary"onclick="openLernstandResult('${t.id}')">🔓 Musterlösung</button>`:""}<button class="secondary"onclick="openLernstand('${t.id}')">${a?"Weiter / ansehen":"Starten"} →</button></div></div>`}).join("")}</section>`).join("")}</div>${footer()}`;
}

// Rendert eine einzelne Kompetenzaufgabe im Bearbeitungsformular: K-Prim als
// ankreuzbare Aussagenliste (inkl. Rückblick auf den letzten Versuch, falls
// vorhanden), offene Fragen als großes Textfeld.
function lernstandTaskInputHTML(q,i,priorAttempt){
 if(q.type==="kprim"){
 const priorAnswer=priorAttempt?.answers?.[q.id];
 let feedbackHTML="";
 if(Array.isArray(priorAnswer)){
 const g=kprimGrade(q,priorAnswer);
 feedbackHTML=`<div class="notice ${g.allCorrect?"ls-fb-green":"ls-fb-red"}"style="margin:8px 0 12px"><strong>${g.allCorrect?`✅ Versuch ${priorAttempt.attempt}: Alles richtig!`:`❌ Versuch ${priorAttempt.attempt}: ${g.errors} von ${g.total} Aussagen falsch beurteilt`}</strong></div>`;
 }
 return`<div class="ls-task-box"><h4>${i+1}. ${esc(q.label)} <span class="ls-points">· ${q.points} P.</span></h4><p>${esc(q.intro||"")}</p>${feedbackHTML}<div class="ls-kprim-list">${(q.statements||[]).map((s,si)=>`<label class="ls-kprim-row"><input type="checkbox"data-kprim-task="${esc(q.id)}"data-kprim-index="${si}"><span>${esc(s.text)}</span></label>`).join("")}</div></div>`;
 }
 return`<div class="ls-task-box"><h4>${i+1}. ${esc(q.label)} <span class="ls-points">· ${q.points} P.</span></h4><p>${esc(q.prompt)}</p><textarea id="lsAnswer_${q.id}"rows="10"placeholder="Deine Antwort …"></textarea></div>`;
}

function openLernstand(id){
 if(isTeacher()){toast("Lehrkräfte bearbeiten und bewerten über die Schülerübersicht.");return}
 getLernstandTasks().then(async tasks=>{
 const t=tasks.find(x=>x.id===id);if(!t)return;
 const attempts=await getMyLernstandAttempts();
 const count=lernstandAttemptCount(attempts,id);
 if(count>=3){openLernstandResult(id);return}
 const nextAttempt=count+1;
 const prior=lernstandLatest(attempts,id);
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">${LERNSTAND_AREAS[t.learningArea].icon} LERNSTANDSMESSUNG ${t.nr}/26</div><h2>${esc(t.title)}</h2><p>${esc(t.description||"Kompetenzüberprüfung mit fünf Kompetenzdimensionen.")}</p><div class="notice"><strong>Versuch ${nextAttempt} von 3</strong><p style="margin-bottom:0">Bearbeite alle ${t.tasks.length} Kompetenzaufgaben. Bei K-Prim-Aufgaben nur die als richtig erkannten Aussagen ankreuzen. Nach dem dritten Versuch kannst du die vollständigen Musterlösungen einsehen.</p></div><div class="ls-progress">${[1,2,3].map(n=>`<span class="${n<=count?"on":""}"></span>`).join("")}</div><div class="form">${t.tasks.map((q,i)=>lernstandTaskInputHTML(q,i,prior)).join("")}<div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="submitLernstand('${t.id}',${nextAttempt})">Versuch ${nextAttempt} abgeben</button></div></div>`);
 });
}

// Schüler:innen-PDF: Themenübersicht mit vollständigen Musterlösungen
// (K-Prim inkl. Begründung je Aussage, offene Fragen inkl. Musterantwort).
async function downloadLernstandResultPDF(id){
 try{
 const tasks=await getLernstandTasks(),t=tasks.find(x=>x.id===id);if(!t){toast("Thema nicht gefunden.");return}
 const attempts=await getMyLernstandAttempts();
 const rows=attempts.filter(x=>x.taskId===id).sort((a,b)=>(a.attempt||0)-(b.attempt||0));
 const latest=rows[rows.length-1];
 const max=t.tasks.reduce((s,q)=>s+(Number(q.points)||0),0);
 const scoreLine=latest?.status==="bewertet"?`Ergebnis: ${latest.total}/${max} Punkte (${lernstandStatusText(latest.total,max)})`:`Ergebnis: ${Number(latest?.total)||0}/${max} Punkte (K-Prim automatisch, offene Fragen ggf. noch nicht bewertet)`;
 const body=t.tasks.map((q,i)=>{
 if(q.type==="kprim"){
 const stmts=(q.statements||[]).map(s=>`<tr><td style="width:26px">${s.correct?"✅":"❌"}</td><td>${escPDF(s.text)}${s.explain?`<br><small>${escPDF(s.explain)}</small>`:""}</td></tr>`).join("");
 return`<div class="item"><strong>${escPDF(String(i+1)+"."+q.label)} · ${q.points} P.</strong><div>${escPDF(q.intro||"")}</div><table style="margin-top:8px">${stmts}</table>${q.solution?`<div style="margin-top:6px"><strong>${escPDF(q.solution)}</strong></div>`:""}</div>`;
 }
 return`<div class="item"><strong>${escPDF(String(i+1)+"."+q.label)} · ${q.points} P.</strong><div><em>Aufgabe:</em> ${escPDF(q.prompt||"")}</div><div style="margin-top:6px"><em>Musterlösung:</em><br>${escPDF(q.solution||"Noch keine Musterlösung hinterlegt.").replace(/\n/g,"<br>")}</div></div>`;
 }).join("");
 openToolPrintWindow(
 "Lernstandsmessung – "+(t.title||"Thema"),`<div class="item"style="background:#f5f7f8"><strong>${escPDF(scoreLine)}</strong></div>`+body,"F12Sb · Lernstandsmessung"+t.nr+"/26 · "+(LERNSTAND_AREAS[t.learningArea]?.title||"")
 );
 }catch(e){console.error("Lernstand PDF:",e);toast("Das PDF konnte nicht erstellt werden.")}
}

function openLernstandResult(id){
 getLernstandTasks().then(async tasks=>{const t=tasks.find(x=>x.id===id);if(!t)return;const attempts=await getMyLernstandAttempts();const rows=attempts.filter(x=>x.taskId===id).sort((a,b)=>(a.attempt||0)-(b.attempt||0));const latest=rows[rows.length-1];const max=t.tasks.reduce((s,q)=>s+(Number(q.points)||0),0);modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> ERGEBNIS · ${t.nr}/26</div><h2>${esc(t.title)}</h2><div class="notice"><strong>${latest?.status==="bewertet"?`${latest.total}/${max} · ${lernstandStatusText(latest.total,max)}`:`${Number(latest?.total)||0}/${max} · K-Prim automatisch gewertet, offene Fragen noch nicht bewertet`}</strong><p style="margin-bottom:0">Hier sind die vollständigen Musterlösungen.</p></div>${t.tasks.map((q,i)=>{
 if(q.type==="kprim"){
 return`<div class="ls-task-box"><h4>${i+1}. ${esc(q.label)} · ${q.points} P.</h4><p>${esc(q.intro||"")}</p><div class="ls-kprim-list">${(q.statements||[]).map(s=>`<div class="ls-kprim-row"style="cursor:default"><span>${s.correct?"✅":"❌"}</span><span>${esc(s.text)}${s.explain?` — <em style="color:var(--muted)">${esc(s.explain)}</em>`:""}</span></div>`).join("")}</div>${q.solution?`<p style="margin-top:10px;font-weight:700">${esc(q.solution)}</p>`:""}</div>`;
 }
 return`<div class="ls-task-box"><h4>${i+1}. ${esc(q.label)} · ${q.points} P.</h4><div class="ls-solution"><strong> Musterlösung</strong><p style="white-space:pre-wrap;margin-bottom:0">${esc(q.solution||"Noch keine Musterlösung hinterlegt.")}</p></div></div>`;
 }).join("")}<div class="form-actions"><button class="secondary"onclick="downloadLernstandResultPDF('${id}')"> Als PDF herunterladen</button><button class="secondary"onclick="closeModal()">Schließen</button></div>`)});
}

async function submitLernstand(taskId,attempt){
 if(isTeacher()){toast("Lehrkräfte können keine Schülerantworten abgeben.");return}
 const tasks=await getLernstandTasks(),t=tasks.find(x=>x.id===taskId);if(!t)return;
 const existing=await getMyLernstandAttempts();if(existing.filter(x=>x.taskId===taskId).length>=3){toast("Für diese Lernstandsmessung sind bereits drei Versuche gespeichert.");return}
 const answers={},kprimFeedback={},competencies={};
 let autoPoints=0,missingOpen=false;
 t.tasks.forEach(q=>{
 if(q.type==="kprim"){
 const checked=(q.statements||[]).map((s,si)=>!!document.querySelector(`[data-kprim-task="${CSS.escape(q.id)}"][data-kprim-index="${si}"]`)?.checked);
 answers[q.id]=checked;
 const g=kprimGrade(q,checked);
 kprimFeedback[q.id]={errors:g.errors,total:g.total,allCorrect:g.allCorrect,points:g.points};
 competencies[q.id]=g.points;
 autoPoints+=g.points;
 }else{
 const val=$(`lsAnswer_${q.id}`)?.value.trim()||"";
 answers[q.id]=val;
 if(!val)missingOpen=true;
 }
 });
 if(missingOpen){toast("Bitte beantworte alle offenen Fragen, bevor du abgibst.");return}
 try{
 await addDoc(collection(db,"lernstandVersuche"),{uid:currentUser.uid,displayName:profile?.displayName||currentUser?.email||"Schüler/in",taskId:t.id,title:t.title,nr:t.nr,learningArea:t.learningArea,attempt,answers,competencies,kprimFeedback,total:autoPoints,status:"abgegeben",createdAt:serverTimestamp()});
 closeModal();
 showMotivationsBild();
 showLernstandSubmitFeedback(t,kprimFeedback,attempt);
 }catch(e){console.error("Lernstand speichern:",e);toast("Lernstand konnte nicht gespeichert werden.")}
}

function showLernstandSubmitFeedback(t,kprimFeedback,attempt){
 const kprimTasks=t.tasks.filter(q=>q.type==="kprim");
 const openTasks=t.tasks.filter(q=>q.type!=="kprim");
 const rows=kprimTasks.map(q=>{
 const g=kprimFeedback[q.id]||{};
 return`<div class="list-item"><div><strong>${esc(q.label)}</strong></div><span class="pill${g.allCorrect?"green":""}"style="${g.allCorrect?"":"background:#fad2d5;color:#b32b32"}">${g.allCorrect?"✅ Alles richtig":`❌ ${g.errors} von ${g.total} falsch`}</span></div>`;
 }).join("");
 modal(`<button class="modal-close"onclick="closeModal();render()">×</button><div class="kicker">✅ VERSUCH ${attempt} ABGEGEBEN</div><h2>${esc(t.title)}</h2>${kprimTasks.length?`<div class="list">${rows}</div>`:""}${openTasks.length?`<div class="notice"style="margin-top:12px"><strong>Offene Fragen</strong><p style="margin-bottom:0">Deine ${openTasks.length===1?"offene Antwort wurde":"offenen Antworten wurden"} gespeichert und ${openTasks.length===1?"wird":"werden"} von deiner Lehrkraft bewertet.</p></div>`:""}<div class="form-actions"><button class="primary"onclick="closeModal();render()">Weiter</button></div>`);
}

async function openLernstandTeacherOverview(){
 if(!isTeacher()){toast("Dieser Bereich ist nur für Lehrkräfte.");return}
 const tasks=await getLernstandTasks(),students=await getAllUsersForLernstand(),attempts=await getAllLernstandAttempts();
 const completedFor=s=>tasks.filter(t=>attempts.some(a=>a.uid===s.uid&&a.taskId===t.id)).length;
 const gradedFor=s=>tasks.filter(t=>attempts.some(a=>a.uid===s.uid&&a.taskId===t.id&&a.status==="bewertet")).length;
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> LEHRKRAFT</div><h2>Schülerübersicht</h2><p>Hier siehst du, wer welche Lernstandsmessungen bereits abgegeben oder bewertet hat. Klicke einen Schüler an, um alle Details und die Kompetenzentwicklung zu öffnen.</p><div class="toolbar"><input class="search"id="lsStudentSearch"placeholder="Schüler/in suchen …"oninput="filterLernstandStudents()"></div><div class="ls-student-grid"id="lsStudentGrid">${students.map(s=>`<div class="ls-student-row"data-student-name="${esc((s.displayName||s.email||"").toLowerCase())}"><div><strong>${esc(s.displayName||s.email||"Schüler/in")}</strong><small>${completedFor(s)}/${tasks.length} Messungen abgegeben · ${gradedFor(s)}/${tasks.length} bewertet</small></div><button class="primary"onclick="openLernstandStudent('${s.uid}')">Einblick →</button></div>`).join("")||`<div class="empty">Keine Schülerprofile gefunden.</div>`}</div><div class="form-actions"><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
}
function filterLernstandStudents(){const q=($('lsStudentSearch')?.value||'').toLowerCase().trim();document.querySelectorAll('#lsStudentGrid .ls-student-row').forEach(r=>r.hidden=!!q&&!r.dataset.studentName.includes(q))}

async function openLernstandStudent(uid){
 if(!isTeacher()){toast("Dieser Bereich ist nur für Lehrkräfte.");return}
 const tasks=await getLernstandTasks(),students=await getAllUsersForLernstand(),s=students.find(x=>x.uid===uid);if(!s)return;
 const attempts=(await getAllLernstandAttempts()).filter(a=>a.uid===uid).sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
 const latestByTask=tasks.map(t=>{const rows=attempts.filter(a=>a.taskId===t.id).sort((a,b)=>(b.attempt||0)-(a.attempt||0));return {t,a:rows[0]||null,rows}});
 const graded=attempts.filter(a=>a.status==="bewertet");
 const seriesByComp=LERNSTAND_COMPETENCIES.map(c=>({c,series:graded.map(a=>Number(a.competencies?.[c.id]??0))}));
 const avg=graded.length?((graded.reduce((n,a)=>n+((Number(a.total||0))/lernstandMaxPoints(a.taskId)),0)/graded.length)*100).toFixed(0):"—";
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> SCHÜLER · INDIVIDUELLER LERNSTAND</div><h2>${esc(s.displayName||s.email||"Schüler/in")}</h2><div class="ls-teacher-stats"><div class="card stat"><b>${attempts.length}</b><span>Versuche</span></div><div class="card stat"><b>${graded.length}</b><span>Bewertet</span></div><div class="card stat"><b>${avg}${avg==="—"?"":" %"}</b><span>Ø Erreichte Punkte</span></div><div class="card stat"><b>${graded.length?"Ja":"Nein"}</b><span>Kompetenzprofil</span></div></div><div class="ls-detail-grid"style="margin-top:14px"><section class="card"><div class="kicker">KOMPETENZENTWICKLUNG</div><h3>Fünf Dimensionen</h3>${seriesByComp.map(x=>{const last=x.series.length?x.series[x.series.length-1]:null;return`<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(x.c.label)}</strong><span>${last===null?"—":last+"/3"}</span></div>${last===null?"":lernstandBar(last,3)}</div>`}).join("")}</section><section class="card"><div class="kicker">FORTSCHRITT</div><h3>Lernstandsmessungen</h3><div class="ls-overview-scroll"><table class="ls-matrix"><thead><tr><th>#</th><th>Thema</th><th>Status</th><th>Punkte</th><th></th></tr></thead><tbody>${latestByTask.map(x=>`<tr><td>${x.t.nr}</td><td>${esc(x.t.title)}</td><td>${x.a?lernstandStatusPill(x.a.status):lernstandStatusPill("offen")}</td><td class="num">${x.a?.status==="bewertet"?`${x.a.total}/${lernstandMaxPoints(x.t.id)}`:"—"}</td><td>${x.a?`<button class="secondary"onclick="openLernstandTeacherAttempt('${x.a.id}')">Details</button>`:""}</td></tr>`).join("")}</tbody></table></div></section></div><div class="form-actions"><button class="secondary"onclick="openLernstandTeacherOverview()">← Schülerübersicht</button><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
}

// Lehrkraft-PDF: vollständiger Bewertungsbericht mit den tatsächlichen
// Schülerantworten, automatischer K-Prim-Auswertung und vergebenen Punkten.
async function downloadLernstandTeacherPDF(attemptId){
 try{
 const snap=await getDoc(doc(db,"lernstandVersuche",attemptId));if(!snap.exists()){toast("Versuch nicht gefunden.");return}
 const a={id:snap.id,...snap.data()},tasks=await getLernstandTasks(),t=tasks.find(x=>x.id===a.taskId);if(!t){toast("Thema nicht gefunden.");return}
 const competencies=a.competencies||{},kprimFeedback=a.kprimFeedback||{};
 const max=t.tasks.reduce((s,q)=>s+(Number(q.points)||0),0);
 const body=t.tasks.map((q,i)=>{
 if(q.type==="kprim"){
 const checked=Array.isArray(a.answers?.[q.id])?a.answers[q.id]:[];
 const fb=kprimFeedback[q.id]||{};
 const stmts=(q.statements||[]).map((s,si)=>{const wasChecked=!!checked[si];const isRight=wasChecked===!!s.correct;return`<tr><td style="width:26px">${wasChecked?"":""}</td><td style="width:26px">${isRight?"✅":"❌"}</td><td>${escPDF(s.text)}</td></tr>`}).join("");
 return`<div class="item"><strong>${escPDF(String(i+1)+"."+q.label)} · ${fb.points??competencies[q.id]??0}/${q.points} P. (automatisch)</strong><table style="margin-top:8px">${stmts}</table></div>`;
 }
 return`<div class="item"><strong>${escPDF(String(i+1)+"."+q.label)} · ${competencies[q.id]??"–"}/${q.points} P.</strong><div><em>Antwort:</em><br>${escPDF(a.answers?.[q.id]||"").replace(/\n/g,"<br>")}</div></div>`;
 }).join("");
 const scoreLine=a.status==="bewertet"?`Gesamt: ${a.total}/${max} Punkte (${lernstandStatusText(a.total,max)})`:`Gesamt bisher: ${Number(a.total)||0}/${max} Punkte (noch nicht vollständig bewertet)`;
 openToolPrintWindow(
 "Bewertungsbericht – "+(t.title||"Thema"),`<div class="item"style="background:#f5f7f8"><strong>${escPDF(a.displayName||"Schüler/in")} · Versuch ${a.attempt}/3</strong><br>${escPDF(scoreLine)}${a.feedback?`<br><em>Rückmeldung:</em> ${escPDF(a.feedback)}`:""}</div>`+body,"F12Sb · Lernstandsmessung"+t.nr+"/26 · "+(LERNSTAND_AREAS[t.learningArea]?.title||"")
 );
 }catch(e){console.error("Lernstand-Bewertungsbericht PDF:",e);toast("Das PDF konnte nicht erstellt werden.")}
}

async function openLernstandTeacherAttempt(attemptId){
 if(!isTeacher())return;
 const snap=await getDoc(doc(db,"lernstandVersuche",attemptId));if(!snap.exists()){toast("Versuch nicht gefunden.");return}
 const a={id:snap.id,...snap.data()},tasks=await getLernstandTasks(),t=tasks.find(x=>x.id===a.taskId);if(!t)return;
 const competencies=a.competencies||{},kprimFeedback=a.kprimFeedback||{};
 const max=t.tasks.reduce((s,q)=>s+(Number(q.points)||0),0);
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> BEWERTUNG · VERSUCH ${a.attempt}/3</div><h2>${esc(a.title)}</h2><p><strong>${esc(a.displayName||"Schüler/in")}</strong> · ${a.status==="bewertet"?`${a.total}/${max} · ${lernstandStatusText(a.total,max)}`:"noch nicht bewertet"}</p><div class="form">${t.tasks.map((q,i)=>{
 if(q.type==="kprim"){
 const checked=Array.isArray(a.answers?.[q.id])?a.answers[q.id]:[];
 const fb=kprimFeedback[q.id]||{};
 return`<div class="ls-task-box"><h4>${i+1}. ${esc(q.label)} · ${fb.points??competencies[q.id]??0}/${q.points} P. (automatisch)</h4><div class="ls-kprim-list">${(q.statements||[]).map((s,si)=>{const wasChecked=!!checked[si];const isRight=wasChecked===!!s.correct;return`<div class="ls-kprim-row"style="cursor:default"><span>${wasChecked?"":""}</span><span>${esc(s.text)} ${isRight?"✅":"❌"}</span></div>`}).join("")}</div><p style="margin-top:8px;color:var(--muted);font-size:12px">Automatisch bewertet: ${fb.errors??0} von ${fb.total??(q.statements||[]).length} Aussagen falsch beurteilt.</p></div>`;
 }
 return`<div class="ls-task-box"><h4>${i+1}. ${esc(q.label)} · ${q.points} P.</h4><div class="notice"><strong>Antwort des Schülers</strong><p style="white-space:pre-wrap;margin-bottom:0">${esc(a.answers?.[q.id]||"")}</p></div><label>Punkte (0–3)<input id="lsGrade_${q.id}"type="number"min="0"max="3"step="1"value="${Math.max(0,Math.min(3,Number(competencies[q.id]??0)))}"></label><details style="margin-top:8px"><summary>Musterlösung anzeigen</summary><div class="ls-solution"><p style="white-space:pre-wrap;margin-bottom:0">${esc(q.solution||"Noch keine Musterlösung hinterlegt.")}</p></div></details></div>`;
 }).join("")}<label>Rückmeldung an den Schüler<textarea id="lsTeacherFeedback"rows="4"placeholder="Kurze Rückmeldung …">${esc(a.feedback||"")}</textarea></label><div class="form-actions"><button class="secondary"onclick="downloadLernstandTeacherPDF('${a.id}')"> Als PDF herunterladen</button><button class="secondary"onclick="openLernstandStudent('${a.uid}')">Zurück</button><button class="primary"onclick="saveLernstandGrade('${a.id}')">Bewertung speichern</button></div></div>`);
}

async function saveLernstandGrade(attemptId){
 if(!isTeacher())return;
 try{
 const snap=await getDoc(doc(db,"lernstandVersuche",attemptId));if(!snap.exists())throw new Error("Versuch nicht gefunden");
 const a={id:snap.id,...snap.data()},tasks=await getLernstandTasks(),t=tasks.find(x=>x.id===a.taskId);if(!t)throw new Error("Messung nicht gefunden");
 const kprimFeedback=a.kprimFeedback||{};
 const competencies={};let total=0;
 t.tasks.forEach(q=>{
 if(q.type==="kprim"){
 const v=Number(kprimFeedback[q.id]?.points??a.competencies?.[q.id]??0);
 competencies[q.id]=v;total+=v;
 }else{
 const v=Math.max(0,Math.min(3,Math.round(Number($(`lsGrade_${q.id}`)?.value)||0)));
 competencies[q.id]=v;total+=v;
 }
 });
 await updateDoc(doc(db,"lernstandVersuche",attemptId),{competencies,total,status:"bewertet",feedback:$('lsTeacherFeedback')?.value.trim()||"",gradedBy:currentUser.uid,gradedAt:serverTimestamp()});
 toast("Bewertung gespeichert.");await openLernstandStudent(a.uid);
 }catch(e){console.error("Lernstand bewerten:",e);toast("Bewertung konnte nicht gespeichert werden.")}
}

async function openLernstandEditor(){
 if(!isTeacher()){toast("Dieser Bereich ist nur für Lehrkräfte.");return}
 const tasks=await getLernstandTasks();
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> AUFGABENVERWALTUNG</div><h2>26 Kompetenzüberprüfungen verwalten</h2><p>Nur Lehrkräfte können Aufgaben und Musterlösungen bearbeiten. Schüler sehen ausschließlich die veröffentlichten Aufgaben und können nur Antworten abgeben.</p><div class="list">${tasks.map(t=>`<div class="ls-item"><div class="ls-item-main"><strong>${t.nr}. ${esc(t.title)}</strong><small>${esc(LERNSTAND_AREAS[t.learningArea].title)}</small></div><button class="secondary"onclick="openLernstandTaskEditor('${t.id}')">Aufgaben bearbeiten</button></div>`).join("")}</div><div class="form-actions"><button class="secondary"onclick="openLernstandTeacherOverview()">Schülerübersicht</button><button class="secondary"onclick="closeModal()">Schließen</button></div>`);
}

async function openLernstandTaskEditor(id){
 if(!isTeacher()){toast("Nur Lehrkräfte können Aufgaben einstellen.");return}
 const tasks=await getLernstandTasks(),t=tasks.find(x=>x.id===id);if(!t)return;
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> ${t.nr}/26 · ${esc(LERNSTAND_AREAS[t.learningArea].title)}</div><h2>${esc(t.title)}</h2><div class="form"><label>Kurzer Überblick / Beschreibung<textarea id="lsEditDescription"rows="3">${esc(t.description||"")}</textarea></label>${t.tasks.map(q=>{
 if(q.type==="kprim"){
 return`<div class="ls-task-box"><h4>${esc(q.label)} · ${q.points} Punkte (K-Prim, automatisch bewertet)</h4><p style="color:var(--muted);font-size:12px">${esc(q.intro||"")}</p><div class="ls-kprim-list">${(q.statements||[]).map(s=>`<div class="ls-kprim-row"style="cursor:default"><span>${s.correct?"✅":"❌"}</span><span>${esc(s.text)}</span></div>`).join("")}</div><p style="margin-top:8px;color:var(--muted);font-size:11px">K-Prim-Aufgaben werden aktuell nicht über dieses Formular bearbeitet – melde dich bei Bedarf, dann passe ich die Aussagen im Code an.</p></div>`;
 }
 return`<div class="ls-task-box"><h4>${esc(q.label)} · ${q.points} Punkte</h4><label>Aufgabe<textarea id="lsEditPrompt_${q.id}"rows="5">${esc(q.prompt||"")}</textarea></label><label>Musterlösung<textarea id="lsEditSolution_${q.id}"rows="5">${esc(q.solution||"")}</textarea></label></div>`;
 }).join("")}<div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="saveLernstandTask('${t.id}')">Speichern</button></div></div>`);
}

async function saveLernstandTask(id){
 if(!isTeacher())return;
 const base=lernstandTaskById(id);if(!base)return;
 const updated={...base,description:$('lsEditDescription')?.value.trim()||base.description,tasks:base.tasks.map(q=>{
 if(q.type==="kprim")return q;
 return {...q,prompt:$(`lsEditPrompt_${q.id}`)?.value.trim()||"",solution:$(`lsEditSolution_${q.id}`)?.value.trim()||""};
 })};
 try{await setDoc(doc(db,"lernstandMessungen",id),{taskId:id,title:updated.title,nr:updated.nr,learningArea:updated.learningArea,description:updated.description,tasks:updated.tasks,updatedBy:currentUser.uid,updatedAt:serverTimestamp()},{merge:true});const local=lernstandStoredTasks();local[id]=updated;localStorage.setItem("campus_lernstand_tasks",JSON.stringify(local));closeModal();await render();toast("Lernstandsmessung gespeichert.")}catch(e){console.error("Lernstand bearbeiten:",e);toast("Lernstandsmessung konnte nicht gespeichert werden.")}
}

window.openLernstand=openLernstand;window.submitLernstand=submitLernstand;window.openLernstandEditor=openLernstandEditor;window.openLernstandTaskEditor=openLernstandTaskEditor;window.saveLernstandTask=saveLernstandTask;window.openLernstandTeacherOverview=openLernstandTeacherOverview;window.openLernstandStudent=openLernstandStudent;window.openLernstandTeacherAttempt=openLernstandTeacherAttempt;window.saveLernstandGrade=saveLernstandGrade;window.filterLernstandStudents=filterLernstandStudents;window.openLernstandResult=openLernstandResult;window.downloadLernstandResultPDF=downloadLernstandResultPDF;window.downloadLernstandTeacherPDF=downloadLernstandTeacherPDF;

let __campusRenderSeq=0;
async function render(){
 if(!currentUser)return;
 if(liveUnsubscribe){liveUnsubscribe();liveUnsubscribe=null;}
 if(liveUnsubHeimat){liveUnsubHeimat();liveUnsubHeimat=null;}
 if(liveUnsubMiniKalender){liveUnsubMiniKalender();liveUnsubMiniKalender=null;}
 const seq=++__campusRenderSeq;
 const p=location.hash.replace("#","")||"start";
 const pages={
 start:renderStart,klassenteam:renderKlassenteam,kompass:renderKompass,lernwerkstatt:renderLernwerkstatt,"ki-lernen":renderKILernen,
 faecher:renderFaecherUebersicht,fach:renderFachDetail,
 ressourcen:renderRessourcenRoute,lernpfad:renderLernpfadRoute,forum:renderForum,"forum-board":renderForumBoard,"forum-nachrichten":renderForumMessages,
 pinnwand:renderPinnwandUebersicht,"pinnwand-board":renderPinnwandBoard,
 kollaboration:renderKollaborationsTools,
 wortwolke:renderWortwolkeUebersicht,"wortwolke-board":renderWortwolkeBoard,
 kanban:renderKanbanUebersicht,"kanban-board":renderKanbanBoard,
 terminfindung:renderTerminfindungUebersicht,"terminfindung-board":renderTerminfindungBoard,
 teamgesucht:renderTeamgesuchtUebersicht,
 checkliste:renderChecklisteUebersicht,"checkliste-board":renderChecklisteBoard,
 ampel:renderAmpelUebersicht,"ampel-board":renderAmpelBoard,
 umfrage:renderUmfrageUebersicht,"umfrage-board":renderUmfrageBoard,
 zufallspicker:renderZufallspicker,
 lernwerkzeuge:renderLernWerkzeuge,
 karteikarten:renderKarteikartenUebersicht,"karteikarten-board":renderKarteikartenBoard,"fokus-timer":renderFokusTimer,"uhr-timer":renderUhrTimer,
 glossar:renderGlossar,
 fachaufsatz:renderFachaufsatzUebersicht,"fachaufsatz-board":renderFachaufsatzBoard,
 projekte:renderProjekte,kompetenz:renderKompetenz,journal:renderLernjournalRoute,
 resilienz:renderResilienz,fragenhilfe:renderFragenHilfe,
 kalender:renderKalender,team:renderTeam,
 impulse:renderLernimpulse,lernstand:renderLernstand,
 kompetenzprofil:()=>modulePlaceholder("Kompetenzprofil"),methoden:renderLernmethoden,lernstrategien:renderLernstrategienTest,metakognition:renderMetakognition,
 lerncoaching:renderLerncoaching
 };
 const fn=pages[p]||renderStart;
 document.querySelectorAll(".nav-link").forEach(a=>a.classList.toggle("active",
 a.dataset.page===p || (a.dataset.page==="forum" && p.startsWith("forum-"))));
 const content=$("content");
 if(!content)return;
 // Never leave a blank page while a module is loading.
 content.innerHTML=`<div class="card"style="margin:4px 0"><strong>Campus wird geladen …</strong><p style="margin:8px 0 0">Bitte einen Moment.</p></div>`;
 try{
 const html=await Promise.race([
 Promise.resolve().then(()=>fn()),
 new Promise((_,reject)=>setTimeout(()=>reject(new Error("Die Seite hat zu lange zum Laden gebraucht.")),10000))
 ]);
 if(seq!==__campusRenderSeq)return;
 content.innerHTML=html||`<div class="card"><h3>Keine Inhalte vorhanden.</h3></div>`;
 window.scrollTo(0,0);
 if(p==="kompetenz"){
 $("competencySearch")?.addEventListener("input",filterCompetencyNetwork);
 $("competencyCategory")?.addEventListener("change",filterCompetencyNetwork);
 $("competencyHelpersOnly")?.addEventListener("change",filterCompetencyNetwork);
 }
 if(p==="forum-board"){
 $("forumSearch")?.addEventListener("input",filterForumPosts);
 }
 if(p==="klassenteam"){
 subscribeHeimatkarteLive();
 }
 if(p==="start"){
 subscribeMiniKalenderLive();
 }
 if(p==="ampel-board"&&activeAmpelId){
 subscribeAmpelLive(activeAmpelId);
 }
 if(p==="wortwolke-board"&&activeWordcloudId){
 subscribeWordcloudLive(activeWordcloudId);
 }
 if(p==="pinnwand-board"&&activeBoardId){
 subscribePinnwandLive(activeBoardId);
 }
 if(p==="kanban-board"&&activeKanbanId){
 subscribeKanbanLive(activeKanbanId);
 }
 if(p==="checkliste-board"&&activeChecklistId){
 subscribeChecklistLive(activeChecklistId);
 }
 if(p==="umfrage-board"&&activePollId){
 getDoc(doc(db,"polls",activePollId)).then(snap=>{
 if(snap.exists())subscribePollLive(activePollId,snap.data().options||[]);
 });
 }
 if(p==="terminfindung-board"&&activeTermPollId){
 getDoc(doc(db,"termPolls",activeTermPollId)).then(snap=>{
 if(snap.exists())subscribeTerminfindungLive(activeTermPollId,snap.data().slots||[]);
 });
 }
 if(p==="methoden"){
 renderProkChips();
 }
 if(p==="lernstrategien"){
 listAnswers={};
 renderListItems();
 }
 if(p==="metakognition"){
 metaAnswers={};metaOpenPhase=null;metaScenarioAnswers={};
 renderMetaPhases();
 renderMetaScenarios();
 }
 if(p==="fokus-timer"){
 initPomodoroTimer();
 pomodoroUpdateDisplay();
 }
 if(p==="glossar"){
 $("glossarySearch")?.addEventListener("input",filterGlossary);
 }
 }catch(e){
 if(seq!==__campusRenderSeq)return;
 console.error("Campus-Seitenfehler:",e);
 content.innerHTML=`<div class="card"><h3>Die Seite konnte nicht geladen werden.</h3><p>${esc(e?.message||"Unbekannter Fehler")}</p><button class="primary"onclick="go('start')">← Zur Startseite</button></div>`;
 window.scrollTo(0,0);
 }
 updateTeacherTeamNav();
 $("sidebar")?.classList.remove("open");
}

function modulePlaceholder(title){
 return`${pageHead("CAMPUS-MODUL",title,"Dieser Bereich ist in der Master-Struktur vorbereitet.",`<button class="secondary"onclick="go('start')">← Startseite</button>`)}
 <div class="card"><span class="badge"> VORBEREITET</span><h2>${title}</h2><p>Dieser Bereich wird später als eigenes Modul
entwickelt. Die übrige Campus-App bleibt dabei unverändert.</p></div>${footer()}`;
}


/* =========================================================
 F12Sb – MODAL BRIDGE
 app.js wird als ES-Modul geladen. Funktionen aus einem
 ES-Modul sind nicht automatisch window-global.
 Die bestehenden Modal-Formulare verwenden jedoch inline
 onclick="...". Deshalb werden die benötigten Aktionen
 hier explizit nach window exportiert.
 ========================================================= */
window.addEventListener("error",e=>{
 console.error("Campus globaler Fehler:",e.error||e.message);
 const c=$("content");
 if(c && !c.innerHTML.trim()) c.innerHTML=`<div class="card"><h3>Campus konnte den Inhalt nicht laden.</h3><p>Bitte die Seite einmal neu laden.</p></div>`;
});
window.__CampusModalBridgeInstalled=true;
window.addCalendar=addCalendar;
window.openCalendarForm=openCalendarForm;

window.addCompetence=addCompetence;
window.addJournal=addJournal;
window.addPost=addPost;
window.openNewsForm=openNewsForm;
window.addNews=addNews;
window.addPractice=addPractice;
window.addProject=addProject;
window.addTask=addTask;
window.closeModal=closeModal;
window.commentPost=commentPost;
window.deletePost=deletePost;
window.deleteCampusEntry=deleteCampusEntry;
window.deleteCalendarEntry=deleteCalendarEntry;
window.openLernressource=openLernressource;
window.editLernressourceForm=editLernressourceForm;
window.updateLernressource=updateLernressource;
window.editCalendarEntry=editCalendarEntry;
window.updateCalendar=updateCalendar;
window.focusComment=focusComment;
window.likePost=likePost;

window.openCompetenceForm=openCompetenceForm;
window.openCompetencyHelp=openCompetencyHelp;
window.createCompetencyHelpPost=createCompetencyHelpPost;
window.openHelpForm=openHelpForm;
window.openJournalForm=openJournalForm;
window.openTeacherJournalOverview=openTeacherJournalOverview;
window.downloadStudentJournalPDF=downloadStudentJournalPDF;
window.downloadAllJournalsPDF=downloadAllJournalsPDF;
window.printMyJournals=printMyJournals;
window.printJournalEntry=printJournalEntry;
window.openJournalEntry=openJournalEntry;
window.openUserManagement=openUserManagement;
window.setUserStatus=setUserStatus;
window.setUserRole=setUserRole;
window.openPostForm=openPostForm;
window.openPracticeForm=openPracticeForm;
window.openKILearningLinkForm=openKILearningLinkForm;
window.saveKILearningLink=saveKILearningLink;
window.deleteKILearningLink=deleteKILearningLink;
window.resilienzImpuls=resilienzImpuls;
window.openResonanzatmung=openResonanzatmung;
window.startResilienzSkill=startResilienzSkill;
window.openResilienzSchatzkiste=openResilienzSchatzkiste;
window.updateResilienzStress=updateResilienzStress;
window.toggleResonanzTimer=toggleResonanzTimer;
window.resilienzCheckin=resilienzCheckin;

window.openProjectForm=openProjectForm;
window.openTaskForm=openTaskForm;
window.openClassTeamUpdateForm=openClassTeamUpdateForm;
window.saveClassTeamUpdate=saveClassTeamUpdate;

window.openNewMessagePicker=openNewMessagePicker;

// Diese vier Handler werden in onclick-Attributen verwendet, waren aber
// bisher nicht exportiert – da app.js als <script type="module"> geladen
// wird, blieben die zugehörigen Buttons dadurch wirkungslos.
window.deleteNews=deleteNews;
window.render=render;
window.resilienzSkillDone=resilienzSkillDone;
window.toggleResilienzSchatz=toggleResilienzSchatz;
window.openConversation=openConversation;
window.closeConversation=closeConversation;
window.replyToMessage=replyToMessage;
window.cancelMessageReply=cancelMessageReply;
window.editMessage=editMessage;
window.cancelEditMessage=cancelEditMessage;
window.saveEditMessage=saveEditMessage;
window.deleteMessage=deleteMessage;
window.deleteConversation=deleteConversation;
window.hideMessage=hideMessage;
window.sendMessage=sendMessage;

window.openBoard=openBoard;
window.closePinnwandBoard=closePinnwandBoard;
window.openBoardForm=openBoardForm;
window.addBoard=addBoard;
window.deleteBoard=deleteBoard;
window.openBoardPostForm=openBoardPostForm;
window.selectBoardNoteColor=selectBoardNoteColor;
window.addBoardPost=addBoardPost;
window.deleteBoardPost=deleteBoardPost;

window.openWordcloud=openWordcloud;
window.closeWortwolke=closeWortwolke;
window.openWordcloudForm=openWordcloudForm;
window.addWordcloud=addWordcloud;
window.submitWordcloudWord=submitWordcloudWord;
window.deleteWordcloud=deleteWordcloud;
window.resetWordcloud=resetWordcloud;

window.openKanban=openKanban;
window.closeKanban=closeKanban;
window.openKanbanBoardForm=openKanbanBoardForm;
window.addKanbanBoard=addKanbanBoard;
window.deleteKanbanBoard=deleteKanbanBoard;
window.openKanbanCardForm=openKanbanCardForm;
window.addKanbanCard=addKanbanCard;
window.moveKanbanCard=moveKanbanCard;
window.deleteKanbanCard=deleteKanbanCard;

window.openTerminfindung=openTerminfindung;
window.closeTerminfindung=closeTerminfindung;
window.openTermPollForm=openTermPollForm;
window.addTermPoll=addTermPoll;
window.saveTermVote=saveTermVote;
window.deleteTermPoll=deleteTermPoll;

window.openTeamAdForm=openTeamAdForm;
window.addTeamAd=addTeamAd;
window.toggleTeamInterest=toggleTeamInterest;
window.deleteTeamAd=deleteTeamAd;

window.openChecklist=openChecklist;
window.closeChecklist=closeChecklist;
window.openChecklistForm=openChecklistForm;
window.addChecklist=addChecklist;
window.deleteChecklist=deleteChecklist;
window.openChecklistItemForm=openChecklistItemForm;
window.addChecklistItem=addChecklistItem;
window.toggleChecklistItem=toggleChecklistItem;
window.deleteChecklistItem=deleteChecklistItem;

window.showImpressum=showImpressum;
window.openReportForm=openReportForm;
window.submitReport=submitReport;
window.resolveReport=resolveReport;
window.deleteReport=deleteReport;

window.downloadBoardPDF=downloadBoardPDF;
window.downloadWordcloudPDF=downloadWordcloudPDF;
window.downloadKanbanPDF=downloadKanbanPDF;
window.downloadTermPollPDF=downloadTermPollPDF;
window.downloadTeamAdsPDF=downloadTeamAdsPDF;
window.downloadChecklistPDF=downloadChecklistPDF;
window.editProjectForm=editProjectForm;
window.updateProject=updateProject;
window.exportCampusCalendarICS=exportCampusCalendarICS;
window.exportCalendarDayICS=exportCalendarDayICS;

window.openAmpel=openAmpel;
window.closeAmpel=closeAmpel;
window.openAmpelForm=openAmpelForm;
window.addAmpelRound=addAmpelRound;
window.editAmpelForm=editAmpelForm;
window.updateAmpelRound=updateAmpelRound;
window.setAmpelResponse=setAmpelResponse;
window.deleteAmpelRound=deleteAmpelRound;
window.downloadAmpelPDF=downloadAmpelPDF;

window.openUmfrage=openUmfrage;
window.closeUmfrage=closeUmfrage;
window.openPollForm=openPollForm;
window.addPoll=addPoll;
window.editPollForm=editPollForm;
window.updatePoll=updatePoll;
window.savePollVote=savePollVote;
window.deletePoll=deletePoll;
window.downloadPollPDF=downloadPollPDF;

window.pickRandomStudent=pickRandomStudent;
window.resetPickedStudents=resetPickedStudents;
window.openRandomListForm=openRandomListForm;
window.addRandomList=addRandomList;
window.editRandomListForm=editRandomListForm;
window.updateRandomList=updateRandomList;
window.pickFromRandomList=pickFromRandomList;
window.deleteRandomList=deleteRandomList;

window.openDeck=openDeck;
window.closeDeck=closeDeck;
window.flipStudyCard=flipStudyCard;
window.studyNextCard=studyNextCard;
window.studyPrevCard=studyPrevCard;
window.shuffleDeck=shuffleDeck;
window.openDeckForm=openDeckForm;
window.addDeck=addDeck;
window.editDeckForm=editDeckForm;
window.updateDeck=updateDeck;
window.deleteDeck=deleteDeck;
window.openCardForm=openCardForm;
window.addCard=addCard;
window.editCardForm=editCardForm;
window.updateCard=updateCard;
window.deleteCard=deleteCard;
window.downloadDeckPDF=downloadDeckPDF;

window.startPomodoro=startPomodoro;
window.pausePomodoro=pausePomodoro;
window.resetPomodoro=resetPomodoro;

window.openGlossaryForm=openGlossaryForm;
window.addGlossaryEntry=addGlossaryEntry;
window.editGlossaryForm=editGlossaryForm;
window.updateGlossaryEntry=updateGlossaryEntry;
window.deleteGlossaryEntry=deleteGlossaryEntry;
window.downloadGlossaryPDF=downloadGlossaryPDF;

window.openEssayCase=openEssayCase;
window.closeEssayCase=closeEssayCase;
window.openEssayCaseForm=openEssayCaseForm;
window.addEssayCase=addEssayCase;
window.deleteEssayCase=deleteEssayCase;
window.saveEssayEntry=saveEssayEntry;
window.downloadEssayPDF=downloadEssayPDF;

window.openLernpfadCheckinForm=openLernpfadCheckinForm;
window.selectLernpfadStrategy=selectLernpfadStrategy;
window.addLernpfadCheckin=addLernpfadCheckin;
window.openLernpfadOutcomeForm=openLernpfadOutcomeForm;
window.saveLernpfadOutcome=saveLernpfadOutcome;
window.deleteLernpfadEntry=deleteLernpfadEntry;
window.requestEssayFeedback=requestEssayFeedback;
window.openTeacherFeedbackForm=openTeacherFeedbackForm;
window.submitTeacherFeedback=submitTeacherFeedback;
window.openEssayModelCompare=openEssayModelCompare;
window.openEssayModelAnswersForm=openEssayModelAnswersForm;
window.saveEssayModelAnswers=saveEssayModelAnswers;


/* CAMPUS MODULE BRIDGE
 ES-Module erhalten die gemeinsamen Render-Helfer über window.
*/
window.__CampusModuleBridge=true;
window.CampusFirebase=window.CampusFirebase||{};
window.CampusFirebase.pageHead=pageHead;
window.CampusFirebase.footer=footer;
window.CampusFirebase.modal=modal;
window.CampusFirebase.toast=toast;

window.addEventListener("hashchange",()=>render());
window.go=p=>{const target=String(p||"start"); if(location.hash!=="#"+target) location.hash=target; else render();};

function openTaskForm(){
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">CAMPUS-KOMPASS</div><h2>Neue
Aufgabe</h2><div class="form"><label>Aufgabe<input id="fTitle"placeholder="Was soll erledigt werden?"required></label>
<label>Verantwortlich<input id="fOwner"placeholder="Name"></label><label>Deadline<input id="fDeadline"type="date"></label>
<label>Status<select id="fStatus"><option value="green">Auf Kurs</option><option value="yellow">Klärungsbedarf</option><option
value="red">Handlungsbedarf</option></select></label><label>Nächste Schritte<textarea id="fNext"rows="3"></textarea></label><div
class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="addTask()">Speichern</button></div></div>`);
}
async function addTask(){
 try{await addDoc(collection(db,"tasks"),{title:$("fTitle").value.trim()||"Neue Aufgabe",ownerName:$("fOwner").value.trim()||profile.displayName,ownerUid:currentUser.uid,deadline:cleanDateInput($("fDeadline").
value),status:$("fStatus").value,next:$("fNext").value.trim()||"Nächsten Schritt festlegen",createdBy:currentUser.uid,createdAt:serverTimestamp()});closeModal();await render();toast("Aufgabe gespeichert.")}catch(e){toast("Speichern nicht möglich.");console.error(e)}
}
function openNewsForm(){
 if(!isTeacher()){toast("Nur Lehrkräfte können News veröffentlichen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">CAMPUS-NEWS · LEHRKRAFT</div><h2>News veröffentlichen</h2><div class="form"><label>Überschrift<input id="newsTitle"placeholder="Kurze Überschrift"required></label><label>News<textarea id="newsText"rows="6"placeholder="Was sollen die Campus-Mitglieder wissen?"required></textarea></label><div style="margin-top:-8px;margin-bottom:10px">${emojiPickerHTML("newsText","emojiPickerNews")}</div><div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="addNews()">Veröffentlichen</button></div></div>`);
}

async function addNews(){
 if(!isTeacher()){toast("Nur Lehrkräfte können News veröffentlichen.");return}
 const title=$("newsTitle")?.value.trim()||"",text=$("newsText")?.value.trim()||"";
 if(!title||!text){toast("Bitte Überschrift und News eingeben.");return}
 try{await addDoc(collection(db,"news"),{authorUid:currentUser.uid,authorName:profile?.displayName||currentUser?.email||"Lehrkraft",title,text,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});closeModal();await render();toast("News veröffentlicht.")}catch(e){console.error(e);toast("News konnte nicht veröffentlicht werden.")}
}

// ---- Emoji-Picker (wiederverwendbar für Forum-Beiträge und Nachrichten) --
const EMOJI_PICKER_LISTE=["😀","😂","🥰","😅","😉","🙂","😊","😍","🤔","😮","😢","😡","👍","👎","❤️","🔥","🎉","👏","🙏","💡","✅","❌","🤝","🚀","📚","🎓","😴","🥳","💪","👀"];
function emojiPickerHTML(targetId,pickerId){
 return `<div style="position:relative;display:inline-block">
 <button type="button"class="secondary"onclick="toggleEmojiPicker('${pickerId}')"title="Emoji einfügen">😊</button>
 <div id="${pickerId}"class="emoji-picker"hidden>
 ${EMOJI_PICKER_LISTE.map(e=>`<button type="button"onclick="insertEmoji('${targetId}','${e}','${pickerId}')">${e}</button>`).join("")}
 </div>
 </div>`;
}
function toggleEmojiPicker(pickerId){
 const el=$(pickerId);
 if(!el)return;
 document.querySelectorAll(".emoji-picker").forEach(p=>{if(p.id!==pickerId)p.hidden=true});
 el.hidden=!el.hidden;
}
function insertEmoji(targetId,emoji,pickerId){
 const field=$(targetId);
 if(field){
 const start=field.selectionStart??field.value.length;
 const end=field.selectionEnd??field.value.length;
 field.value=field.value.slice(0,start)+emoji+field.value.slice(end);
 field.focus();
 field.selectionStart=field.selectionEnd=start+emoji.length;
 }
 const picker=$(pickerId);
 if(picker)picker.hidden=true;
}
window.toggleEmojiPicker=toggleEmojiPicker;window.insertEmoji=insertEmoji;
document.addEventListener("click",e=>{
 if(e.target.closest(".emoji-picker")||e.target.closest('[onclick^="toggleEmojiPicker"]'))return;
 document.querySelectorAll(".emoji-picker").forEach(p=>p.hidden=true);
});

function openPostForm(defaultType="question"){
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">CAMPUS-FORUM</div><h2>Beitrag
schreiben</h2><div class="form"><label>Kategorie<select id="pType"><option value="question"
${defaultType==="question"?"selected":""}> Frage</option><option value="info" ${defaultType==="info"?"selected":""}>
Info</option><option value="idea" ${defaultType==="idea"?"selected":""}> Idee</option><option value="project">
Projekt</option><option value="practice"> Praxis</option></select></label><label>Beitrag<textarea id="pText"rows="5"placeholder="Was möchtest du teilen?"required></textarea></label><div style="margin-top:-8px;margin-bottom:10px">${emojiPickerHTML("pText","emojiPickerPost")}</div><div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="addPost()">Veröffentlichen</button></div></div>`);
}
async function addPost(){
 const text=$("pText").value.trim();if(!text){toast("Bitte Beitrag eingeben.");return}
 try{await addDoc(collection(db,"posts"),
{authorUid:currentUser.uid,authorName:profile.displayName,type:$("pType").value,text,likes:0,comments:
[],createdAt:serverTimestamp()});closeModal();await render();toast("Beitrag veröffentlicht.")}catch(e){toast("Beitrag konnte nicht gespeichert werden.");console.error(e)}
}
async function likePost(id){
 try{
 if(!currentUser || !profile || profile.status!=="approved"){
 toast("Nur freigeschaltete Nutzer können Beiträge bewerten.");
 return false;
 }

 const ref=doc(db,"posts",id);
 const snap=await getDoc(ref);
 if(!snap.exists()){
 toast("Der Beitrag wurde nicht gefunden.");
 return false;
 }

 const data=snap.data()||{};
 const currentLikes=Number(data.likes||0);
 await updateDoc(ref,{likes:currentLikes+1});

 document.querySelectorAll(`[data-like-post="${CSS.escape(id)}"]`).forEach(b=>{
 b.textContent=`Gefällt mir (${currentLikes+1})`;
 b.disabled=true;
 b.style.pointerEvents="none";
 });
 return false;
 }catch(e){
 console.error("Gefällt mir:",e);
 toast(e?.code==="permission-denied"
 ?"Gefällt mir ist in den Firebase-Regeln nicht freigegeben."
 :"Gefällt mir konnte nicht gespeichert werden.");
 return false;
 }
} async function commentPost(id){
 const input=$("comment-"+id), text=input.value.trim();if(!text)return;
 try{await updateDoc(doc(db,"posts",id),{comments:arrayUnion({uid:currentUser.uid,name:profile.displayName,text,createdAt:new
Date().toISOString()})});await render()}catch(e){toast("Antwort konnte nicht gespeichert werden.")}
}
function focusComment(id){setTimeout(()=>{const e=$("comment-"+id);if(e)
{e.focus();e.scrollIntoView({behavior:"smooth",block:"center"});}},80)}
async function deleteNews(id){
 if(!isAdmin()){toast("Nur der Admin kann News löschen.");return}
 if(!confirm("News wirklich löschen?"))return;
 try{await deleteDoc(doc(db,"news",id));await render();toast("News gelöscht.")}catch(e){console.error(e);toast("News konnte nicht gelöscht werden.")}
}
async function deletePost(id){if(!isTeacher()){toast("Nur Lehrkräfte können Beiträge löschen.");return}if(!confirm("Beitrag wirklich löschen?"))return;try{await deleteDoc(doc(db,"posts",id));await render()}catch(e){console.error(e);toast("Löschen nicht erlaubt.")}}
async function deleteCampusEntry(collectionName,id,label="Eintrag"){
 if(!isTeacher()){toast("Nur Lehrkräfte können Einträge löschen.");return}
 if(!confirm(`${label} wirklich löschen?`))return;
 try{await deleteDoc(doc(db,collectionName,id));await render();toast(`${label} gelöscht.`)}catch(e){console.error("Löschen:",collectionName,id,e);toast("Löschen nicht erlaubt.")}
}
async function deleteCalendarEntry(collectionName,id){
 if(!isTeacher()){toast("Nur Lehrkräfte können Termine löschen.");return}
 if(!confirm("Termin wirklich löschen?"))return;
 try{await deleteDoc(doc(db,collectionName,id));closeModal();await render();toast("Termin gelöscht.")}catch(e){console.error("Termin löschen:",e);toast("Termin konnte nicht gelöscht werden.")}
}
function openHelpForm(){openPostForm("idea")}
function openProjectForm(){
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">PROJEKTE</div><h2>Projekt anlegen</h2>
<div class="form"><label>Projektname<input id="xTitle"></label><label>Team<input id="xTeam"></label><label>Praxispartner<input
id="xPartner"></label><label>Ziel<textarea id="xGoal"rows="3"></textarea></label><label>Fortschritt (0–100)<input id="xProgress"type="number"min="0"max="100"value="0"></label><label>Frist (optional)<input id="xDeadline"type="date"></label><div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="addProject()">Speichern</button></div></div>`);
}
async function addProject(){try{await addDoc(collection(db,"projects"),{title:$("xTitle").value.trim()||"Neues Projekt",team:$("xTeam").value.trim()||"Team",partner:$("xPartner").value.trim()||"—",progress:Math.max(0,Math.min(100,Number($("xProgress").value)||0)),status:"green",goal:$("xGoal").value.trim()||"Ziel ergänzen",deadline:$("xDeadline").value||"",createdBy:currentUser.uid,createdAt:serverTimestamp()});closeModal();await render();toast("Projekt angelegt.")}catch(e)
{toast("Projekt konnte nicht angelegt werden.")}}

function editProjectForm(id,title,team,partner,goal,progress,deadline){
 window.__editProjectId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">PROJEKTE</div><h2>Projekt bearbeiten</h2>
<div class="form"><label>Projektname<input id="xTitle"value="${esc(title||"")}"></label><label>Team<input id="xTeam"value="${esc(team||"")}"></label><label>Praxispartner<input
id="xPartner"value="${esc(partner||"")}"></label><label>Ziel<textarea id="xGoal"rows="3">${esc(goal||"")}</textarea></label><label>Fortschritt (0–100)<input id="xProgress"type="number"min="0"max="100"value="${Number(progress||0)}"></label><label>Frist (optional)<input id="xDeadline"type="date"value="${esc(deadline||"")}"></label><div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="updateProject()">Speichern</button></div></div>`);
}
async function updateProject(){
 const id=window.__editProjectId;
 if(!id)return;
 try{
 await updateDoc(doc(db,"projects",id),{
 title:$("xTitle").value.trim()||"Neues Projekt",
 team:$("xTeam").value.trim()||"Team",
 partner:$("xPartner").value.trim()||"—",
 goal:$("xGoal").value.trim()||"Ziel ergänzen",
 progress:Math.max(0,Math.min(100,Number($("xProgress").value)||0)),
 deadline:$("xDeadline").value||""
 });
 closeModal();await render();toast("Projekt aktualisiert.");
 }catch(e){
 console.error("Projekt aktualisieren:",e);
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Projekt konnte nicht aktualisiert werden.");
 }
}
function openJournalForm(){
 location.hash="journal";
 setTimeout(()=>{
 const field=$("jTitle");
 if(field)field.focus();
 },100);
}

function journalEntryText(j){
 return [
 ["Zielerreichung (letztes Ziel)",j.goalAchieved],
 ["Woran habe ich heute gearbeitet?",j.workedOn],
 ["Was habe ich verstanden oder gelernt?",j.learned],
 ["Was war schwierig?",j.difficult],
 ["Was hat mir geholfen? Welche Methode/Strategie hat funktioniert?",j.helpful],
 ["Ein Gedanke über mein Lernen",j.metaThought],
 ["Mein nächster Lernschritt",j.nextStep]
 ].filter(x=>x[1]).map(x=>x[0]+"\n"+x[1]).join("\n\n");
}

async function addJournal(){
 const title=$("jTitle")?.value.trim()||"";
 const journalDate=$("jDate")?.value||new Date().toISOString().slice(0,10);
 const goalAchieved=$("jGoalAchieved")?.value||"";
 const workedOn=$("jWorkedOn")?.value.trim()||"";
 const learned=$("jLearned")?.value.trim()||"";
 const difficult=$("jDifficult")?.value.trim()||"";
 const helpful=$("jHelpful")?.value.trim()||"";
 const metaThought=$("jMetaThought")?.value.trim()||"";
 const nextStep=$("jNextStep")?.value.trim()||"";
 const mood=$("jMood")?.value||"";
 const satisfaction=$("jSatisfaction")?.value||"";

 if(!title){
 toast("Bitte einen Titel eingeben.");
 $("jTitle")?.focus();
 return;
 }
 if(!learned){
 toast("Bitte festhalten, was du verstanden oder gelernt hast.");
 $("jLearned")?.focus();
 return;
 }

 try{
 await addDoc(collection(db,"journal"),{
 uid:currentUser.uid,
 displayName:profile?.displayName||currentUser?.email||"Campus-Mitglied",
 title,
 journalDate,
 goalAchieved,
 workedOn,
 learned,
 difficult,
 helpful,
 metaThought,
 nextStep,
 mood,
 satisfaction,
 text:journalEntryText({goalAchieved,workedOn,learned,difficult,helpful,metaThought,nextStep}),
 createdAt:serverTimestamp(),
 updatedAt:serverTimestamp()
 });

 await render();
 showMotivationsBild();
 toast("Lernjournal gespeichert.");
 }catch(error){
 console.error("Lernjournal speichern:",error);
 toast("Lernjournal konnte nicht gespeichert werden.");
 }
}

async function getMyJournalEntries(){
 const snap=await getDocs(collection(db,"journal"));
 const entries=snap.docs
 .map(d=>({id:d.id,...d.data()}))
 .filter(j=>j.uid===currentUser.uid);

 entries.sort((a,b)=>{
 const ad=a.journalDate||"";
 const bd=b.journalDate||"";
 if(ad!==bd)return bd.localeCompare(ad);
 return (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0);
 });

 return entries;
}

function openJournalEntry(id){
 getMyJournalEntries().then(entries=>{
 const j=entries.find(x=>x.id===id);
 if(!j){
 toast("Lernjournal nicht gefunden.");
 return;
 }
 const canManage=j.uid===currentUser.uid||isTeacher();

 modal(`
 <button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker"> LERNJOURNAL · ${esc(journalDisplayDate(j))}</div>
 <h2>${esc(j.title||"Lernjournal")}</h2>
 ${j.mood?`<span class="pill">Befinden: ${esc(j.mood)}</span>`:""}
 ${j.satisfaction?`<span class="pill">Zufriedenheit: ${esc(j.satisfaction)}</span>`:""}

 ${j.goalAchieved?`<div class="journal-detail journal-c-blau"><strong>Zielerreichung (letztes Ziel)</strong><p>${esc(j.goalAchieved)}</p></div>`:""}
 ${j.workedOn?`<div class="journal-detail"><strong>Woran habe ich heute gearbeitet?</strong><p>${esc(j.workedOn)}</p></div>`:""}
 ${j.learned?`<div class="journal-detail journal-c-gruen"><strong>Was habe ich verstanden oder gelernt?</strong><p>${esc(j.learned)}</p></div>`:""}
 ${j.difficult?`<div class="journal-detail journal-c-orange"><strong>Was war schwierig?</strong><p>${esc(j.difficult)}</p></div>`:""}
 ${j.helpful?`<div class="journal-detail journal-c-blau"><strong>Was hat mir geholfen? Welche Methode/Strategie hat funktioniert?</strong><p>${esc(j.helpful)}</p></div>`:""}
 ${j.metaThought?`<div class="journal-detail journal-c-lila"><strong>Ein Gedanke über mein Lernen</strong><p>${esc(j.metaThought)}</p></div>`:""}
 ${j.nextStep?`<div class="journal-detail journal-c-teal"><strong>Mein nächster Lernschritt</strong><p>${esc(j.nextStep)}</p></div>`:""}

 <div class="form-actions">
 <button class="secondary"onclick="closeModal()">Schließen</button>
 <button class="primary"onclick="closeModal();printJournalEntry('${esc(j.id)}')"> Als PDF</button>
 ${canManage?`<button class="secondary"onclick="deleteJournalEntry('${esc(j.id)}')">Löschen</button>`:""}
 </div>
 `);
 }).catch(error=>{
 console.error(error);
 toast("Lernjournal konnte nicht geöffnet werden.");
 });
}
async function deleteJournalEntry(id){
 if(!confirm("Diesen Lernjournal-Eintrag wirklich löschen?"))return;
 try{
 await deleteDoc(doc(db,"journal",id));
 closeModal();
 await render();
 toast("Lernjournal-Eintrag gelöscht.");
 }catch(e){
 console.error("Lernjournal löschen:",e);
 toast("Eintrag konnte nicht gelöscht werden.");
 }
}
window.deleteJournalEntry=deleteJournalEntry;

async function printJournalEntry(id){
 try{
 const entries=await getMyJournalEntries();
 const j=entries.find(x=>x.id===id);
 if(!j){
 toast("Lernjournal nicht gefunden.");
 return;
 }

 openJournalPrintWindow(
 "Lernjournal – "+(j.title||"Reflexion"),
 [{
 uid:currentUser.uid,
 name:profile?.displayName||currentUser?.email||"Schüler/in",
 entries:[j]
 }]
 );
 }catch(error){
 console.error(error);
 toast("Das Lernjournal konnte nicht als PDF geöffnet werden.");
 }
}

async function printMyJournals(){
 try{
 const entries=await getMyJournalEntries();
 if(!entries.length){
 toast("Noch keine Lernjournale vorhanden.");
 return;
 }

 openJournalPrintWindow(
 "Meine Lernjournale",
 [{
 uid:currentUser.uid,
 name:profile?.displayName||currentUser?.email||"Schüler/in",
 entries
 }]
 );
 }catch(error){
 console.error(error);
 toast("Die Lernjournale konnten nicht als PDF geöffnet werden.");
 }
}

function openCompetenceForm(){
 const categories=["Auftreten & Kommunikation","Schreiben & Sprache","Lernen & Denken","Mathematik & analytisches Denken","Kreativität & Gestaltung","Digital & KI","Zusammenarbeit","Persönliche Stärken","Musik & Ausdruck","Sport & Bewegung","Praktisches & Handwerk","Sonstiges"];
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker"> MEINE KOMPETENZ</div><h2>Was kannst du gut?</h2><p>Auch Dinge, die dir selbstverständlich vorkommen, können für andere wertvoll sein.</p><div class="form">
 <label> Meine Kompetenz<input id="cName"placeholder="z. B. Präsentieren, Canva, Singen, gut erklären …"required></label>
 <label> Bereich<select id="cCategory">${categories.map(c=>`<option>${esc(c)}</option>`).join("")}</select></label>
 <label> Wie gut schätzt du dich ein?<select id="cLevel"><option value="1"> 1 – probiere ich gerade aus</option><option value="2"> 2 – kann ich schon etwas</option><option value="3"selected> 3 – kann ich gut</option><option value="4"> 4 – kann ich sehr gut</option><option value="5"> 5 – kann ich anderen zeigen</option></select></label>
 <label> Was genau kannst du?<textarea id="cDescription"rows="3"placeholder="Zum Beispiel: Ich kann Präsentationen übersichtlich gestalten und frei vor Gruppen sprechen."></textarea></label>
 <label><input id="cCanHelp"type="checkbox"> <strong>Ich kann anderen dabei helfen.</strong></label>
 <label> Wenn jemand Hilfe braucht …<textarea id="cHelpText"rows="2"placeholder="Wobei könntest du helfen?"></textarea></label>
 <div class="notice"><strong> Campus-Gedanke</strong><p>Du musst nicht in allem gut sein. Eine einzige Fähigkeit kann für jemanden anderen genau das sein, was gerade gebraucht wird.</p></div>
 <div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="addCompetence()">Kompetenz eintragen</button></div></div>`);
}
async function addCompetence(){
 const name=$("cName")?.value.trim();if(!name){toast("Bitte eine Kompetenz eintragen.");return}
 try{
 await addDoc(collection(db,"competencies"),{uid:currentUser.uid,ownerName:profile?.displayName||currentUser?.email||"Campus-Mitglied",name,category:$("cCategory").value,level:Math.max(1,Math.min(5,Number($("cLevel").value)||1)),description:$("cDescription").value.trim()||"",canHelp:Boolean($("cCanHelp").checked),helpText:$("cHelpText").value.trim()||"",createdAt:serverTimestamp()});
 closeModal();await render();showMotivationsBild();toast("Kompetenz ins Netzwerk aufgenommen.");
 }catch(e){console.error("Kompetenz speichern:",e);toast("Kompetenz konnte nicht gespeichert werden.")}
}

function openPracticeForm(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Praxisaufträge erstellen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">PRAXIS</div>
<h2>Praxisauftrag</h2><div class="form"><label>Titel<input id="rTitle"></label><label>Datum<input id="rDate"type="date"></label>
<label>Beschreibung<textarea id="rText"rows="4"></textarea></label><div class="form-actions"><button class="secondary"onclick="closeModal()">Abbrechen</button><button class="primary"onclick="addPractice()">Speichern</button></div></div>`)}
async function addPractice(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Praxisaufträge erstellen.");return}
 try{await addDoc(collection(db,"practice"),
{module:"fachreferat",type:"teacherAssignment",title:$("rTitle").value.trim()||"Praxisauftrag",date:cleanDateInput($("rDate").value),state:"offen",text:$("rText").value.trim()
||"Beschreibung ergänzen",createdBy:currentUser.uid,createdAt:serverTimestamp()});closeModal();await
render();toast("fpA-Praxisauftrag gespeichert.")}catch(e){console.error(e);toast("fpA-Praxisauftrag konnte nicht gespeichert werden.")}}

function openCalendarForm(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Termine eintragen.");return}
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">CAMPUS-KALENDER · LEHRKRAFT</div><h2>Termin eintragen</h2>
 <div class="form">
 <label>Titel *<input id="calTitle"type="text"placeholder="z. B. Schulaufgabe Pädagogik"required></label>
 <label>Terminart *
 <select id="calType">
 <option value="schulaufgabe">Schulaufgabe</option>
 <option value="kurzarbeit">Kurzarbeit</option>
 <option value="projektvorstellung">Projektvorstellung</option>
 <option value="referat">Referat</option>
 <option value="praesentation">Präsentation</option>
 <option value="sonstiges">Sonstiger Termin / frei wählbar</option>
 </select>
 </label>
 <label>Datum *<input id="calDate"type="date"required></label>
 <label>Uhrzeit<input id="calTime"type="time"></label>
 <label>Ort<input id="calLocation"type="text"placeholder="z. B. F203"></label>
 <label>Beschreibung / weitere Informationen<textarea id="calDescription"rows="5"placeholder="Freie Informationen zum Termin …"></textarea></label>
 <div class="form-actions"><button class="secondary"type="button"onclick="closeModal()">Abbrechen</button>
 <button id="calendarSaveBtn"class="primary"type="button">Termin speichern</button></div>
 </div>`);
 const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
 $("calDate").value=d.toISOString().slice(0,10);
 $("calendarSaveBtn").addEventListener("click",addCalendar);
}

async function addCalendar(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Termine eintragen.");return}
 const title=$("calTitle")?.value.trim()||"",date=$("calDate")?.value||"",
 time=$("calTime")?.value||"",location=$("calLocation")?.value.trim()||"",
 description=$("calDescription")?.value.trim()||"",type=$("calType")?.value||"sonstiges";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(!date){toast("Bitte ein Datum auswählen.");return}
 const payload={title,date,start:date,type,time,location,description,
 createdBy:currentUser.uid,createdByName:profile?.displayName||currentUser.email||"Campus-Mitglied",
 createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
 const btn=$("calendarSaveBtn");if(btn){btn.disabled=true;btn.textContent="Speichert …"}
 try{
 await addDoc(collection(db,"events"),payload);
 closeModal();toast("Termin gespeichert.");await render();
 }catch(e){
 console.error("Kalender events:",e);
 try{
 await addDoc(collection(db,"calendar"),payload);
 closeModal();toast("Termin gespeichert.");await render();
 }catch(e2){
 console.error("Kalender calendar:",e2);
 if(btn){btn.disabled=false;btn.textContent="Termin speichern"}
 toast(e2?.code==="permission-denied"?"Speichern von Terminen ist in den Firebase-Regeln nicht freigegeben.":"Termin konnte nicht gespeichert werden.");
 }
 }
}

function editCalendarEntry(collectionName,id,title,type,date,time,location,description){
 if(!isTeacher()){toast("Nur Lehrkräfte können Termine bearbeiten.");return}
 window.__editCalendarCollection=collectionName;
 window.__editCalendarId=id;
 modal(`<button class="modal-close"onclick="closeModal()">×</button>
 <div class="kicker">CAMPUS-KALENDER · LEHRKRAFT</div><h2>Termin bearbeiten</h2>
 <div class="form">
 <label>Titel *<input id="calTitle"type="text"value="${esc(title||"")}"required></label>
 <label>Terminart *
 <select id="calType">
 <option value="schulaufgabe">Schulaufgabe</option>
 <option value="kurzarbeit">Kurzarbeit</option>
 <option value="projektvorstellung">Projektvorstellung</option>
 <option value="referat">Referat</option>
 <option value="praesentation">Präsentation</option>
 <option value="sonstiges">Sonstiger Termin / frei wählbar</option>
 </select>
 </label>
 <label>Datum *<input id="calDate"type="date"value="${esc(date||"")}"required></label>
 <label>Uhrzeit<input id="calTime"type="time"value="${esc(time||"")}"></label>
 <label>Ort<input id="calLocation"type="text"value="${esc(location||"")}"></label>
 <label>Beschreibung / weitere Informationen<textarea id="calDescription"rows="5">${esc(description||"")}</textarea></label>
 <div class="form-actions"><button class="secondary"type="button"onclick="closeModal()">Abbrechen</button>
 <button id="calendarSaveBtn"class="primary"type="button">Änderungen speichern</button></div>
 </div>`);
 const typeSel=$("calType");
 if(typeSel)typeSel.value=type||"sonstiges";
 $("calendarSaveBtn").addEventListener("click",updateCalendar);
}

async function updateCalendar(){
 if(!isTeacher()){toast("Nur Lehrkräfte können Termine bearbeiten.");return}
 const collectionName=window.__editCalendarCollection;
 const id=window.__editCalendarId;
 if(!collectionName||!id)return;
 const title=$("calTitle")?.value.trim()||"",date=$("calDate")?.value||"",
 time=$("calTime")?.value||"",location=$("calLocation")?.value.trim()||"",
 description=$("calDescription")?.value.trim()||"",type=$("calType")?.value||"sonstiges";
 if(!title){toast("Bitte einen Titel eingeben.");return}
 if(!date){toast("Bitte ein Datum auswählen.");return}
 const btn=$("calendarSaveBtn");if(btn){btn.disabled=true;btn.textContent="Speichert …"}
 try{
 await updateDoc(doc(db,collectionName,id),{title,date,start:date,type,time,location,description,updatedAt:serverTimestamp()});
 closeModal();toast("Termin aktualisiert.");await render();
 }catch(e){
 console.error("Termin aktualisieren:",e);
 if(btn){btn.disabled=false;btn.textContent="Änderungen speichern"}
 toast(e?.code==="permission-denied"?"Firebase verweigert die Änderung. Bitte die Firestore-Regeln prüfen.":"Termin konnte nicht aktualisiert werden.");
 }
}


async function init(){
 if(!configReady){
 showAuth();
 $("authError").textContent="Die Firebase-Konfiguration fehlt noch.";
 return;
 }
 try{
 await loadFirebase();
 onAuthStateChanged(auth,async user=>{
 clearListeners();
 currentUser=user;
 if(!user){profile=null;showAuth();return}
 try{
 await ensureProfile(user);

 if(!profile){
 showAuth();
 $("authError").textContent="Benutzerprofil konnte nicht geladen werden.";
 return;
}

if(profile.status === "blocked"){
 showAuth();
 $("authError").textContent="Dein Zugang wurde von der Schule gesperrt. Bitte wende dich an die zuständige Lehrkraft oder Administration.";
 return;
 }

 if(profile.status !== "approved"){
 showAuth();
 $("authError").textContent="Dein Konto wurde angelegt, ist aber noch nicht freigeschaltet. Bitte warte auf die Bestätigung durch die Schule.";
 return;
 }

 showApp();
}
 catch(e){console.error(e);showAuth();$("authError").textContent="Benutzerprofil konnte nicht geladen werden."}
 });
 }catch(e){
 console.error("Firebase konnte nicht geladen werden:",e);
 showAuth();
 $("authError").textContent="Firebase konnte nicht geladen werden. Der Reiter „Konto erstellen“ sollte trotzdem funktionieren.";
 }
}
init();


/* =========================================================
 ROBUST INTERACTION BRIDGE – KALENDER & IMPULSE
 ========================================================= */
(function(){
 if(window.__CampusInteractionBridgeInstalled)return;
 window.__CampusInteractionBridgeInstalled=true;

 document.addEventListener("click", async function(ev){
 const el=ev.target.closest("[data-calendar-add],[data-calendar-day],[data-impulse-id],[data-open-impulse]");
 if(!el)return;

 ev.preventDefault();
 ev.stopPropagation();

 try{
 if(el.hasAttribute("data-calendar-add")){
 if(typeof window.openCalendarForm==="function") window.openCalendarForm();
 else if(typeof openCalendarForm==="function") openCalendarForm();
 return;
 }

 if(el.hasAttribute("data-calendar-day")){
 const raw=el.getAttribute("data-calendar-day");
 const parts=raw.split("-").map(Number);
 if(parts.length===3 && typeof window.openCalendarDay==="function"){
 window.openCalendarDay(parts[0],parts[1],parts[2]);
 }
 return;
 }

 const impulseId=el.getAttribute("data-impulse-id")||el.getAttribute("data-open-impulse");
 if(impulseId){
 if(typeof window.openImpulse==="function") window.openImpulse(impulseId);
 else if(typeof window.openImpuls==="function") window.openImpuls(impulseId);
 else if(typeof window.openImpulseModal==="function") window.openImpulseModal(impulseId);
 else{
 const data=window._campusImpulses||window.impulses||[];
 const item=data.find(x=>String(x.id)===String(impulseId));
 if(item){
 const title=item.title||item.name||"Impuls";
 const body=item.text||item.content||item.description||"";
 if(typeof window.modal==="function") window.modal(`<button class="modal-close"onclick="closeModal()">×</button><div class="kicker">IMPULS</div><h2>${esc(title)}</h2><p>${esc(body)}</p>`);
 }
 }
 }
 }catch(err){
 console.error("Campus Interaction:",err);
 }
 },true);
})();


/* Compatibility aliases */
if(typeof window.openCalendarForm!=="function" && typeof openCalendarForm==="function") window.openCalendarForm=openCalendarForm;
if(typeof window.addCalendar!=="function" && typeof addCalendar==="function") window.addCalendar=addCalendar;
if(typeof window.openCalendarDay!=="function" && typeof openCalendarDay==="function") window.openCalendarDay=openCalendarDay;
if(typeof window.openImpulse!=="function" && typeof openImpulse==="function") window.openImpulse=openImpulse;
if(typeof window.openImpuls!=="function" && typeof openImpuls==="function") window.openImpuls=openImpuls;
if(typeof window.openImpulseModal!=="function" && typeof openImpulseModal==="function") window.openImpulseModal=openImpulseModal;


try{ if(typeof closeResilienzModal==="function") window.closeResilienzModal=closeResilienzModal; }catch(_){}


/* Robust close handler for"Impuls für mich" */
(function(){
 if(window.__ImpulsCloseFixInstalled)return;
 window.__ImpulsCloseFixInstalled=true;
 document.addEventListener("click",function(ev){
 const btn=ev.target.closest('[data-close-impuls-modal]');
 if(!btn)return;
 ev.preventDefault();
 ev.stopPropagation();
 try{
 if(typeof window.closeModal==="function") window.closeModal();
 else if(typeof closeModal==="function") closeModal();
 }catch(err){ console.error("Impuls schließen:",err); }
 },true);
})();

