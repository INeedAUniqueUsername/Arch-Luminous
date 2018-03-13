/* Rubbish Square
Rows
3   1 2 3
2   4 5 6
1   7 8 9

    1 2 3
    Columns
    
>right 1
123    123
456 -> 456
789    978

>right 2
123    123
456 -> 645
789    789

>right 3
123    312
456 -> 456
789    789

>left 1
123    123
456 -> 456
789    897

>left 2
123    123
456 -> 564
789    789

>left 3
123    231
456 -> 456
789    789

>up 1
123    423
456 -> 756
789    189

>up 2
123    153
456 -> 486
789    729


>up 3
123    126
456 -> 459
789    783

>down 1
123    723
456 -> 156
789    489

>down 2
123    183
456 -> 426
789    759

>down 3
123    129
456 -> 453
789    786
*/

const CONFIG = require('../config.json');
const core = require('./core.js');
const prefix = 'RS!';
const helpText = function(name, desc) {
    return '`' + prefix + name + '`: ' + desc;
}
const solution = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
let cube = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
const findPoint = function(target) {
    for(let y = 0; y < 3; y++) {
        for(let x = 0; x < 3; x++) {
            if(cube[y][x] === target) {
                return { x:x, y:y };
            }
        }
    }
};
const up = function(point) {
    let x = point.x;
    let yIndexes = [0, 1, 2];
    let yValues = yIndexes.map(yIndex => cube[yIndex][x]);
    //Rotate the elements up
    yValues.push(yValues.shift());
    yIndexes.forEach(yIndex => cube[yIndex][x] = yValues[yIndex]);
};
const down = function(point) {
    let x = point.x;
    let yIndexes = [0, 1, 2];
    let yValues = yIndexes.map(yIndex => cube[yIndex][x]);
    //Rotate the elements down
    yValues.unshift(yValues.pop());
    yIndexes.forEach(yIndex => cube[yIndex][x] = yValues[yIndex]);
};
const right = function(point) {
    let y = point.y;
    let xIndexes = [0, 1, 2];
    let xValues = xIndexes.map(xIndex => cube[y][xIndex]);
    //Rotate the elements right
    xValues.unshift(xValues.pop());
    xIndexes.forEach(xIndex => cube[y][xIndex] = xValues[xIndex]);
};
const left = function(point) {
    let y = point.y;
    let xIndexes = [0, 1, 2];
    let xValues = xIndexes.map(xIndex => cube[y][xIndex]);
    //Rotate the elements left
    xValues.push(xValues.shift());
    xIndexes.forEach(xIndex => cube[y][xIndex] = xValues[xIndex]);
};
const checkSolved = function(message) {
    if(cube.map(row => row.join('')).join('') === solution.map(row => row.join('')).join('')) {
        message.channel.send('The square is solved');
    }
}
module.exports = {
    desc: 'Rubbish Module',
    commands: {
        display: function(message, args) {
            message.channel.send('```\n' + cube.map(row => row.join('')).join('\n') + '\n```');
            checkSolved(message);
        },
        up: function(message, args) {
            let point = findPoint(parseInt(args[0]));
            if(!point) {
                message.channel.send(core.tag(message.author.id) + ', invalid number');
                return;
            }
            up(point);
            commands.display(message);
            checkSolved(message);
        },
        down: function(message, args) {
            let point = findPoint(parseInt(args[0]));
            if(!point) {
                message.channel.send(core.tag(message.author.id) + ', invalid number');
                return;
            }
            down(point);
            commands.display(message);
            checkSolved(message);
        },
        right: function(message, args) {
            let point = findPoint(parseInt(args[0]));
            if(!point) {
                message.channel.send(core.tag(message.author.id) + ', invalid number');
                return;
            }
            right(point);
            commands.display(message);
            checkSolved(message);
        },
        left: function(message, args) {
            let point = findPoint(parseInt(args[0]));
            if(!point) {
                message.channel.send(core.tag(message.author.id) + ', invalid number');
                return;
            }
            left(point);
            commands.display(message);
            checkSolved(message);
        },
        scramble: function(message, args) {
            for(let i = 0; i < 25*Math.random() + 25; i++) {
                let moves = [up, down, right, left];
                //Randomly move the square around
                moves[Math.floor(moves.length * Math.random())](findPoint(Math.floor(Math.random()*9+1)));
            }
            commands.display(message);
        }
    },
    help: {
        display: helpText('display', 'Displays the square'),
        up: helpText('up <number>', 'Takes the column containing the specified number and rotates it up'),
        down: helpText('down <number>', 'Takes the column containing the specified number and rotates it down'),
        right: helpText('right <number>', 'Takes the row containing the specified number and rotates it right'),
        left: helpText('left <number>', 'Takes the row containing the specified number and rotates it left'),
        scramble: helpText('scramble', 'Scrambles the square'),
    },
    prefix: prefix,
    ready: function() {
        console.log('Rubbish online');
    },
};
const commands = module.exports.commands;