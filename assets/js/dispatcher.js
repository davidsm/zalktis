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
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](data || {});
            }
        }
    }
};
