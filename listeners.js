const config = require('../config.json');
const core = require('./core.js');
const itemtypes = require('./items.js');
const mobtypes = require('./mobs.js');
const players = require('./players');

const listeners = {
    //We pass in the player object as 'this'
    default_say_room: function(source, text) {
        //console.log('You:    ' + this.id);
        //console.log('Source: ' + source.id);
        this.messages.push(source.name + ' says: ' + text);
    },
    default_damage: function(points, room) {
        //console.log('POINTS');
        //console.log(points);
        this.stats.health -= points;
        room.announce('`' + this.name + '`' + ' takes ' + points + ' points of damage');
        if(this.stats.health < 1) {
            //this.channel.send(this.name + ' dies from the attack!');
        }
    }
};
module.exports = {
    listeners: listeners,
}