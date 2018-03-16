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
        this.desc = 'This evil dude likes to create huge angry mobs just because he can!';
        this.attackCooldown = 10;    //ms until next attack
        this.emoteCooldown = 16;
        
        this.targetPlayerId = 0;
        this.stats = {
            health: 50,
            baseDamage: 3
        }
        this.inventory.items = [
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
        ];
        this.listeners.update_room = function(room, data) {
            this.emoteCooldown--;
            if(this.emoteCooldown < 1) {
                this.emoteCooldown = 8 + Math.random() * 8;
                if(this.targetPlayerId) {
                    room.announce(actionText(this.name, 'exclaims "Sic \'em!" at the angries while pointing at', data.players[this.targetPlayerId].name));
                } else if(Math.random() < 0.6) {
                    room.announce(actionText(this.name, 'exclaims "Hey! Over here!" at the angries'));
                } else if(Math.random() < 0.4) {
                    room.announce(actionText(this.name, 'exclaims "Let\'s get violent!"'));
                } else {
                    room.announce(actionText(this.name, 'exclaims "Riot, or RIOT!"'));
                }
            }
            
            this.attackCooldown--;
            if(this.attackCooldown === 7) {
                room.announce(actionText(this.name, 'grins with more than a trace amount of malice.'));
            } else if(this.attackCooldown < 1) {
                this.attackCooldown = 10;
                let angries = room.mobs.filter(mob => (mob.type === types.angry));
                let target_angry;
                let target_torchfork;
                if(Math.random() < 0.5 && angries.length < 10) {
                    room.announce(actionText(this.name, 'calls in an', 'angry'));
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
                    room.announce(actionText(this.name, 'arms an', 'angry', 'with a', 'pitchfork'));
                } else if(this.targetPlayerId || (this.targetPlayerId = room.players[Math.floor(Math.random() * room.players.length)])) {
                    let item = this.inventory.items.find(item => item.weapon);
                    let damage = this.rollDamage(item ? item.weapon.baseDamage : this.stats.baseDamage);
                    let player = data.players[this.targetPlayerId];
                    if(item) {
                        room.announce(actionText(this.name, 'attacks', player.name, 'with a', item.name));
                    } else {
                        room.announce(actionText(this.name, 'punches', player.name, 'in the gut!'));
                    }
                    player.listeners.damage(damage, room);
                }
            }
        }.bind(this);
        let damage_base = this.listeners.damage;
        this.listeners.damage = function(points, room) {
            damage_base(points, room);
            if(Math.random() < 0.8) {
                room.announce(actionText(this.name, 'swears in pain.'));
            }
        }.bind(this);
        return this;
    },
    angry: function() {
        bases.standard.call(this);
        
        this.name = 'angry';
        this.desc = 'The integral part of every angry mob, this guy is perpetually angry for no apparent reason.';
        this.attackCooldown = 7;    //ms until next attack
        this.targetPlayerId = 0;
        this.stats = {
            health: 30,
            baseDamage: 3
        };
        this.listeners.update_room = function(room, data) {
            this.attackCooldown--;
            if(this.attackCooldown < 1) {
                this.attackCooldown = 7;
                if(this.targetPlayerId || (this.targetPlayerId = room.players[Math.floor(Math.random() * room.players.length)])) {
                    let item = this.inventory.items.find(item => item.weapon);
                    let damage = this.rollDamage(item ? item.weapon.baseDamage : this.stats.baseDamage);
                    let player = data.players[this.targetPlayerId];
                    if(item) {
                        room.announce(actionText(this.name, 'attacks', player.name, 'with a', item.name));
                    } else {
                        room.announce(actionText(this.name, 'punches', player.name, 'in the gut!'));
                    }
                    player.listeners.damage(damage, room);
                }
            }
        }.bind(this);
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