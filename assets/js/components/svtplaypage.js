"use strict";

var React = require("react");
var Focusable = require("./mixins").Focusable;
var EventEmitter = require("./mixins").EventEmitter;
var layout = require("./layout");
var Grid = layout.Grid;
var GridArea = layout.GridArea;
var format = require("../common/format");


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
                id: this.state.shows[this.state.selectedIndex].id
            });
        }
    },

    _return: function () {
        // This is obviously very crude,
        // and will work only as long as
        // there are only two different sections
        if (!this.state.hasFocus) {
            this.takeFocus();
        }
    },

    componentWillMount: function () {
        this.on("svtplay-shows-updated", this._onShows);
        this.emit("svtplay-get-shows", {});

        this.on("navigate", this._navigate);
        this.on("select", this._select);
        this.on("return", this._return);
        this.takeFocus();
    },

    render: function () {
        var firstVisible = (parseInt(this.state.selectedIndex / MAX_VISIBLE_SHOWS, 10) *
                            MAX_VISIBLE_SHOWS);
        var lastVisible = Math.min((firstVisible + MAX_VISIBLE_SHOWS),
                                   this.state.shows.length);
        var shows = this.state.shows.slice(firstVisible, lastVisible)
            .map(function (show, i) {
                return (
                    <ShowItem
                        title={show.title}
                        hasFocus={this.state.selectedIndex === (firstVisible + i)}
                    />
                );
            }, this);

        var classString = "shows-list";
        if (this.state.hasFocus) {
            classString += " focus";
        }

        return (
            <div className={classString}>
                <h1>Shows</h1>
                <ul>
                    {shows}
                </ul>
            </div>
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
        return (
            <li className={classString}>
                {title}
            </li>
        );
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
        var positionStart = visibleEpisodes.length <= 1 ? 25 : -30;
        var focusedIndex = visibleEpisodes.length <= 1 ? 0 : 1;

        var episodes = visibleEpisodes.map(function (episode, i) {
            return (
                <EpisodeItem
                    title={episode.title}
                    thumbnail={episode.thumbnail}
                    hasFocus={(i === focusedIndex)}
                    width={episodeItemSize}
                    left={positionStart + ((episodeItemSize + gutter) * i)}
                />
            );
        }, this);

        var episodeData;
        if (this.state.episodes.length) {
            episodeData = {
                visible: true,
                description: visibleEpisodes[focusedIndex].description,
                duration: visibleEpisodes[focusedIndex].duration
            };
        }
        else {
            episodeData = {
                visible: false
            };
        }

        var classString = "episodes-list";
        if (this.state.hasFocus) {
            classString += " focus";
        }

        return (
            <div>
                <div className={classString}>
                    {episodes}
                </div>
                <EpisodeInfo {...episodeData}/>
            </div>
        );
    }

});

var EpisodeItem = React.createClass({
    displayName: "EpisodeItem",

    render: function () {
        var classString = "episode-item";
        if (this.props.hasFocus) {
            classString += " focus";
        }

        var style = {
            left: this.props.left + "%",
            width: this.props.width + "%"
        };

        return (
            <div className={classString} style={style}>
                <img src={this.props.thumbnail}/>
                <div className="episode-label">
                    {this.props.title}
                </div>
            </div>
        );
    }
});


var EpisodeInfo = React.createClass({
    render: function () {
        var classString = "episode-info";

        if (!this.props.visible) {
            classString += " hidden";
        }

        return (
            <div className={classString}>
                <div className="episode-description">
                    {this.props.description}
                </div>
                <span className="episode-duration">
                    {format.formatTime(this.props.duration)}
                </span>
            </div>
        );
    }
});


var SVTPlayApp = React.createClass({
    render: function () {
        return (
            <Grid>
                <GridArea width="25%" height="100%">
                    <ShowsList dispatcher={this.props.dispatcher}/>
                </GridArea>
                <GridArea width="75%" height="100%" offsetLeft="25%">
                    <EpisodesList dispatcher={this.props.dispatcher}/>
                </GridArea>
            </Grid>
        );
    }
});

module.exports = {
    init: function (dispatcher, mountPoint) {
        React.render(
            <SVTPlayApp dispatcher={dispatcher}/>,
            mountPoint
        );
    },

    onUnload: function () {}
};
