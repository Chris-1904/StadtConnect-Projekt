# Quellen und geografische Datenqualität

Quellabruf und Prüfung: 28. Oktober 2026. Kein Anspruch auf Vollständigkeit oder vermessungstechnische Genauigkeit.

## Amtliche Bezirke und Stadtteile

- [Stadt Mannheim: Stadtgebiet und Flächennutzung](https://www.mannheim.de/de/stadt-gestalten/daten-und-fakten/stadtgebiet-und-flaechennutzung).
- [Offizielle OGC-Dienstübersicht](https://www.gis-mannheim.de/mannheim/mod_ogc/index.php).
- [WFS Stadtbezirke](https://www.gis-mannheim.de/mannheim/mod_ogc/wfs_getmap.php?mapfile=bez_grenze&service=WFS&Request=GetCapabilities), Ebene `bez_grenze`.
- [WFS Stadtteile](https://www.gis-mannheim.de/mannheim/mod_ogc/wfs_getmap.php?mapfile=stadtteil_grenze&service=WFS&Request=GetCapabilities), Ebene `stadtteil_grenze`.

Der Abruf enthielt alle 17 Bezirke und 38 Stadtteile. Übernommen wurden die vollständigen Bezirksobjekte **05 Lindenhof**, **16 Neckarau**, **17 Rheinau** sowie die acht Stadtteile **050, 161, 162, 163, 171, 172, 173, 174**. Keine Grenze wurde nachgezeichnet oder vereinfacht.

Der WFS-2-/GeoJSON-Abruf lieferte HTTP 500. WFS 1.0.0 mit `GetFeature&TYPENAME=<Ebene>` lieferte gültiges GML. Der Dienst lieferte trotz angefordertem WGS84 weiterhin **EPSG:25832 (ETRS89 / UTM 32N)**. Die Dateinamen `*-wgs84.gml` dokumentieren diesen ursprünglichen Abrufversuch; maßgeblich ist das im GML geprüfte CRS, nicht der Dateiname.

Umrechnung mit [Proj4js](https://proj4js.org/), Version 2.22.0, ausschließlich im Wartungswerkzeug. Definition: `+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs`. GeoJSON/Leaflet verwenden anschließend `[Längengrad, Breitengrad]` bzw. `[Breitengrad, Längengrad]`. Alle 1.027 Grenzstützpunkte der drei Bezirke bleiben erhalten. Der gemessene numerische Hin-/Rückumrechnungsfehler unter 0,001 m ist **keine Aussage über die tatsächliche Lagegenauigkeit** der Ausgangsdaten.

Lokale Ergebnisse: `districts.geojson`, `subdistricts.geojson`. Original-GML und unveränderte UTM-Koordinaten: `tests/research/`. SHA-256-Belege: `source-manifest.json`.

## Reale Einrichtungen

- [Amtlicher WFS Sportflächen](https://www.gis-mannheim.de/mannheim/mod_ogc/wfs_getmap.php?mapfile=sportflaechen_public&service=WFS&Request=GetCapabilities): 426 Quellflächen, davon 117 mit Innenpunkt im Zielgebiet. Diese Flächen sind keine Liste ausschließlich frei nutzbarer Angebote. Vereins-/Schulflächen ohne ausreichend belegten Zugang wurden konservativ ausgeschlossen; die Gründe stehen in `coverage.json`.
- [Amtlicher WFS Freizeit-/Spielflächen](https://www.gis-mannheim.de/mannheim/mod_ogc/wfs_getmap.php?mapfile=spielplatz_poly&service=WFS&Request=GetCapabilities): 270 Quellflächen, davon 61 mit Innenpunkt im Zielgebiet. Nur belegte Attribute für Basketball, Kickplatz, Skate, BMX sowie die ausdrücklich bezeichnete Calisthenics-Anlage werden als erlaubte Kategorien übernommen. Allgemeine Spielplätze ohne Sportnachweis werden nicht zu neuen Kategorien.
- [Stadtbibliothek Neckarau](https://www.mannheim.de/de/bildung-staerken/stadtbibliothek/adressen-und-oeffnungszeiten/zweigstellen-in-den-stadtteilen/neckarau) und [Stadtbibliothek Rheinau](https://www.mannheim.de/de/bildung-staerken/stadtbibliothek/adressen-und-oeffnungszeiten/zweigstellen-in-den-stadtteilen/rheinau): Standorte aus den unveränderten Koordinaten der offiziellen Standortseiten, Angaben zu Adresse/Öffnungszeiten/Ausstattung aus denselben Seiten. Es wurden keine Google-Dienste abgefragt.
- [Stadt Mannheim: Skatepark am Schnickenloch eingeweiht](https://www.mannheim.de/de/nachrichten/skatepark-an-der-rheinpromenade-eingeweiht), 25.07.2024: korrigiert den widersprüchlichen alten Skate-Eintrag am Pfalzplatz. Der Skatepark wurde zum Schnickenloch verlegt. Regeln und Begründung: `corrections.json`. Der Standortpunkt bleibt innerhalb der amtlichen Freizeitfläche; eine einzelne Rampe wurde nicht eigenständig geokodiert.

## Bestand nach Bezirk und Kategorie

| Kategorie | Lindenhof | Neckarau | Rheinau |
| --- | ---: | ---: | ---: |
| Basketballplätze | 3 | 6 | 5 |
| Beachvolleyballplätze | 0 | 0 | 0 |
| Bibliotheken | 0 | 1 | 1 |
| BMX-Anlagen | 0 | 0 | 1 |
| Calisthenics-Anlagen | 1 | 0 | 0 |
| Fußballplätze / Bolzplätze | 5 | 7 | 7 |
| Laufbahnen | 1 | 1 | 0 |
| Outdoor-Fitnessanlagen | 0 | 0 | 0 |
| Parkour-Anlagen | 0 | 0 | 0 |
| Skateparks | 1 | 1 | 1 |
| Tischtennisplatten | 0 | 1 | 0 |
| Volleyballplätze | 0 | 0 | 0 |

Eindeutige Orte insgesamt: Lindenhof **7**, Neckarau **10**, Rheinau **8**; zusammen **25**. Mehrfachkategorien zählen in mehreren Tabellenzeilen, erzeugen aber nur einen Ort/Marker. Alle 25 sind geometrisch gegen die amtlichen Bezirke geprüft. Der freie Zugang ist bei keinem Ort vor Ort verifiziert. Null bedeutet „in diesem Bestand nicht ausreichend belegt“, nicht „existiert im Bezirk nicht“.

## Positionierung und Prüfung

Punkte aus einer Primärquelle werden unverändert verwendet. Bei Flächen wird der geometrische Schwerpunkt nur verwendet, wenn er innerhalb der tatsächlichen Fläche und außerhalb aller Innenringe liegt. Andernfalls wird ein belegtes inneres Scanline-Segment gewählt. Bei MultiPolygonen erfolgt dies in der größten Teilfläche; bei OSM-Linien auf der tatsächlichen Liniengeometrie. Es gibt keine Zufallsverschiebung und keinen Bezirksmittelpunkt als Ersatz.

OSM-Flächen benötigen ihre Originalgeometrie (`out meta geom`), OSM-Relationen werden aus äußeren/inneren Teilwegen zusammengesetzt. Ein bloßes `center` reicht nicht aus. Alte Cacheeinträge ohne Originalgeometrie/Objektmetadaten bleiben gesperrt. Geometrie, Ortsdetails und Marker verwenden denselben berechneten Punkt. Freizeitanlagen sind teilweise größere Flächen; der Marker belegt die Lage innerhalb der Anlage, **nicht den exakten Standort jedes einzelnen Geräts**. Die technischen Nachweise bleiben intern und in dieser Quellendokumentation erhalten; die Ortsdetails zeigen nur nutzerrelevante Angaben.

Die Punkt-in-Polygon-Prüfung berücksichtigt MultiPolygone und Innenringe. Bezirksnamen aus OSM-Tags oder alten Speichern können sie nicht überstimmen. Eine Bounding Box wird nur zur effizienten Datenabfrage und zur Kartenansicht verwendet. Ohne die drei gültigen amtlichen Geometrien bleibt die Ortsanzeige gesperrt.

## OSM-Abruf und bekannte Lücken

Aktuelle OSM-Daten konnten in dieser Umgebung nicht erfolgreich abgerufen werden. Beobachtet wurden HTTP 406, HTTP 429, nach gesetzter aussagekräftiger Projektkennung eine Zeitüberschreitung sowie beim dokumentierten POST-Verfahren HTTP 502 mit Überlastungshinweis. Deshalb enthält der ausgelieferte lokale Bestand **keine als aktuell bestätigt ausgegebenen OSM-Orte**. Er stammt aus den oben genannten städtischen Quellen.

Die App startet ohne Netzabfrage. „OSM aktualisieren“ führt einen einzelnen Sammelabruf an genau einem konfigurierten Anbieter aus. Kein automatischer Endpunktwechsel und keine automatischen Wiederholungsschleifen. Nach Fehlern mindestens 60 Sekunden Wartezeit; ein vom Browser zugänglich gemachtes längeres `Retry-After` wird respektiert. Der lokale Bestand bleibt erhalten. Filter lösen nie eine Abfrage aus.

Die Kategorien mit Nullbestand sind Datenlücken. Weitere Tischtennisplatten, Beach-/Volleyballflächen, Fitness-/Parkour-Anlagen und Hochschulbibliotheken können existieren. Beispielsweise ist die Hochschulbibliothek der TH Mannheim offiziell beschrieben, wurde aber ohne ausreichend verlässlich belegte Gebäudekoordinate nicht aufgenommen. Nicht bestätigte Standorte, nur angekündigte Neubauten und ungeklärte öffentliche Zugänge werden nicht erfunden oder als bestätigt dargestellt. Auch kurzfristige Sperrungen und der bauliche Zustand sind nicht vor Ort geprüft.

## Lizenz

[Geoportal-Nutzungsbedingungen](https://geoportal-mannheim.de/nutzungsbedingungen/): frei verfügbare städtische Dienste unter **Datenlizenz Deutschland – Namensnennung 2.0**. Die verwendeten WFS-Ebenen sind im offiziellen Verzeichnis frei zugänglich; Capabilities nennen `Fees: none` und `AccessConstraints: none`.

Quellenvermerk: **© Stadt Mannheim (2026) / dl-de/by-2-0, www.mannheim.de, Daten bearbeitet (CRS-Umrechnung, Gebietsauswahl, Kategorisierung und Quellenkorrektur)**. Dieser Vermerk steht in den Datendateien und der Kartenquellenangabe. Bibliotheksfakten und Korrekturen sind zusätzlich mit ihren offiziellen Primärseiten belegt. Ergänzende OSM-Daten unterliegen [ODbL](https://www.openstreetmap.org/copyright); CARTO-Karten und deren bestehende Quellenangabe bleiben erhalten.

## Nachvollziehbare Aktualisierung

Normaler App-Start benötigt weiterhin nur die bestehenden Startskripte. Entwickler können mit vorhandenem Node.js und Python die Quellen aktualisieren:

```text
node scripts/update-geodata.mjs
node scripts/fetch-osm.mjs
node scripts/build-catalog.cjs
node tests/geography.cjs
```

`update-geodata.mjs` lädt die vier amtlichen GML-Ebenen und beide Bibliotheksseiten. Es prüft das tatsächliche CRS, konvertiert per `gml-to-json.py` und `build-boundaries.cjs` und erzeugt den Katalog. Die Bibliotheksinformationen werden dabei automatisch extrahiert. Manuelle Quellenkorrekturen in `corrections.json` bleiben vor Veröffentlichung fachlich zu prüfen. Ein fehlgeschlagener OSM-Abruf überschreibt keine erfolgreiche Quelle und keinen App-Katalog. `fetch-osm.mjs` ist optional und fragt nur einmal ab. Es wird nicht automatisch durch den amtlichen Import gestartet.

## Automatisch ergänzte Ortsinformationen

Für eine gezielte Aktualisierung genügt `node scripts/update-place-info.mjs` (Node.js und Python 3, keine Zusatzpakete, keine Schlüssel). Das Werkzeug lädt ausschließlich die bereits bekannten offiziellen Bibliotheksseiten. `extract-place-info.py` prüft den exakten Einrichtungsnamen und die vorhandene Standortkoordinate. Ausschließlich die eindeutige Liste unter „Öffnungszeiten“ wird übernommen. Eine andere Zweigstelle, ein versetzter Standort oder unklare Seitengliederung führen zu fehlenden statt falsch zugeordneten Angaben. Nach einem Abruffehler bleibt der bisherige App-Katalog erhalten. Abrufnachweise: `place-info-fetch.json`; strukturierte Extraktion: `place-info-extracted.json`; ausgewertete Informationen und Probleme: `place-info.json`. Das Browserpaket enthält die Ergebnisse im vorhandenen Katalog; es ruft beim Öffnen einer Ortsdetailseite keine Ortsseite ab.

Am 28.10.2026 wurden **2 Orte mit bestätigten Öffnungszeiten** automatisch eingelesen:

| Einrichtung | Veröffentlichte Wochenzeiten | Zusätzlich belegte Ausstattung |
| --- | --- | --- |
| Zweigstelle Neckarau | Mo/Mi 10–12 und 13–17:30; Di 10–12 und 13–19; Fr 9–14 Uhr | 2 Internet-Arbeitsplätze, Aufzug |
| Zweigstelle Rheinau | Mo/Di 13–19; Mi/Do 10–17 Uhr | Lese- und Lernplätze, WLAN, ebenerdiger Eingang |

Quelle ist jeweils die oben verlinkte offizielle Einrichtungsseite. Nicht genannte Wochentage werden nicht als bestätigt geschlossen ergänzt. Sonderöffnungen, Ferien und kurzfristige Schließungen sind nicht vollständig strukturiert erfasst. Keine Angaben über freie Plätze oder reservierbare Gruppenräume.

Bei allen **23 Sportorten** fehlen belastbar belegte Öffnungszeiten. Allgemeine Spielplatzregeln und die [Überlassung von Sportstätten](https://www.mannheim.de/de/service-bieten/sport/sportstaetten/ueberlassung-von-sportstaetten) belegen keine individuellen Öffnungszeiten und werden dafür nicht übernommen. Die Oberfläche zeigt „Nicht bekannt“. Eine Sportkategorie belegt eine Sportmöglichkeit, keine Geräteanzahl oder freie Nutzung. Nur ausdrücklich belegte Beläge oder Geräteattribute werden als Ausstattung angezeigt. Zugang bleibt ohne gesonderten Beleg unbestätigt.

Zusätzliche OSM-Daten werden beim kontrollierten Import automatisch aus `opening_hours` ausgewertet, gemäß der [OSM-Attributdokumentation](https://wiki.openstreetmap.org/wiki/Key:opening_hours). Der kleine lokale Parser unterstützt einfache Wochenregeln, explizit geschlossene Tage, `PH off` und `24/7`. Komplexe Regeln wie Sonnenzeiten, Saisonkalender oder Freitext werden nicht vereinfacht geraten. Widersprechende auswertbare Quellen führen zu „Angaben ungeklärt“; die Kandidaten bleiben intern erhalten. Der aktuelle Bestand enthält mangels erfolgreichem Live-Abruf keine als aktuell bestätigt ausgegebenen OSM-Zeiten. Es wurde kein kostenpflichtiger Dienst und kein neuer API-Schlüssel eingebunden.

Das Browserpaket lädt nur `catalog.js`, nicht die Recherchedaten. `catalog.json`, `coverage.json` und `ORTE.md` erlauben die Kontrolle. Bei Änderungen am Katalog sollten Bestandsbericht und Quellenbelege erneut erzeugt werden. Proj4js liegt mit Lizenz unter `scripts/vendor/` und wird nicht im Browser geladen.
