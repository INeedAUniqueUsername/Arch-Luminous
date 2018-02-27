const core = require('./core.js');
let inventory = {
    initialize: function(id) {
        //console.log('Initialize Inventory ID: ' + id);
        if(!inventory[id]) {
            inventory[id] = {
                items: [
                    {
                        name: 'six-sided die',
                        desc: 'a standard six-sided die',
                        use: {
                            roll: function() {
                                return 'You roll a ' + this.roll();
                            }
                        },
                        sides: [1, 2, 3, 4, 5, 6],
                        roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
                    }, {
                        name: 'loaded six-sided die',
                        desc: 'a standard six-sided die',
                        use: {
                            roll: function() {
                                return 'You roll ' + this.roll();
                            }
                        },
                        sides: [1, 2, 3, 4, 5, 6],
                        odds: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6],
                        roll: function() { return this.odds[Math.floor(Math.random() * this.odds.length)]; }
                    }, {
                        name: 'bundle of six-sided die',
                        desc: 'a bundle of six standard six-sided die',
                        use: {
                            roll: function() {
                                return 'You roll ' + this.roll();
                            }
                        },
                        dice: {
                            sides: [1, 2, 3, 4, 5, 6],
                            roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
                        },
                        roll: function() {
                            return this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll() + this.dice.roll();
                        }
                    }
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
module.exports = {
    ready: function() {
        console.log('RPG online');
    },
    commands: {
        examine: function(message, args) {
            let author = message.author.id;
            inventory.initialize(author);
            
            let name = args.join(' ');
            
            let items = inventory[author].items;
            let results = [];
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(item.name === name) {
                    results.push(item);
                }
            }
            let reply = core.tag(author) + ', ' + results.length + ' results found.';
            for(let i = 0; i < results.length; i++) {
                let item = results[i];
                reply += '\n' + item.name + ': ' + item.desc;
            }
            message.channel.send(reply);
            
        },
        inventory: function(message, args) {
            let author = message.author.id;
            inventory.initialize(author);
            
            let items = inventory[author].items;
            let reply = core.tag(author) + ', ' + items.length + ' items';
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                reply += '\n' + item.name + ': ' + item.desc;
            }
            message.channel.send(reply);
        },
        use: function(message, args) {
            let author = message.author.id;
            inventory.initialize(author);
            
            let action = args.shift();
            let name = args.join(' ');
            
            let items = inventory[author].items;
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
                    message.channel.send(core.tag(author) + ', ' + f.call(item));
                } else {
                    message.channel.send(core.tag(author) + ', unknown use');
                }
            } else {
                message.channel.send(core.tag(author) + ', item not found');
            }
            
        }
    }
}