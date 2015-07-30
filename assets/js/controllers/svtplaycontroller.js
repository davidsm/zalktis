"use strict";

var Zalktis = require("../zalktis");
var zalktis = new Zalktis();

var dispatcher;

function getShows() {
    zalktis.svtplay.getAllShows().then(function (shows) {
        dispatcher.emit("svtplay-shows-updated", {
            shows: shows
        });
    });
}

function getEpisodes(data) {
    zalktis.svtplay.getEpisodesForShow({
        show_url: data.url
    }).then(function (episodes) {
        dispatcher.emit("svtplay-episodes-updated", {
            episodes: episodes
        });
    });
}

function getVideoUrl(data) {
    zalktis.svtplay.getVideoUrlForEpisode({
        episode_url: data.url
    }).then(function (url) {
        dispatcher.emit("svtplay-video-url-updated", {
            url: url
        });
    });
}

function setUpListeners() {
    dispatcher.on("svtplay-get-shows", getShows);
    dispatcher.on("svtplay-get-episodes", getEpisodes);
    dispatcher.on("svtplay-get-video-url", getVideoUrl);
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpListeners();
    },

    onUnload: function () {}
};
