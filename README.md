# StadtConnect Mannheim

**StadtConnect Mannheim** ist ein Web-Prototyp für Studierende, die gemeinsam Sport treiben, Lernpartner finden und Treffen organisieren möchten. Die Anwendung verbindet eine interaktive Karte mit Aktivitäten, Gruppen und Chats.

> **CA 1 – Prototyp** · Technische Hochschule Mannheim

## Funktionsumfang

- **Entdecken:** Sportflächen und Bibliotheken auf einer interaktiven Karte anzeigen, nach Kategorien und Stadtbezirken filtern sowie Ortsdetails öffnen.
- **Startgebiet:** Die drei Mannheimer Stadtbezirke **Lindenhof, Neckarau und Rheinau** (einschließlich ihrer zugehörigen Stadtteile).
- **Aktivitäten:** Sport- und Lerntreffen erstellen und Teilnahmen im Demo-Modus verwalten.
- **Gruppen:** Gruppen beitreten oder verlassen und wiederkehrende Treffen organisieren.
- **Chats:** Absprachen, z. B. zu Treffpunkt, Uhrzeit und mitzubringender Ausstattung, im Demo-Modus simulieren.
- **Profil:** Eigene Aktivitäten und Gruppen einsehen sowie Demo-Daten verwalten.

## Voraussetzungen

- Ein aktueller Webbrowser, beispielsweise Chrome, Firefox oder Edge.
- **Python 3** für den lokalen Webserver. Es sind nach dem bisherigen Projektstand keine zusätzlichen Python-Pakete erforderlich.
- Eine Internetverbindung für externe Kartenkacheln und gegebenenfalls die Aktualisierung von Ortsdaten.

## Prototyp lokal starten

### Windows

1. Dieses Repository herunterladen: Auf GitHub **Code → Download ZIP** wählen und das ZIP-Archiv vollständig entpacken (alternativ das Repository klonen).
2. Den entpackten Projektordner öffnen.
3. Die vorhandene Datei **`start-server.bat`** doppelt anklicken.
4. Im Browser **http://localhost:8000** öffnen.
5. Zum Beenden das Fenster des lokalen Webservers schließen oder im Terminal **Strg + C** drücken.

Falls das Startskript nicht ausgeführt werden kann, einen Terminal im Projektordner öffnen und Folgendes ausführen:

```powershell
py -3 -m http.server 8000
```

Falls `py` nicht vorhanden ist, stattdessen `python -m http.server 8000` verwenden.

### macOS / Linux

1. Das Repository herunterladen beziehungsweise klonen und den Projektordner öffnen.
2. Ein Terminal **im Projektordner** starten.
3. Den lokalen Webserver ausführen:

```bash
python3 -m http.server 8000
```

4. Im Browser **http://localhost:8000** öffnen.
5. Mit **Strg + C** beenden.

**Wichtig:** Die Webseite über den lokalen Webserver aufrufen und nicht nur die `index.html` per Doppelklick öffnen. Andernfalls können Browser-Sicherheitsregeln das Laden lokaler Dateien oder Daten verhindern.

Falls Port 8000 bereits belegt ist, kann im Terminal beispielsweise `8001` statt `8000` verwendet werden. In diesem Fall die Adresse **http://localhost:8001** öffnen.

## Bedienung

1. Unter **Entdecken** einen Stadtbezirk oder eine Ortskategorie auswählen.
2. Auf einen Marker oder einen Eintrag in der Ergebnisliste klicken.
3. Unter **Ortsdetails** Informationen zu Standort und Ausstattung ansehen.
4. Über **Aktivität erstellen** ein Sport- oder Lerntreffen anlegen.
5. Unter **Gruppen** und **Chats** weitere Treffen und Absprachen im Demo-Modus ausprobieren.

## Technische Umsetzung

- Webanwendung mit **HTML, CSS und JavaScript**.
- Interaktive Karte mit **Leaflet** und Kartendaten beziehungsweise Kartenkacheln von **OpenStreetMap** und weiteren angegebenen Anbietern.
- Geografische Begrenzung der angezeigten Orte auf Lindenhof, Neckarau und Rheinau.
- Ortsdatenbestand mit lokal vorgehaltenen Informationen; eine Aktualisierung externer Daten kann durch Netzwerk- oder API-Einschränkungen scheitern.

## Einschränkungen des Prototyps

- **Demo-Anwendung:** Es gibt keine produktive Benutzerverwaltung und keine echte serverseitige Synchronisierung von Gruppen, Nachrichten und Aktivitäten über verschiedene Geräte hinweg.
- **Lokale Daten:** Simulierte Aktivitäten, Chats und Profile werden nur im jeweiligen lokalen Demo-Zustand verwaltet. Ein anderes Gerät sieht diese Änderungen nicht automatisch.
- **Karten und Ortsdaten:** Externe Kartenkacheln benötigen Internet. Angaben zu Zugänglichkeit, Öffnungszeiten und Ausstattung sind nicht für jeden Ort vollständig verifiziert.
- **Keine Reservierung:** Ein erstelltes Treffen reserviert keinen Sportplatz oder Lernraum.

