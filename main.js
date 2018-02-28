const Discord = require('discord.js');
const me = new Discord.Client();
const core = require('./core.js');
const CONFIG = require('../config.json');

const cerebrum = require('./cerebrum.js');
const rpg = require('./rpg.js');
const COMMAND_MODULES = [cerebrum, rpg];

const hooks = require('./hooks.js');

const version = '0X';
let asleep = false;
const restart = function() {
    asleep = true;  //This instance stops responding to messages
    require('child_process').exec('node \"' + CONFIG.path + '\"', function() {
        process.exit(); //Doesn't seem to work for some reason
    });
};
const coreFunctions = {
    about: function(message, args) {
        message.channel.send('Created by ' + core.tag(CONFIG.archId) + '.\nGitHub: https://github.com/INeedAUniqueUsername/Arch-Luminous');
    },
    version: function(message, args) {
        message.channel.send('My Version: `' + version + '`');
    },
    help: function(message, args) {
        let criterion = args[0] || '';
        if(criterion) {
            let reply = core.tag(CONFIG.meId) + ' Function Help';
            for(let i = 0; i < COMMAND_MODULES.length; i++) {
                let module = COMMAND_MODULES[i];
                let prefix = module.prefix;
                for(let name in module.commands) {
                    let command = prefix + name;
                    if(command.includes(criterion)) {
                        let help = module.help;
                        if(help) {
                            let text = help[name];
                            if(text) {
                                reply += '\n' + text;
                            } else {
                                reply += '\n`' + prefix + name + '`: No help available for this command';
                            }
                        } else {
                            reply += '\n`' + prefix + name + '`: No help available for this command\'s module';
                        }
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
                    let help = module.help;
                    if(help) {
                        let text = help[name];
                        if(text) {
                            reply += '\n' + text;
                        } else {
                            reply += '\n`' + prefix + name + '`: No help available for this command';
                        }
                    } else {
                        reply += '\n`' + prefix + name + '`: No help available for this command\'s module';
                    }
                }
            }
            message.channel.send(reply);
        }
    },
    sd: function(message, args) {
        if(message.author.id === CONFIG.archId) {
            message.channel.send('Self destruct sequence activated.');
            restart();
        } else {
            message.channel.send(message.channel.send(core.tag(message.author.id) + ', your credentials, please?'));
        }
    }
}
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
};
me.on('ready', function() {
    console.log('Hello World!');
    cerebrum.ready();
    rpg.ready();
});
me.on('message', function(message) {
    if(asleep)
        return;
    if(message.author.id === CONFIG.meId)
        return;
    let input = message.content;
    console.log(input);
    let parts = input.split(' ').map(function(s) { return s.trim(); });
    if(hooks.intercept(message)) {
        console.log('Message intercepted by hook');
        return;
    } else if(parts[0] === core.tag(CONFIG.meId)) {
        let f = coreFunctions[parts[1]];
        if(f) {
            f(message, parts.slice(2));
        } else {
            message.channel.send('You called? If you need help, say: ' + core.tag(CONFIG.meId) + ' help [command]');
        }
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
me.login(CONFIG.token);