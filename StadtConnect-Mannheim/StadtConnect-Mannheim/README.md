# StadtConnect Mannheim – studentische Demo (ab 18)

## Start

**Windows:** `start-server.bat` doppelklicken (Python 3 erforderlich). Browser: http://localhost:8000

**macOS/Linux:** im Projektordner `./start-server.sh` (Python 3 erforderlich). Browser: http://localhost:8000

Im Ordner liegen `index.html`, `styles.css`, `app.js` und die Startskripte. Kein Backend und keine Build-Schritte erforderlich. Eine Internetverbindung wird für Leaflet/CDN, CARTO-Kartenkacheln und den OpenStreetMap-Datenabruf über Overpass benötigt.

## Inhalt und Funktionsweise

- Entdecken: 4 Stadtteile, 12 Kategorien, Mehrfachauswahl, Kartensuche, Marker-Clustering (Leaflet.markercluster), synchronisierte Liste und Karte.
- Aktivitäten: Sport- und Lerntreffen, Erstellen, Bearbeiten, Absagen, Beitritt/Rückzug, Teilnehmerzahlen, Thema/Lernziel bzw. Niveau/Ausrüstung, Meldung.
- Gruppen: Suche, Erstellen, Beitreten, Verlassen, Gruppenaktivitäten und Chat.
- Chats: lokale Chatnachrichten nur für Teilnehmende/Mitglieder.
- Profil: Studentische Demo-Profile mit freiwilligen Angaben, Sichtbarkeitsoptionen, Altersprüfung ab 18 Jahren, Wechsel des Demo-Profils, Abmelden, Registrierung mit rein fiktiven Angaben.
- Speicherung: Browser-Local-Storage. In „Mein Profil“ gibt es „Demo zurücksetzen“ mit Bestätigung.

## Reale Daten vs. Demo

**Real:** Kartenbilder (CARTO Voyager aus OpenStreetMap-Geodaten) und – sofern von Overpass erreichbar – echte OSM-Karteneinträge. Nicht verifiziert sind Zugänglichkeit, Kostenfreiheit, Öffnungszeiten, öffentliche Nutzbarkeit und die exakte Stadtteilgrenze. OSM-Merkmale werden nur angezeigt, wenn sie vorhanden sind.

**Simuliert:** Nutzerkonten, Login, Aktivitäten, Gruppen, Chats, Meldungen, Buchung von Teilnehmerplätzen. Keine Kommunikation über Geräte, keine Reservierung von Sportflächen oder Bibliotheksplätzen, keine Prüfung eines echten Studierendenstatus.

**Fiktive Beispielorte:** Für die Demo gibt es Beispiel-Basketballplätze, Bibliothekstreffpunkte und Trainingsorte. Sie werden **nicht** als echte Marker auf der Karte ausgegeben; sie dienen als lokale Treffpunkte der simulierten Beispielaktivitäten.

## Datenmigration

Beim ersten Start liest die Anwendung eine alte `stadtconnect_demo_v1`-Speicherung und archiviert diese unverändert unter `stadtconnect_legacy_backup_v1`. Nicht mehr passende Kategorien oder alte Angebote werden nicht in der neuen Ansicht gezeigt. Im Profil kann die Sicherung als JSON exportiert werden. Soweit möglich werden individuell angelegte, noch passende Aktivitäten übernommen und als prüfpflichtige Demo-Treffen markiert. Vorhandene kompatible OSM-Caches werden eingelesen.

## Hinweise

Falls Overpass nicht antwortet: manuell „Orte neu laden“ wählen. Bereits gespeicherte Kartenpunkte bleiben sichtbar. Das Kartenbild ist unabhängig davon. Nutzer müssen sich bewusst sein, dass in einem rein lokalen Prototyp die Demo-Profile **nicht** geschützt sind. Keine echten Passwörter oder E-Mail-Adressen eingeben. Der verwendete CARTO-Schlüssel liegt wie in der Ausgangsversion clientseitig vor; bei öffentlichem Hosting Zugriffs- und Nutzungseinstellungen im Anbieter-Konto prüfen.

## UI/UX-Upgrade – Oktober 2026

Die Campus-Edition baut auf der bestehenden Studierenden-Version auf. **Datenformat, Local-Storage-Schlüssel, Kartenanbieter mit vorhandener Schlüsselkonfiguration, Leaflet, Marker-Clustering, OSM-/Overpass-Abfragen sowie vorhandene Interaktionslogik wurden beibehalten.**

**Neu im Design:**

- Die Hauptaktion „Aktivität erstellen“ steht nur noch in der Hauptnavigation, nicht mehr zusätzlich in den Hero-Bereichen.
- Individuell gestaltete, kompakte Kopfbereiche für Entdecken, Aktivitäten, Gruppen, Chats und Profil mit echten Demo-Zählern bzw. erklärenden Statusangaben.
- Lebendigere Farbflächen, differenzierte Türkis-/Orange-/Blau-Akzente, grafische Formen und moderne Kartenlayouts.
- Optisch unterscheidbare Sport- und Lernaktivitäten mit Termin-Kacheln, Teilnehmerstatus und Host-Informationen.
- Neu gestaltete Gruppen-, Orts-, Chat-, Profil- und Filterelemente, stärkere Fokus-/Hover-Zustände und Rücksicht auf `prefers-reduced-motion`.
- Responsive Gestaltung für Desktop, Tablet und Smartphones; keine zusätzliche JavaScript-Bibliothek erforderlich.

### Prüfung dieser Version

- `node --check app.js`: bestanden.
- Lokale Headless-Browserprüfung ohne externe Netzanbindung: Navigation zu allen fünf Hauptansichten, nur ein CTA „Aktivität erstellen“, Kategorien auswählen/zurücksetzen, Aktivitäten erstellen, beitreten, Chatnachrichten schreiben und Teilnahme zurückziehen, Gruppen erstellen/verlassen/beitreten, Chat-Zugriff, Profil-Dialog mit Escape, Layouts bei 320/375/430/768/1024/1440 px. Keine JavaScript-Laufzeitfehler im Test.
- **Nicht live verifiziert:** Laden externer Leaflet-Skripte, CARTO-Kacheln und Overpass-Ortsdaten; in der isolierten Testumgebung war dieser Abruf nicht möglich. Die bisherige technische Kartenkonfiguration wurde nicht ersetzt.

Bei einer öffentlichen Veröffentlichung den bestehenden clientseitigen CARTO-Schlüssel sowie die Nutzungslimits im Anbieter-Konto prüfen.
