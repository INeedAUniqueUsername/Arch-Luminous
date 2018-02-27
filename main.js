const Discord = require('discord.js');
const ME = new Discord.Client();

const CONFIG = require('../config.json');
const cerebrum = require('./cerebrum.js');
const core = require('./core.js');
const COMMAND_PREFIX = 'A!';
let asleep = false;
const restart = function() {
    asleep = true;  //This instance stops responding to messages
    require('child_process').exec('node \"' + CONFIG.path + '\"', function() {
        process.exit(); //Doesn't seem to work for some reason
    });
};
const run = function(message, input) {
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
    let f = cerebrum.commands[command];
    if(f) {
        f(message, input);
    } else {
        message.channel.send(core.tag(message.author.id) + ', unknown command `' + command + '`');
    }
}
ME.on('ready', function() {
    console.log('Hello World!');
    cerebrum.ready();
});
ME.on('message', function(message) {
    if(asleep)
        return;
    let input = message.content;
    if(input === 'sd' && message.author.id === CONFIG.archId) {
        message.channel.send('Self destruct sequence activated.');
        restart();
    } else if(cerebrum.respond(message)) {
        return;
    } else if(input.startsWith(COMMAND_PREFIX)) {
        input = input.slice(COMMAND_PREFIX.length);
        run(message, input);
    }
});
ME.login(CONFIG.token);