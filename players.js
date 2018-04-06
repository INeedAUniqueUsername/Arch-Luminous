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
        baseDamage: 10
    }
    this.rollDamage = function(baseDamage) {
        return Math.floor(baseDamage * (1 + Math.random()));
    };
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
            this.messages.push(arguments[i]);
        }
    }.bind(this);
    this.flushMessages = function() {
        if(this.messages.length > 0) {
            this.channel.send('.\n' + this.messages.join('\n'));
        }
        this.messages = [];
    }.bind(this);
    
    this.addItem = function(item) {
        this.inventory.items.add(item);
    }.bind(this);
    this.removeItem = function(item) {
        let index = this.inventory.items.indexOf(item);
        if(index > -1) {
            this.inventory.items.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }
};
let players = {};
//Stores character information for players who run multiple characters
const players_storage = {
    playerId: []    //List of additional player objects associated with the player
};
module.exports = {
    Player: Player,
    players: players
};