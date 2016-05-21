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
                <MenuButton dispatcher={this.props.dispatcher}/>
            </div>
        );
    }
});

var MenuButton = React.createClass({
    displayName: "MenuButton",

    mixins: [EventEmitter],

    getInitialState: function () {
        return {
            menuOpen: false
        };
    },

    render: function () {
        var nextState = this.state.menuOpen ? "close" : "open";
        var onClick = function () {
            this.setState({
                menuOpen: !this.state.menuOpen
            });
            this.emit("menu-toggle", {
                action: nextState
            });
        }.bind(this);
        return (
            <div onClick={onClick}>
                {(this.state.menuOpen ? "Close" : "Open") + " Menu"}
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
                <div className={"arrow-" + this.props.direction}/>
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
