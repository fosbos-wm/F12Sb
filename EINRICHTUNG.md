# Einrichtung 12Sb_2627 (Frankfurt, Pseudonym-Anmeldung)

## 1. Neues Firebase-Projekt (einmalig, Reihenfolge einhalten)
1. console.firebase.google.com → **Projekt hinzufügen** (z. B. „12Sb_2627“). Google Analytics **ausschalten**.
2. **Firestore Database → Datenbank erstellen**, Standort **`europe-west3` (Frankfurt)**, Produktionsmodus. Der Standort lässt sich später nicht mehr ändern.
3. **Storage → Los geht's**, Standort ebenfalls **`europe-west3`** (Blaze-Tarif nötig; Budgetwarnung unter „Nutzung und Abrechnung“ einrichten).
4. **Authentication → Anmeldemethode → E-Mail/Passwort** aktivieren (E-Mail-Link **nicht** nötig).
5. **Authentication → Einstellungen → Autorisierte Domains**: `fosbos-wm.github.io` eintragen.
6. **Firestore → Regeln**: Inhalt von `firestore.rules` einfügen, **Veröffentlichen**.
7. **Storage → Regeln**: Inhalt von `storage.rules` einfügen, **Veröffentlichen**.
8. **Projekteinstellungen → Allgemein → Meine Apps → Web-App** (</>) registrieren, „Firebase Hosting“ nicht aktivieren. Die angezeigte `firebaseConfig` kopieren.
9. **App Check** (Build → App Check): Web-App mit reCAPTCHA Enterprise/v3 registrieren, danach Erzwingung für Firestore/Storage einschalten (erst nach dem Test, siehe unten).
10. In der **Google-Cloud-Konsole → APIs & Dienste → Anmeldedaten** den Browser-API-Schlüssel auf den HTTP-Referrer `https://fosbos-wm.github.io/*` beschränken.
11. **Authentication → Einstellungen → Passwortrichtlinie**: Mindestlänge 6 (Schüler-PIN) belassen.

## 2. App mit dem Projekt verbinden
Nur die Datei **`firebase-config.js`** bearbeiten: die Werte aus Schritt 8 einsetzen (alles, was mit `HIER_` beginnt). Danach alle Dateien des Ordners ins neue GitHub-Repo hochladen (z. B. `12Sb_2627`, GitHub Pages aktivieren). Die Adresse im QR-Code der Startseite (`qr-f12sb.png`) und auf den Zugangskarten gilt für `https://fosbos-wm.github.io/12Sb_2627/`. Heißt das Repo anders, die Datei `qr-f12sb.png` und den Link in `app.js` (Suche nach `12Sb_2627`) anpassen.

## 3. Erstes Admin-Konto
1. Auf der Seite **Lehrkraft → Konto erstellen** mit dienstlicher E-Mail registrieren.
2. Firebase-Konsole → Firestore → Sammlung `users` → Dokument mit deiner UID: `role` = `admin`, `status` = `approved` setzen.
3. Neu anmelden. Weitere Lehrkräfte registrieren sich genauso und werden von dir in der Benutzerverwaltung freigeschaltet und zur Lehrkraft gemacht.

## 4. Schüler einrichten
1. Als Lehrkraft: **Benutzerverwaltung → Zugangskarten erzeugen**. Optional Namen eintragen (nur zum Ausdrucken der Lehrkraft-Liste, nichts wird gespeichert). Karten drucken und austeilen.
2. Schüler: QR-Code scannen oder Seite öffnen → **Erstmals einrichten** → Code, Pseudonym und PIN wählen.
3. Die Namensliste (CSV) vertraulich lokal aufbewahren, **nicht** in die App hochladen. Zum Anzeigen der Namen in deinem Browser in der Benutzerverwaltung **Namensliste (CSV) laden**.
4. PIN vergessen: Benutzerverwaltung → **Zurücksetzen** (Admin) löscht die Daten der Person. Danach das Anmeldekonto in Firebase → Authentication löschen (Adresse `pseudonym@12sb2627.invalid`), neue Karte ausgeben.

## 5. Schuljahresende
Als Admin in der Datenschutzerklärung: **Schuljahresende: Klasse löschen**. Danach Anmeldekonten (Authentication) und Dateien (Storage) in der Konsole löschen.

## 6. Test vor dem Einsatz
- Karte erzeugen, mit einem zweiten Browser einrichten, anmelden, abmelden, erneut anmelden.
- Zweiten Versuch mit demselben Code: muss abgelehnt werden.
- Lehnt Firebase die technische Adresse ab (Fehler `auth/invalid-email`), in `firebase-config.js` `APP_MAILDOMAIN` auf eine andere Domain setzen (z. B. `12sb2627.example.com`) **vor** dem ersten Schülerkonto.
- Erst wenn alles läuft, App Check erzwingen.

## 7. Inhalte aus dem alten Projekt (optional)
Siehe Export/Import mit `gcloud firestore export/import`. Schülerdaten nicht mitnehmen.
