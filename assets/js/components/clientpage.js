"use strict";

var React = require("react");
var EventEmitter = require("./mixins").EventEmitter;


var RemoteControlApp = React.createClass({
    displayName: "RemoteControlApp",

    render: function () {
        return (
            <div className="control-area">
                <MenuBar dispatcher={this.props.dispatcher}/>
                <Navigation dispatcher={this.props.dispatcher}/>
            </div>
        );
    }
});

var MenuBar = React.createClass({
    displayName: "MenuBar",

    render: function () {
        return (
            <div className="control-menu-bar">
                <BackButton dispatcher={this.props.dispatcher}/>
                <MenuButton dispatcher={this.props.dispatcher}/>
            </div>
        );
    }
});

var BackButton = React.createClass({
    displayName: "BackButton",

    mixins: [EventEmitter],

    render: function () {
        var onClick = function () {
            this.emit("return", {});
        }.bind(this);
        return (
            <div onClick={onClick} className="control-menu-bar-item">
            &lt;
            </div>
        );

    }
});

var MenuButton = React.createClass({
    displayName: "MenuButton",

    mixins: [EventEmitter],

    render: function () {
        var onClick = function () {
            this.emit("menu-toggle", {});
        }.bind(this);
        return (
            <div onClick={onClick} className="control-menu-bar-item">
                Menu
            </div>
        );
    }
});

var Navigation = React.createClass({
    displayName: "Navigation",

    mixins: [EventEmitter],

    onNavButtonClick: function (direction) {
        this.emit("navigate", {direction: direction});
    },

    onSelectButtonClick: function () {
        this.emit("select");
    },

    render: function () {
        var rows = [(
            <div className="navigation-button-row">
                <ArrowButton
                    direction="up"
                    onClick={this.onNavButtonClick.bind(this, "up")}
                />
            </div>
        ), (
            <div className="navigation-button-row navigation-button-row-center">
                <ArrowButton
                    direction="left"
                    onClick={this.onNavButtonClick.bind(this, "left")}
                />
                <SelectButton onClick={this.onSelectButtonClick}/>
                <ArrowButton
                    direction="right"
                    onClick={this.onNavButtonClick.bind(this, "right")}
                />
            </div>
        ), (
            <div className="navigation-button-row">
                <ArrowButton
                    direction="down"
                    onClick={this.onNavButtonClick.bind(this, "down")}
                />
            </div>
        )];

        return (
            <div className="navigator">
                {rows}
            </div>
        );
    }
});

var ArrowButton = React.createClass({
    displayName: "ArrowButton",

    render: function () {
        return (
            <div
                className={"arrow-button arrow-button" + this.props.direction}
                onClick={this.props.onClick}
            >
                <div className={"arrow arrow-" + this.props.direction}/>
            </div>
        );
    }
});

var SelectButton = React.createClass({
    displayName: "SelectButton",

    render: function () {
        return (
            <div
                className="select-button"
                onClick={this.props.onClick}
            />
        );
    }
});

module.exports = {
    init: function (dispatcher, mountPoint) {
        React.render(
            <RemoteControlApp dispatcher={dispatcher}/>,
            mountPoint
        );
    },

    onUnload: function () {
        /* TBD */
    }
};
