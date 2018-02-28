const CONFIG = require('../config.json');
const lisp = CONFIG.lisp ? require(CONFIG.lisp) : {};
const core = require('./core.js');
const rpg = require('./rpg.js');
let sponges = {}, userVars = {}, macros = {};
let users = [];
const prefix = 'A!';
module.exports = {
    commands: {
        bind: function(message, args) {
            let author = message.author.id;
            if(author !== CONFIG.archId) {
                return;
            }
            let alias = args.shift();
            let macro = args.join(' ');
            if(!alias) {
                message.channel.send(core.tag(message.author.id) + ', missing alias parameter');
            } else if(!macro) {
                message.channel.send(core.tag(message.author.id) + ', missing macro parameter');
            } else if(module.exports.commands[alias]) {
                message.channel.send(core.tag(message.author.id) + ', cannot override core functionality');
            } else {
                macros[alias] = macro;
                message.channel.send(core.tag(message.author.id) + ', bound `' + alias + ' -> ' + macro + '`');
            }
        },
        bindings: function(message, args) {
            let reply = '';
            let criterion = args[0] || '';
            for(let key in macros) {
                if(key.includes(criterion) || macros[key].includes(criterion)) {
                    reply += '\n' + '`' + key + ' -> ' + macros[key] + '`';
                }
            }
            message.channel.send(core.tag(message.author.id) + ', ' + reply);
        },
        lisp: function(message, args) {
            args = args.join(' ');
            try {
                let result = lisp.run(args.trim());
                if(Array.isArray(result)) {
                    result = lisp.decode(result);
                }
                message.channel.send(core.tag(message.author.id) + ', ' + result);
            } catch(error) {
                message.channel.send(core.tag(message.author.id) + ', ' + error);
            }
        },
        sponge: function(message, args) {
            message.channel.send(('' + core.tag(message.author.id) + ', you have been ')
                + ((sponges[message.author.id] = !sponges[message.author.id]) ? 'polymorphed into a sponge!' : 'polymorphed back to normal!'));
        },
        unbind: function(message, args) {
            let author = message.author.id;
            if(author !== CONFIG.archId) {
                return;
            }
            //The alias already got replaced with a macro
            let alias = args.join(' ');
            if(!alias) {
                message.channel.send(core.tag(message.author.id) + ', missing alias parameter');
            } else {
                for(let alias_macro in macros) {
                    if(alias_macro === alias) {
                        message.channel.send(core.tag(message.author.id) + ', unbound `' + alias + ' -> ' + macros[alias] + '`');
                        delete macros[alias];
                        return;
                    }
                }
                message.channel.send(core.tag(message.author.id) + ', unknown alias `' + alias + '`');
            }
        },
    },
    help: {
        bind: ('`' + prefix + 'bind <alias> <macro>`: Binds a custom command macro for your convenience'),
        bindings: ('`' + prefix + 'bindings`: Lists all active macros.'),
        lisp: ('`' + prefix + 'lisp`: Runs lisp code'),
        sponge: ('`' + prefix + 'sponge`: Transforms you into a sponge'),
        unbind: ('`' + prefix + 'unbind <alias>`: Unbinds a custom command macro for your convenience')
    },
    macros: macros,
    prefix: prefix,
    ready: function() {
        console.log('Cerebrum online');
    },
    respond: function(message) {
        if(!users.includes(message.author.id)) {
            users.push(message.author.id);
        }
        
        let input = message.content;
        let author = message.author.id;
        let input2;
        //If the user is pinging someone
        if(users.includes(core.id(input))) {
            message.channel.send('***HEY ' + input + ', SOMEONE IS CALLING FOR YOU!***');
        } else if(input.toLowerCase() === 'hello') {
            message.channel.send("world!");
        } else if(!input.startsWith(module.exports.prefix + 'sponge') && sponges[message.author.id]) {
            message.channel.send(core.tag(message.author.id) + ', *whoa, a talking sponge?!*');
        } else if(input.startsWith(core.tag(CONFIG.meId))) {
            message.channel.send(core.tag(message.author.id) + ', no u.');
        } else if((input.endsWith('++') && (input = input.substr(0, input.length-2)).length > 0)
                 || (input.startsWith('++') && (input = input.substr(2)).length > 0)) {
            if(userVars[input] === undefined) userVars[input] = 0;
            message.channel.send(core.tag(message.author.id) + ', value of `' + input + '` incremented to ' + (++userVars[input]));
        } else if((input.endsWith('--') && (input = input.substr(0, input.length-2)).length > 0)
                 || (input.startsWith('--') && (input = input.substr(2)).length > 0)) {
            if(userVars[input] === undefined) userVars[input] = 0;
            message.channel.send(core.tag(message.author.id) + ', value of `' + input + '` decremented to ' + (--userVars[input]));
        } else if(author === CONFIG.archId && (input2 = input.split('=')).length > 1) {
            input = input2;
            for(let i = 0; i < input.length; i++) {
                input[i] = input[i].trim();
            }
            userVars[input[input.length-2]] = input[input.length-1];
            message.channel.send(core.tag(message.author.id) + ', value of ' + input[input.length-2] + ' set to ' + input[input.length-1]);
            for(let i = input.length-2; i > 0; i--) {
                userVars[input[i-1]] = userVars[input[i]];
                message.channel.send(core.tag(message.author.id) + ', value of ' + input[i-1] + ' set to ' + userVars[input[i]]);
            }
        } else if(author === CONFIG.archId && (input2 = userVars[input.trim()])) {
            message.channel.send(core.tag(message.author.id) + ', value of ' + input.trim() + ' is ' + input2);
        } else {
            return false;
        }
        return true;
    },
};