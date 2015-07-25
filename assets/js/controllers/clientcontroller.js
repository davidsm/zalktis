"use strict";

var RemoteControl = require("../control");

var dispatcher;

function setUpConnection() {
    RemoteControl.connect("control").then(function (connection) {
        dispatcher.on("navigate", function (data) {
            connection.emit("navigate", data);
        });

        dispatcher.on("menu-toggle", function (data) {
            connection.emit("menu-toggle", data);
        });
    });
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpConnection();
    }
};
