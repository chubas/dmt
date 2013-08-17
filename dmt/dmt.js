var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var colors = [null, 'black', 'white', 'blue', 'red', 'green']; //...
var pixelOn = function(x, y, colorCode) {
    ctx.fillStyle = colors[colorCode];
    ctx.fillRect(x*16, y*16, 16, 16);
};

var pixelOff = function(x, y) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x*16, y*16, 16, 16);
};

var program = '2|31211-001320|1E3333-0E1E1F';
var hexValueAt = function(index) {
    return parseInt(program[index], 16);
}
var length = program.length;

var bgColor = colors[+program[0]];

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
        pixels : pixels,
        behaviors : behaviors
    });

    console.log(entities[entities.length - 1]);

    i++;
}

for(i = 0; i < entities.length; i++) {
    var entity = entities[i];
    for(var j = 0; j < entity.pixels.length; j++) {
        pixelOn(entity.x + (j % entity.width), entity.y + Math.floor(j / entity.width), entity.pixels[j]);
    }
}


// Draw pixels


//////
// var a = true;
// setInterval(function() {
//     console.log("Tick!");
//     if(a) {
//         pixelOn(0, 0, 4);
//         pixelOff(1, 1);
//     } else {
//         pixelOff(0, 0);
//         pixelOn(1, 1, 3);
//     }
//     a = !a;
// }, 1000);