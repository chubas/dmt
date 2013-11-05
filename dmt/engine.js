Class('Engine')({

    WIN_STATE : 1,
    LOSE_STATE : 2,

    KEYS : {
        37 : 'LEFT',
        38 : 'UP',
        39 : 'RIGHT',
        40 : 'DOWN'
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
            this._pressedKey = null;
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
            this._state = this._state || Engine.LOSE_STATE; // Win by default
        },

        win : function() {
            this._state = Engine.WIN_STATE;
        },

        _prepareKeyListeners : function() {
            var game = this;
            document.body.focus();
            document.body.addEventListener('keydown', function(event) {
                game._keyPressed(event.keyCode);
            });
        },

        _keyPressed : function(keyCode) {
            if(Engine.KEYS[keyCode]) {
                this._pressedKey = Engine.KEYS[keyCode]
            }
        },

        _gameCycle : function() {
            var game = this;
            game._screen.clear();

            game._cycleEntites = [];

            this._gameDefinition.entities.forEach(function(entity) {
                // First priority is input at the beginning of each action
                entity.input(game._pressedKey);
            });

            // Prepare capture for this tick
            game._pressedKey = null;

            this._gameDefinition.entities.forEach(function(entity) {
                entity.tick();
            });

            this._gameDefinition.entities.forEach(function(entity) {
                // Collision check
                game._collisionCheck(entity);
            });

            this._gameDefinition.entities.forEach(function(entity) {
                // Check game state
                entity.state(game);
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