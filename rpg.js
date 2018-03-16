const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');
const mobtypes = require('./mobs.js');

const ROOMS_FILE = config.dir_up + '\\rooms.json';
const INVENTORIES_FILE = config.dir_up + '\\inventories.json';
const PLAYERS_FILE = config.dir_up + '\\players.json';

const ROOMS_MODULE = require('./rooms.js');
const Room = ROOMS_MODULE.Room;
let rooms = ROOMS_MODULE.rooms;

const PLAYERS_MODULE = require('./players.js');
const Player = PLAYERS_MODULE.Player;
let players = PLAYERS_MODULE.players;

const LISTENERS_MODULE = require('./listeners.js');
const listeners = LISTENERS_MODULE.listeners;

/*
R!login a
R!create mob mob boss
R!wait
*/

const stepsPerSecond = 3;

const prefix = 'R!';
const helpText = function(name, desc) {
    return '`' + prefix + name + '`: ' + desc;
};
const actionText = function() {
    //'`character1` verb1 `character2` verb2 `character3` verb3 ...'
    let result = '`' + arguments[0] + '`';
    
    for(let i = 1; i < arguments.length; i++) {
        if(i%2 === 0) {
            result += ' ' + '`' + arguments[i] + '`';
        } else {
            result += ' ' + arguments[i];
        }
    }
    return result;
};
const itemString = function(items) {
    let names = items.map(item => '`' + item.name + '`');
    let last = names.pop();
    return names.join(', ') + ', and ' + last;
};
const getRoom = function(author) {
    return rooms[players[author].location];
module.exports = {
    desc: 'Roleplaying Module',
    //desc: 'ArchROCK (Realm of Chaos and Kleptomania) Module',
    prefix: prefix,
    ready: function() {
        console.log('RPG online');
        rooms = core.load(rooms, ROOMS_FILE);
        
        [
            LISTENERS_MODULE,
            PLAYERS_MODULE,
            ROOMS_MODULE,
            itemtypes,
            mobtypes
        ].filter(module => module.ready).forEach(module => module.ready());
        
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
                
                let player = new Player(author, name, message.channel || message.author);
                players[author] = player;
                let room = rooms.start;
                room.players.push(author);
                module.exports.commands.look(message);
                room.announce(actionText(player.name, 'materializes into the room out of nowhere.'));
            } else if(player.active) {
                message.channel.send(core.tag(author) + ', you are already logged in.');
            } else {
                message.channel.send(core.tag(author) + ', logged in as returning player.');
                player.active = true;
                module.exports.commands.look(message);
                rooms[player.location].announce(actionText(player.name, 'regains consciousness.'));
            }
        },
        logout: function(message, args) {
            let author = message.author.id;
            let player = players[author];
            player.active = false;
            message.channel.send(core.tag(author) + ', logged out.');
        },
        attack: function(message, args) {
            let author = message.author.id;
            let player = players[author];
            let room = getRoom(author);
            let target = args.join(' ');
            
            let characters = room.players.map(playerId => players[playerId]).concat(room.mobs);
            let character = characters.find(character => (character.name === target));
            if(character) {
                character.stats.health -= player.stats.baseDamage;
                message.channel.send(core.tag(author) + ', you attack ' + character.name + ' for ' + player.stats.baseDamage + ' damage.');
                if(character.stats.health < 1) {
                    let index;
                    if(index = room.mobs.indexOf(character)) {
                        room.mobs.splice(index, 1);
                    } else if(index = room.players.indexOf(character.id)) {
                        room.players.splice(index, 1);
                    }
                    message.channel.send(character.name + ' dies from the attack!');
                }
            } else {
                message.channel.send(core.tag(author) + ', I cannot find that character.');
            }
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
        get: function(message, args) {
            let author = message.author.id;
            let player = players[author];
            let room = getRoom(author);
            let items = room.items;
            let target = args.join(' ');
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(item.name === target) {
                    room.items.splice(i, 1);
                    player.inventory.items.push(item);
                    message.channel.send(core.tag(author) + ', you got ' + item.name);
                    return;
                }
            }
            message.channel.send(core.tag(author) + ', I can\'t find that item');
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
            let source = players[author];
            let room = getRoom(author);
            room.players.map(playerId => players[playerId]).forEach(player => {
                let say_room = player.listeners.say_room;
                if(say_room) {
                    say_room.call(player, source, text);
                }
            });
            
            player.inventory.items.forEach(item => {
                if(!item.listeners) {
                    console.log('Warning: ' + item.name + '.listeners is undefined');
                } else if(!item.listeners.say_owner) {
                    console.log('Warning: ' + item.name + '.listeners.say_owner is undefined');
                } else {
                    console.log(item.name + '.listeners.say_owner called');
                    item.listeners.say_owner.call(item, message, text);
                }
            });
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
            let room = getRoom(message.author.id);
            let type = args.shift();
            if(type === 'item') {
                let criterion = args.join(' ') || '';
                let result_types = Object.keys(itemtypes.typesByName).filter(name => (name.startsWith(criterion))).map(name => itemtypes.typesByName[name]);
                if(result_types.length === 0) {
                    message.channel.send(core.tag(author) + ', item not found');
                } else if(result_types.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' results fouund. Create which item?';
                    reply += '\n' + result_types.map(type => ('`' + type.name + '`' + ': ' + type.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let item = new result_types[0]();
                    message.channel.send(core.tag(author) + ', created an item\n' + item.name + ': ' + item.desc);
                    room.items.push(item);
                }
            } else if(type === 'prop') {
                let criterion = args.join(' ') || '';
                let result_types = Object.keys(itemtypes.typesByName).filter(name => (name.startsWith(criterion))).map(itemtypes.typesByName[name]);
                if(result_types.length === 0) {
                    message.channel.send(core.tag(author) + ', prop not found');
                } else if(result_types.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' results found. Create which prop?';
                    reply += '\n' + result_types.map(type => ('`' + type.name + '`' + ': ' + type.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let item = new result_types[0]();
                    message.channel.send(core.tag(author) + ', created a prop\n' + item.name + ': ' + item.desc);
                    room.props.push(item);
                }
            } else if(type === 'mob') {
                let criterion = args.join(' ') || '';
                let result_types = Object.keys(mobtypes.typesByName).filter(name => (name.startsWith(criterion))).map(name => mobtypes.typesByName[name]);
                if(result_types.length === 0) {
                    message.channel.send(core.tag(author) + ', mob not found');
                } else if(result_types.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' results found. Create which mob?';
                    reply += '\n' + result_types.map(type => ('`' + type.name + '`' + ': ' + type.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let mob = new result_types[0]();
                    message.channel.send(core.tag(author) + ', created a mob\n' + mob.name + ': ' + mob.desc);
                    room.mobs.push(mob);
                }
            }
            
        },
        //TODO: Add descriptions of allowed actions with each item
        examine: function(message, args) {
            let author = message.author.id;
            let room = getRoom(author);
            let name = args.join(' ');
            
            let objects = players[author].inventory.items.concat(room.mobs).concat(room.props).concat(room.items);
            let results = objects.filter(object => (object.name === name));
            let reply = core.tag(author) + ', ' + results.length + ' results found.';
            reply += '\n' + results.map(object => ('`' + object.name + '`' + ': ' + object.desc + ((!object.use || object.use.length === 0) ? '' : (' (Use: ' + Object.keys(object.use).map(use => ('`' + use + '`')).join(', ') + ')')))).join('\n');
            message.channel.send(reply);
        },
        inventory: function(message, args) {
            let author = message.author.id;
            
            let target = args.join(' ').trim();
            if(target.length > 0) {
                let room = getRoom(author);
                let characters = room.players.map(id => players[id]).concat(room.mobs);
                results = characters.filter(character => (character.name.startsWith(target)));
                reply = core.tag(author) + ', ' + results.length + ' results found.';
                reply += '\n' + results.map(
                    character => (character.name + ': ' + character.inventory.items.map(
                        item => ('`' + item.name + '`')).join(', '))
                ).join('\n');
                message.channel.send(reply);
            } else {
                let items = players[author].inventory.items;
                let reply = core.tag(author) + ', ' + items.length + ' items: ' + items.map(item => ('`' + item.name + '`')).join(', ');
                message.channel.send(reply);
            }
        },
        remove: function(message, args) {
            let author = message.author.id;
            let room = getRoom(author);
            let type = args.shift();
            if(type === 'item') {
                let criterion = args.join(' ') || '';
                let results = room.items.filter(item => (item.name.startsWith(criterion)));
                if(results.length === 0) {
                    message.channel.send(core.tag(author) + ', item not found');
                } else if(results.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' results found. Remove which item?';
                    reply += '\n' + results.map(item => ('`' + item.name + '`' + ': ' + item.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let item = results[0];
                    message.channel.send(core.tag(author) + ', removed an item\n' + item.name + ': ' + item.desc);
                    room.items.splice(room.items.indexOf(item), 1);
                }
            } else if(type === 'prop') {
                let criterion = args.join(' ') || '';
                let results = room.props.filter(prop => (prop.name.startsWith(criterion)));
                if(results.length === 0) {
                    message.channel.send(core.tag(author) + ', prop not found');
                } else if(results.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' results found. Remove which prop?';
                    reply += '\n' + results.map(prop => ('`' + prop.name + '`' + ': ' + prop.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let prop = results[0];
                    message.channel.send(core.tag(author) + ', removed an prop\n' + prop.name + ': ' + prop.desc);
                    room.props.splice(room.props.indexOf(prop), 1);
                }
            } else if(type === 'mob') {
                let criterion = args.join(' ') || '';
                let results = room.mobs.filter(mob => (mob.name.startsWith(criterion)));
                if(results.length === 0) {
                    message.channel.send(core.tag(author) + ', mob not found');
                } else if(results.length > 1) {
                    let reply = core.tag(author) + ', ' + results.length + ' results found. Remove which mob?';
                    reply += '\n' + results.map(mob => ('`' + mob.name + '`' + ': ' + mob.desc)).join('\n');
                    message.channel.send(reply);
                } else {
                    let mob = results[0];
                    message.channel.send(core.tag(author) + ', removed a mob\n' + mob.name + ': ' + mob.desc);
                    room.mobs.splice(room.mobs.indexOf(mob), 1);
                }
            }
        },
        use: function(message, args) {
            let author = message.author.id;
            
            let action = args.shift();
            let name = args.join(' ');
            
            let items = players[author].inventory.items;
            let results = items.filter(item => (item.name === name));
            if(results.length > 1) {
                let reply = core.tag(author) + ', ' + results.length + ' use which item?';
                reply += results.map(item => ('\n' + item.name + ': ' + item.desc));
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