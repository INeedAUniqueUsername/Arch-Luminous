const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');

const ROOMS_FILE = config.dir_up + '\\rooms.json';
const INVENTORIES_FILE = config.dir_up + '\\inventories.json';
const PLAYERS_FILE = config.dir_up + '\\players.json';

let rooms = {
    name: {
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
    },
    start: {
        name: 'ArchROCK Customs Office',
        desc: 'aaaaaaaa',
        players: [],
        props: [
            {
                name: 'prop',
                desc: 'desc'
            }
        ],
        items: [
            {
                name: 'item',
                desc: 'desc'
            }
        ],
        exits: {
            "front door": 'nowhere'
        }
    },
    nowhere: {
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
    }
    
};
let inventories = {
    initialize: function(id) {
        //console.log('Initialize Inventories ID: ' + id);
        if(!inventories[id]) {
            inventories[id] = {
                items: [
                    new itemtypes.types.die_std(),
                    new itemtypes.types.die_loaded(),
                    new itemtypes.types.bundle_die_std()
                ]
            };
        }
    },
    playerId: {
        items: {
            name: 'item',
            desc: 'desc'
        }
    }
};
//Stores character information for players who run multiple characters
let characters_other = {
    playerId: []    //List of additional player objects associated with the player
};
let players = {
    id: {
        active: true,
        nick: 'nick',
        location: '',
    }
};
const Player = function(nick) {
    this.active = true;
    this.nick = nick;
    this.location = 'start';
    this.listeners = {
        room_say: listeners.default_say_room,
    };
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
            message.channel.send(core.tag(source) + ', You hear `' + players[source].nick + '` say: ' + text);
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
        }
        return true;
    },
    commands: {
        login: function(message, args) {
            let author = message.author.id;
            let player = players[author];
            if(!player) {
                let nick = args[0] || '';
                if(!nick) {
                    message.channel.send(core.tag(author) + ', specify nick.');
                    return;
                }
                message.channel.send(core.tag(author) + ', logged in as new player.');
                
                players[author] = new Player(nick);
                inventories.initialize(author);
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
            reply += '\nPlayers: ' + room.players.map(player => players[player]).filter(player => !player.hidden).map(player => ('`' + player.nick + '`')).join(', ');
            reply += '\nProps: ' + room.props.filter(prop => !prop.hidden).map(prop => ('`' + prop.name + '`')).join(', ');
            reply += '\nItems: ' + room.items.filter(item => !item.hidden).map(item => ('`' + item.name + '`')).join(', ');
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
            
            let items = inventories[author].items;
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
        
        create: function(message, args) {
            let author = message.author.id;
            
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
                let item = result_types[0]();
                message.channel.send(core.tag(author) + ', created an item\n' + item.name + ': ' + item.desc);
                inventories[author].items.push(item);
            }
        },
        //TODO: Add descriptions of allowed actions with each item
        examine: function(message, args) {
            let author = message.author.id;
            let room = getRoom(author);
            let name = args.join(' ');
            
            let items = inventories[author].items.concat(room.props).concat(room.items);
            let results = [];
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(item.name === name) {
                    results.push(item);
                }
            }
            let reply = core.tag(author) + ', ' + results.length + ' results found.';
            reply += '\n' + results.map(item => ('`' + item.name + '`' + ': ' + item.desc + (!item.use ? '' : (' (Use: ' + Object.keys(item.use).map(use => ('`' + use + '`')).join(', ') + ')')))).join('\n');
            message.channel.send(reply);
            
        },
        inventory: function(message, args) {
            let author = message.author.id;
            
            let items = inventories[author].items;
            let reply = core.tag(author) + ', ' + items.length + ' items: ' + items.map(item => ('`' + item.name + '`')).join(', ');
            message.channel.send(reply);
        },
        use: function(message, args) {
            let author = message.author.id;
            
            let action = args.shift();
            let name = args.join(' ');
            
            let items = inventories[author].items;
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
                        inventories: inventories,
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