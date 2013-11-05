Class('Game')({
    prototype : {
        init : function(code) {
            // this._engine = new Engine('2|1E3333-060A1E1F|31211-00021320');
            this._engine = new Engine('2|1113-000304060A25|EE15-1E20|0741111-25|3011111-25|4341111-25|7411111111-25|3A41111-25|3B111-25|4C6111111-25|A3211-25|A9211-25|C311111111111111-25');
        },

        run : function(code) {
            this._engine.run();
        }
    }
});