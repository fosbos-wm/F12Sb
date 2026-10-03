# Einarbeitung (interaktive Selbstlernkurse, F12Sb)

Die interaktiven Kurse laufen immer über **dieselbe Seite** (`player.html`). Nur der Inhalt liegt je Kurs in einer eigenen Datei:

    einarbeitung/inhalte/<Kurs-ID>.json

Die App zeigt Kurse im **Modulplan der 12. Klasse** (Unterricht Pädagogik und Psychologie → ＋ Zusatzmodul → Selbstlernkurs → Feld „Kurs“) zur Auswahl an.

## Ordner im Repo

    einarbeitung/
    ├── player.html          die Kursseite (immer dieselbe)
    ├── README.md            diese Anleitung
    └── inhalte/
        ├── _vorlage.json    Vorlage zum Kopieren
        ├── f12-fa01.json    Basiskurs Fachaufsatztraining (Instanzenmodell nach Freud)
        ├── f12-freud1.json  Freud: Instanzenmodell (Es, Ich, Über-Ich)
        ├── f12-freud2.json  Freud: Psychosexuelle Entwicklung und Fixierung
        └── f12-freud3.json  Freud: Abwehrmechanismen

## Neuen Kurs anlegen

1. `inhalte/_vorlage.json` kopieren und in `<Kurs-ID>.json` umbenennen (z. B. `f12-bindung1.json`).
2. Titel, Seiten, Texte und Aufgaben ersetzen. Am Anfang der Datei stehen `"modulart": "selbstlern"` und `"lb": 1` (Lernbereich 1 bis 4). Beides bestimmt, wie der Kurs in der Auswahl benannt wird („Titel · Selbstlernkurs · LB1“).
3. `"entwurf": true` entfernen, sobald der Kurs fertig ist (sonst steht oben ein Entwurf-Hinweis).
4. Datei in den Ordner `einarbeitung/inhalte` hochladen.
5. In **app.js** die Kurs-ID in die Liste `PPM_EA_IDS` eintragen (Suche nach `PPM_EA_IDS`), zum Beispiel:
   `const PPM_EA_IDS=["f12-fa01","f12-freud1","f12-freud2","f12-freud3","f12-bindung1"];`

## Aufbau der Datei

- `titel`, `modulart`, `lb`, `einleitung` (optional): Überschrift, Art, Lernbereich und kurze Einführung.
- `abschnitte`: Liste der Seiten. Jede Seite hat `titel`, optional `kicker` (kleine Zeile darüber) und `bloecke`.
- `bloecke`: Inhalte und Aufgaben in der Reihenfolge, in der sie auf der Seite stehen.
- Text: `**fett**` mit doppelten Sternen. Ein Absatz, der mit `- ` beginnt, wird zur Liste.

## Inhaltsblöcke

| typ | Felder |
| --- | --- |
| `text` | `text` |
| `merke` | `text`, optional `label` (Standard „Merke“) |
| `situation` | `text`, optional `label` (Standard „Lernsituation“) |
| `zitat` | `text`, optional `quelle` |
| `notizen` | `items` (Aussagen als Notizzettel), optional `beschriftung` |
| `schema` | `links`, `rechts`, `mitte` (zwei Zeilen), optional `beschriftung` |
| `fussnote` | `text` |
| `aufbau` | `zeilen`: Liste von `{label, farbe, text}`, optional `legende` (Liste von `{name, farbe}`) |

## Aufgabentypen

| typ | Felder |
| --- | --- |
| `mc` | `frage`, `optionen`, `richtig` (Zählung ab 0), `erklaerung` |
| `lueckentext` | `titel`, `text` mit `{{Wort}}` für Lücken, `woerter` (Auswahl inkl. Ablenker) |
| `zuordnung` | `titel`, `paare`: Liste von `[Begriff, Erklärung]` |
| `sortieren` | `titel`, `kategorien`: Liste von `{name, items}` |
| `kprim` | `stamm`, `aussagen`: Liste von `{text, richtig, erklaerung}` |
| `frei` | `frage`, `hinweis`, `muster`, optional `kriterien` (Selbstcheck-Punkte nach der Musterlösung) |
| `reihenfolge` | `titel`, `hinweis`, `absaetze` (in der **richtigen** Reihenfolge, die Seite mischt sie) |
| `strukturstreifen` | `titel`, `aufgabe`, `hinweis`, `felder`: Liste von `{titel, farbe, hilfe, muster}`; `farbe` = `pfirsich`, `blau`, `gelb`, `rot` oder `gruen` |

## Was gespeichert wird

Die App speichert „Kurs abgeschlossen“ (mit Datum) und die Zahl der richtig gelösten Aufgaben. Beides sehen die Person selbst und die Lehrkraft. Eigene Texte der Schüler:innen bleiben im Browser.
