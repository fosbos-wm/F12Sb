# Neue Anmeldung (wie 11Sb_2627)

Schüler: Reiter "Anmelden" (Pseudonym + PIN) und "Erstmals einrichten" (Zugangscode von der Karte + Pseudonym + PIN, mind. 6 Zeichen; QR-Code auf der Karte öffnet die Einrichtung mit vorausgefülltem Code).
Lehrkräfte: Reiter "Lehrkraft" (Pseudonym oder E-Mail + Passwort; "Konto erstellen" nur mit Pseudonym, danach Freischaltung durch Admin; Passwort-Reset mit Wiederherstellungscode).

Schritte nach dem Hochladen:
1. firestore.rules in der Firebase-Konsole (Firestore -> Regeln) einfügen und VERÖFFENTLICHEN (neu: Sammlung einladungen, neue Create-Regel für users).
2. Als Admin/Lehrkraft anmelden -> Benutzerverwaltung -> "Zugangskarten erzeugen" -> Karten drucken und austeilen.
3. Bestehende Schülerkonten: bleiben gültig (Anmeldung mit Pseudonym + bisherigem Passwort im Feld "PIN").
4. PIN vergessen: Admin -> Benutzerverwaltung -> Zurücksetzen, dann Anmeldekonto in Firebase -> Authentication löschen, neue Karte ausgeben.
