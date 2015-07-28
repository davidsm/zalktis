"use strict";

var React = require("react");
var layout = require("./layout");
var Grid = layout.Grid;
var GridArea = layout.GridArea;


var Clock = React.createClass({
    displayName: "Clock",

    getInitialState: function () {
        return {
            now: new Date()
        };
    },

    componentDidMount: function () {
        this.timer = setInterval(this.tick, 5000);
    },

    componentWillUnmount: function () {
        clearInterval(this.timer);
    },

    tick: function () {
        this.setState({now: new Date()});
    },

    timeString: function () {
        var hour = this.state.now.getHours();
        var minute = this.state.now.getMinutes();
        minute = minute > 9 ? minute : "0" + minute.toString();
        return hour + ":" + minute;
    },

    dateString: function () {
        return this.state.now.toDateString();
    },

    render: function () {
        return React.DOM.div(
            {className: "clock"},
            React.DOM.span(
                {className: "time"},
                null,
                this.timeString()
            ),
            React.DOM.span(
                {className: "date"},
                null,
                this.dateString()
            )
        );
    }
});


var MainPage = React.createClass({
    render: function () {
        return React.createElement(
            Grid, null,
            React.createElement(
                GridArea, {
                    width: "25%",
                    height: "25%",
                    offsetLeft: "75%",
                    offsetTop: "75%"
                }, React.createElement(Clock, null)
            )
        );
    }
});

module.exports = {
    init: function (dispObj, mountPoint) {
        React.render(React.createElement(MainPage, null), mountPoint);
    },

    onUnload: function () {
        /* TBD */
    }
};
