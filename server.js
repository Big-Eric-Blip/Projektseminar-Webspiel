const ws = require('ws');
const http = require("http");

const wss = new ws.Server({noServer: true});
const clients = new Set();

const server = http.createServer((req, res) => {
    // here we only handle websocket connections
    // in real project we'd have some other code here to handle non-websocket requests
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
});

function onSocketConnect(ws) {
    clients.add(ws);

    ws.on('message', function (fromClientMessage) {
        console.log(fromClientMessage.toString());
        const toClientMessage = "Message from server";

        for (let client of clients) {
            client.send(toClientMessage);
        }
    });

    ws.on('close', function () {
        clients.delete(ws);
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
