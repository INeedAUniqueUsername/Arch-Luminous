const CONFIG = require('../config.json');
const lisp = CONFIG.lisp ? require(CONFIG.lisp) : {};
const id = function(inp) {
    // strips out the first <@! and > in a string
    // if you send it a string that is already a legit id, it won't be harmed
    // if not passed a String, sends the input back
    // should always return a String
    if (typeof(inp) !== 'string') {return inp};
    var outp = inp.replace('<', '').replace('>', '').replace('!', '').replace('@', '');
    return outp;
};
const tag = function(inp) {
    var outp = '<@' + inp + '>';
    return outp;
};
let sponges = {};
let userVars = {};
module.exports = {
    respond: function(message) {
        let input = message.content;
        let author = message.author.id;
        let input2;
        if(input.toLowerCase() === 'hello') {
            message.channel.send("world!");
            return true;
        } else if(!input.startsWith('Arch!sponge') && sponges[message.author.id]) {
            message.channel.send(tag(message.author.id) + ', *whoa, a talking sponge?!*');
            return true;
        } else if(input.startsWith(tag(CONFIG.meId))) {
            message.channel.send(tag(message.author.id) + ', no u.');
            return true;
        } else if((input.endsWith('++') && (input = input.substr(0, input.length-2)).length > 0)
                 || (input.startsWith('++') && (input = input.substr(2)).length > 0)) {
            if(userVars[input] === undefined) userVars[input] = 0;
            message.channel.send(tag(message.author.id) + ', value of `' + input + '` incremented to ' + (++userVars[input]));
            return true;
        } else if((input.endsWith('--') && (input = input.substr(0, input.length-2)).length > 0)
                 || (input.startsWith('--') && (input = input.substr(2)).length > 0)) {
            if(userVars[input] === undefined) userVars[input] = 0;
            message.channel.send(tag(message.author.id) + ', value of `' + input + '` decremented to ' + (--userVars[input]));
            return true;
        } else if(author === CONFIG.archId && (input2 = input.split('=')).length > 1) {
            input = input2;
            for(let i = 0; i < input.length; i++) {
                input[i] = input[i].trim();
            }
            userVars[input[input.length-2]] = input[input.length-1];
            message.channel.send(tag(message.author.id) + ', value of ' + input[input.length-2] + ' set to ' + input[input.length-1]);
            for(let i = input.length-2; i > 0; i--) {
                userVars[input[i-1]] = userVars[input[i]];
                message.channel.send(tag(message.author.id) + ', value of ' + input[i-1] + ' set to ' + userVars[input[i]]);
            }
            return true;
        } else if(author === CONFIG.archId && (input2 = userVars[input.trim()])) {
            message.channel.send(tag(message.author.id) + ', value of ' + input.trim() + ' is ' + input2);
            return;
        }
    },
    commands: {
        sponge: function(message, args) {
            message.channel.send(('' + tag(message.author.id) + ', you have been ')
                + ((sponges[message.author.id] = !sponges[message.author.id]) ? 'polymorphed into a sponge!' : 'polymorphed back to normal!'));
        },
        lisp: function(message, args) {
            args = args.join(' ');
            try {
                let result = lisp.run(args.trim());
                if(Array.isArray(result)) {
                    result = lisp.decode(result);
                }
                message.channel.send(tag(message.author.id) + ', ' + result);
            } catch(error) {
                message.channel.send(tag(message.author.id) + ', ' + error);
            }
        }
    }
};