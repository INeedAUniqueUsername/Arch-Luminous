const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');
const mobtypes = require('./mobs.js');

const ROOMS_FILE = config.dir_up + '\\rooms.json';
const INVENTORIES_FILE = config.dir_up + '\\inventories.json';
const PLAYERS_FILE = config.dir_up + '\\players.json';

/*
R!login a
R!create mob mob boss
R!wait
*/

const Room = function(source) {
    this.name = source.name || 'name';
    this.desc = source.desc || 'desc';
    this.players = source.players || [];
    this.mobs = source.mobs || [];
    this.props = source.props || [];
    this.items = source.items || [];
    this.exits = source.exits || {};
    
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
        for(let i = 0; i < objects.length; i++) {
            let object = objects[i];
            if(!object.listeners)
                console.log('Warning: ' + object.name + '.listeners is undefined');
            else if(!object.listeners.update_room)
                console.log('Warning: ' + object.name + '.listeners.update_room is undefined');
            else
                object.listeners.update_room.call(object, this, {
                    rooms: rooms,
                    players: players,
                });
        }
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
        if(this.updateStepsLeft > 0) {
            //console.log('Setting up next update timer');
            let me = this;
            this.updateTimer = setTimeout(function() { me.updateContinuous.call(me); }, 200);
            //console.log('Set up next update timer');
        } else {
            this.updatePauseCallback();
        }
    };
    this.setUpdating = function(minSteps = 5) {
        //console.log('setUpdating()');
        
        if(this.updateStepsLeft < minSteps) {
            this.updateStepsLeft = minSteps;
            if(!this.updateTimer) {
                //console.log('Setting up next update timer');
                this.updateTimer = setTimeout(function() { me.updateContinuous.call(me); }, 200);
            }
        }
    };
}
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
    })
    
};
//Stores character information for players who run multiple characters
let characters_other = {
    playerId: []    //List of additional player objects associated with the player
};
let players = {
    id: {
        active: true,
        name: 'name',
        location: '',
        inventory: {
            items: [
                        new itemtypes.types.die_std(),
                        new itemtypes.types.die_loaded(),
                        new itemtypes.types.bundle_die_std()
            ]
        }
    }
};
const Player = function(name, channel) {
    this.active = true;
    this.name = name;
    this.location = 'start';
    this.listeners = {
        room_say: listeners.default_say_room,
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
}
const listeners = {
    //We pass in the player ID as 'this'
    default_say_room: function(message, text) {
        let source = message.author.id;
        console.log('You:    ' + this);
        console.log('Source: ' + source);
        if(parseInt(this) === parseInt(source)) {
            message.channel.send(core.tag(source) + ', You say: ' + text);
        } else {
            message.channel.send(core.tag(source) + ', You hear `' + players[source].name + '` say: ' + text);
        }
    }
};
const prefix = 'R!';
const helpText = function(name, desc) {
    return '`' + prefix + name + '`: ' + desc;
}
const getRoom = function(author) {
    return rooms[players[author].location];
}
module.exports = {
    desc: 'Roleplaying Module',
    //desc: 'ArchROCK (Realm of Chaos and Kleptomania) Module',
    prefix: prefix,
    ready: function() {
        console.log('RPG online');
        rooms = core.load(rooms, ROOMS_FILE);
        //TODO: Make sure that loaded items preserve their functions such as 'use' actions
        //inventories = core.load(inventories, INVENTORIES_FILE);
        //players = core.load(players, PLAYERS_FILE);
    },
    close: function() {
        console.log('RPG offline');
        //core.save(rooms, ROOMS_FILE);
        //core.save(inventories, INVENTORIES_FILE);
        //core.save(players, PLAYERS_FILE);
    },
    precommand: function(message, command, args) {
        let author = message.author.id;
        if((!players[author] || !players[author].active) && command !== 'login') {
            message.channel.send(core.tag(author) + ', please login first.');
            return false;
        } else if(players[author]) {
            //Update the player's channel
            players[author].channel = message.channel || message.author;
        }
        return true;
    },
    commands: {
        login: function(message, args) {
            let author = message.author.id;
            let player = players[author];
            if(!player) {
                let name = args[0] || '';
                if(!name) {
                    message.channel.send(core.tag(author) + ', specify name.');
                    return;
                }
                message.channel.send(core.tag(author) + ', logged in as new player.');
                
                players[author] = new Player(name, message.channel || message.author);
                rooms.start.players.push(author);
            } else if(player.active) {
                message.channel.send(core.tag(author) + ', you are already logged in.');
            } else {
                message.channel.send(core.tag(author) + ', logged in as returning player.');
                player.active = true;
            }
        },
        logout: function(message, args) {
            let author = message.author.id;
            let player = players[author];
            player.active = false;
            message.channel.send(core.tag(author) + ', logged out.');
        },
        attack: function(message, args) {
            
        },
        equip: function(message, args) {
            
        },
        look: function(message, args) {
            let author = message.author.id;
            let room = getRoom(author);
            let reply = '**' + room.name + '**';
            reply += '\n' + '*' + room.desc + '*';
            reply += '\n';
            let players_visible = room.players.map(player => players[player]).filter(player => !player.hidden);
            reply += (players_visible.length > 0)
                ? ('\nPlayers: ' + players_visible.map(player => ('`' + player.name + '`')).join(', '))
                : ('\nNo visible players here');
            let mobs_visible = room.mobs.filter(mob => !mob.hidden);
            reply += (mobs_visible.length > 0)
                ? ('\nMobs: ' + mobs_visible.map(mob => ('`' + mob.name + '`')).join(', '))
                : ('\nNo visible mobs here.');
            let props_visible = room.props.filter(prop => !prop.hidden);
            reply += (props_visible.length > 0)
                ? ('\nProps: ' + props_visible.map(prop => ('`' + prop.name + '`')).join(', '))
                : ('\nNo visible props here');
            let items_visible = room.items.filter(item => !item.hidden);
            reply += (items_visible.length > 0)
                ? ('\nItems: ' + items_visible.map(item => ('`' + item.name + '`')).join(', '))
                : ('\nNo visible items here');
            reply += '\nExits: ' + Object.keys(room.exits).filter(exit => !room.exits[exit].hidden).map(exit => ('`' + exit + '`'));
            message.channel.send(reply);
        },
        go: function(message, args) {
            let author = message.author.id;
            let exit = args.join(' ');
            let room = getRoom(author);
            let destination = room.exits[exit];
            let destination_room = rooms[destination];
            if(destination) {
                if(destination_room) {
                    room.players.splice(room.players.indexOf(author), 1);
                    destination_room.players.push(author);
                    players[author].location = destination;
                    module.exports.commands.look(message);
                } else {
                    message.channel.send(core.tag(author) + ', you attempt to leave **' + room.name + '** via *' + exit + '* but you bump into solid nothingness.');
                }
            } else {
                message.channel.send(core.tag(author) + ', you wanted to go where?');
            }
        },
        say: function(message, args) {
            let text = args.join(' ');
            let author = message.author.id;
            let room = getRoom(author);
            
            for(let i = 0; i < room.players.length; i++) {
                let playerId = room.players[i];
                let player = players[playerId];
                if(player.listeners.room_say) {
                    player.listeners.room_say.call(playerId, message, text);
                }
            }
            
            let items = players[author].inventory.items;
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(!item.listeners) {
                    console.log('Warning: ' + item.name + '.listeners is undefined');
                } else if(!item.listeners.say_owner) {
                    console.log('Warning: ' + item.name + '.listeners.say_owner is undefined');
                } else {
                    console.log(item.name + '.listeners.say_owner called');
                    item.listeners.say_owner.call(item, message, text);
                }
            }
        },
        wait: function(message, args) {
            let steps = parseInt(args[0]) || 50;
            let room = getRoom(message.author.id);
            room.setUpdating.call(room, steps);
            message.channel.send('Time unpaused');
            room.updatePauseCallback = () => { message.channel.send('Time paused'); };
        },
        
        create: function(message, args) {
            let author = message.author.id;
            
            let type = args.shift();
            if(type === 'item') {
                let criterion = args.join(' ') || '';
                let result_types = [];
                for(let name in itemtypes.typesByName) {
                    if(name.startsWith(criterion)) {
                        result_types.push(itemtypes.typesByName[name]);
                    }
                }
                if(result_types.length === 0) {
                    message.channel.send(core.tag(author) + ', item not found');
                } else if(result_types.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' create which item?';
                    reply += '\n' + result_types.map(type => ('`' + type.name + '`' + ': ' + type.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let item = new result_types[0]();
                    message.channel.send(core.tag(author) + ', created an item\n' + item.name + ': ' + item.desc);
                    players[author].inventory.items.push(item);
                }
            } else if(type === 'prop') {
                
            } else if(type === 'mob') {
                let criterion = args.join(' ') || '';
                let result_types = [];
                for(let name in mobtypes.typesByName) {
                    if(name.startsWith(criterion)) {
                        result_types.push(mobtypes.typesByName[name]);
                    }
                }
                if(result_types.length === 0) {
                    message.channel.send(core.tag(author) + ', mob not found');
                } else if(result_types.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' create which mob?';
                    reply += '\n' + result_types.map(type => ('`' + type.name + '`' + ': ' + type.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let mob = new result_types[0]();
                    message.channel.send(core.tag(author) + ', created a mob\n' + mob.name + ': ' + mob.desc);
                    getRoom(message.author.id).mobs.push(mob);
                }
            }
            
        },
        //TODO: Add descriptions of allowed actions with each item
        examine: function(message, args) {
            let author = message.author.id;
            let room = getRoom(author);
            let name = args.join(' ');
            
            let items = players[author].inventory.items.concat(room.mobs).concat(room.props).concat(room.items);
            let results = [];
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(item.name === name) {
                    results.push(item);
                }
            }
            let reply = core.tag(author) + ', ' + results.length + ' results found.';
            reply += '\n' + results.map(item => ('`' + item.name + '`' + ': ' + item.desc + ((!item.use || item.use.length === 0) ? '' : (' (Use: ' + Object.keys(item.use).map(use => ('`' + use + '`')).join(', ') + ')')))).join('\n');
            message.channel.send(reply);
            
        },
        inventory: function(message, args) {
            let author = message.author.id;
            
            let items = players[author].inventory.items;
            let reply = core.tag(author) + ', ' + items.length + ' items: ' + items.map(item => ('`' + item.name + '`')).join(', ');
            message.channel.send(reply);
        },
        use: function(message, args) {
            let author = message.author.id;
            
            let action = args.shift();
            let name = args.join(' ');
            
            let items = players[author].inventory.items;
            let results = [];
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(item.name === name) {
                    results.push(item);
                }
            }
            if(results.length > 1) {
                let reply = core.tag(author) + ', ' + results.length + ' use which item?';
                for(let i = 0; i < results.length; i++) {
                    let item = results[i];
                    reply += '\n' + item.name + ': ' + item.desc;
                }
                message.channel.send(reply);
            } else if(results.length === 1) {
                let item = results[0];
                let f = item.use[action];
                if(f) {
                    f.call(item, message, author, {
                        rooms: rooms,
                        players: players,
                    });
                } else {
                    message.channel.send(core.tag(author) + ', unknown action');
                }
            } else {
                message.channel.send(core.tag(author) + ', item not found');
            }
        }
    },
    help: {
        create: helpText('create <name>...', 'Gives you the item with the specified name'),
        examine: helpText('examine <name>...', 'Gives you the description of the item with the specified name'),
        inventory: helpText('inventory', 'Lists all the items in your inventory'),
        use: helpText('use <name>... <action>', 'Use the specified item for the specified action')
    }
}