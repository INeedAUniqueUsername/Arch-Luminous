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
let parties = {
    partyName: {
        members: [],
        leaders: [],
        inviteOnly: true,
        invited: []
    }
}
const prefix = 'R!';
const helpText = function(name, desc) {
    return '`' + prefix + name + '`: ' + desc;
}
module.exports = {
    prefix: prefix,
    ready: function() {
        console.log('RPG online');
    },
    commands: {
        create: function(message, args) {
            let author = message.author.id;
            inventory.initialize(author);
            
            let criterion = args.join(' ') || '';
            let result_types = [];
            for(let name in items.typesByName) {
                if(name.startsWith(criterion)) {
                    result_types.push(items.typesByName[name]);
                }
            }
            if(result_types.length === 0) {
                message.channel.send(core.tag(author) + ', item not found');
            } else if(result_types.length > 1) {
                let reply = core.tag(author) + ', ' + results.length + ' create which item?';
                for(let i = 0; i < result_types.length; i++) {
                    let item = result_types[i]();
                    reply += '\n' + item.name + ': ' + item.desc;
                }
                message.channel.send(reply);
            } else {
                let item = result_types[0]();
                message.channel.send(core.tag(author) + ', created an item\n' + item.name + ': ' + item.desc);
                inventory[author].items.push(item);
            }
        },
        //TODO: Add descriptions of allowed actions with each item
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
        party: function(message, args) {
            let subcommands = {
                claim: function(message, args) {
                    let name = args.join(' ') || '';
                    let party;
                    if(!name) {
                        message.channel.send(core.tag(message.author.id) + ', specify party name.');
                    } else if(!(party = parties[name])) {
                        message.channel.send(core.tag(message.author.id) + ', that party does not exist.');
                    } else if(party.leaders.includes(message.author.id)) {
                        message.channel.send(core.tag(message.author.id) + ', you are already a leader of that party.');
                    } else if(party.leaders.length > 0) {
                        message.channel.send(core.tag(message.author.id) + ', you cannot claim leadership over an active party.');
                    } else if(!party.members.includes(message.author.id)) {
                        message.channel.send(core.tag(message.author.id) + ', you must be a member of that party to claim leadership.');
                    } else {
                        message.channel.send(core.tag(message.author.id) + ', you have claimed leadership of party `' + name + '`');
                        party.leaders.push(message.author.id);
                    }
                },
                //TODO: dissolve (disbands a party if you are a leader or if party is empty)
                create: function(message, args) {
                    let name = args.join(' ') || '';
                    if(!name) {
                        message.channel.send(core.tag(message.author.id) + ', specify party name.');
                    } else if(parties[name]) {
                        message.channel.send(core.tag(message.author.id) + ', that party already exists.');
                    } else {
                        parties[name] = {
                            members: [message.author.id],
                            leaders: [message.author.id],
                            inviteOnly: true,
                            invited: []
                        };
                        message.channel.send(core.tag(message.author.id) + ', created new party `' + name + '`.');
                    }
                },
                //TODO: Disable inviteOnly command
                //TODO: Uninvite command
                invite: function(message, args) {
                    let invitee = core.id(args.shift()) || '';
                    if(!invitee) {
                        message.channel.send(core.tag(message.author.id) + ', specify invitee.');
                    } else {
                        let partyName = args.join(' ') || '';
                        let party;
                        if(!partyName) {
                            message.channel.send(core.tag(message.author.id) + ', specify party name.');
                        } else if(!(party = parties[partyName])) {
                            message.channel.send(core.tag(message.author.id) + ', that party does not exist.');
                        } else if(party.members.includes(invitee)) {
                            message.channel.send(core.tag(message.author.id) + ', your invitee is already a member of that party.');
                        } else if(!party.inviteOnly) {
                            message.channel.send(core.tag(message.author.id) + ', that is already an open party.');
                        } else if(!party.leaders.includes(message.author.id)) {
                            message.channel.send(core.tag(message.author.id) + ', you must be a leader of the party in order to invite people.');
                        } else {
                            message.channel.send(core.tag(message.author.id) + ', you invited ' + core.tag(invitee) + ' to join `' + partyName + '`');
                            party.invited.push(invitee);
                        }
                    }
                },
                join: function(message, args) {
                    let name = args.join(' ') || '';
                    let party;
                    let index = -1;
                    if(!name) {
                        message.channel.send(core.tag(message.author.id) + ', specify party name.');
                    } else if(!(party = parties[name])) {
                        message.channel.send(core.tag(message.author.id) + ', that party does not exist.');
                    } else if(party.members.includes(message.author.id)) {
                        message.channel.send(core.tag(message.author.id) + ', you are already a member of that party.');
                    } else if(party.inviteOnly && (index = party.invited.indexOf(message.author.id)) === -1) {
                        message.channel.send(core.tag(message.author.id) + ', you must be invited to the party before you can join.');
                    } else {
                        message.channel.send(core.tag(message.author.id) + ', you have joined the party `' + name + '`');
                        party.members.push(message.author.id);
                        if(index > -1) {
                            party.invited.splice(index, 1);
                        }
                    }
                },
                //TODO: kick command
                //TODO: resign command
                leave: function(message, args) {
                    let name = args.join(' ') || '';
                    let party;
                    let index = -1;
                    if(!name) {
                        message.channel.send(core.tag(message.author.id) + ', specify party name.');
                    } else if(!(party = parties[name])) {
                        message.channel.send(core.tag(message.author.id) + ', that party does not exist.');
                    } else if((index = party.members.indexOf(message.author.id)) == -1) {
                        message.channel.send(core.tag(message.author.id) + ', you are not a member of that party.');
                    } else {
                        party.members.splice(index, 1);
                        if((index = party.leaders.indexOf(message.author.id)) > -1) {
                            party.leaders.splice(index, 1);
                            message.channel.send(core.tag(message.author.id) + ', you have left as a leader of the party `' + name + '`');
                        } else {
                            message.channel.send(core.tag(message.author.id) + ', you have left the party `' + name + '`');
                        }
                    }
                },
                list: function(message, args) {
                    let reply = core.tag(message.author.id) + ', List of Parties:';
                    for(let name in parties) {
                        let party = parties[name];
                        reply += '\n`' + name + '`: ' + party.leaders.length + ' leaders and ' + party.members.length + ' members.'
                            + (party.inviteOnly ? ' Invite only.' : '')
                            + (party.invited.includes(message.author.id) ? ' You have been invited to this party.' : '')
                            + (party.leaders.includes(message.author.id) ? ' You are a leader of this party.' :
                                (party.members.includes(message.author.id) ? 'You are a member of this party.' : '')
                                );
                        //To do: List members and invites
                    }
                    message.channel.send(reply);
                }
            };
            let command = args.shift() || '';
            let f = subcommands[command];
            if(f) {
                f(message, args);
            } else {
                message.channel.send(core.tag(message.author.id) + ', unknown R!party subcommand');
            }
        },
        use: function(message, args) {
            let author = message.author.id;
            inventory.initialize(author);
            
            let action = args.pop();
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
                    f.call(item, message)
                } else {
                    message.channel.send(core.tag(author) + ', unknown use');
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
        party: helpText('party <subcommand>', 'Provides subcommands for managing parties')
            + '\n' + helpText('party claim', 'Claim leadership of a leaderless party of which you are a member')
            + '\n' + helpText('party create <name>...', 'Create a party with the specified name')
            + '\n' + helpText('party invite <user> <name>...', 'Invite the specified user to the specified party')
            + '\n' + helpText('party join <name>...', 'Join an open party or one that you have received an invitation for')
            + '\n' + helpText('party leave <name>...', 'Leave a party of which you are a member')
            + '\n' + helpText('party list', 'List all parties'),
        use: helpText('use <name>... <action>', 'Use the specified item for the specified action')
    }
}