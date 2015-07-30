"use strict";

var SVTPlayController = require("./controllers/svtplaycontroller");
var MediaPlayerController = require("./controllers/mediaplayercontroller");

var unmount = require("react").unmountComponentAtNode;

function appLoader(app, handlers) {
    var mountedAt;

    return {
        init: function (dispatcher, mountPoint) {
            // Controllers should be loaded first
            // so that the app can require data immediately
            // when mounting if necessary
            if (handlers.onLoad) {
                handlers.onLoad(dispatcher);
            }
            app.init(dispatcher, mountPoint);
            mountedAt = mountPoint;
        },

        unload: function () {
            unmount(mountedAt);
            app.onUnload();
            if (handlers.onUnload) {
                handlers.onUnload();
            }
        }
    };
}

exports.apps = {
    main: appLoader(require("./components/mainpage"), {}),
    svtplay: appLoader(require("./components/svtplaypage"), {
        onLoad: function (dispatcher) {
            SVTPlayController.init(dispatcher);
            MediaPlayerController.init(dispatcher);
        },

        onUnload: function () {
            SVTPlayController.onUnload();
            MediaPlayerController.onUnload();
        }

    }),
    menu: appLoader(require("./components/menu"), {}),
    client: appLoader(require("./components/clientpage"), {})
};

exports.APP_INITIAL = "main";

exports.MOUNT_POINT_MAIN = "#app-mount-point";
exports.MOUNT_POINT_MENU = "#menu-mount-point";
exports.MOUNT_POINT_CLIENT = "#mount-point";
