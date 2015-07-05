var RemoteControl;

(function () {
    "use strict";

    var wsServer = "ws://" + window.location.host + "/controller";

    function sendMessage(event, args, type, ws) {
        ws.send(JSON.stringify({
            event: event,
            args: args,
            client_type: type
        }));
    }

    function createConnection(ws, type) {
        var listeners = {};

        var connection = {
            on: function (event, callback) {
                listeners[event] = listeners[event] || [];
                listeners[event].push(callback);
            },

            emit: function (event, args) {
                sendMessage(event, args, type, ws);
            }
        };

        ws.onmessage = function (message) {
            var parsedMessage = JSON.parse(message.data);
            var event = parsedMessage.event;
            var args = parsedMessage.args;
            var registeredListeners = listeners[event];
            if (registeredListeners) {
                for (var i=0; i < registeredListeners.length; i++) {
                    registeredListeners[i](args);
                }
            }
        };

        return connection;
    };

    RemoteControl = {
        connect: function (type) {
            var ws = new WebSocket(wsServer);
            return new CrapPromise(function (resolve, reject) {
                ws.onopen = function () {
                    sendMessage("join", {}, type, ws);
                    document.addEventListener("unload", function () {
                        ws.close();
                    });
                    resolve(createConnection(ws, type));
                };
            });
        }
    };
})();
