Class('Game')({
    prototype : {
        init : function(code) {
            this._engine = new Engine('2|1E3333-060A1E1F|31211-00021320');
        },

        run : function(code) {
            this._engine.run();
        }
    }
})