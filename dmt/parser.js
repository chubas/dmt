Class('Parser')({

    parse : function(program) {
        var result = {};
        var hexValueAt = function(index) {
            return parseInt(program[index], 16);
        };

        result.bgColorCode = parseInt(program[0], 10); // Parse the first character as number

        var i = 2; // Start after the separator following the bg color
        var x, y, width, pixels, behaviors, entities, mapping;
        entities = [];
        while(i < program.length) {
            x = hexValueAt(i++);
            y = hexValueAt(i++);
            width = hexValueAt(i++);
            pixels = [];
            behaviorCodes = [];
            while(program[i] !== '-' && i < program.length) {
                pixels.push(program[i]);
                i++;
            }
            i++; // Skip the -
            while(program[i] !== '|' && i < program.length) {
                behaviorCodes.push(program.substring(i, i+2));
                i = i + 2;
            }
            i++;
            entities.push(new Entity({
                x : x,
                y : y,
                width : width,
                height : Math.floor(pixels.length / width),
                pixels : pixels,
                behaviorCodes : behaviorCodes
            }));
        }
        result.entities = entities;
        return result;
    }

});