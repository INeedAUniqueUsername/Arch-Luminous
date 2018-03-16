const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');
const mobtypes = require('./mobs.js');
const listeners = require('./listeners.js').listeners;

const Player = function(id, name, channel) {
    this.id = id;
    this.active = true;
    this.name = name;
    this.location = 'start';
    this.listeners = {
        say_room: listeners.default_say_room.bind(this),
        damage: listeners.default_damage.bind(this),
    };
    this.stats = {
        health: 60,
        baseDamage: 100
    }
    this.inventory = {
        items: [
                    new itemtypes.types.die_std(),
                    new itemtypes.types.die_loaded(),
                    new itemtypes.types.bundle_die_std(),
                    new itemtypes.types.lightning_helmet()
        ]
    };
    this.channel = channel;
    
    this.messages = [];
    this.addMessage = function() {
        for(let i = 0; i < arguments.length; i++) {
            messages.push(arguments[i]);
        }
    }.bind(this);
    this.flushMessages = function() {
        if(this.messages.length > 0) {
            this.channel.send('.\n' + this.messages.join('\n'));
        }
        this.messages = [];
    }.bind(this);
};
let players = {};
module.exports = {
    Player: Player,
    players: players
}