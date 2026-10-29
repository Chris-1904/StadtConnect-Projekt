# Geografische Überarbeitung – 28. Oktober 2026

Die bestehende Anwendung wurde direkt weiterentwickelt. Navigation, Farben, Typografie und Seitenlayouts bleiben erhalten. Leaflet, CARTO und Marker-Clustering bleiben die technische Grundlage.

## Geografische Änderungen

- Genau die vollständigen amtlichen Bezirke Lindenhof (05), Neckarau (16), Rheinau (17). Die acht zugehörigen Stadtteile sind lokal hinterlegt. Almenhof/Niederfeld werden Neckarau zugeordnet.
- Rechteck- und Textzuordnung entfernt; dieselbe MultiPolygon-/Innenringprüfung gilt für Katalog, Live-Import, Cache, gespeicherte Orte und Aktivitätsauswahl.
- Alte falsche Orte und unbelegte Mittelpunkte erscheinen nach Neuladen nicht wieder. Nutzeraktivitäten bleiben erhalten, erscheinen ohne gültigen Ort jedoch nicht als aktuelle Angebote. Im Profil ist eine Neuzuordnung möglich; Originalspeicher und ausgeschlossene Orte bleiben gesichert.
- Kartenausschnitt aus vollständigen Bezirksgeometrien; optionale dezente Grenzen. Rücksetzen löscht die alte Ortsauswahl. Größenwechsel passen den Gesamtausschnitt an, solange kein Ort fokussiert ist. Veraltete Kartenereignisse nach einem Ansichtswechsel werden ignoriert.
- Lokaler nachvollziehbarer Bestand statt einer leeren Karte bei Overpass-Ausfällen. Kein automatischer Abruf beim Start oder Filtern, kein Endpunktrundlauf; kontrollierter manueller Abruf und Wartezeit.
- Widerspruch Pfalzplatz/Schnickenloch anhand städtischer Eröffnungsmeldung korrigiert. Reale Orte und lokale fiktive Demotreffen sind ausdrücklich getrennt.

Quellen, Positionierung und Lizenz: [data/QUELLEN.md](data/QUELLEN.md). Vollständiges Inventar: [data/ORTE.md](data/ORTE.md).

## Geografisch geprüfter Bestand

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

## Durchgeführte Tests

- **120 Browser-Regressionen** in `tests/smoke.cjs`: bestehende Aktivitäten-, Gruppen-, Chat-, Profil- und Speicherabläufe; alle fünf Ansichten bei 320/375/430/768/1024/1440 px; lokale reale Startdaten plus 181 künstliche OSM-Testorte ausschließlich für Last-/Fehlerprüfungen.
- **30 Geometrie-/Quelldatenprüfungen** in `tests/geography.cjs`: drei vollständige Bezirke, acht Stadtteile, 1.027 unveränderte Grenzstützpunkte, CRS-Rundlauf, echte Ortspositionen und Quellen, Ausschluss Ludwigshafen/anderer Bezirke, Innenringe, MultiPolygone, Relationsteile, Duplikate und Quellenkorrektur.
- **18 zusätzliche Browser-Geografieprüfungen** in `tests/geography-browser.cjs`: reale Bezirkszahlen, vollständige Ausschnitte, Grenzen ein-/ausblenden, Cache-/Speichermigration, fehlende Grenzen sperren Anzeige, erhaltene Aktivität neu zuordnen, HTTP 429/Retry-After ohne schnellen Folgeabruf.
- **Browserkontrolle mit echten Daten und echten Kartenbildern** in `tests/real-browser.cjs`: alle 25 amtlichen Orte, reale Grenzen, Desktop und 375-px-Mobilansicht, kombinierter Rheinau-/Basketballfilter, Markeröffnung und vollständiger mobiler Ausschnitt. **42 echte CARTO-Kacheln erfolgreich**, keine fehlgeschlagenen Kacheln.
- JavaScript-Syntaxprüfung der Anwendung und Geometriemodule. Keine JavaScript-Laufzeitfehler in den bestandenen Abschlussläufen; keine Konsolenfehler in regulären Regressionen. Gezielte API-Ausfälle erzeugen erwartete Ressourcenmeldungen.

Das sind **168 automatisierte Assertions** zuzüglich der tatsächlichen Browser-/Kartenkontrolle. Maschinenlesbare Ergebnisse: `tests/result.json`, `tests/geography-result.json`, `tests/geography-browser-result.json`, `tests/real-browser-result.json`. Screenshots: `tests/screenshots/karte-reale-daten-desktop.png` und `karte-reale-daten-mobil.png`.

Der isolierte Browser lädt die echten Projektdateien über lokale Playwright-Routen. Echte CARTO-Kacheln wurden dabei unverändert über begrenzte Node-Abrufe bezogen. Damit sind Darstellung und echte Karten-/Ortsgeometrie geprüft; ein vollständig unbeschränkter Browser-Netzwerkpfad und ein aktueller OSM-Import werden dadurch nicht behauptet. Bestehende Nutzer-Browserprofile wurden nicht verändert.

## Nicht bestätigt / offen

- Aktueller OSM-Live-Import: HTTP 406/429, Timeout und HTTP 502 (Überlastung) verhinderten einen belastbaren Quellabruf. Es werden keine künstlichen OSM-Punkte als reale Daten ausgeliefert.
- Vollständigkeit der Einrichtungen, Kategorien mit Nullbestand, einzelne Gerätekoordinaten innerhalb größerer Freizeitflächen und exakter Bibliothekseingang. Quellenpunkte/Flächen werden ohne erfundene Genauigkeit angezeigt.
- Vor-Ort-Zugang, aktuelle Sperrungen, Zustand und kostenlose Nutzbarkeit. Unklare Zugänglichkeit bleibt ausdrücklich unbestätigt.
- Hochschulbibliothek TH Mannheim ist als Einrichtung bekannt, aber ohne unabhängig gesicherten Gebäudepunkt nicht im Bestand.
- Konten, Aktivitäten, Chats und Meldungen bleiben lokale Simulationen; keine echten Veranstaltungen, Reservierungen, Gerätekommunikation oder serverseitigen Rechte. Native Android-/iOS-Gerätetests bleiben offen.
