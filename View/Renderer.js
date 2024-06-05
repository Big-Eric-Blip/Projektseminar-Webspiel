class Renderer {
    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");
       /* this.small = 35;
        this.big = 45;*/

        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));

        this.tokens = [
            // blue token
            { tn: 'bt1', x: 50, y: 50, color: "blue" },
            { tn: 'bt2', x: 50, y: 150, color: "blue" },
            { tn: 'bt3', x: 150, y: 50, color: "blue" },
            { tn: 'bt4', x: 150, y: 150, color: "blue" },
            // green token
            { tn: 'gt1', x: 950, y: 950, color: "green" },
            { tn: 'gt2', x: 950, y: 1050, color: "green" },
            { tn: 'gt3', x: 1050, y: 950, color: "green" },
            { tn: 'gt4', x: 1050, y: 1050, color: "green" },
            // yellow token
            { tn: 'yt1', x: 50, y: 950, color: "yellow" },
            { tn: 'yt2', x: 50, y: 1050, color: "yellow" },
            { tn: 'yt3', x: 150, y: 950, color: "yellow" },
            { tn: 'yt4', x: 150, y: 1050, color: "yellow" },
            // red token
            { tn: 'rt1', x: 950, y: 50, color: "red" },
            { tn: 'rt2', x: 1050, y: 50, color: "red" },
            { tn: 'rt3', x: 950, y: 150, color: "red" },
            { tn: 'rt4', x: 1050, y: 150, color: "red" }
        ];
        this.fields = [

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
            { fn: 'wp32', x: 450, y: 1050, color: "yellow" },
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

        this.drawFields();
        this.drawTokens();

        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));


    }

    resizeCanvas() {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
        this.canvas.width = size;
        this.canvas.height = size;
        this.drawFields();
        this.drawTokens();
    }

    drawFields() {
       // let big = this.big;
        let ctx = this.ctx;

        this.fields.forEach(function (draw) {
            ctx.beginPath();
            ctx.fillStyle = draw.color;
            ctx.arc(field.x / 12 * this.canvas.width, field.y / 12 * this.canvas.height, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    drawTokens() {
        let small = this.small;
        let ctx = this.ctx;

        this.tokens.forEach(function (draw) {
            ctx.beginPath();
            ctx.fillStyle = draw.color;
            ctx.fillRect(token.x / 12 * this.canvas.width - size / 2, token.y / 12 * this.canvas.height - size / 2, size, size);

            ctx.strokeStyle = "black";
            ctx.strokeRect(token.x / 12 * this.canvas.width - size / 2, token.y / 12 * this.canvas.height - size / 2, size, size);
            ctx.stroke();
        });
    }

    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        this.tokens.forEach(token => {
            if (this.isPointInRect({ x: clickX, y: clickY }, token)) {
                console.log(`Game piece clicked:`, token);
                this.moveToken(token);
            }
        });
    }

    isPointInRect(point, token) {
        return (
            point.x >= token.x - this.small / 2 &&
            point.x <= token.x + this.small / 2 &&
            point.y >= token.y - this.small / 2 &&
            point.y <= token.y + this.small / 2
        );
    }


  moveToken(token) {
        console.log('Moving token:', token);

        console.log('Token is valid. Proceeding with movement.');
        const diceResultDiv = document.getElementById('resultDice');
        const resultDice = parseInt(diceResultDiv.innerText);
        console.log('Dice result:', resultDice);
        const currentIndex = this.fields.findIndex(field => field.x === token.x && field.y === token.y);
        console.log('Current index:', currentIndex);
        const newIndex = (currentIndex + resultDice) % this.fields.length;
        console.log('New index:', newIndex);
        const newField = this.fields[newIndex];
        console.log('New field:', newField);


        token.x = newField.x;
        token.y = newField.y;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawFields();
        this.drawTokens();

    }  


/* 
   moveToken(token) {
        console.log('Moving token:', token);
    
        console.log('Token is valid. Proceeding with movement.');
        const diceResultDiv = document.getElementById('resultDice');
        const resultDice = parseInt(diceResultDiv.innerText);
        console.log('Dice result:', resultDice);
    
        // Stellen Sie sicher, dass this.fields korrekt initialisiert ist
        if (!this.fields || !Array.isArray(this.fields)) {
            console.error('this.fields is not properly initialized:', this.fields);
            return;
        }
    
        // Überprüfen Sie, ob alle Felder korrekt initialisiert sind
        this.fields.forEach((field, index) => {
            if (!field || !field.fieldID) {
                console.error(`Field at index ${index} is not properly initialized:`, field);
            }
        });
    
        // Zugriff auf das Board-Objekt
        const board = this.board; // Stellen Sie sicher, dass das Board-Objekt korrekt initialisiert und zugewiesen ist
        if (!board) {
            console.error('Board object is not initialized.');
            return;
        }
    
        // Aktuelle Position des Tokens bestimmen
        const currentField = board.gameArray.find(field => field.x === token.x && field.y === token.y);
    
        if (!currentField) {
            // Token befindet sich noch im homeArray, setze auf Startposition
            const startingFieldID = board.getStartingPosition(token.color);
            const startingField = board.gameArray.find(field => field.fieldID === startingFieldID);
            console.log('Setting token to starting field:', startingField);
    
            if (startingField) {
                token.x = startingField.x;
                token.y = startingField.y;
            } else {
                console.error('Starting field not found for color:', token.color);
            }
        } else {
            // Token befindet sich bereits im gameArray, bewege um das Würfelergebnis weiter
            const newField = board.getNextPosition(currentField.fieldID, resultDice);
            console.log('New field:', newField);
    
            if (newField) {
                token.x = newField.x;
                token.y = newField.y;
            } else {
                console.error('New field not found.');
            }
        }
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawFields();
        this.drawTokens();
    } 
    

 */




}





document.addEventListener("DOMContentLoaded", function () {
    const renderer = new Renderer("myCanvas");
    
});
