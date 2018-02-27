const types = {
    die_std: function() {
        return {
            name: 'six-sided die',
            desc: 'a standard six-sided die',
            use: {
                roll: function() {
                    return 'You roll a ' + this.roll();
                }
            },
            sides: [1, 2, 3, 4, 5, 6],
            roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
        }
    },
    die_loaded: function() {
        return {
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
        }
    },
    bundle_die_std: function() {
        return {
            name: 'bundle of six-sided dice',
            desc: 'a bundle of six standard six-sided dice',
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
        };
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