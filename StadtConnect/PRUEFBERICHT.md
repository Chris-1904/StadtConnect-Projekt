> Historischer Bericht der vorherigen UI-Überarbeitung. Für das aktuelle Gebiet, die heutige Ortsversorgung und die Abschlussprüfung gilt [GEODATEN-PRUEFBERICHT.md](GEODATEN-PRUEFBERICHT.md).

# Übernahme und Prüfung – 28. Oktober 2026

## Bestandsaufnahme und Priorisierung

Die ursprüngliche Projektbeschreibung und alle sechs vorhandenen Projektdateien wurden gelesen. Bereits vorhanden waren die fünf Ansichten, Leaflet/CARTO mit Clustering, die zwölf zulässigen Kategorien, vier Stadtteile, Aktivitäts- und Gruppenabläufe, lokale Chats, Profilbearbeitung, Altersprüfung und Local Storage. Grundlage und Hauptnavigation wurden erhalten.

Priorisierung vor Änderungen: Ortslistenlayout/Kartenkopplung → Berechtigungen, Formulare und Speicherung → Bedienung/Inhaltsdesign → Desktop-, Mobil- und Ausfallprüfung.

| Bereich | Ausgangslücke und Verbesserung |
| --- | --- |
| Ortsliste | Schrumpfende Flex-Karten, verdeckter Inhalt, nur 160 Listeneinträge bei mehr Markern. Natürliche Inhaltshöhen, Umbrüche und vollständige scrollbare Liste. |
| Karte | Neuaufbau beim Ortsupdate, fehlende Größenbeobachtung, CSS-Bewegungsreduktion konnte Clusteröffnung blockieren. Karte weiterverwenden, ResizeObserver, passende Leaflet-/Cluster-Optionen. |
| Aktivitäten | Geschlossene Treffen boten nicht ausführbare Beitrittsaktionen; reale Treffpunkte waren nur im austauschbaren Cache verfügbar. Klarer Status und gespeicherte Ortsschnappschüsse. |
| Gruppen/Chats | Mitgliedschaftsfilter ergänzt, Meldung ergänzt, Chatrechte zusätzlich im Renderer geprüft; Schreiben erhält Fokus und aktualisiert nur den Verlauf. |
| Profile/Formulare | Unnötiges Testpasswort entfernt, ungültige Kalendertage und doppelte Demo-E-Mail-Adressen erkannt; Fehler mit Eingabefeld verknüpft. |
| Speicherung | Beschädigte Strukturen konnten abstürzen oder ersetzt werden. Validierung und unveränderte Sicherungen, sichtbare Speicherfehler, Download; unzulässige Kategorien bleiben im Archiv. |
| Oberfläche | Große Banner durch kompakte Köpfe ersetzt; einheitliche Karten, verständliche Filter, mobil alle Navigationspunkte sowie aufklappbare Ortsfilter. Dialoghintergrund inert, Fokuswiederherstellung und Inhaltssprung. |

## Ursache der Ortsstreifen

`.place-list` verwendete Flexbox in Spaltenrichtung mit begrenzter Höhe und Scrollen. Die `.place-row`-Elemente behielten `flex-shrink:1`; ihre ergänzende Gestaltung setzte `overflow:hidden`. Bei vielen Treffern schrumpften dadurch die Karten und verdeckten ihre Inhalte.

Die Karten verwenden jetzt `flex:none`, natürliche Inhaltshöhe und umbrechende Texte. Der Container übernimmt das Scrollen. Breitenbegrenzungen liegen auf den Grid- und Textkomponenten. Alle Treffer werden gemeinsam in Liste und Markerbestand berücksichtigt. Dies wurde mit 181 Treffern einschließlich langer Namen und Mehrfachkategorien geprüft.

## Tatsächlich durchgeführte Tests

`node --check app.js` bestand. `tests/smoke.cjs` bestand mit **119 Assertions**. Verwendet wurden die echten lokalen Leaflet-1.9.4-/Markercluster-1.5.3-Bibliotheken. Ortsdaten und Kartenbilder wurden im isolierten Chromium-Browser durch künstliche Testdaten ersetzt. Bestehende Nutzerprofile wurden nicht verändert.

- 181 vollständige scrollbare Orte; private, kostenpflichtige und räumlich fremde Testorte ausgeschlossen; Mehrfachkategorien ohne Duplikate.
- Basketballplätze in Neckarau, Suche und leere Ergebnisse, Filterrücksetzen; keine neue Abfrage pro Filterklick, dieselbe Karteninstanz.
- Listenwahl, Markeröffnung und Hervorhebung, Clustering mit und ohne Bewegungsreduktion; Quellenangabe korrekt dimensioniert.
- Sporttreffen erstellen und bearbeiten, Kapazität/Datum/Ende validieren; zweites Demo-Profil beitreten lassen, Teilnehmerzahlen und Ausbuchung in Übersicht prüfen; Rückzug und Absage.
- Lerntreffen mit Modul, Lernziel und Reservierungshinweis; unbekannte Bibliotheksangaben ehrlich dargestellt.
- Gruppe erstellen, verlassen, mit anderem Profil beitreten; Gruppennachricht, Chatzuordnung und lokale Meldung.
- Chatlesen und Schreiben nur mit passender Mitgliedschaft, nach Austritt kein Zugang; HTML als Text und jede Nachricht genau einmal, Fokus bleibt im Eingabefeld.
- Profilbearbeitung und Neuladen bewahren Aktivitäten/Gruppen/Nachrichten; unter 18 abgewiesen, volljähriges Profil ohne Passwort erstellt; abgemeldet erfordert Erstellen eine Demo-Anmeldung.
- Legacy-Profil übernommen und Originaldaten gesichert; beschädigte v3-Speicherung gesichert; alte unzulässige Kategorie archiviert; Sicherung heruntergeladen.
- Ortsausfälle mit und ohne Cache: vorhandene Daten bleiben erhalten, manuelle Wiederholung möglich. Speicherfehler bleiben sichtbar.
- Alle fünf Ansichten bei 320/375/430/768/1024/1440 px ohne horizontalen Überlauf, jeweils ein globaler Erstellen-Button. Aktivitäts-, Gruppen- und Profilformulare zusätzlich bei 320/768/1440 px ohne Überlauf.
- Mobil initial geschlossene Filter, scrollbar dargestellte Liste und Wechsel zur Karte; Escape, Fokuswiederherstellung und Fokusfang per Tab.
- Keine JavaScript-Laufzeitfehler und keine Konsolenfehler in regulären Abläufen. Erwartete HTTP-503-Ressourcenmeldungen der Ausfallsimulation sind getrennt protokolliert.

Einzelergebnisse: `tests/result.json`. Bildschirmaufnahmen zur visuellen Kontrolle: `tests/screenshots/`; dargestellte Testorte sind keine realen Einrichtungen.

## Externe Live-Dienste

| Dienst | Tatsächliches Ergebnis |
| --- | --- |
| CARTO Voyager | HTTP 200, `image/png`, 15.993 Bytes für eine Kachel im Startgebiet. |
| overpass.private.coffee | HTTP 429, keine Ortsdaten. |
| overpass-api.de | HTTP 406, HTML statt Ortsdaten. |
| overpass.nchc.org.tw | Fetch nicht möglich (`TypeError`). |

Siehe `tests/live-result.json`. Diese Antworten belegen keine funktionierende aktuelle Live-Ortsversorgung. Ob die Begrenzung jeweils beim Dienst oder in der Netzumgebung entsteht, lässt sich daraus allein nicht sicher unterscheiden. Anbieter und bestehende Endpunkte wurden erhalten. Es wurden keine erfundenen Einrichtungen als Ersatz eingebaut.

Der Browser konnte den gestarteten lokalen HTTP-Server in dieser Testumgebung nicht erreichen (`ERR_NETWORK_ACCESS_DENIED`, nach Freigabe Timeout). Die Regression lädt deshalb die tatsächlichen Dateien über Playwright-Routen unter einer isolierten Testadresse. Ein direkter Datei-Browserstart war ebenfalls möglich. Ein normaler HTTP-Browserbetrieb auf dem Nutzerrechner wird hier nicht als erfolgreich getestet behauptet. Die einfachen Python-Startskripte bleiben erhalten.

## Verbleibende Grenzen

- Stadtteilzuordnung näherungsweise; amtliche Grenzgeometrien fehlen. Zugang, Gebühren, Bibliotheksräume und Öffnungszeiten bleiben soweit unbekannt entsprechend gekennzeichnet.
- Vollständiger Browserlauf mit aktuellen echten Ortsdaten und echten Kartenbildern hier nicht bestätigt.
- Konten, Teilnahmen, Gruppen, Chats und Meldungen sind lokale Simulationen ohne echte Anmeldung, Moderation, Gerätekommunikation, studentische Verifizierung oder Reservierung.
- Sicherungsexport vorhanden, Importoberfläche nicht implementiert. Gleichzeitige Änderungen mehrerer Tabs werden nicht zusammengeführt.
- Responsive Chromium-Prüfungen ersetzen keinen echten Android-/iOS-Gerätetest. Capacitor-Builds, WebView-Lifecycle und externe Linkbehandlung bleiben für die spätere Integration offen.
