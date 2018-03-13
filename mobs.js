const hooks = require('./hooks.js');
const core = require('./core.js');



const types = {
    example: function() {
        this.type = types.example;
        this.name = 'example';
        this.desc = 'example';
        return this;
    },
    mob_boss: function() {
        this.type = types.mob_boss;
        this.name = 'mob boss';
        this.desc = 'this evil dude likes to create huge angry mobs just because he can!';
        this.attackCooldown = 0;    //ms until next attack
        this.targetPlayerId = 0;
        this.listeners = {
            update_room: function(room, data) {
                this.attackCooldown -= 200;
                if(this.attackCooldown <= 0) {
                    this.attackCooldown = 2000;
                    if((Math.random() < 0.6) && (room.mobs.filter(mob => (mob.type === types.angry)).length < 10)) {
                        room.players.map(id => data.players[id].channel).forEach(channel => {
                            if(channel) channel.send('mob boss calls in an angry');
                        });
                        let angry = new types.angry();
                        if(this.targetPlayerId)
                            angry.targetPlayerId = this.targetPlayerId;
                        room.mobs.push(angry);
                    } else if(this.targetPlayerId || (this.targetPlayerId = room.players[Math.floor(Math.random() * room.players.length)])) {
                        let channel = data.players[this.targetPlayerId].channel;
                        if(channel) channel.send('mob boss attacks ' + core.tag(this.targetPlayerId));
                    }
                }
            }
        }
        return this;
    },
    angry: function() {
        this.type = types.angry;
        this.name = 'angry';
        this.desc = 'the integral part of every angry mob';
        this.attackCooldown = 0;    //ms until next attack
        this.targetPlayerId = 0;
        this.listeners = {
            update_room: function(room, data) {
                this.attackCooldown -= 200;
                if(this.attackCooldown <= 0) {
                    this.attackCooldown = 2000;
                    if(this.targetPlayerId || (this.targetPlayerId = room.players[Math.floor(Math.random() * room.players.length)])) {
                        let channel = data.players[this.targetPlayerId].channel;
                        if(channel) channel.send(this.name + ' attacks ' + core.tag(this.targetPlayerId));
                    }
                }
            }
        }
        return this;
    },
};
const typesByName = {};
//Store each item type under its actual name
for(let key in types) {
    let type = types[key];
    typesByName[type().name] = type;
}
module.exports.types = types;
module.exports.typesByName = typesByName;