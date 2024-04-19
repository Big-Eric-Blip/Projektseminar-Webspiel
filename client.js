
const url = "127.0.0.1:3000";



const WebSocket = require('ws');

// Verbindung zum Websocket-Server herstellen
const socket = new WebSocket('ws://' + url);

// Event-Handler für Verbindungsereignisse
socket.on('open', function() {
  console.log('Verbindung hergestellt.');

  // Nachricht an den Server senden
  socket.send('Hallo Server, ich bin der Client!');
});

// Event-Handler für eingehende Nachrichten
socket.on('message', function(data) {
  console.log('Nachricht vom Server:', data);
});

// Event-Handler für Fehler
socket.on('error', function(error) {
  console.error('Verbindungsfehler:', error);
});

// Event-Handler für das Schließen der Verbindung
socket.on('close', function() {
  console.log('Verbindung geschlossen.');
});
