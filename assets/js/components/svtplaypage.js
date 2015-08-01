"use strict";

var React = require("react");
var layout = require("./layout");
var Grid = layout.Grid;
var GridArea = layout.GridArea;


var dispatcher;

var MAX_VISIBLE_SHOWS = 20;

var ShowsList = React.createClass({
    displayName: "ShowsList",

    getInitialState: function () {
        return {
            shows: [],
            selectedIndex: 0,
            hasFocus: true
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

    componentWillMount: function () {
        dispatcher.on("svtplay-shows-updated", this._onShows.bind(this));
        dispatcher.emit("svtplay-get-shows", {});

        dispatcher.on("navigate", this._navigate.bind(this));
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

var ShowItem = React.createClass({
    displayName: "ShowItem",

    render: function () {
        var classString = this.props.hasFocus ? "focus" : "";
        return React.DOM.li({className: classString}, null, this.props.title);
    }
});

var SVTPlayApp = React.createClass({
    render: function () {
        return React.createElement(
            Grid, null,
            React.createElement(
                GridArea, {
                    width: "20%",
                    height: "100%",
                },
                React.createElement(ShowsList, null)
            )
        );
    }
});

module.exports = {
    init: function (dispObj, mountPoint) {
        dispatcher = dispObj;
        React.render(React.createElement(SVTPlayApp, null), mountPoint);
    },

    onUnload: function () {}
};
