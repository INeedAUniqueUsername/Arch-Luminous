const core = require('./core.js');

let parties = {
    partyName: {
        members: [],
        leaders: [],
        inviteOnly: true,
        invited: []
    }
};
const prefix = 'P!';
const helpText = function(name, desc) {
    return '`' + prefix + name + '`: ' + desc;
}
module.exports = {
    desc: 'Parties and Guilds Module',
    commands: {
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
    },
    help: {
        party: helpText('<subcommand>', 'Provides subcommands for managing parties'),
        claim: helpText('claim', 'Claim leadership of a leaderless party of which you are a member'),
        create: helpText('create <name>...', 'Create a party with the specified name'),
        invite: helpText('invite <user> <name>...', 'Invite the specified user to the specified party'),
        join: helpText('join <name>...', 'Join an open party or one that you have received an invitation for'),
        leave: helpText('leave <name>...', 'Leave a party of which you are a member'),
        list: helpText('list', 'List all parties'),
    },
    parties: parties,
    prefix: prefix
}