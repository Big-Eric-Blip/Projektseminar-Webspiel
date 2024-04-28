(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const url = "ws://127.0.0.1:3000";
const socket = new WebSocket(url);

// Connect to server
socket.addEventListener('open', function (event) {
    console.log('Connection established.');

    socket.send('Hello Server, I\'m the client!');
});

// Handle incoming messages
socket.addEventListener('message', function (event) {
    console.log('Message from server:', event.data);
});

// Error handling on connection
socket.addEventListener('error', function (error) {
    console.error('Connection Error:', error);
});

// Close connection
socket.addEventListener('close', function (event) {
    console.log('Connection closed.');
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('createGameButton');
    if (button) {
        button.addEventListener('click', createGame);
    } else {
        console.error('Button with id "createGameButton" not found.');
    }
});

function createGame() {
    console.log("yesss!");
    fetch('http://localhost:3000/createGame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // TODO set parameter not static values
        body: JSON.stringify({
            board: 1,
            colorOfFigure: "red",
            colorOfDie: "blue"
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('Response:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
},{}],2:[function(require,module,exports){
document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var small = 35;
    var big = 45;
    ctx.beginPath();
    /*Felder:
    blue (x,y): außen (50,50) (50,150) (150,150) (150,50) 
                innen (150,550) (250,550) (350,550) (450,550)
                erstes (50,450)
    green (x,y): außen (950,950) (950,1050) (1050,950) (1050,1050) 
                innen (650,550) (750,550) (850,550) (950,550)
                erstes (1050,650)
    yellow (x,y): außen (50,950) (50,1050) (150,950) (150,1050) 
                innen (550,650) (550,850) (550,750) (550,950)
                erstes (450,1050)
    red (x,y): außen (950,50) (950,50) (950,50) (950,50) 
                innen (550,150) (550,250) (550,350) (550,450)
                erstes (650,50)
    */
    let fields = [
        // blue home
        { fn: 'ba1', x: 50, y: 50, color: "blue" },
        { fn: 'ba2', x: 50, y: 150, color: "blue" },
        { fn: 'ba3', x: 150, y: 50, color: "blue" },
        { fn: 'ba4', x: 150, y: 150, color: "blue" },
        // blue safe
        { fn: 'bi1', x: 150, y: 550, color: "blue" },
        { fn: 'bi2', x: 250, y: 550, color: "blue" },
        { fn: 'bi3', x: 350, y: 550, color: "blue" },
        { fn: 'bi4', x: 450, y: 550, color: "blue" },
        // green home
        { fn: 'ga1', x: 950, y: 950, color: "green" },
        { fn: 'ga2', x: 950, y: 1050, color: "green" },
        { fn: 'ga3', x: 1050, y: 950, color: "green" },
        { fn: 'ga4', x: 1050, y: 1050, color: "green" },
        //green safe
        { fn: 'gi1', x: 650, y: 550, color: "green" },
        { fn: 'gi2', x: 750, y: 550, color: "green" },
        { fn: 'gi3', x: 850, y: 550, color: "green" },
        { fn: 'gi4', x: 950, y: 550, color: "green" },
        //yellow home
        { fn: 'ya1', x: 50, y: 950, color: "yellow" },
        { fn: 'ya2', x: 50, y: 1050, color: "yellow" },
        { fn: 'ya3', x: 150, y: 950, color: "yellow" },
        { fn: 'ya4', x: 150, y: 1050, color: "yellow" },
        // yellow safe
        { fn: 'yi1', x: 550, y: 650, color: "yellow" },
        { fn: 'yi2', x: 550, y: 750, color: "yellow" },
        { fn: 'yi3', x: 550, y: 850, color: "yellow" },
        { fn: 'yi4', x: 550, y: 950, color: "yellow" },
        // red home
        { fn: 'ra1', x: 950, y: 50, color: "red" },
        { fn: 'ra2', x: 1050, y: 50, color: "red" },
        { fn: 'ra3', x: 950, y: 150, color: "red" },
        { fn: 'ra4', x: 1050, y: 150, color: "red" },
        // red safe
        { fn: 'ri1', x: 550, y: 150, color: "red" },
        { fn: 'ri2', x: 550, y: 250, color: "red" },
        { fn: 'ri3', x: 550, y: 350, color: "red" },
        { fn: 'ri4', x: 550, y: 450, color: "red" },
        // white or first of color
        { fn: 'wp1', x: 50, y: 450, color: "blue" },
        { fn: 'wp2', x: 150, y: 450, color: "white" },
        { fn: 'wp3', x: 250, y: 450, color: "white" },
        { fn: 'wp4', x: 350, y: 450, color: "white" },
        { fn: 'wp5', x: 450, y: 450, color: "white" },
        { fn: 'wp6', x: 450, y: 350, color: "white" },
        { fn: 'wp7', x: 450, y: 250, color: "white" },
        { fn: 'wp8', x: 450, y: 150, color: "white" },
        { fn: 'wp9', x: 450, y: 50, color: "white" },
        { fn: 'wp10', x: 550, y: 50, color: "white" },
        { fn: 'wp11', x: 650, y: 50, color: "red" },
        { fn: 'wp12', x: 650, y: 150, color: "white" },
        { fn: 'wp13', x: 650, y: 250, color: "white" },
        { fn: 'wp14', x: 650, y: 350, color: "white" },
        { fn: 'wp15', x: 650, y: 450, color: "white" },
        { fn: 'wp16', x: 750, y: 450, color: "white" },
        { fn: 'wp17', x: 850, y: 450, color: "white" },
        { fn: 'wp18', x: 950, y: 450, color: "white" },
        { fn: 'wp19', x: 1050, y: 450, color: "white" },
        { fn: 'wp20', x: 1050, y: 550, color: "white" },
        { fn: 'wp21', x: 1050, y: 650, color: "green" },
        { fn: 'wp22', x: 950, y: 650, color: "white" },
        { fn: 'wp24', x: 850, y: 650, color: "white" },
        { fn: 'wp25', x: 750, y: 650, color: "white" },
        { fn: 'wp26', x: 650, y: 650, color: "white" },
        { fn: 'wp27', x: 650, y: 750, color: "white" },
        { fn: 'wp28', x: 650, y: 850, color: "white" },
        { fn: 'wp29', x: 650, y: 950, color: "white" },
        { fn: 'wp30', x: 650, y: 1050, color: "white" },
        { fn: 'wp31', x: 550, y: 1050, color: "white" },
        { fn: 'wp31', x: 450, y: 1050, color: "yellow" },
        { fn: 'wp33', x: 450, y: 950, color: "white" },
        { fn: 'wp34', x: 450, y: 850, color: "white" },
        { fn: 'wp35', x: 450, y: 750, color: "white" },
        { fn: 'wp36', x: 450, y: 650, color: "white" },
        { fn: 'wp37', x: 350, y: 650, color: "white" },
        { fn: 'wp38', x: 250, y: 650, color: "white" },
        { fn: 'wp39', x: 150, y: 650, color: "white" },
        { fn: 'wp40', x: 50, y: 650, color: "white" },
        { fn: 'wp41', x: 50, y: 550, color: "white" },
    ];
    
    fields.forEach(function (draw) {
        ctx.beginPath();
        ctx.fillStyle = draw.color;
        ctx.arc(draw.x, draw.y, big, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

});

},{}],3:[function(require,module,exports){
const script = require('./View/script');
const client = require('./Communication/client');

},{"./Communication/client":1,"./View/script":2}]},{},[3]);
