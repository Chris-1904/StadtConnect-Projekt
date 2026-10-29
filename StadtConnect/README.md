# StadtConnect Mannheim

Buildfreier lokaler Web-Prototyp für studentische Sport- und Lerntreffen ab 18 Jahren. Die bestehende Anwendung wurde direkt im vorhandenen Ordner weiterentwickelt. Design und Hauptnavigation bleiben erhalten.

## Start

- Windows: `start-server.bat` doppelklicken (Python 3 erforderlich).
- macOS/Linux: `sh start-server.sh` im Projektordner (Python 3 erforderlich).
- Browser: **http://localhost:8000**.
- Alternativ: `python -m http.server 8000 --bind 127.0.0.1`.

Alle Anwendungsskripte, Bibliotheken, Bezirksgrenzen und der Ortsbestand liegen lokal. Internet wird für echte CARTO-Kartenbilder und die optionale OSM-Aktualisierung benötigt. Zum Ansehen kann auch `index.html` geöffnet werden; für konsistente Browser-Speicherung den lokalen Server verwenden. `localhost`, `127.0.0.1` und `file:` haben möglicherweise getrennte Speicher.

## Geografisches Gebiet und Orte

Unterstützt werden ausschließlich die vollständigen offiziellen Stadtbezirke **Lindenhof, Neckarau und Rheinau**. Almenhof und Niederfeld gehören zu Neckarau und sind keine eigenen Filteroptionen mehr. Die Zuordnung verwendet amtliche Polygone mit Innenringen, keine Rechteck-/Radiusprüfung und keine Schätzung anhand von Bezirksnamen.

Der lokale Bestand enthält **25 geografisch geprüfte reale Quellorte**: Lindenhof 7, Neckarau 10, Rheinau 8. Quelle sind amtliche Mannheimer Sport-/Freizeitflächen und offizielle Bibliotheksseiten. Er ist kein vollständiges Verzeichnis und keine Vor-Ort-Zugangsprüfung. Fehlende Kategorien werden nicht mit erfundenen Orten aufgefüllt.

- [Quellen, Lizenz, Kategorienzahlen und Aktualisierung](data/QUELLEN.md)
- [Vollständiges Ortsinventar](data/ORTE.md)
- [Aktueller geografischer Prüfbericht](GEODATEN-PRUEFBERICHT.md)
- [Ortsdetails, Informationsquellen und aktuelle Tests](ORTSDETAILS-PRUEFBERICHT.md)

Entdecken bietet Suche, kombinierbare Kategorien-/Bezirksfilter, scrollbare Ortsliste, synchronisierte Marker, Clustering und optional sichtbare Bezirksgrenzen. Der Ausschnitt wird aus den tatsächlichen Grenzen berechnet. Mobil lassen sich Filter aufklappen und Karte/Liste umschalten. Die Ortsdetails zeigen kompakt Standort, belegte Öffnungszeiten, Zugang sowie Sportarten oder Lernplätze und Ausstattung. „Auf Karte anzeigen“ hebt den vorhandenen Marker hervor. Technische Ortsnachweise bleiben intern; „Quellen & Lizenzen“ im Seitenfuß hält die Herkunft zugänglich.

## Datenversorgung

Beim Start und Filtern erfolgt keine externe Ortsabfrage. „OSM aktualisieren“ fragt einen konfigurierten Anbieter einmal mit einer Sammelabfrage und Originalgeometrie/-metadaten an. Bei Fehlern bleibt der lokale Bestand erhalten; mindestens 60 Sekunden Wartezeit, längeres zugängliches `Retry-After` wird berücksichtigt. Keine Endpunktwechsel oder automatischen Wiederholungsschleifen.

Aktuelle OSM-Daten konnten hier wegen HTTP 406/429, Timeout und HTTP 502 nicht zuverlässig bezogen werden. Deshalb ist der ausgelieferte lokale Bestand ausdrücklich ein amtlicher Ersatzbestand; es wird keine aktuelle OSM-Vollständigkeit behauptet. Reale CARTO-Kartenbilder wurden erfolgreich geprüft.

### Öffnungszeiten und Ausstattung automatisch aktualisieren

**2 von 25 Orten haben bestätigte Öffnungszeiten:** die Bibliothekszweigstellen Neckarau und Rheinau. Die veröffentlichten Wochenzeiten und eindeutig belegte Ausstattung werden automatisch aus den offiziellen Seiten gelesen, über Einrichtungsname und bestehende Standortkoordinate zugeordnet und lokal gespeichert. Bei den 23 Sportorten sind keine verlässlichen Öffnungszeiten belegt. Nutzungs-/Mietzeiten werden nicht dafür verwendet.

Kontrollierte Aktualisierung mit vorhandenem Node.js und Python 3:

```text
node scripts/update-place-info.mjs
```

Der Befehl lädt die bereits bekannten offiziellen Ortsseiten, wertet sie aus und baut den lokalen Katalog neu. Bei einem HTTP-Fehler bleibt der ausgelieferte Katalog erhalten. Änderungen an Seitenstruktur oder Einrichtungsidentität werden in `data/place-info.json` unter `problems` gemeldet; unklare Zeiten werden nicht bestätigt. Optional lässt sich der Python-Pfad über `STADTCONNECT_PYTHON` angeben. Auch der vollständige Import `scripts/update-geodata.mjs` aktualisiert diese Informationen.

Bei einem erfolgreichen optionalen OSM-Import wird `opening_hours` automatisch ausgewertet. Unterstützt sind einfache Wochenzeiten, geschlossene Tage, `PH off` und ausdrücklich belegtes `24/7`. Komplexe Sonderregeln bleiben unbekannt; abweichende auswertbare Quellen werden als „Angaben ungeklärt“ angezeigt. Es gibt keine Berechnung „jetzt geöffnet“ und keine zusätzliche API mit Schlüssel. Das Öffnen von Ortsdetails fragt keine externen Informationen ab.

## Aktivitäten, Gruppen, Chats und Profile

Die bisherigen Abläufe bleiben erhalten: Treffen erstellen/bearbeiten/absagen, beitreten/zurückziehen; Gruppen erstellen/beitreten/verlassen; lokale Chats mit Teilnahme-/Mitgliedschaftsprüfung; Profilbearbeitung, Sichtbarkeit, Demo-Profilwechsel und Registrierung ab 18 ohne Passwort. Profilwechsel unter „Mein Profil → Profil wechseln“ erlaubt Vorführungen mit Max, Mia, Jonas und Lea.

Neue und bearbeitete Aktivitäten können nur gültige reale Orte aus den drei Bezirken auswählen. Fiktive Demoaktivitäten tragen eine sichtbare Kennzeichnung. Sie sind keine tatsächlich angekündigten Veranstaltungen. Eine Teilnahme reserviert weder eine Sportfläche noch einen Bibliotheksplatz oder Gruppenraum.

## Bestehende Daten und Migration

Der vorhandene Local-Storage-Schlüssel `stadtconnect_students_v3` bleibt erhalten. Alte Bezirkspräferenzen Almenhof/Niederfeld werden Neckarau zugeordnet. Unzulässige Orte, fiktive Standorte sowie alte OSM-Mittelpunkte ohne Originalgeometrie und Objektmetadaten werden nicht wieder als Ergebnisse oder Auswahl angeboten. Ausgeschlossene gespeicherte Orte bleiben unter `quarantinedPlaces`, Originalstände unter `stadtconnect_recovery_v3` bzw. Schlüsseln mit Zeitstempel erhalten.

Nutzeraktivitäten ohne gültigen Ort bleiben erhalten, werden aber nicht mehr als aktuelle Angebote angezeigt. Ihre Hosts können im Profil die Details öffnen und einen gültigen Ort neu zuordnen. Es erfolgt keine heimliche Verlegung zu einer beliebigen Anlage. Ältere v1-Daten bleiben zusätzlich im bisherigen Legacy-Archiv erhalten.

„Mein Profil → Demo-Sicherung“ exportiert aktuellen Stand und vorhandene Sicherungen. Eine Importoberfläche ist nicht implementiert. Zurücksetzen verlangt eine Bestätigung und erhält Sicherungen. Browserbereinigung kann lokale Daten löschen; gleichzeitige Änderungen mehrerer Tabs werden nicht zusammengeführt.

## Real und simuliert

**Reale Daten:** amtliche Bezirks-/Objektgeometrien, offizielle Bibliotheks-Standortpunkte, automatisch ausgelesene Bibliothekszeiten und belegte Ausstattung sowie CARTO-/OSM-Kartenbilder. Die aktuelle öffentliche Nutzbarkeit, Vor-Ort-Sperrungen, einzelne Gerätepositionen und Vollständigkeit sind nicht unabhängig bestätigt.

**Lokale Simulation:** Konten/Anmeldung, Studierendenstatus, Treffen, Teilnehmerplätze, Gruppen, Chats und Meldungen. Kein Backend, keine Kommunikation zwischen Geräten, keine Moderation oder Reservierung. Es wird kein Passwort angefordert. Hochschule ist eine Selbstauskunft.

## Tests und Wartung

Aktueller Abschluss: **257 Prüfungen bestanden** (120 Kern-/Responsive-Browserprüfungen, 30 Geometrie-/Quellenprüfungen, 18 Browser-Migrations-/Geografiefälle, 60 Ortsdetail-Browserprüfungen, 23 Informationsprüfungen und 6 HTML-Extraktionstests). Alle 25 Ortsdetails und Breiten von 320 bis 1440 Pixeln geprüft; keine JavaScript-Laufzeitfehler. Die Funktionstests verwenden künstliche Kartenkacheln und teilweise klar getrennte Testorte. Im vorherigen geografischen Abschluss wurden zusätzlich Desktop und Mobil mit 25 echten Quellorten und **42 echten CARTO-Kacheln** erfolgreich geprüft; der aktuelle Ortsdetail-Umbau verändert den Kartenanbieter nicht.

Für Entwickler mit vorhandenem Node.js/Playwright:

```text
node --check app.js
node tests/geography.cjs
node tests/geography-browser.cjs
node tests/smoke.cjs
node tests/place-info.cjs
python -B tests/place-info-extraction.py
node tests/place-details.cjs
node tests/real-browser.cjs
```

Bei Bedarf `STADTCONNECT_PLAYWRIGHT` auf ein vorhandenes Playwright-Modul und `STADTCONNECT_CHROME` auf ein vorhandenes Chromium setzen. Normale Nutzung erfordert diese Werkzeuge nicht. `scripts/update-geodata.mjs` und die Quellenhinweise dokumentieren den optionalen Datenimport. Proj4js dient nur dem Wartungsimport, wird nicht im Browser geladen und liegt mit Lizenz unter `scripts/vendor/`.

Relative Assets, Touchbedienung, dynamische Kartengröße und Safe-Area-Abstände bleiben für eine spätere Capacitor-Integration vorbereitet. In ein späteres Webverzeichnis gehören `index.html`, `styles.css`, `app.js`, `geo.js`, `place-info.js`, `place-data.js`, `data/catalog.js`, `data/QUELLEN.md` und `assets/`; keine Recherchedaten oder Test-/Wartungsskripte. Native Projekte wurden nicht angelegt oder auf Android/iOS getestet.
