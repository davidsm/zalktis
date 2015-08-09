"use strict";

var listeners = {};

// Need to defer event registration if the handler loop
// for that event is ongoing. When dismounting and remounting
// a component, the added event handler functions count as the same
// as the handlers registered in the previous mount.
//
// Thus, the newly added handler will be called in the forEach loop,
// despite having been removed before its turn.
// This is stupid. Javascript is a stupid language.
var ongoing = [];
var deferred = [];

module.exports = {

    on: function (event, listener) {
        if (ongoing.indexOf(event) !== -1) {
            deferred[event] = deferred[event] || [];
            deferred[event].push({event: event, listener: listener});
        }
        else {
            listeners[event] = listeners[event] || [];
            listeners[event].push(listener);
        }
    },

    emit: function (event, data) {
        var handlers = listeners[event];
        if (handlers) {
            ongoing.push(event);
            handlers.forEach(function (handler) {
                handler(data || {});
            });
            ongoing.splice(ongoing.indexOf(event), 1);
            if (deferred[event] && deferred[event].length) {
                deferred[event].forEach(function (e) {
                    this.on(e.event, e.listener);
                }, this);
            }
        }
    },

    unregister: function (event, listener) {
        var handlers = listeners[event];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] === listener) {
                handlers.splice(i, 1);
                break;
            }
        }
    }
};
