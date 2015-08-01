"use strict";

var listeners = {};

module.exports = {
    on: function (event, listener) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(listener);
    },
    emit: function (event, data) {
        var handlers = listeners[event];
        if (handlers) {
            handlers.forEach(function (handler) {
                handler(data || {});
            });
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
