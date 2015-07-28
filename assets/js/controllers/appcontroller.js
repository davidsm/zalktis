"use strict";

var RemoteControl = require("../control");
var appHandler = require("../apps");


var dispatcher;
var loadedApp = null;

function setUpConnection() {
    RemoteControl.connect("screen").then(function (connection) {
        connection.on("menu-toggle", function (data) {
            dispatcher.emit("menu-toggle", data);
        });

        connection.on("navigate", function (data) {
            dispatcher.emit("navigate", data);
        });

        connection.on("select", function (data) {
            dispatcher.emit("select", data);
        });
    });
}

function loadApp(app) {
    if (loadedApp) {
        appHandler.apps[loadedApp].unload();
    }
    appHandler.apps[app].init(dispatcher, appHandler.MOUNT_POINT_MAIN);
    loadedApp = app;
}

function setUpListeners() {
    dispatcher.on("app-select", function (data) {
        loadApp(data.app);
    });
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpConnection();
        setUpListeners();
        loadApp(appHandler.APP_INITIAL);
    }
};
