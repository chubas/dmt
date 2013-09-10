var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var colors = [null, 'black', 'white', 'blue', 'red', 'green']; //...

var cycleArray;
var pixelOn = function(x, y, colorCode, entity) {
    ctx.fillStyle = colors[colorCode];
    ctx.fillRect(x * 16, y * 16, 16, 16);
    var was = cycleArray[x * 16 + y];
    cycleArray[x * 16 + y] = entity;
    return was;
};

var pixelOff = function(x, y) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x*16, y*16, 16, 16);
    cycleArray[x * 16 + y] = null;
};

var program = '2|31211-001320|1E3333-0E1E1F';
var hexValueAt = function(index) {
    return parseInt(program[index], 16);
}
var length = program.length;

var bgColor = colors[+program[0]];

var _BEHAVIORS = [];

var gameState = null; // true is win, false is lose, null is playing

// Behavior return codes:
// 1 => object dies

_BEHAVIORS[0x1E] = { // hurtable
    collide : function(other) {
        return is(other, 0) ?  1 : null;
    }
};
_BEHAVIORS[0x13] = { // Move down
    tick : function() {
        this.y += 1;
    }
};

console.log("bgcolor", bgColor);

ctx.fillStyle = bgColor;
ctx.fillRect(0, 0, 256, 256);
var entities = [];
var i = 2;
while(i < length) {

    var x = hexValueAt(i++);
    console.log(i, x)
    var y = hexValueAt(i++);
    console.log(i, y)
    var width = hexValueAt(i++);
    console.log(i, width)
    var mapping;
    var pixels = [];
    var behaviors = [];
    while(program[i] != '-' && i < length) {
        console.log(i, program[i], colors[+program[i]])
        pixels.push(program[i]);
        i++;
    }
    i++; // Skip the -
    while(program[i] != '|' && i < length) {
        behaviors.push(program.substring(i, i+2));
        i = i+2;
    }
    console.log(behaviors);
    entities.push({
        x : x,
        y : y,
        width : width,
        height : Math.floor(pixels.length / width),
        pixels : pixels,
        behaviors : behaviors
    });

    console.log(entities[entities.length - 1]);

    i++;
}

var clear = function() {
    for(i = 0; i < 256; i++) {
        pixelOff(Math.floor(i / 16), i%16);
    }
    console.log("Cleaned!");
}
var draw = function(entity, callback) {
    for(var j = 0; j < entity.pixels.length; j++) {
        var collision = pixelOn(
            entity.x + (j % entity.width),
            entity.y + Math.floor(j / entity.width),
            entity.pixels[j],
            entity
        );
        callback(collision);
    }
};


// Draw pixels
var interval = setInterval(function() {
    cycleArray = [];
    clear();
    entities.forEach(function(entity) {
        entity.behaviors.forEach(function(behavior) {
            var beh = _BEHAVIORS[parseInt(behavior, 16)];
            if(beh) { // Remove this condition after all are implemented
                if(beh.tick) {
                    beh.tick.call(entity);
                }
            }
            if(entity.x < 0 || // Check for OOB entity
                entity.y < 0 ||
                entity.x + entity.width > 16 ||
                entity.y + entity.height > 16) {
                //debugger;
                entity.dead = true;
            }

            // Dead objects check
            if(entity.dead) {
                if(parseInt(behavior, 16) === 0x1F) { // Lose on die
                    gameState = false;
                } else if(parseInt(behavior, 16) === 0x20) {// Win on die
                    gameState = true;
                }
            }
        })
        draw(entity, function(collision) {
            if(collision) {
                console.log('collision!', collision);
            }
        });
    });
    if(gameState === true) {
        console.log("You win!");
        clearInterval(interval);
    } else if(gameState === false) {
        console.log("You lose!");
        clearInterval(interval);
    }
}, 1000);