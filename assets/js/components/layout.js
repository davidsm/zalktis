"use strict";

var React = require("react");

exports.Grid = React.createClass({
    displayName: "Grid",

    render: function () {
        return (
            <div className="grid">
                {this.props.children}
            </div>
        );
    }
});

exports.GridArea = React.createClass({
    displayName: "GridArea",

    render: function () {
        var style = {
            width: this.props.width,
            height: this.props.height,
            top: this.props.offsetTop || 0,
            left: this.props.offsetLeft || 0
        };

        return (
            <div style={style} className="grid-area">
                {this.props.children}
            </div>
        );
    }
});
