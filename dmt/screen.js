Class('Screen')({

    COLORS : [null, 'black', 'white', 'blue', 'red', 'green'],

    prototype : {
        init : function(canvas, bgColorCode) {
            this._ctx = canvas.getContext('2d');
            this._bgColorCode = bgColorCode;
        },

        clear : function() {
            for(var i = 0; i < 256; i++) {
                this.pixelOff(Math.floor(i / 16), i % 16);
            }
        },

        pixelOn : function(x, y, colorCode) {
            //console.log("Pixel on", x, y, colorCode);
            this._ctx.fillStyle = Screen.COLORS[colorCode];
            this._ctx.fillRect(x * 16, y * 16, 16, 16);
        },

        pixelOff : function(x, y) {
            //console.log("Pixel off", x, y)
            this._ctx.fillStyle = Screen.COLORS[this._bgColorCode];
            this._ctx.fillRect(x * 16, y * 16, 16, 16);
        },

        draw : function(entity) {
            for(var i = 0; i < entity.pixels.length; i++) {
                this.pixelOn(
                    entity.x + (i % entity.width),
                    entity.y + Math.floor(i / entity.width),
                    entity.pixels[i]
                )
            }
        }
    }
});