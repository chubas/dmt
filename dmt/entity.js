Class('Entity')({

    ACTIONS : ['collide', 'state', 'input', 'tick'],

    prototype : {

        x : 0,
        y : 0,
        width : 0,
        pixels : [],
        behaviorCodes : [],


        _behaviors : null,

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
                }); // TODO: Possibly iterations can be reduced by extending.
                    // Find correct data structure
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
                };
            });
        }

    }
});