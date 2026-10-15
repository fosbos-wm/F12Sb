# Lernrallye-Vorlagen

`vorlagen.json` enthält fertige Lernrallyes als Liste. In der Lehrkraft-Ansicht eines Moduls „Lernrallye“ legt der Knopf
„📥 Stationen aus Vorlage laden“ alle Stationen einer Vorlage auf einmal an (neue Codes, danach wie gewohnt bearbeitbar).

Enthalten: „Psychosexuelle Entwicklung nach Freud“ (LB 12.1) in vier Etappen, eine je Unterrichtsstunde:
`psychosexuell-e1` bis `psychosexuell-e4`. Je Etappe ein eigenes Lernrallye-Modul anlegen und die passende Vorlage laden.

## Felder je Vorlage

| Feld | Bedeutung |
| --- | --- |
| `id` | eindeutiger Schlüssel |
| `titel` | Titel des Moduls (wird übernommen, wenn das Häkchen gesetzt ist) |
| `unter` | Untertitel in der Auswahl |
| `rModus` | `team` oder `einzeln` |
| `rFreischaltung` | `offen`, `reihe` oder `qr` |
| `stationen` | Liste der Stationen |

## Felder je Station

`titel`, `typ` (`info`, `wahl`, `kprim`, `text`, `zuordnen`, `frei`), `punkte`, `text` (Markdown: `## Überschrift`, `- Aufzählung`, `**fett**`),
`frage`, `erklaerung` (Rückmeldung nach der Antwort, bei `frei` die Musterlösung), je nach Art `optionen` + `richtig` (Nummer ab 0),
`aussagen` (`{t, ok}`), `antworten` (Liste), `paare` (`{l, r}`). Die Felder `id` und `code` vergibt die App.

## Hinweis zu den Lehrtexten

Die Lehrtexte (M2, M4, M5, M6, M7) stehen nicht in der Datei, weil sie aus Schulbüchern stammen und das Repository öffentlich ist.
Sie liegen an den Stationen im Schulhaus auf Papier.
