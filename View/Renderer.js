class Renderer {
    constructor(canvasID) {
        this.scale = 1;
        this.tokens = [];
        this.fields = [];
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");
        this.images = this.loadImages();
        this.drawFields();
        this.drawTokens();
    }

    drawFields() {        
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

    loadImages() {
        let images = {};
        images['red'] = new Image();
        images['red'].src = 'pictures/figureRed.png';
        images['blue'] = new Image();
        images['blue'].src = 'pictures/figureBlue.png';
        images['green'] = new Image();
        images['green'].src = 'pictures/figureGreen.png';
        images['yellow'] = new Image();
        images['yellow'].src = 'pictures/figureYellow.png';
        return images;        
    }

    drawTokens() {
        let ctx = this.ctx;
        let size = 50 * this.scale;
        this.tokens.forEach((token) => {
            let img = this.images[token.color];          
                ctx.drawImage(
                    img,
                    token.x * this.scale - size / 2,
                    token.y * this.scale - size / 2,
                    size,
                    size);
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {
    window.renderer = new Renderer("myCanvas");
})

module.exports = Renderer;