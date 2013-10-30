Class('Entity')({

    ACTIONS : ['collide', 'die', 'input', 'tick'],

    prototype : {

        behaviors : null, // Holds the transformed behaviors

        init : function(configuration) {
            var entity = this;
            var behavior;
            Object.keys(configuration).forEach(function(key) {
                entity[key] = configuration[key];
            });

            // Set up the behaviors
            var behaviorMap = {};

            Entity.ACTIONS.forEach(function(actionName) {
                behaviorMap[actionName] = [];
            });

            this.behaviorCodes.forEach(function(code) {
                behavior = BEHAVIORS[parseInt(code, 16)];
                Entity.ACTIONS.forEach(function(actionName) {
                    if(behavior[actionName]) {
                        behaviorMap[actionName].push(behavior[actionName]);
                    }
                }); // TODO: Possibly iterations can be reduced by extending. Find correct data structure
            });

            this._behaviors = behaviorMap;

            this._defineActions();
            console.log("entity", this);
        },

        hasBehavior : function(behaviorCode) {
            return this.behaviorCodes.indexOf(behaviorCode) !== -1;
        },


        // Makes this object acts as a command proxy for all the handlers,
        // defined in the constant Entity.ACTIONS
        _defineActions : function() {
            var entity = this;
            Entity.ACTIONS.forEach(function(actionName) {
                entity[actionName] = function() {
                    // Keep the reference, since arguments is scope variable
                    var actionArguments = arguments;

                    entity._behaviors[actionName].forEach(function(behavior) {
                        behavior.apply(entity, actionArguments);
                    });
                }
            });
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

        _gameCycle : function() {
            var game = this;
            game._screen.clear();

            game._cycleEntites = [];

            this._gameDefinition.entities.forEach(function(entity) {
                // First priority is input at the beginning of each action
                entity.input(Object.keys(game._cycleInputs));
            });

            // Prepare capture for this tick
            game._cycleInputs = [];

            this._gameDefinition.entities.forEach(function(entity) {
                entity.tick();
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
                entity.die(game);
            });


            this._gameDefinition.entities.forEach(function(entity) {
                game._screen.draw(entity);
            });

            if(game._state) {
                console.log(game._state === Game.WIN_STATE ? 'You win!' : 'You lose!');
                game.stop();
            }
        },

        _collisionCheck : function(entity) {
            var index, other, x, y;
            for(var i = 0; i < entity.pixels.length; i++) {
                x = entity.x + (i % entity.width);
                y = entity.y + Math.floor(i / entity.width);
                index = x + (y * 16);
                other = this._cycleEntites[index]
                if(other) {
                    entity.collide(other);
                    other.collide(entity);
                }
                this._cycleEntites[index] = entity;
            }
        }
    }
});