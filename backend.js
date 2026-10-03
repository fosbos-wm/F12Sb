/* Datenschicht der Experiment-App.
   - Mit eingetragener Firebase-Konfiguration (firebase-config.js) läuft alles über Firebase (Anonyme Anmeldung + Firestore).
   - Ohne Konfiguration startet ein Demo-Modus, der nur im eigenen Browser läuft (zum Ausprobieren; mehrere Tabs sehen sich). */

export const CODE_LAENGE = 6; // Muss zu den Regeln in firestore.rules passen ([0-9]{6})

export function neuerCode(){
  const a = new Uint32Array(CODE_LAENGE); crypto.getRandomValues(a);
  return [...a].map(x => x % 10).join('');
}
export function konfigOk(cfg){
  const leer = v => !v || /^(DEIN|YOUR|HIER)/i.test(String(v));
  return !!cfg && !leer(cfg.apiKey) && !leer(cfg.projectId);
}
const fehler = (code, msg) => Object.assign(new Error(msg || code), { code });

export async function createBackend(cfg){
  return konfigOk(cfg) ? await firebaseBackend(cfg) : demoBackend();
}

/* ======================= Firebase ======================= */
async function firebaseBackend(cfg){
  const V = '10.12.2', U = `https://www.gstatic.com/firebasejs/${V}/`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(U + 'firebase-app.js'), import(U + 'firebase-auth.js'), import(U + 'firebase-firestore.js')
  ]);
  const app = initializeApp(cfg), auth = A.getAuth(app), db = F.getFirestore(app);
  const uid = () => auth.currentUser && auth.currentUser.uid;
  const raumRef = c => F.doc(db, 'raeume', c);
  const sub = (c, name) => F.collection(db, 'raeume', c, name);

  return {
    demo: false,
    async start(){
      await new Promise(res => { const un = A.onAuthStateChanged(auth, () => { un(); res(); }); });
      if (!auth.currentUser) await A.signInAnonymously(auth);
      let lehrer = false, email = '';
      const u = auth.currentUser;
      if (u && !u.isAnonymous){
        try { lehrer = (await F.getDoc(F.doc(db, 'lehrer', u.uid))).exists(); } catch (e) {}
        email = u.email || '';
        if (!lehrer){ await A.signOut(auth); await A.signInAnonymously(auth); email = ''; }
      }
      return { uid: uid(), lehrer, email };
    },
    async raumLesen(code){
      const s = await F.getDoc(raumRef(code));
      return s.exists() ? { code, ...s.data() } : null;
    },
    /* Gruppe per Los, aber gleich große Gruppen: Die kleinere Gruppe wird zuerst aufgefüllt, bei Gleichstand entscheidet der Zufall. */
    async beitreten(code, name){
      const tRef = F.doc(db, 'raeume', code, 'teilnehmer', uid());
      return F.runTransaction(db, async tx => {
        const t = await tx.get(tRef);
        if (t.exists()) return { gruppe: t.data().gruppe, name: t.data().name, neu: false };
        const r = await tx.get(raumRef(code));
        if (!r.exists()) throw fehler('kein-raum');
        const d = r.data();
        if (!d.offen) throw fehler('geschlossen');
        const g = d.anzA < d.anzB ? 'A' : d.anzB < d.anzA ? 'B' : (Math.random() < .5 ? 'A' : 'B');
        tx.set(tRef, { name, gruppe: g, beigetretenAt: F.serverTimestamp() });
        tx.update(raumRef(code), g === 'A' ? { anzA: d.anzA + 1 } : { anzB: d.anzB + 1 });
        return { gruppe: g, name, neu: true };
      });
    },
    async ergebnisSenden(code, gruppe, woerter){
      const b = F.writeBatch(db);
      b.set(F.doc(db, 'raeume', code, 'ergebnisse', uid()), { gruppe, woerter, at: F.serverTimestamp() });
      b.update(F.doc(db, 'raeume', code, 'teilnehmer', uid()), { woerter, fertigAt: F.serverTimestamp() });
      await b.commit();
    },
    onRaum(code, cb, err){
      return F.onSnapshot(raumRef(code), s => cb(s.exists() ? { code, ...s.data() } : null), err);
    },
    onErgebnisse(code, cb, err){
      return F.onSnapshot(sub(code, 'ergebnisse'), s => cb(s.docs.map(d => d.data())), err);
    },
    /* ---- Lehrkraft ---- */
    async lehrerLogin(email, pw){
      const cred = await A.signInWithEmailAndPassword(auth, email, pw);
      const ok = (await F.getDoc(F.doc(db, 'lehrer', cred.user.uid))).exists();
      if (!ok){ await A.signOut(auth); await A.signInAnonymously(auth); throw fehler('kein-lehrer'); }
      return { email: cred.user.email };
    },
    async lehrerLogout(){ await A.signOut(auth); await A.signInAnonymously(auth); },
    async raumAnlegen(titel){
      for (let i = 0; i < 8; i++){
        const code = neuerCode();
        if ((await F.getDoc(raumRef(code))).exists()) continue;
        try {
          await F.setDoc(raumRef(code), { titel, lehrerUid: uid(), offen: true, vergleichFrei: false, anzA: 0, anzB: 0, createdAt: F.serverTimestamp() });
          return code;
        } catch (e) { if (i === 7) throw e; }
      }
      throw fehler('kein-code');
    },
    onMeineRaeume(cb, err){
      const q = F.query(F.collection(db, 'raeume'), F.where('lehrerUid', '==', uid()));
      return F.onSnapshot(q, s => {
        const l = s.docs.map(d => ({ code: d.id, ...d.data() }));
        const t = r => (r.createdAt && r.createdAt.seconds) || 9e12;
        cb(l.sort((a, b) => t(b) - t(a)));
      }, err);
    },
    onTeilnehmer(code, cb, err){
      return F.onSnapshot(sub(code, 'teilnehmer'), s => cb(s.docs.map(d => ({ uid: d.id, ...d.data() }))), err);
    },
    async raumUpdate(code, patch){ await F.updateDoc(raumRef(code), patch); },
    async raumLoeschen(code){
      for (const name of ['ergebnisse', 'teilnehmer']){
        const docs = (await F.getDocs(sub(code, name))).docs;
        for (let i = 0; i < docs.length; i += 400){
          const b = F.writeBatch(db); docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit();
        }
      }
      await F.deleteDoc(raumRef(code));
    }
  };
}

/* ======================= Demo (nur dieser Browser) ======================= */
function demoBackend(){
  const KEY = 'expapp-demo-db';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { raeume: {} }; } catch (e) { return { raeume: {} }; } };
  let db = load();
  const subs = new Set();
  const notify = () => subs.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  const save = () => { localStorage.setItem(KEY, JSON.stringify(db)); notify(); };
  addEventListener('storage', e => { if (e.key === KEY){ db = load(); notify(); } });
  let uid = sessionStorage.getItem('expapp-demo-uid');
  if (!uid){ uid = 'u' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('expapp-demo-uid', uid); }
  const istLehrer = () => sessionStorage.getItem('expapp-demo-lehrer') === '1';
  const sub = (compute, cb) => { const f = () => cb(compute()); subs.add(f); setTimeout(f, 0); return () => subs.delete(f); };
  const raumOut = c => { const r = db.raeume[c]; if (!r) return null; const { teilnehmer, ergebnisse, ...rest } = r; return { code: c, ...rest }; };

  return {
    demo: true,
    async start(){ return { uid, lehrer: istLehrer(), email: istLehrer() ? 'demo@lehrkraft' : '' }; },
    async raumLesen(code){ db = load(); return raumOut(code); },
    async beitreten(code, name){
      db = load();
      const r = db.raeume[code];
      if (!r) throw fehler('kein-raum');
      if (r.teilnehmer[uid]) return { gruppe: r.teilnehmer[uid].gruppe, name: r.teilnehmer[uid].name, neu: false };
      if (!r.offen) throw fehler('geschlossen');
      const g = r.anzA < r.anzB ? 'A' : r.anzB < r.anzA ? 'B' : (Math.random() < .5 ? 'A' : 'B');
      r.teilnehmer[uid] = { name, gruppe: g, beigetretenAt: Date.now() };
      if (g === 'A') r.anzA++; else r.anzB++;
      save();
      return { gruppe: g, name, neu: true };
    },
    async ergebnisSenden(code, gruppe, woerter){
      db = load();
      const r = db.raeume[code];
      if (!r || !r.teilnehmer[uid]) throw fehler('kein-raum');
      r.ergebnisse[uid] = { gruppe, woerter, at: Date.now() };
      r.teilnehmer[uid].woerter = woerter; r.teilnehmer[uid].fertigAt = Date.now();
      save();
    },
    onRaum(code, cb){ return sub(() => raumOut(code), cb); },
    onErgebnisse(code, cb){ return sub(() => Object.values((db.raeume[code] || { ergebnisse: {} }).ergebnisse), cb); },
    async lehrerLogin(email, pw){
      if (!email || !pw) throw fehler('falsche-daten');
      sessionStorage.setItem('expapp-demo-lehrer', '1'); return { email };
    },
    async lehrerLogout(){ sessionStorage.removeItem('expapp-demo-lehrer'); },
    async raumAnlegen(titel){
      db = load();
      let code; do { code = neuerCode(); } while (db.raeume[code]);
      db.raeume[code] = { titel, lehrerUid: 'demo-lehrer', offen: true, vergleichFrei: false, anzA: 0, anzB: 0, createdAt: { seconds: Math.floor(Date.now() / 1000) }, teilnehmer: {}, ergebnisse: {} };
      save(); return code;
    },
    onMeineRaeume(cb){ return sub(() => Object.keys(db.raeume).map(raumOut).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds), cb); },
    onTeilnehmer(code, cb){ return sub(() => Object.entries((db.raeume[code] || { teilnehmer: {} }).teilnehmer).map(([u, t]) => ({ uid: u, ...t })), cb); },
    async raumUpdate(code, patch){ db = load(); Object.assign(db.raeume[code], patch); save(); },
    async raumLoeschen(code){ db = load(); delete db.raeume[code]; save(); }
  };
}
