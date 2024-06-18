
class Renderer {
    constructor(canvasID) {

        this.scale = 1;
        this.tokens = [];
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