"use strict";

var React = require("react");
var EventEmitter = require("./mixins").EventEmitter;


var RemoteControlApp = React.createClass({
    displayName: "RemoteControlApp",

    render: function () {
        return React.DOM.div(
            {className: "control-area"},
            React.createElement(MenuBar, {
                dispatcher: this.props.dispatcher
            }),
            React.createElement(Navigation, {
                dispatcher: this.props.dispatcher
            })
        );
    }
});

var MenuBar = React.createClass({
    displayName: "MenuBar",

    render: function () {
        return React.DOM.div({className: "control-menu-bar"},
                             React.createElement(MenuButton, {
                                 dispatcher: this.props.dispatcher
                             }));
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
        return React.DOM.div({
            onClick: function () {
                this.setState({
                    menuOpen: !this.state.menuOpen
                });
                this.emit("menu-toggle", {
                    action: nextState
                });
            }.bind(this)
        }, (this.state.menuOpen ? "Close" : "Open") + " Menu");
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
        var rows = [
            React.DOM.div(
                {className: "navigation-button-row"}, React.createElement(ArrowButton, {
                    direction: "up",
                    onClick: this.onNavButtonClick.bind(this, "up")
                })
            ),
            React.DOM.div(
                {className: "navigation-button-row navigation-button-row-center"},
                React.createElement(ArrowButton, {
                    direction: "left",
                    onClick: this.onNavButtonClick.bind(this, "left")
                }),
                React.createElement(SelectButton, {
                    onClick: this.onSelectButtonClick
                }),
                React.createElement(ArrowButton, {
                    direction: "right",
                    onClick: this.onNavButtonClick.bind(this, "right")
                })
            ),
            React.DOM.div(
                {className: "navigation-button-row"}, React.createElement(ArrowButton, {
                    direction: "down",
                    onClick: this.onNavButtonClick.bind(this, "down")
                })
            )
        ];

        return React.DOM.div({className: "navigator"},
                             rows);
    }
});

var ArrowButton = React.createClass({
    displayName: "ArrowButton",

    render: function () {
        return React.DOM.div({
            className: "arrow-button arrow-button-" + this.props.direction,
            onClick: this.props.onClick
        }, React.DOM.div({
            className: "arrow-" + this.props.direction
        }));
    }
});

var SelectButton = React.createClass({
    displayName: "SelectButton",

    render: function () {
        return React.DOM.div({
            className: "select-button",
            onClick: this.props.onClick
        });
    }
});

module.exports = {
    init: function (dispatcher, mountPoint) {
        React.render(React.createElement(RemoteControlApp, {
            dispatcher: dispatcher
        }), mountPoint);
    },

    onUnload: function () {
        /* TBD */
    }
};
