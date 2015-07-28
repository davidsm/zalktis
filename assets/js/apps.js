"use strict";

var unmount = require("react").unmountComponentAtNode;

function appLoader(app, handlers) {
    var mountedAt;

    return {
        init: function (dispatcher, mountPoint) {
            app.init(dispatcher, mountPoint);
            mountedAt = mountPoint;
            if (handlers.onLoad) {
                handlers.onLoad(dispatcher);
            }
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
    svtplay: appLoader(require("./components/svtplaypage"), {}),
    menu: appLoader(require("./components/menu"), {}),
    client: appLoader(require("./components/clientpage"), {})
};

exports.APP_INITIAL = "main";

exports.MOUNT_POINT_MAIN = "#app-mount-point";
exports.MOUNT_POINT_MENU = "#menu-mount-point";
exports.MOUNT_POINT_CLIENT = "#mount-point";
