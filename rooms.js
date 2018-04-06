const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');
const mobtypes = require('./mobs.js');
const players = require('./players').players;

const stepsPerSecond = 3;
const ticksPerStep = 1000/stepsPerSecond;

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
    
    this.update = source.update || function() { this.updateObjects(); };
    this.update.bind(this);
    
    this.updateObjects = function() {
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
    }.bind(this);
    this.updateTimer = null;
    this.updateStepsLeft = 0;
    this.updatePauseCallback = function() {};
    this.updateContinuous = function() {
        delete this.updateTimer;
        //console.log('updateContinuous()');
        this.update();
        this.updateStepsLeft--;
        //console.log('updateStepsLeft: ' + this.updateStepsLeft);
        if(this.updateStepsLeft%(stepsPerSecond*2) === 0) {
            this.players.forEach(playerId => {
                players[playerId].flushMessages();
            });
        }
        
        if(this.updateStepsLeft > 0) {
            //console.log('Setting up next update timer');
            this.updateTimer = setTimeout(function() { this.updateContinuous(); }.bind(this), ticksPerStep);
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
                this.updateTimer = setTimeout(function() { this.updateContinuous(); }.bind(this), ticksPerStep);
            }
        }
    }.bind(this);
    this.announce = function(text) {
        this.players.map(id => players[id]).forEach(player => {
            player.messages.push(text);
        });
        //If we are paused, then we flush messages immediately
        if(this.updateStepsLeft === 0) {
            this.flushMessages();
        }
    }.bind(this);
    this.tell = function(target, text) {
        target.addMessage(text);
        //If we are paused, then we flush messages immediately
        if(this.updateStepsLeft === 0) {
            target.flushMessages();
        }
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
        mobs: [
            //A customs officer who needs the player's help to clean up all the discarded passports
            new mobtypes.types.archrock_customs_officer()
        ],
        props: [
            new itemtypes.types.stuporcomputer(),
            {
                name: 'cardboard customs officer',
                desc: 'This cardboard cutout of a customs officer is designed to be placed next to a door to discourage suspicious people from sneaking out of the Customs Office'
            }
        ],
        items: [
            {
                name: 'passport',
                desc: 'It\'s just a piece of paper with a name written on it. It\'s so useless that everyone just drops it, usually in the ArchROCK Customs Office, as soon as possible.'
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
        mobs: [
            //An archeologist named Nym who needs the player's help to clear the Haunted Acropolis using acronyms
        ],
        listeners: {
            say: function(source, text) {
                this.announce('The voice of `' + source.name + '` echoes around the walls of the Haunted Acropolis');
                if(this.ghostTimer > 0) {
                    return;
                } else if(mob = this.mobs.find(mob => mob.type === mobtypes.types.scry_gost)) {
                    this.announce('The ' + mob.name + ' winces at ' + source.name + ' and becomes more agitated.');
                } else {
                    this.announce('You hear a monstrous grumble from a mysterious, cosmic voice as an opaque, icy mist crawls in from the windows of the Haunted Acropolis');
                    this.ghostTimer = 12;
                    this.ghostTargetId = source.id;
                }
            }
        },
        update: function() {
            this.updateObjects();
            
            this.ghostTimer--;
            if(this.ghostTimer === 0) {
                let mob = new mobtypes.types.scry_gost();
                mob.targetPlayerId = this.ghostTargetId;
                this.announce('The icy mist violently condenses into a rain, revealing a screaming, translucent figure. The Scry Gost has appeared!');
                this.mobs.push(mob);
            }
        }
    }),
    
};

module.exports = {
    Room: Room,
    rooms: rooms,
}