const types = {
    die_std: function() {
        return {
            name: 'six-sided die',
            desc: 'a standard six-sided die',
            
            use: {
                stats: function() {
                    let average = 0;
                    let record = this.roll_record;
                    for(let i = 0; i < record.length; i++) {
                        average += record[i];
                    }
                    average /= record.length;
                    return 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average;
                },
                roll: function() {
                    let roll = this.roll();
                    this.roll_record.push(roll);
                    return 'You roll ' + roll;
                }
            },
            roll_record: [],
            
            sides: [1, 2, 3, 4, 5, 6],
            roll: function() { return this.sides[Math.floor(Math.random() * this.sides.length)]; }
        }
    },
    die_loaded: function() {
        return {
            name: 'loaded six-sided die',
            desc: 'a loaded six-sided die with a preference for the number 6',
            
            use: {
                stats: function() {
                    let average = 0;
                    let record = this.roll_record;
                    for(let i = 0; i < record.length; i++) {
                        average += record[i];
                    }
                    average /= record.length;
                    return 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average;
                },
                roll: function() {
                    let roll = this.roll();
                    this.roll_record.push(roll);
                    return 'You roll ' + roll;
                }
            },
            roll_record: [],
            
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
                stats: function() {
                    let average = 0;
                    let record = this.roll_record;
                    for(let i = 0; i < record.length; i++) {
                        average += record[i];
                    }
                    average /= record.length;
                    return 'You have rolled this bundle of dice ' + record.length + ' times. Your average roll is ' + average;
                },
                roll: function() {
                    let roll = this.roll();
                    this.roll_record.push(roll);
                    return 'You roll ' + roll;
                }
            },
            roll_record: [],
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