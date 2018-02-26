const Discord = require('discord.js');
const ME = new Discord.Client();
const CONFIG = require('../config.json');
const cerebrum = require('./cerebrum.js');
let asleep = false;
const restart = function() {
    asleep = true;  //This instance stops responding to messages
    require('child_process').exec('node \"' + CONFIG.path + '\"', function() {
        process.exit(); //Doesn't seem to work for some reason
    });
};
ME.on('ready', () => {
    console.log('Hello World!');
});
ME.on('message', function(message) {
    if(asleep)
        return;
    let input = message.content;
    if(input === 'self-destruct' && message.author.id === CONFIG.archId) {
        message.channel.send('Self destruct sequence activated.');
        restart();
    } else if(cerebrum.respond(message)) {
        return;
    } else if(input.startsWith('Arch!')) {
        input = input.slice(5).split(' ');
        let command = input.shift();
        let f = cerebrum.commands[command];
        if(f) {
            f(message, input);
        }
    }
});
ME.login(CONFIG.token);