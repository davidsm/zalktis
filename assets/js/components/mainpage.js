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
        return (
            <div className="clock">
                <span className="time">
                    {this.timeString()}
                </span>
                <span className="date">
                    {this.dateString()}
                </span>
            </div>
        );
    }
});


var MainPage = React.createClass({
    render: function () {
        return (
            <Grid>
                <GridArea
                    width="25%"
                    height="25%"
                    offsetLeft="75%"
                    offsetTop="75%"
                >
                    <Clock/>
                </GridArea>
            </Grid>
        );
    }
});

module.exports = {
    init: function (dispatcher, mountPoint) {
        React.render(<MainPage />, mountPoint);
    },

    onUnload: function () {
        /* TBD */
    }
};
