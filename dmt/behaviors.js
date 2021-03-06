var move = function(expected, key, entity) {
    if(key === expected) {
        switch(key) {
            case 'LEFT':
                if(entity.x > 0) {
                    entity.x -= 1;
                }
                break;
            case 'RIGHT':
                if(entity.x + entity.width < 15) {
                    entity.x += 1;
                }
                break;
            case 'UP':
                if(entity.y > 0) {
                    entity.y -= 1;
                }
                break;
            case 'DOWN':
                if(entity.y + entity.height < 15) {
                    entity.y += 1;
                }
                break;
        }
    }
};

BEHAVIORS = [];

BEHAVIORS[0x00] = { // Hurts
};

BEHAVIORS[0x01] = { // Not used
};

BEHAVIORS[0x02] = { // Die on out of bounds
    state : function(engine) {
        if(this.x < 0 || this.y < 0 ||
            this.x > 15 || this.y > 15) {
            this.dead = true;
        }
    }
};

BEHAVIORS[0x03] = { // Controllable move down
    input : function(key) {
        move('DOWN', key, this);
    }
};

BEHAVIORS[0x04] = { // Controllable move up
    input : function(key) {
        move('UP', key, this);
    }
};

BEHAVIORS[0x06] = { // Controllable move right
    input : function(key) {
        move('RIGHT', key, this);
    }
};

BEHAVIORS[0x0A] = { // Controllable move left
    input : function(key) {
        move('LEFT', key, this);
    }
};

BEHAVIORS[0x1E] = { // Hurtable
    collide : function(other) {
        console.log("Calling collide", this, other);
        var otherHurts = other.hasBehavior('00');
        if(otherHurts) {
            console.log("HURTED!");
            this.dead = true;
        }
    }
};

BEHAVIORS[0x13] = { // Move down
    tick : function() {
        this.y += 1;
    }
};

BEHAVIORS[0x14] = { // Move up
    tick : function() {
        this.y -= 1;
    }
};

BEHAVIORS[0x1F] = { // Lose on die
    state : function(engine) {
        if(this.dead) {
            engine.lose();
        }
    }
};

BEHAVIORS[0x20] = { // Win on die
    state : function(engine) {
        if(this.dead) {
            engine.win();
        }
    }
};

BEHAVIORS[0x25] = { // Solid object
    // TBI
};

