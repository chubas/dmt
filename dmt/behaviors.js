BEHAVIORS = [];

BEHAVIORS[0x00] = { // Hurts
};

BEHAVIORS[0x0E] = { // Move horizontal
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

BEHAVIORS[0x1E] = { // Hurtable
    collide : function(other) {
        console.log("Calling collide", this, other);
        var otherHurts = other.hasBehavior('00');
        if(otherHurts) {
            console.log("HURTED!")
            this.dead = true;
        }
    }
};

BEHAVIORS[0x13] = { // Move down
    tick : function() {
        this.y += 1;
    }
};

BEHAVIORS[0x1F] = { // Lose on die
    die : function(game) {
        if(this.dead) {
            game.lose();
        }
    }
};

BEHAVIORS[0x20] = { // Win on die
    die : function(game) {
        if(this.dead) {
            game.win();
        }
    }
};

