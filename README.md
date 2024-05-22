"# Projektseminar-Webspiel" 
Githubprojekt für das Projektseminar
🎲
## Frameworks und Technology
### Start server
In the terminal, move to the project directory and execute
npm install

### Browserify
Mit Browserify werden alle für die Webseite benötigten JavaScript-Dateien in eine Datei gebundlet (bundle.js). Um berücksichtigt zu werden, muss der Dateiname in "index.js" hinterlegt werden.
Installation: Anweisungen auf https://browserify.org/ befolgen
Anwendung: Nach Veränderung einer Skript-Datei den Befehl "Npx browserify [index.js] -o [bundle.js]" im Terminal ausführen, für die beiden Dateien relative Dateipfade angeben