const hooks = require('./hooks.js');
const core = require('./core.js');
const types = {
    example: function() {
        this.name = 'example';
        this.desc = 'example';
        this.use = {
            example: function(message) {
                message.channel.send('example');
            }
        };
        //Store mutable data in this object
        this.data = {};
        this.example = 'example';
        return this;
    },
    die_std: function() {
        this.name = 'six-sided die';
        this.desc = 'a standard six-sided die';
        this.use = {
            stats: function(message) {
                let average = 0;
                let record = this.data.record;
                for(let i = 0; i < record.length; i++) {
                    average += record[i];
                }
                average /= record.length;
                message.channel.send(core.tag(message.author.id) + ', You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average);
            },
            roll: function(message) {
                let roll = this.roll();
                this.data.record.push(roll);
                message.channel.send(core.tag(message.author.id) + ', You roll ' + roll);
            },
            multi: function(message) {
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

                //The hook prevents this action from being called before the player specifies a target
                hooks.add({
                    targetId: message.author.id,
                    intercept: function(message) {
                        message.channel.send('You throw the ' + item.name + ' at ' + message.content + '. It\'s a direct hit!');
                        this.remove = true;
                        return true;
                    }
                });
                message.channel.send(core.tag(message.author.id) + ', Throw this die at what?');
            }
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
            stats: function() {
                let average = 0;
                let record = this.data.record;
                for(let i = 0; i < record.length; i++) {
                    average += record[i];
                }
                average /= record.length;
                return 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average;
            },
            roll: function() {
                let roll = this.roll();
                this.data.record.push(roll);
                return 'You roll ' + roll;
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
            stats: function() {
                let average = 0;
                let record = this.data.record;
                for(let i = 0; i < record.length; i++) {
                    average += record[i];
                }
                average /= record.length;
                return 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average;
            },
            roll: function() {
                let roll = this.roll();
                this.data.record.push(roll);
                return 'You roll ' + roll;
            }
        }
        this.data = {
            record: []
        };
        this.dice = {
            sides: [1, 2, 3, 4, 5, 6],
            roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
        };
        this.roll = function() {
            return this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll();
        }
        return this;
    }
};
const typesByName = {};
//Store each item type under its actual name
for(let key in types) {
    let type = types[key];
    typesByName[type().name] = type;
}
module.exports.types = types;
module.exports.typesByName = typesByName;