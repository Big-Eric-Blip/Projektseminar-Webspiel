//import { validateMoveToken} from "../Communication/client";

class Renderer {
    constructor(canvasID) {

        this.scale = 1;
        this.tokens = [
            // blue token
            { tn: 'blue1', x: 50, y: 50, color: "blue" },
            { tn: 'blue2', x: 50, y: 150, color: "blue" },
            { tn: 'blue3', x: 150, y: 50, color: "blue" },
            { tn: 'blue4', x: 150, y: 150, color: "blue" },
            // green token
            { tn: 'green1', x: 950, y: 950, color: "green" },
            { tn: 'green2', x: 950, y: 1050, color: "green" },
            { tn: 'green3', x: 1050, y: 950, color: "green" },
            { tn: 'green4', x: 1050, y: 1050, color: "green" },
            // yellow token
            { tn: 'yellow1', x: 50, y: 950, color: "yellow" },
            { tn: 'yellow2', x: 50, y: 1050, color: "yellow" },
            { tn: 'yellow3', x: 150, y: 950, color: "yellow" },
            { tn: 'yellow4', x: 150, y: 1050, color: "yellow" },
            // red token
            { tn: 'red1', x: 950, y: 50, color: "red" },
            { tn: 'red2', x: 1050, y: 50, color: "red" },
            { tn: 'red3', x: 950, y: 150, color: "red" },
            { tn: 'red4', x: 1050, y: 150, color: "red" }
        ];
        this.fields = [];
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");
        this.currentToken = ""

        this.drawFields();
        this.drawTokens();


        //this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
    }
    listenToTheCanvas() {
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
    }


    drawFields() {
        console.log(this.fields)
        let ctx = this.ctx;
        let size = 45 * this.scale;
        this.fields.forEach((field) => {
            ctx.beginPath();
            ctx.fillStyle = field.color;
            ctx.arc(field.xCoord * this.scale, field.yCoord * this.scale, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }


    drawTokens() {

        let ctx = this.ctx;


        let size = 35 * this.scale;

        this.tokens.forEach((token) => {
            ctx.beginPath();
            ctx.scale(1, 1)
            ctx.fillStyle = token.color;
            ctx.fillRect(token.x * this.scale - size / 2, token.y * this.scale - size / 2, size, size);
            ctx.strokeStyle = "black";
            ctx.strokeRect(token.x * this.scale - size / 2, token.y * this.scale - size / 2, size, size);
            ctx.stroke();
        });
    }

    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        const clickPoint = { x: clickX, y: clickY };

        this.tokens.forEach(token => {
            // Die Position des Tokens entsprechend der aktuellen Skalierung berücksichtigen
            const tokenSize = 35 * this.scale;
            const tokenX = token.x;
            const tokenY = token.y;

            // Überprüfen, ob der Klick innerhalb des Bereichs des Tokens liegt
            if (
                clickPoint.x >= tokenX - tokenSize / 2 &&
                clickPoint.x <= tokenX + tokenSize / 2 &&
                clickPoint.y >= tokenY - tokenSize / 2 &&
                clickPoint.y <= tokenY + tokenSize / 2
            ) {
                console.log(`Game piece clicked:`, token);
                this.moveToken(token);
                this.currentToken = token
                return token.tn
            }
        });
        return "test false"
    }

    getCurrentToken(){
        return this.currentToken
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


        token.x = newField.xCoord;
        token.y = newField.yCoord;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawFields();
        this.drawTokens();

    }
}


document.addEventListener("DOMContentLoaded", function () {
    window.renderer = new Renderer("myCanvas");


})

module.exports = Renderer;