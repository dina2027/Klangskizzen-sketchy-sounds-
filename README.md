# Klanglandschaft

Grafische Partitur zum Komponieren mit Klängen und Zeichnungen –
für den Workshop „Klanggeräusche/farben“.

## Inhalt

- `index.html` – die ganze App (HTML, CSS, JavaScript)
- `manifest.webmanifest` – Name, Icon, Farben (für „Installieren“)
- `sw.js` – macht die App offline-fähig
- `grafiken/` – die Zeichnungen
- `icons/` – App-Icons

## Klänge und Zeichnungen ändern

Ganz oben im `<script>` von `index.html` steht die Liste `GRUPPEN`.
Neue Zeichnungen in den Ordner `grafiken/` legen und dort eintragen,
z. B. `bild: "grafiken/meine-zeichnung.png"`.

## Nach jeder Änderung

In `sw.js` die Versionsnummer erhöhen:
`const VERSION = "klanglandschaft-v2";` (dann v3, v4 …)
Sonst zeigen bereits installierte Geräte weiter die alte Version.
