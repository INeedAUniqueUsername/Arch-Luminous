const Discord = require('discord.js');
const ME = new Discord.Client();

const CONFIG = require('../config.json');

const cerebrum = require('./cerebrum.js');
const rpg = require('./rpg.js');
const COMMAND_MODULES = [cerebrum, rpg];

const core = require('./core.js');
let asleep = false;
const restart = function() {
    asleep = true;  //This instance stops responding to messages
    require('child_process').exec('node \"' + CONFIG.path + '\"', function() {
        process.exit(); //Doesn't seem to work for some reason
    });
};
const run = function(message, input, command_module) {
    /*
    let active;
    do {
        active = false;
        for(let alias in cerebrum.macros) {
            let input_replaced = input.split(alias).join(cerebrum.macros[alias]);
            if(input !== input_replaced) {
                input = input_replaced;
                active = true;
            }
        }
    } while(active);
    */
    input = input.split(' ');
    let command = input.shift().toLowerCase();

    for(let alias in cerebrum.macros) {
        if(command === alias) {
            message.channel.send(core.tag(message.author.id) + ', `' + command + ' -> ' + cerebrum.macros[alias] + '`');
            input.unshift(cerebrum.macros[alias]);
            input = input.join(' ').split(' ');
            command = input.shift().toLowerCase();
            break;
        }
    }
    console.log('Command: ' + command);
    let f;
    if(command_module) {
        f = command_module.commands[command];
    } else {
        for(let i = 0; i < COMMAND_MODULES.length; i++) {
            let module = COMMAND_MODULES[i];
            if(f = module.commands[command]) {
                break;
            }
        }
    }
    if(f) {
        f(message, input);
    } else {
        message.channel.send(core.tag(message.author.id) + ', unknown command `' + command + '`');
    }
}
ME.on('ready', function() {
    console.log('Hello World!');
    cerebrum.ready();
    rpg.ready();
});
ME.on('message', function(message) {
    if(asleep)
        return;
    if(message.author.id === CONFIG.meId)
        return;
    let input = message.content;
    console.log(input);
    let parts = input.split(' ').map(function(s) { return s.trim(); });
    if(parts[0] === core.tag(CONFIG.meId) && parts.length === 1) {
        message.channel.send('You called? If you need help, say: ' + core.tag(CONFIG.meId) + ' help [command]');
    } else if(parts[0] === core.tag(CONFIG.meId) && parts[1] === 'help') {
        let criterion = parts[2] || '';
        if(criterion) {
            let reply = core.tag(CONFIG.meId) + ' Function Help';
            for(let i = 0; i < COMMAND_MODULES.length; i++) {
                let module = COMMAND_MODULES[i];
                let prefix = module.prefix;
                for(let name in module.commands) {
                    let command = prefix + name;
                    if(command.startsWith(criterion)) {
                        reply += '\n`' + prefix + name + '`' + (module.help ? (': ' + (module.help[c] || 'no help available for this command')) : ': no help available for this command\'s module') /* + ': ' + module.help[c]*/;
                    }
                }
            }
            message.channel.send(reply);
        } else {
            let reply = core.tag(CONFIG.meId) + ' Function List';
            for(let i = 0; i < COMMAND_MODULES.length; i++) {
                let module = COMMAND_MODULES[i];
                let prefix = module.prefix;
                for(let name in module.commands) {
                    reply += '\n`' + prefix + name + '`' + (module.help ? (': ' + (module.help[c] || 'no help available for this command')) : ': no help available for this command\'s module') /* + ': ' + module.help[c]*/;
                }
            }
            message.channel.send(reply);
        }
    } else if(parts[0] === core.tag(CONFIG.meId) && parts[1] === 'sd' && message.author.id === CONFIG.archId) {
        message.channel.send('Self destruct sequence activated.');
        restart();
    } else if(cerebrum.respond(message)) {
        return;
    }
    
    for(let i = 0; i < COMMAND_MODULES.length; i++) {
        let module = COMMAND_MODULES[i];
        if(input.startsWith(module.prefix)) {
            run(message, input.slice(module.prefix.length), module);
        }
    }
});
ME.login(CONFIG.token);