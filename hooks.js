//We define a "hook" as an object that intercepts a raw message and uses it as extended input for a previous command
const core = require('./core.js');
const CONFIG = require('../config.json');
let hooks = [
    {
        //We always make sure to define 'this' as the hook object when calling functions
        
        //If specified, then this hook only intercepts messages from a specific author
        targetId: CONFIG.archId,
        //This is an anonymous function that handles input for a hook. We return true if we intercepted the message
        intercept: function(message) {
            console.log('Testing default hook');
            if(message.content === (core.tag(CONFIG.meId) + ' hook')) {
                message.channel.send(core.tag(message.author.id) + ', your message has been intercepted by the default hook');
                return true;
            }
            return false;
        },
        //This is either a boolean value or a function that returns a boolean value. If true, then the hook is done and should be removed. This can be set in the hook's intercept function.
        remove: false,
        data: {
            //Keep other relevant data here
        },
    }
];
module.exports = {
    add: function(hook) {
        hooks.push(hook);
    },
    match: function(predicate) {
        for(let i = hooks.length-1; i > -1; i--) {
            let hook = hooks[i];
            if(predicate(hook)) {
                return hook;
            }
        }
        return null;
    },
    intercept: function(message) {
        console.log('Processing hooks');
        //We return true to say that we intercept the message and that the parent should not process it any further
        for(let i = hooks.length-1; i > -1; i--) {
            let hook = hooks[i];
            console.log('Processing hook ' + i);
            //If we have a target ID, then we check if the author matches it
            if(hook.targetId && hook.targetId !== message.author.id)
                continue;
            if(hook.intercept.call(hook, message)) {
                //If we intercept this message, then we leave the remaining hooks for next time
                
                if(hook.remove) {
                    //Check if we need to remove this hook
                    if(hook.remove === true || hook.remove.call(hook, message) === true) {
                        //Remove this hook because we are done with it
                        hooks.splice(i, 1);
                    }
                }
                return true;
            }
        }
        return false;
    }
};