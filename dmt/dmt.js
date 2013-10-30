Class('Parser')({


    parse : function(program) {
        var result = {};
        var hexValueAt = function(index) {
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
        },

        hasBehavior : function(behaviorCode) {
            return this.behaviors.indexOf(behaviorCode) !== -1;
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

    WIN_STATE : 1,
    LOSE_STATE : 2,

    KEYS : {
        37 : 'LEFT',
        39 : 'RIGHT'
    },

    prototype : {

        program : null,

        _screen : null,
        _state : null, // Indicates end of game

        // Regenerated each cycle
        _cycleEntites : [],
        _cycleInputs : {},

        init : function(program) {
            this.program = program;
            this._gameDefinition = Parser.parse(this.program);
            this._canvas = document.getElementById('canvas');
            this._screen = new Screen(this._canvas, this._gameDefinition.bgColorCode);
            this._prepareKeyListeners();
            this._cycleInputs = {};
            this._cycleEntites = [];
            console.log(this);
        },

        run : function() {
            this.tick = setInterval(this._gameCycle.bind(this), 500);
        },

        stop : function() {
            clearInterval(this.tick);
        },

        lose : function() {
            this._state = this._state || Game.LOSE_STATE; // Win by default
        },

        win : function() {
            this._state = Game.WIN_STATE;
        },

        _prepareKeyListeners : function() {
            var game = this;
            document.body.focus();
            document.body.addEventListener('keydown', function(event) {
                game._keyPressed(event.keyCode);
            });
            document.body.addEventListener('keyup', function(event) {
                game._keyReleased(event.keyCode);
            });
        },

        _keyPressed : function(keyCode) {
            if(Game.KEYS[keyCode]) {
                this._cycleInputs[Game.KEYS[keyCode]] = true;
            }
        },

        _keyReleased : function(keyCode) {
            // if(Game.KEYS[keyCode]) {
            //     delete this._cycleInputs[Game.KEYS[keyCode]];
            //     console.log("RELEASE", keyCode, this._cycleInputs);
            // }
        },

        _checkInputActions : function(entity) {
            var game = this;
            entity.behaviors.forEach(function(behaviorCode) {
                var behavior = Game.BEHAVIORS[parseInt(behaviorCode, 16)];
                if(behavior && behavior.input) {
                    behavior.input.call(entity, Object.keys(game._cycleInputs));
                }
            })
        },

        _gameCycle : function() {
            var game = this;
            game._screen.clear();

            game._cycleEntites = [];

            this._gameDefinition.entities.forEach(function(entity) {
                // First priority is input at the beginning of each action
                game._checkInputActions(entity);
            });

            // Prepare capture for this tick
            game._cycleInputs = [];

            this._gameDefinition.entities.forEach(function(entity) {
                entity.behaviors.forEach(function(behaviorCode) {
                    var behavior = Game.BEHAVIORS[parseInt(behaviorCode, 16)];

                    // Tick override check
                    if(behavior) {
                        if(behavior.tick) {
                            behavior.tick.call(entity);
                        }
                    }
                });
            });

            this._gameDefinition.entities.forEach(function(entity) {
                // If any pixel is out, consider it dead for OOB
                if(entity.x < 0 ||
                    entity.y < 0 ||
                    entity.x + entity.width > 16 ||
                    entity.y + entity.height > 16) {
                    entity.dead = true;
                }

                // Collision check
                game._collisionCheck(entity);
            });

            this._gameDefinition.entities.forEach(function(entity) {
                game._checkDeadEntity(entity);
            });


            this._gameDefinition.entities.forEach(function(entity) {
                game._screen.draw(entity);
            });

            if(game._state) {
                console.log(game._state === Game.WIN_STATE ? 'You win!' : 'You lose!');
                game.stop();
            }
        },

        _checkDeadEntity : function(entity) {
            var game = this;
            var behavior;
            entity.behaviors.forEach(function(behaviorCode) {
                behavior = Game.BEHAVIORS[parseInt(behaviorCode, 16)];
                if(behavior.die) {
                    behavior.die.call(entity, game);
                }
            });
        },

        _collisionCheck : function(entity) {
            var index, other, x, y;
            for(var i = 0; i < entity.pixels.length; i++) {
                x = entity.x + (i % entity.width);
                y = entity.y + Math.floor(i / entity.width);
                index = x + (y * 16);
                other = this._cycleEntites[index]
                if(other) {
                    var behavior;
                    entity.behaviors.forEach(function(behaviorCode) {
                        behavior = Game.BEHAVIORS[parseInt(behaviorCode, 16)];
                        if(behavior.collide) {
                            behavior.collide.call(entity, other);
                        }
                    });

                    other.behaviors.forEach(function(behaviorCode) {
                        behavior = Game.BEHAVIORS[parseInt(behaviorCode, 16)];
                        if(behavior.collide) {
                            behavior.collide.call(other, entity);
                        }
                    });

                }
                this._cycleEntites[index] = entity;
            }
        }
    }
});

Game.BEHAVIORS[0x00] = { // Hurts
};

Game.BEHAVIORS[0x0E] = { // Move horizontal
    input : function(pressedKeys) {
        // TODO: Make an input dictionary
        var isPressingLeft = pressedKeys.indexOf('LEFT') !== -1;
        var isPressingRight = pressedKeys.indexOf('RIGHT') !== -1;
        if(isPressingLeft && !isPressingRight) { // Left but not both
            if(this.x > 0) { // Do not go out of bounds
                this.x -= 1;
            }
        }
        if(isPressingRight && !isPressingLeft) { // Right but not both
            if(this.x + this.width <= 15) { // Do not go out of bounds
                this.x += 1;
            }
        }
    }
};

Game.BEHAVIORS[0x1E] = { // Hurtable
    collide : function(other) {
        console.log("Calling collide", this, other);
        var otherHurts = other.hasBehavior('00');
        if(otherHurts) {
            console.log("HURTED!")
            this.dead = true;
        }
    }
};

Game.BEHAVIORS[0x13] = { // Move down
    tick : function() {
        this.y += 1;
    }
};

Game.BEHAVIORS[0x1F] = { // Lose on die
    die : function(game) {
        if(this.dead) {
            game.lose();
        }
    }
};

Game.BEHAVIORS[0x20] = { // Win on die
    die : function(game) {
        if(this.dead) {
            game.win();
        }
    }
};


// var game = new Game('2|31211-001320|1E3333-0E1E1F');
var game = new Game('2|1E3333-0E1E1F|31211-001320');
game.run();
