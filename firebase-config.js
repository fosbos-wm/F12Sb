/* =========================================================
 Verbindung zum Firebase-Projekt der 12Sb_2627.
 Diese Datei ist die EINZIGE, die du nach dem Anlegen des
 neuen Firebase-Projekts (Region europe-west3, Frankfurt)
 anpassen musst: Werte aus Projekteinstellungen → Allgemein →
 „Meine Apps“ → Web-App → SDK-Konfiguration einsetzen.
 ========================================================= */
export const firebaseConfig = {
  apiKey: "AIzaSyBmG6fjW3wCEVQmGj7alsohezfDvwqbhDU",
  authDomain: "sb2627-1548c.firebaseapp.com",
  projectId: "sb2627-1548c",
  storageBucket: "sb2627-1548c.firebasestorage.app",
  messagingSenderId: "962773487018",
  appId: "1:962773487018:web:64ad0c378ba8bef27b2fd3"
};
/* Kürzel der Klasse (steht in den Zugangscodes als Klassenmarkierung). */
export const APP_KLASSE = "12sb2627";
/* Technische Domain für die Anmelde-Adressen (pseudonym@<domain>). Sie wird den
   Schülern nie angezeigt und es werden dorthin keine E-Mails versendet.
   NACH dem ersten Einrichten eines Schülerkontos NICHT mehr ändern. */
export const APP_MAILDOMAIN = "12sb2627.invalid";
