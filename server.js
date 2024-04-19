
const ws = require('ws');
const wss = new ws.Server({noServer: true});
const http = require("http");


const clients = new Set();

http.createServer((req, res) => {
  // here we only handle websocket connections
  // in real project we'd have some other code here to handle non-websocket requests
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
});

function onSocketConnect(ws) {
  clients.add(ws);

  ws.on('message', function(message) {
    message = message.slice(0, 50); // max message length will be 50

    for(let client of clients) {
      client.send(message);
    }
  });

  ws.on('close', function() {
    clients.delete(ws);
  });
}







/* // Erforderliche Module importieren
const express = require('express');

// Express-App erstellen
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für das Parsen von JSON-Daten
app.use(express.json());

// Beispiel-Routen definieren
app.get('/', (req, res) => {
    res.send('Willkommen auf der Startseite!');
});

app.post('/api/user', (req, res) => {
    const { username, email } = req.body;
    // Hier könntest du die erhaltenen Daten verarbeiten, z.B. in eine Datenbank speichern
    res.status(201).json({ message: 'Benutzer erfolgreich erstellt', username, email });
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
}); */