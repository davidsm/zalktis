"use strict";

var React = require("react");

exports.Grid = React.createClass({
    displayName: "Grid",

    render: function () {
        return React.DOM.div({
            className: "grid",
            style: {
                //width: screen.width,
                //height: screen.height,
                position: "relative"
            }
        }, this.props.children);
    }
});

exports.GridArea = React.createClass({
    displayName: "GridArea",

    render: function () {
        return React.DOM.div({
            style: {
                width: this.props.width,
                height : this.props.height,
                top: this.props.offsetTop || 0,
                left: this.props.offsetLeft || 0
            },
            className: "grid-area"
        }, this.props.children);
    }
});
