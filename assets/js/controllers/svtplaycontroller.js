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
        id: data.id
    }).then(function (episodes) {
        dispatcher.emit("svtplay-episodes-updated", {
            episodes: episodes
        });
    });
}

function playVideo(data) {
    zalktis.svtplay.getVideoUrlForEpisode({
        episode_url: data.url
    }).then(function (url) {
        dispatcher.emit("mediaplayer-play", {
            url: url
        });
    });
}

function setUpListeners() {
    dispatcher.on("svtplay-get-shows", getShows);
    dispatcher.on("svtplay-get-episodes", getEpisodes);
    dispatcher.on("svtplay-play-episode", playVideo);
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpListeners();
    },

    onUnload: function () {
        dispatcher.unregister("svtplay-get-shows", getShows);
        dispatcher.unregister("svtplay-get-episodes", getEpisodes);
        dispatcher.unregister("svtplay-play-episode", playVideo);
    }
};
