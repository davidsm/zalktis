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
                <div className="remote-col remote-col-center">
                    <ArrowButton
                        direction="up"
                        onClick={this.onNavButtonClick.bind(this, "up")}
                    />
                </div>
            </div>
        ), (
            <div className="navigation-button-row navigation-button-row-center">
                <div className="remote-col remote-col-left">
                    <ArrowButton
                        direction="left"
                        onClick={this.onNavButtonClick.bind(this, "left")}
                    />
                </div>
                <div className="remote-col remote-col-center">
                    <SelectButton onClick={this.onSelectButtonClick}/>
                </div>
                <div className="remote-col remote-col-right">
                    <ArrowButton
                        direction="right"
                        onClick={this.onNavButtonClick.bind(this, "right")}
                    />
                </div>

            </div>
        ), (
            <div className="navigation-button-row">
                <div className="remote-col remote-col-center">
                    <ArrowButton
                        direction="down"
                        onClick={this.onNavButtonClick.bind(this, "down")}
                    />
                </div>
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
            <div className="remote-button">
                <div
                    className={"button-content arrow arrow-" + this.props.direction}
                    onClick={this.props.onClick}
                />
            </div>
        );
    }
});

var SelectButton = React.createClass({
    displayName: "SelectButton",

    render: function () {
        return (
            <div className="remote-button">
                <div
                    className="button-content select-button"
                    onClick={this.props.onClick}
                />
            </div>
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
