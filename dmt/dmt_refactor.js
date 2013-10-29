Class('Parser')({


    parse : function(program) {
        console.log("Parsing");
        var result = {};
        var hexValueAt = function(index) {
            console.log("Hexvalue from", index)
            return parseInt(program[index], 16);
        }

        result.bgColorCode = parseInt(program[0], 10); // Parse the first character as number

        var i = 2; // Start after the separator following the bg color
        var x, y, width, pixels, behaviors, entities, mapping;
        entities = [];
        while(i < program.length) {
            x = hexValueAt(i++);
            y = hexValueAt(i++);
            width = hexValueAt(i++);
            pixels = [];
            behaviors = [];
            console.log("XYW", x, y, width);
            while(program[i] !== '-' && i < program.length) {
                pixels.push(program[i]);
                i++
            }
            i++; // Skip the -
            while(program[i] !== '|' && i < program.length) {
                behaviors.push(program.substring(i, i+2));
                i = i + 2;
            }
            i++;
            entities.push(new Entity({
                x : x,
                y : y,
                width : width,
                height : Math.floor(pixels.length / width),
                pixels : pixels,
                behaviors : behaviors
            }));
        }
        result.entities = entities;
        return result;
    }

});

Class('Entity')({
    prototype : {
        init : function(configuration) {
            var entity = this;
            Object.keys(configuration).forEach(function(key) {
                entity[key] = configuration[key];
            });
        }
    }
});

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


Class('Game')({

    BEHAVIORS : [],

    prototype : {

        program : null,
        screen : null,
        state : null, // Indicates end of game

        init : function(program) {
            this.program = program;
            var gameDefinition = Parser.parse(this.program);
            console.log(gameDefinition);
            this._gameDefinition = gameDefinition; // REF:Remove var
            this.screen = new Screen(document.getElementById('canvas'), gameDefinition.bgColorCode);
            console.log(this);
        },

        run : function() {
            this.tick = setInterval(this._gameCycle.bind(this), 1000);
        },

        stop : function() {
            clearInterval(this.tick);
        },

        _gameCycle : function() {
            var game = this;
            game.screen.clear();
            this._gameDefinition.entities.forEach(function(entity) {
                entity.behaviors.forEach(function(behaviorCode) {
                    var behavior = Game.BEHAVIORS[parseInt(behaviorCode, 16)];
                    if(behavior) {
                        if(behavior.tick) {
                            behavior.tick.call(entity);
                        }
                    }
                    // Check for OutOfBounds Entity
                    if(entity.x < 0 ||
                        entity.y < 0 ||
                        entity.x + entity.width > 16 ||
                        entity.y + entity.height > 16) {
                        entity.dead = true;
                    }

                    // Dead objects check
                    if(entity.dead) {
                        if(parseInt(behaviorCode, 16) === 0x1F) { // Lose on die
                            game.state = false;
                        } else if(parseInt(behaviorCode, 16) === 0x20) { // Win on die
                            game.state = true;
                        }
                    }
                });
                game.screen.draw(entity);
            });
            if(game.state === true) {
                console.log("You win!");
                game.stop();
            } else if(game.state === false) {
                console.log("You lose!");
                game.stop();
            }
        }
    }
});
Game.BEHAVIORS[0x1E] = { // hurtable
    collide : function(other) {
        return is(other, 0) ?  1 : null;
    }
};
Game.BEHAVIORS[0x13] = { // Move down
    tick : function() {
        this.y += 1;
        console.log("TICKED!");
    }
};

var game = new Game('2|31211-001320|1E3333-0E1E1F');
game.run();
