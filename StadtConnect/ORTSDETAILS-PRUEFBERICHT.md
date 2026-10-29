# StadtConnect – Ortsdetails und Informationsqualität

Abschlussprüfung vom 28. Oktober 2026. Änderungen direkt im bestehenden Projektordner; Grundlage sind unverändert die 25 geografisch geprüften realen Quellorte in Lindenhof, Neckarau und Rheinau.

## Gestaltung und erhaltene Funktionen

Die Ortsdetails besitzen vier kompakte Informationsbereiche: Standort, Öffnungszeiten, Zugang sowie Sportarten/Ausstattung beziehungsweise Lernplätze/Ausstattung. Zwei Spalten auf Desktop und Tablet, eine Spalte bis 580 Pixel. Einheitliche SVG-Icons, dezente Trennlinien, lesbare Texte und sichtbarer Tastaturfokus verwenden das vorhandene türkise und orange Design.

Ortsname, Kategorien, Stadtteil/Stadtbezirk, Kennzeichnung „Realer Ort“, orange Hauptaktion und geplante Aktivitäten bleiben erhalten. Bibliotheken zeigen „Hier Lerntreffen erstellen“ und keine Sportbegriffe. Der Reservierungshinweis bleibt im Erstellformular. Die vorhandene Hauptnavigation wurde für diesen Umbau nicht verändert.

„Auf Karte anzeigen“ öffnet die bestehende Entdecken-Karte und hebt den passenden Marker hervor. Filter, Marker-Clustering, geografische Zuordnung, bestehende Speicherung sowie Verknüpfungen von Orten und Treffen bleiben erhalten. Es gibt keine neue Kartenversion und keine zweite Anwendung.

Aus der sichtbaren Ortsdetailansicht entfernt: ausführlicher geografischer Prüfnachweis, „Position & Datenquelle“, Koordinaten, Objektkennungen, Positionierungsmethoden, allgemeiner Katastertext und „Originalquelle öffnen“. Die Daten bleiben intern erhalten. Erforderliche Quellen- und Lizenzhinweise stehen im kompakten aufklappbaren Seitenfuß; die bestehende Kartenattribution bleibt erhalten. Bibliotheken können weiterhin direkt über „Website der Bibliothek“ erreicht werden.

## Standort und belegte Zusatzinformationen

Bekannte Adressen bleiben erhalten. Ohne postalische Adresse erscheint der tatsächliche Stadtteil beziehungsweise Stadtbezirk mit Mannheim, etwa „Almenhof, Mannheim“ am 48-er Platz. Auch Straßen ohne bekannte Postleitzahl nennen Mannheim. Es werden keine Adressen oder Postleitzahlen ergänzt, die nicht belegt sind.

Sportarten werden verständlich als Basketball, Fußball, Skaten, Laufen usw. dargestellt. Tatsächlich belegte Beläge können zusätzlich erscheinen. Aus Basketball wird keine Korbanzahl abgeleitet. Zugang wird ohne verlässlichen Nachweis als „Zugang nicht bestätigt“ dargestellt; OSM-Angaben können öffentlichen oder bedingten Zugang kennzeichnen, ohne kostenlose Nutzung zu behaupten.

## Automatische Recherche statt manueller Stundeneingabe

Die offiziellen Seiten der [Bibliothek Neckarau](https://www.mannheim.de/de/bildung-staerken/stadtbibliothek/adressen-und-oeffnungszeiten/zweigstellen-in-den-stadtteilen/neckarau) und [Bibliothek Rheinau](https://www.mannheim.de/de/bildung-staerken/stadtbibliothek/adressen-und-oeffnungszeiten/zweigstellen-in-den-stadtteilen/rheinau) wurden erfolgreich erneut geladen. Der Import identifiziert die Einrichtung über den exakten Namen und ihre bestehende geografische Position. Er liest ausschließlich die eindeutig beschriftete Öffnungszeitenliste und ausdrücklich belegte Ausstattungsmerkmale.

| Ort | Bestätigte Wochenzeiten | Ergänzte Ausstattung |
| --- | --- | --- |
| Stadtbibliothek · Zweigstelle Neckarau | Mo/Mi 10–12 und 13–17:30; Di 10–12 und 13–19; Fr 9–14 Uhr | 2 Internet-Arbeitsplätze, Aufzug |
| Stadtbibliothek · Zweigstelle Rheinau | Mo/Di 13–19; Mi/Do 10–17 Uhr | Lese- und Lernplätze, WLAN, ebenerdiger Eingang |

**Ergebnis: 2 von 25 Orten mit bestätigten Öffnungszeiten, 23 Sportorte ohne belastbaren Stundenbeleg.** Bei fehlenden Angaben steht „Nicht bekannt“. Vermietungs- und allgemeine Nutzungszeiten werden nicht als Öffnungszeiten verwendet. „24 Stunden geöffnet“ ist nur nach einem ausdrücklichen entsprechenden Quellattribut möglich.

`node scripts/update-place-info.mjs` aktualisiert die bereits bekannten offiziellen Einrichtungsseiten kontrolliert mit Node.js und Python 3. Der vollständige Geodatenimport verwendet denselben Auswertungsschritt. HTTP-Fehler erhalten den bisherigen ausgelieferten Katalog; Zuordnungs- und Auswertungsprobleme werden in `data/place-info.json` dokumentiert. Geänderte Seitenstrukturen werden nicht durch erratene Angaben ersetzt. Es werden keine kostenpflichtige API und kein neuer Schlüssel benötigt.

Für erfolgreiche optionale OSM-Importe werden einfache `opening_hours`-Wochenzeiten, ausdrücklich geschlossene Tage, `PH off` und belegtes `24/7` automatisch ausgewertet. Widersprüchliche auswertbare Quellen bleiben als „Angaben ungeklärt“ sichtbar. Kandidaten und Quellen bleiben intern gespeichert. Komplexere OSM-Regeln werden nicht interpretiert; eine Liveanzeige „jetzt geöffnet“ wird nicht berechnet. Die Ortsdetailansicht benötigt keine erneuten externen Informationsabfragen.

## Durchgeführte Tests

| Prüfung | Ergebnis |
| --- | ---: |
| Bestehende Kernabläufe und Responsive-Browserfälle | 120 bestanden |
| Geometrie, Quellenzuordnung und Grenzen | 30 bestanden |
| Browser: Karte, Filter, Migration und gespeicherte Daten | 18 bestanden |
| Browser: Ortsdetails, Erstellaktionen, Karte, Quellen und Tastatur | 60 bestanden |
| Stundenparser, Konflikte, Ausstattung und Standortdarstellung | 23 bestanden |
| HTML-Extraktion, Einrichtungsidentität und sichere Ablehnung | 6 bestanden |
| **Gesamt** | **257 bestanden** |

Zusätzlich JavaScript-Syntax aller sieben geänderten Skripte geprüft. Keine JavaScript-Laufzeitfehler in den bestandenen Browserläufen. Die 120 Kernprüfungen umfassen Erstellung von Sport-/Lerntreffen, Bearbeiten, Beitritt/Rückzug, Teilnehmerzahlen, Gruppen, Chatberechtigungen, Profilwechsel, Speicherung und Fehlerfälle.

Alle 25 Ortsdetails wurden im Browser geprüft. Sportanlage und beide Bibliotheken wurden bei 320, 375, 430, 768 und 1440 Pixeln geprüft: kein horizontaler Überlauf, eine Spalte auf kleinen Smartphones, zwei auf Desktop. Visuell kontrolliert anhand der erzeugten Desktop- und Mobilaufnahmen. Tastaturfokus und Auslösen der Hauptaktion geprüft. Die kontextbezogenen Erstellaktionen wählen den richtigen Ort und Sport-/Lerntreffen vor. Vorhandene geplante Aktivitäten werden weiterhin angezeigt.

Die Browserfunktionstests laden die echten lokalen Dateien über eine Test-URL, weil Loopback-Aufrufe in dieser Testumgebung eingeschränkt waren. Kartenkacheln sind dabei simuliert; ergänzende künstliche OSM-Orte dienen ausschließlich Last- und Importtests. Der tatsächliche ausgelieferte Katalog enthält keine dieser Testorte. Die offiziellen Bibliotheksseiten wurden separat wirklich per HTTPS abgerufen. Im vorherigen geografischen Abschluss wurden zusätzlich 42 echte CARTO-Kacheln erfolgreich geprüft; dieser Umbau hat den Kartenanbieter nicht geändert.

Ergebnisse: `tests/place-details-result.json`, `tests/place-info-result.json`, `tests/result.json`, `tests/geography-result.json`, `tests/geography-browser-result.json`. Die Python-Suite meldet sechs bestandene Tests direkt im Terminal. Ansichten unter `tests/screenshots/ortsdetails-*.png`.

## Offen und bewusst nicht als bestätigt ausgegeben

- Keine belastbaren individuellen Öffnungszeiten der 23 Sportorte; keine Annahme „24/7“.
- Zugang, Gebührenfreiheit, kurzfristige Sperrungen und tatsächliche Nutzbarkeit sind nicht vor Ort verifiziert.
- Keine gesicherten Kapazitäten reservierbarer Gruppenräume, freien Lernplätze oder vollständigen Gerätebestände.
- Feiertags-, Ferien- und spontane Sonderzeiten der Bibliotheken sind nicht vollständig erfasst. Nicht veröffentlichte Tage werden nicht als geschlossen ergänzt; der Datenstand wird angezeigt.
- Komplexe OSM-Zeitregeln benötigen später einen umfassenderen Parser. Der aktuelle einfache Parser lässt sie unbekannt.
- Der aktuelle Live-OSM-Abruf war zuvor durch HTTP 406/429, Timeout beziehungsweise HTTP 502 eingeschränkt. Diese Anbieter-/Testumgebungsfehler werden nicht als erfolgreiche Ortsrecherche ausgegeben. Die vorhandene kontrollierte Aktualisierung und der lokale Ersatzbestand bleiben nutzbar.

Geometrien, Einrichtungsfakten und Bibliotheksstunden sind reale Quelldaten. Anmeldung, Profile, Treffen, Gruppen, Chats und Teilnehmerplätze bleiben lokal simulierte Prototypfunktionen. Eine Teilnahme reserviert keinen Platz; es gibt kein Backend und keine geräteübergreifende Kommunikation.
