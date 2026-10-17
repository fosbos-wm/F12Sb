# Blockfall (Lernvariante, Tetris-Prinzip)

Fächer: Pädagogik/Psychologie, Lernbereich 12.1 (Psychoanalyse, Entwicklung, Erziehungseinflüsse).
Immer wenn eine Reihe voll ist, hält das Spiel an und stellt pro Reihe eine Frage (Begriff zu Definition oder umgekehrt).

## Dateien
- `blockfall/blockfall.html`  das Spiel (eigenständig, lädt `aufgaben.json` und `../logo.jpg`)
- `blockfall/aufgaben.json`   87 Karten in 7 Themenpaketen
- `logo.jpg` liegt im Hauptordner der App (wird mit `../logo.jpg` eingebunden)

## Spielregeln
- Richtig: Reihe löst sich auf, 100 Punkte mal Level.
- Falsch: Reihe löst sich trotzdem auf, keine Punkte. Die Karte kommt nach 3 weiteren Fragen erneut.
- Mehrere Reihen gleichzeitig: eine Frage pro Reihe.
- Spielende: Zusammenfassung "Das solltest du wiederholen".
- Steuerung per Klick oder Tipp: Ein Klick auf das Spielfeld dreht den Block um 90 Grad. Nach links oder rechts ziehen verschiebt ihn (ein Feld pro Feldbreite), nach unten wischen lässt ihn fallen. Zusätzlich gibt es die Tasten unter dem Feld (Links, Drehen, Rechts, Schneller, Fallen); ein Klick auf sie ist genau ein Schritt, Halten wiederholt ihn.
- Steuerung per Tastatur: Pfeiltasten, Leertaste = fallen lassen, P = Pause.

## Karten ergänzen
In `aufgaben.json` unter dem passenden Thema in `karten` anhängen:

    { "begriff": "Realangst", "definition": "Das Ich fürchtet die Konsequenzen der Realität ..." }

Neues Thema: Objekt mit `id` (eindeutig), `titel`, `lb`, `quelle` (Liste) und `karten` (mindestens 5, besser 8 oder mehr, damit die falschen Antworten aus demselben Thema stammen).
Begriffe dürfen sich innerhalb der Datei nicht wiederholen.

## Testen
Nicht per Doppelklick öffnen (fetch funktioniert nur über http), sondern über GitHub Pages oder lokal: `python3 -m http.server` im App-Ordner, dann `/blockfall/blockfall.html`.
