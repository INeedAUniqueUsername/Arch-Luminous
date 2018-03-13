const hooks = require('./hooks.js');
const core = require('./core.js');
const itemtypes = require('./items.js');

const bases = {
    standard: function() {
        //Standard base; initializes inventory and listeners to empty
        this.inventory = {
            items: []
        };
        this.listeners = {};
    }
}
const types = {
    example: function() {
        bases.standard.call(this);
        
        //Auto-assigned at program start
        this.alias = 'example';
        this.type = types.example;
        
        this.name = 'example';
        this.desc = 'example';
        return this;
    },
    mob_boss: function() {
        bases.standard.call(this);
        
        this.name = 'mob boss';
        this.desc = 'this evil dude likes to create huge angry mobs just because he can!';
        this.attackCooldown = 0;    //ms until next attack
        this.targetPlayerId = 0;
        this.stats = {
            health: 50,
            baseDamage: 3
        }
        this.inventory = {
            items: [
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork(),
                new itemtypes.types.torchfork()
            ]
        };
        this.listeners = {
            update_room: function(room, data) {
                this.attackCooldown -= 200;
                if(this.attackCooldown <= 0) {
                    this.attackCooldown = 2000;
                    let angries = room.mobs.filter(mob => (mob.type === types.angry));
                    let target_angry;
                    let target_torchfork;
                    if(Math.random() < 0.5 && angries.length < 10) {
                        room.announce.call(room, 'mob boss calls in an angry');
                        let angry = new types.angry();
                        if(this.targetPlayerId)
                            angry.targetPlayerId = this.targetPlayerId;
                        room.mobs.push(angry);
                    } else if(Math.random() < 0.7
                                &&(target_angry = angries.find(angry => !angry.inventory.items.find(item => (item.type === itemtypes.types.torchfork))))
                                && (target_torchfork = this.inventory.items.filter(item => item.type === itemtypes.types.torchfork))) {
                        //let torchfork = new itemtypes.types.torchfork();
                        this.inventory.items.splice(this.inventory.items.indexOf(target_torchfork), 1);
                        target_angry.inventory.items.push(target_torchfork);
                        room.announce.call(room, 'mob boss arms an angry with a torchfork');
                    } else if(this.targetPlayerId || (this.targetPlayerId = room.players[Math.floor(Math.random() * room.players.length)])) {
                        let item = this.inventory.items.find(item => item.weapon);
                        let damage = (item ? item.weapon.baseDamage : this.stats.baseDamage);
                        let player = data.players[this.targetPlayerId];
                        if(item) {
                            room.announce.call(room, 'mob boss attacks `' + player.name + '` with a ' + item.name + '!');
                        } else {
                            room.announce.call(room, 'mob boss punches `' + player.name + '` in the gut!');
                        }
                        player.listeners.damage.call(player, damage);
                    }
                }
            }
        }
        return this;
    },
    angry: function() {
        bases.standard.call(this);
        
        this.name = 'angry';
        this.desc = 'the integral part of every angry mob';
        this.attackCooldown = 0;    //ms until next attack
        this.targetPlayerId = 0;
        this.stats = {
            baseDamage: 3
        };
        this.inventory = {
            items: []
        }
        this.listeners = {
            update_room: function(room, data) {
                this.attackCooldown -= 200;
                if(this.attackCooldown <= 0) {
                    this.attackCooldown = 2000;
                    if(this.targetPlayerId || (this.targetPlayerId = room.players[Math.floor(Math.random() * room.players.length)])) {
                        let item = this.inventory.items.find(item => item.weapon);
                        let damage = (item ? item.weapon.baseDamage : this.stats.baseDamage);
                        let player = data.players[this.targetPlayerId];
                        if(item) {
                            room.announce.call(room, 'angry attacks `' + player.name + '` with a ' + item.name + '!');
                        } else {
                            room.announce.call(room, 'angry punches `' + player.name + '` in the gut!');
                        }
                        player.listeners.damage.call(player, damage);
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
    
    type.prototype.alias = key;
    type.prototype.type = type;
    
    typesByName[type().name] = type;
}
module.exports.types = types;
module.exports.typesByName = typesByName;