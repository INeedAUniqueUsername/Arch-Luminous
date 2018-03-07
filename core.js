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
            console.log(Object.assign(file, obj));
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
}