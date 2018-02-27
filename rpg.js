const core = require('./core.js');
const items = require('./items.js');
let inventory = {
    initialize: function(id) {
        //console.log('Initialize Inventory ID: ' + id);
        if(!inventory[id]) {
            inventory[id] = {
                items: [
                    items.types.die_std(),
                    items.types.die_loaded(),
                    items.types.bundle_die_std()
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
    prefix: 'R!',
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