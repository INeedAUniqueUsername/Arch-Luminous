const hooks = require('./hooks.js');
const core = require('./core.js');

const types = {
    example: function() {
        //Auto-assigned at program start
        this.alias = 'example';
        this.type = types.example;
        
        this.name = 'example';
        this.desc = 'example';
        this.use = {
            /*
            data = {
                rooms: {},
                inventory: [],
                players: {}
            }
            */
            example: function(message, data) {
                message.channel.send('example');
            }
        };
        //Store mutable data in this object
        this.data = {};
        this.example = 'example';
        return this;
    },
    stuporcomputer: function() {
        this.name = 'stuporcomputer';
        this.desc = 'this personal supercomputer is always stuck for some reason.';
        this.use = {};
        this.data = {};
        this.listeners = {
            update_room: function(room, data) {
                if(Math.random() < 0.04) {
                    room.announce('The stuporcomputer unfreezes for a second only to freeze yet again.')
                }
            }
        };
        return this;
    },
    die_std: function() {
        this.name = 'six-sided die';
        this.desc = 'a standard six-sided die';
        this.use = {
            stats: function(message, ownerId, data) {
                let average = 0;
                let record = this.data.record;
                for(let i = 0; i < record.length; i++) {
                    average += record[i];
                }
                average /= record.length;
                message.channel.send(core.tag(ownerId) + ', You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average);
            },
            roll: function(message, ownerId, data) {
                let roll = this.roll();
                this.data.record.push(roll);
                message.channel.send(core.tag(ownerId) + ', You roll ' + roll);
            },
            multi: function(message, ownerId, data) {
                let item = this;
                let actionDesc =  ' Enter an action, or `quit` to finish.';
                hooks.add({
                    targetId: message.author.id,
                    intercept: function(message) {
                        let action = message.content;
                        if(action === 'quit') {
                            message.channel.send('You are no longer using this ' + item.name);
                            this.remove = true;
                            return true;
                        } else if(action === 'multi') {
                            message.channel.send('You are already using this ' + item.name + '.' + actionDesc);
                            return true;
                        }

                        let f = item.use[action];
                        if(f) {
                            f.call(item, message);
                        } else {
                            let reply = 'Unknown action. Enter `quit` to finish. Valid actions:';
                            for(let actions in item.use) {
                                reply += ' `' + actions + '`';
                            }
                            message.channel.send(reply);
                        }

                        //message.channel.send('You are using this item.' + actionDesc);
                        return true;
                    },
                    remove: false
                });
                let reply = core.tag(message.author.id) + ', You are now using this ' + item.name + '.' + actionDesc + ' Valid actions:';
                for(let actions in item.use) {
                    reply += ' `' + actions + '`';
                }
                message.channel.send(reply);
            },
        };
        this.data = {
            record: []
        };
        this.sides = [1, 2, 3, 4, 5, 6];
        this.roll = function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; };
        return this;
    },
    die_loaded: function() {
        this.name = 'loaded six-sided die';
        this.desc = 'a loaded six-sided die with a preference for the number 6';
        this.use = {
            stats: function(message, ownerId, data) {
                let average = 0;
                let record = this.data.record;
                for(let i = 0; i < record.length; i++) {
                    average += record[i];
                }
                average /= record.length;
                message.channel.send(core.tag(ownerId) + ', ' + 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average);
            },
            roll: function(message, ownerId, data) {
                let roll = this.roll();
                this.data.record.push(roll);
                message.channel.send(core.tag(ownerId) + ', ' + 'You roll ' + roll);
            }
        };
        this.sides = [1, 2, 3, 4, 5, 6];
        this.odds = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6];
        this.roll = function() { return this.odds[Math.floor(Math.random() * this.odds.length)]; };
        return this;
    },
    bundle_die_std: function() {
        this.name = 'bundle of six-sided dice';
        this.desc = 'a bundle of six standard six-sided dice';
        this.use = {
            stats: function(message, ownerId, data) {
                let average = 0;
                let record = this.data.record;
                for(let i = 0; i < record.length; i++) {
                    average += record[i];
                }
                average /= record.length;
                message.channel.send(core.tag(ownerId) + ', ' + 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average);
            },
            roll: function(message, ownerId, data) {
                let roll = this.roll();
                this.data.record.push(roll);
                message.channel.send(core.tag(ownerId) + ', You roll ' + roll);
            }
        };
        this.data = {
            record: []
        };
        this.dice = {
            sides: [1, 2, 3, 4, 5, 6],
            roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
        };
        this.roll = function() {
            return this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll();
        };
        return this;
    },
    polygone: function() {
        this.name = 'Polygone';
        this.desc = 'This poorly written self-help book promises to teach you how to polymorph objects into polygons simply by shouting "Begone!"';
        this.use = {};
        this.data = {};
        this.listeners = {
            say_owner: function(message, text) {
                console.log(this.name + ': say_owner, ' + text);
                if(text === 'Begone!') {
                    message.channel.send('After a flash of light, you find yourself polymorphed into a polygon.');
                }
            }
        };
        return this;
    },
    lightning_helmet: function() {
        this.name = 'Lightning Helm';
        this.desc = 'Benjamin the Barbarian had the novel idea of attaching lightning rods to a metal helm, thus allowing him to transform his brain power into electricity.';
        this.use = {
            think: function(message, ownerId, data) {
                if(this.data.charge > 9) {
                    message.channel.send(core.tag(ownerId) + ', your Lightning Helm overheats from having too much charge and melts into a cheap statuette of a sponge.');
                    let items = data.players[ownerId].inventory.items;
                    items[items.indexOf(this)] = {
                        name: 'cheap statuette of a sponge',
                        desc: 'It\'s a statuette of sponge, except it looks more like a half-solidified clump of liquid metal. No wait, it\'s actually just a half-solidified clump of liquid metal that looks like a statuette of sponge',
                        use: {},
                        data: {},
                        listeners: {}
                    };
                    return;
                }
                this.data.charge++;
                message.channel.send(core.tag(ownerId) + ', your Lightning Helm gets charged up by your brain power.');
                
            },
            zap: function(message, ownerId) {
                if(this.data.charge === 0) {
                    message.channel.send(core.tag(ownerId) + ', your Lightning Helm has 0 charge to zap with.');
                }
                message.channel.send(core.tag(ownerId) + ', you attempt to zap something with your Lightning Helm, but instead you get hundreds of volts discharged directly to your brain, giving you a terrible electric shock.');
                this.data.charge = 0;
            }
        };
        this.data = {
            charge: 0
        };
        return this;
    },
    dodge_roll: function() {
        this.name = 'The Dodge Roll';
        this.desc = 'Rolling this special die may increase your agility for a while.';
        this.use = {};
        this.data = {};
        return this;
    },
    attack_roll: function() {
        this.name = 'The Attack Roll';
        this.desc = 'Throw this die at your opponents to make them die!';
        this.use = {
            throw: function(message) {
                let item = this;
                /*
                if(!hooks.match(hook => {
                    return hook.itemSource === item;
                })) {

                } else {
                    return 'You are in the middle of throwing this die';
                }
                */

                //The hook prevents this action from being called before the player specifies a target, so we don't need to check
                hooks.add({
                    targetId: message.author.id,
                    intercept: function(message) {
                        let roll = this.dice.roll();
                        message.channel.send('You throw the ' + item.name + ' at ' + message.content + ', dealing ' + roll + ' damage!');
                        this.remove = true;
                        return true;
                    }
                });
                message.channel.send(core.tag(message.author.id) + ', Throw this die at what?');
            }
        };
        this.data = {};
        this.dice = {
            sides: [1, 2, 3, 4, 5, 6],
            roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
        };
        return this;
    },
    torchfork: function() {
        this.name = 'Torchfork';
        this.desc = 'A combined torch and pitchfork, with the utility of both and the convenience of neither. Perfect for all your angry needs.';
        this.weapon = {
            baseDamage: 9
        };
        this.use = {};
        this.data = {};
        return this;
    }
};
const typesByName = {};
//Store each item type under its actual name
for(let key in types) {
    let type = types[key];
    
    type.prototype.type = type;
    type.prototype.alias = key;
    
    typesByName[type().name] = type;
}
module.exports.types = types;
module.exports.typesByName = typesByName;