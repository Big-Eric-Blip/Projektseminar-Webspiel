
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

        this.drawFields();
        this.drawTokens();

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
}

document.addEventListener("DOMContentLoaded", function () {
    window.renderer = new Renderer("myCanvas");
})

module.exports = Renderer;