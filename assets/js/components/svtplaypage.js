"use strict";

var React = require("react");
var layout = require("./layout");
var Grid = layout.Grid;
var GridArea = layout.GridArea;


var dispatcher;

var ShowsList = React.createClass({

    getInitialState: function () {
        return {
            shows: []
        };
    },

    _onShows: function (data) {
        this.setState({
            shows: data.shows
        });
    },

    componentWillMount: function () {
        dispatcher.on("svtplay-shows-updated", this._onShows.bind(this));
        dispatcher.emit("svtplay-get-shows", {});
    },

    render: function () {
        var shows = this.state.shows.map(function (show) {
            return React.createElement(ShowItem, {title: show.title});
        });

        return React.DOM.div(
            {className: "shows-list"},
            React.DOM.h1(null, null, "Shows"),
            React.DOM.ul(null, shows)
        );
    }
});

var ShowItem = React.createClass({
    render: function () {
        return React.DOM.li(null, null, this.props.title);
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
