Class('Game')({
    prototype : {
        init : function(code) {
            this._engine = new Engine(code);
        },

        run : function(code) {
            this._engine.run();
        }
    }
})