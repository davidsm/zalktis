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

        dispatcher.on("select", function (data) {
            connection.emit("select", data);
        });

        dispatcher.on("return", function (data) {
            connection.emit("return", data);
        });
    });
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpConnection();
    }
};
