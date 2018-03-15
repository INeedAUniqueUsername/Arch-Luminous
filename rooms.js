const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');
const mobtypes = require('./mobs.js');
const players = require('./players').players;

const Room = function(source) {
    this.name = source.name || 'name';
    this.desc = source.desc || 'desc';
    this.players = source.players || [];
    this.mobs = source.mobs || [];
    this.props = source.props || [];
    this.items = source.items || [];
    this.exits = source.exits || {};
    
    this.listeners = {
        say: function(source, text) {}
    }
    if(source.listeners) Object.keys(source.listeners).forEach(key => this.listeners[key] = source.listeners[key].bind(this));
    
    let me = this;
    this.update = function() {
        //console.log('update()');
        /*
        for(let id in players) {
            let channel = players[id].channel;
            if(channel) channel.send('Time passes');
        }
        */
        let objects = this.mobs.concat(this.props).concat(this.items);
        objects.forEach(object => {
            if(!object.listeners) {
                //console.log('Warning: ' + object.name + '.listeners is undefined');
            } else if(!object.listeners.update_room) {
                //console.log('Warning: ' + object.name + '.listeners.update_room is undefined');
            } else {
                object.listeners.update_room(this, {
                    rooms: rooms,
                    players: players,
                });
            }
        });
    };
    this.updateTimer = null;
    this.updateStepsLeft = 0;
    this.updatePauseCallback = function() {};
    this.updateContinuous = function() {
        delete this.updateTimer;
        //console.log('updateContinuous()');
        this.update();
        this.updateStepsLeft--;
        //console.log('updateStepsLeft: ' + this.updateStepsLeft);
        if(this.updateStepsLeft%5 === 0) {
            this.players.forEach(playerId => {
                players[playerId].flushMessages();
            });
        }
        
        if(this.updateStepsLeft > 0) {
            //console.log('Setting up next update timer');
            this.updateTimer = setTimeout(function() { this.updateContinuous(); }.bind(this), 200);
            //console.log('Set up next update timer');
        } else {
            this.updatePauseCallback();
        }
    }.bind(this);
    this.setUpdating = function(minSteps = 5) {
        //console.log('setUpdating()');
        
        if(this.updateStepsLeft < minSteps) {
            this.updateStepsLeft = minSteps;
            if(!this.updateTimer) {
                //console.log('Setting up next update timer');
                this.updateTimer = setTimeout(function() { this.updateContinuous(); }.bind(this), 200);
            }
        }
    }.bind(this);
    this.announce = function(text) {
        this.players.map(id => players[id]).forEach(player => {
            player.messages.push(text);
        });
    }.bind(this);
    this.flushMessages = function() {
        this.players.forEach(playerId => players[playerId].flushMessages());
    }.bind(this);
};
let rooms = {
    name: new Room({
        name: 'name',
        desc: 'desc',
        players: [],
        props: [{
            id: 0,
            name: 'name',
            desc: 'desc'
        }],
        items: [
            {
                id: 0,
                name: 'name',
                desc: 'desc'
            }
        ],
        exits: {
            name: 'destination'
        }
    }),
    start: new Room({
        name: 'ArchROCK Customs Office',
        desc: 'This is less of a Customs Office and more like a PvP arena where players go to farm EXP on idlers and where idlers go to get killed and over again.',
        players: [],
        props: [
            new itemtypes.types.stuporcomputer(),
            {
                name: 'cardboard customs officer',
                desc: 'This cardboard cutout of a customs officer is designed to be placed next to a door to discourage suspicious people from sneaking out of the Customs Office'
            }
        ],
        items: [
            {
                name: 'customer',
                desc: 'This citizen of ArchROCK follows local customs.'
            }
        ],
        exits: {
            "front door": 'nowhere'
        }
    }),
    nowhere: new Room({
        name: 'Nowhere 3000',
        desc: 'Welcome to the future of Nowhere! Cool, isn\'t it?',
        players: [],
        props: [
            {
                name: 'nothingness',
                desc: 'it\'s literally nothing!'
            }
        ],
        items: [
            {
                name: 'nothing',
                desc: 'I don\'t see anything there'
            }
        ],
        exits: {
            "front door": 'start'
        }
    }),
    acropolis: new Room({
        name: 'Haunted Acropolis',
        desc: '',
        listeners: {
            say: function(source, text) {
                this.announce('The voice of `' + source.name + '` echoes around the walls of the Haunted Acropolis');
                if(this.ghostTimer) {
                    return;
                } else if(mob = this.mobs.find(mob => mob.type === mobtypes.types.scry_gost)) {
                    this.announce('The ' + mob.name + ' winces at ' + source.name + ' and becomes more agitated.');
                } else {
                    this.announce('You hear a monstrous grumble from a mysterious, cosmic voice as an opaque, icy mist crawls in from the windows of the Haunted Acropolis');
                    this.ghostTimer = setTimeout(function() {
                        mob = new mobtypes.types.scry_gost();
                        mob.targetPlayerId = source.id;
                        this.announce('The icy mist suddenly bursts into hot steam, revealing a screaming, translucent figure. The Scry Gost has appeared!');
                        this.mobs.push(mob);
                    }.bind(this), 2000);
                }
            }
        }
    }),
    
};

module.exports = {
    Room: Room,
    rooms: rooms,
}