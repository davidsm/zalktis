"use strict";

var React = require("react");
var Focusable = require("./mixins").Focusable;
var EventEmitter = require("./mixins").EventEmitter;
var layout = require("./layout");
var Grid = layout.Grid;
var GridArea = layout.GridArea;


var MAX_VISIBLE_SHOWS = 20;

var ShowsList = React.createClass({
    displayName: "ShowsList",

    mixins: [EventEmitter, Focusable],

    getInitialState: function () {
        return {
            shows: [],
            selectedIndex: 0,
            hasFocus: false
        };
    },

    _onShows: function (data) {
        this.setState({
            shows: data.shows
        });
    },

    _navigate: function (data) {
        if (this.state.hasFocus) {
            var change;
            if (data.direction === "up") {
                change = -1;
            }
            else if (data.direction === "down") {
                change = 1;
            }
            else {
                return;
            }
            var itemsAmount = this.state.shows.length;
            var newIndex = ((itemsAmount + this.state.selectedIndex + change) %
                            itemsAmount);
            this.setState({
                selectedIndex: newIndex
            });
        }
    },

    _select: function () {
        if (this.state.hasFocus) {
            this.emit("svtplay-get-episodes", {
                url: this.state.shows[this.state.selectedIndex].url
            });
        }
    },

    componentWillMount: function () {
        this.on("svtplay-shows-updated", this._onShows);
        this.emit("svtplay-get-shows", {});

        this.on("navigate", this._navigate);
        this.on("select", this._select);
        this.takeFocus();
    },

    render: function () {
        var firstVisible = (parseInt(this.state.selectedIndex / MAX_VISIBLE_SHOWS, 10) *
                            MAX_VISIBLE_SHOWS);
        var lastVisible = Math.min((firstVisible + MAX_VISIBLE_SHOWS),
                                   this.state.shows.length);
        var shows = this.state.shows.slice(firstVisible, lastVisible)
            .map(function (show, i) {
                return React.createElement(ShowItem, {
                    title: show.title,
                    hasFocus: (this.state.selectedIndex === (firstVisible + i))
                });
            }, this);

        return React.DOM.div(
            {className: "shows-list"},
            React.DOM.h1(null, null, "Shows"),
            React.DOM.ul(null, shows)
        );
    }
});

// Not very scientific...
var MAX_SHOW_TITLE_LENGTH = 32;

var ShowItem = React.createClass({
    displayName: "ShowItem",

    truncateTitle: function (title) {
        if (title.length <= MAX_SHOW_TITLE_LENGTH) {
            return title;
        }
        else {
            return title.slice(0, MAX_SHOW_TITLE_LENGTH - 3) + "...";
        }
    },

    render: function () {
        var classString = this.props.hasFocus ? "focus" : "";
        var title = this.truncateTitle(this.props.title);
        return React.DOM.li({className: classString}, null, title);
    }
});

var MAX_VISIBLE_EPISODES = 3;

var EpisodesList = React.createClass({
    displayName: "EpisodesList",

    mixins: [EventEmitter, Focusable],

    getInitialState: function () {
        return {
            episodes: [],
            selectedIndex: 0,
            hasFocus: false
        };
    },

    _onEpisodes: function (data) {
        this.setState({
            episodes: data.episodes
        });
        this.takeFocus();
    },

    _navigate: function (data) {
        if (this.state.hasFocus) {
            var change;
            if (data.direction === "left") {
                change = -1;
            }
            else if (data.direction === "right") {
                change = 1;
            }
            else {
                return;
            }
            var itemsAmount = this.state.episodes.length;
            var newIndex = ((itemsAmount + this.state.selectedIndex + change) %
                            itemsAmount);
            this.setState({
                selectedIndex: newIndex
            });
        }
    },

    _select: function () {
        if (this.state.hasFocus) {
            this.emit("svtplay-play-episode", {
                url: this.state.episodes[this.state.selectedIndex].url
            });
        }
    },

    getVisibleEpisodes: function () {
        // Get one episode before and one after the selected one
        // Wrap around when necessary
        if (!this.state.episodes.length) {
            return [];
        }
        var i = 0;
        var visibleEpisodes = [];
        while (i < MAX_VISIBLE_EPISODES) {
            // Javascript modulo is dumb :(
            var episodeIndex = ((this.state.episodes.length +
                                 this.state.selectedIndex - 1 + i) %
                                this.state.episodes.length);
            if (visibleEpisodes.length < this.state.episodes.length) {
                visibleEpisodes.push(this.state.episodes[episodeIndex]);
            }
            i++;
        }
        return visibleEpisodes;
    },

    componentWillMount: function () {
        this.on("svtplay-episodes-updated", this._onEpisodes);
        this.on("navigate", this._navigate);
        this.on("select", this._select);
    },

    render: function () {
        var visibleEpisodes = this.getVisibleEpisodes();

        // Percent
        var episodeItemSize = 50;
        var gutter = 5;
        var positionStart = visibleEpisodes.length < MAX_VISIBLE_EPISODES ? 25 : -30;
        var focusedIndex = visibleEpisodes.length < MAX_VISIBLE_EPISODES ? 0 : 1;

        var episodes = visibleEpisodes.map(function (episode, i) {
            return React.createElement(EpisodeItem, {
                title: episode.title,
                thumbnail: episode.thumbnail,
                hasFocus: (i === focusedIndex),
                width: episodeItemSize,
                left: positionStart + ((episodeItemSize + gutter) * i)
            });
        }, this);

        return React.DOM.div({className: "episodes-list"},
                             episodes);
    }

});

var EpisodeItem = React.createClass({
    displayName: "EpisodeItem",

    render: function () {
        var classString = "episode-item";
        if (this.props.hasFocus) {
            classString += " focus";
        }
        return React.DOM.div(
            {
                className: classString,
                style: {
                    left: this.props.left + "%",
                    width: this.props.width + "%"
                }
            },
            React.DOM.img({
                src: this.props.thumbnail,
            }, null),
            React.DOM.div({className: "episode-label"}, null, this.props.title)
        );
    }
});

var SVTPlayApp = React.createClass({
    render: function () {
        return React.createElement(
            Grid, null,
            React.createElement(
                GridArea, {
                    width: "25%",
                    height: "100%",
                },
                React.createElement(ShowsList, {
                    dispatcher: this.props.dispatcher
                })
            ),
            React.createElement(
                GridArea, {
                    width: "75%",
                    height: "100%",
                    offsetLeft: "25%"
                },
                React.createElement(EpisodesList, {
                    dispatcher: this.props.dispatcher
                })
            )
        );
    }
});

module.exports = {
    init: function (dispatcher, mountPoint) {
        React.render(React.createElement(SVTPlayApp, {
            dispatcher: dispatcher
        }), mountPoint);
    },

    onUnload: function () {}
};
