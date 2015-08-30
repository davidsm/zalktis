"use strict";

var Zalktis = require("../zalktis");
var zalktis = new Zalktis();

var dispatcher;

function startPlayback(data) {
    zalktis.player.play({
        uri: data.url
    }).then(function () {
        dispatcher.emit("mediaplayer-playback-started", {});
    });
}

function setUpListeners() {
    dispatcher.on("mediaplayer-play", startPlayback);
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpListeners();
    },

    onUnload: function () {
        dispatcher.unregister("mediaplayer-play", startPlayback);
    }
};
