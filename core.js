const main = require('./main.js');
const FS = require('fs');
module.exports = {
    id: function(tag) {
        return (typeof(tag) !== 'string') ? tag : tag.replace('<', '').replace('>', '').replace('!', '').replace('@', '');
    },
    tag: function(id) {
        return '<@' + id + '>';
    },
    save: function(obj, path) {
		if (!path) {
			path = '../saved.json';
		}
        console.log('Saving file ' + path);
        //main.setBusy('File saving in progress');
		var writeStream = FS.createWriteStream(path, {autoClose: true});
		writeStream.write(JSON.stringify(obj, null, 1));
		writeStream.end(function() {
            //main.clearBusy();
			console.log('File ' + path + ' saved');
		});
	},
    load: function(obj, path) {
        try {
            let file = require(path);
            //console.log(Object.assign(file, obj));
            return Object.assign(file, obj);
        } catch(e) {
            console.log(e);
        }
        return obj;
    },
    send: function(message, text) {
        if(message.channel) {
            message.channel.send(text);
        } else {
            message.author.send(text);
        }
    },
    //https://stackoverflow.com/a/46946633
    splitQuotes: function(s) {
        return s.match(/\\?.|^$/g).reduce((p, c) => {
            if(c === '"') {
                p.quote ^= 1;
            } else if(!p.quote && c === ' ') {
                p.a.push('');
            } else {
                p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
            }
            return  p;
        }, {a: ['']}).a;
    }
};
Array.prototype.remove = function(target) {
    let index = this.indexOf(target);
    if(index) {
        this.splice(index, 1);
        return true;
    } else {
        return false;
    }
};
Array.prototype.clone = function() {
    return this.slice(0);
}
Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};
/*Finds the first item that satisfies criterion and runs a function on it. If no matching item is found, then it runs a fallback function
*/
Array.prototype.findThen = function(criterion, then, otherwise) {
    let match = this.find(item => criterion(item));
    //Found a match; run the function on it
    if(match) {
        //Run the fallback function
        return then(match);
    } else if(otherwise) {
        return otherwise();
    }
};
Array.prototype.findNth = function(n, criterion) {
    return this.filter(item => criterion(item))[n];
};
Array.prototype.shuffle = function() {
    let result = this.clone();
    for(let i = result.length-1; i > -1; i--) {
        let swap_i = Math.floor(Math.random() * i);
        [result[i], result[swap_i]] = [result[swap_i], result[i]];
    }
    return result;
};
Array.prototype.at = function(index) {
    if(index) {
        return this[index];
    }
};
Array.prototype.choose = function(count) {
    if(count) {
        return this.shuffle().slice(0, count);
    } else {
        return this[Math.floor(Math.random() * this.length)];
    }
};
Array.prototype.pick = function(count) {
    if(count) {
        let result = [];
        for(let i = 0; i < count; i++) {
            let random_i = Math.floor(Math.random() * this.length);
            result.push(this[random_i]);
            this.splice(random_i, 1);
        }
        return result;
    } else {
        let random_i = Math.floor(Math.random() * this.length);
        let result = this[random_i];
        this.splice(random_i, 1);
        return result;
    }
};
Array.prototype.pushUnique = function(item) {
    if(this.includes(item)) {
        return false;
    } else {
        this.push(item);
        return true;
    }
};
Math.range = function(min, max) {
    if(max) {
        return min + Math.floor(Math.random() * (1 + max));
    } else {
        return Math.floor(Math.random() * (1 + min));
    }
};