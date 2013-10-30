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

Class('Game')({

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
                var behavior = BEHAVIORS[parseInt(behaviorCode, 16)];
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
                    var behavior = BEHAVIORS[parseInt(behaviorCode, 16)];

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
                behavior = BEHAVIORS[parseInt(behaviorCode, 16)];
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
                        behavior = BEHAVIORS[parseInt(behaviorCode, 16)];
                        if(behavior.collide) {
                            behavior.collide.call(entity, other);
                        }
                    });

                    other.behaviors.forEach(function(behaviorCode) {
                        behavior = BEHAVIORS[parseInt(behaviorCode, 16)];
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