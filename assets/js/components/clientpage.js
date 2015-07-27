"use strict";

var React = require("react");

var dispatcher;

function onNavButtonClick(direction) {
    dispatcher.emit("navigate", {direction: direction});
}

var RemoteControlApp = React.createClass({
    displayName: "RemoteControlApp",

    render: function () {
        return React.DOM.div(
            {className: "control-area"},
            React.createElement(MenuBar, null),
            React.createElement(Navigation, null)
        );
    }
});

var MenuBar = React.createClass({
    displayName: "MenuBar",

    render: function () {
        return React.DOM.div({className: "control-menu-bar"},
                             React.createElement(MenuButton, null));
    }
});

var MenuButton = React.createClass({
    displayName: "MenuButton",

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
                dispatcher.emit("menu-toggle", {
                    action: nextState
                });
            }.bind(this)
        }, (this.state.menuOpen ? "Close" : "Open") + " Menu");
    }
});

var Navigation = React.createClass({
    displayName: "Navigation",

    render: function () {
        var rows = [
            React.DOM.div(
                {className: "navigation-button-row"}, React.createElement(ArrowButton, {
                    direction: "up",
                })
            ),
            React.DOM.div(
                {className: "navigation-button-row navigation-button-row-center"},
                React.createElement(ArrowButton, {
                    direction: "left"
                }),
                React.createElement(SelectButton, null),
                React.createElement(ArrowButton, {
                    direction: "right"
                })
            ),
            React.DOM.div(
                {className: "navigation-button-row"}, React.createElement(ArrowButton, {
                    direction: "down",
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
            onClick: onNavButtonClick.bind(this, this.props.direction)
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

            onClick: function () {
                dispatcher.emit("select");
            }
        });
    }
});

module.exports = {
    init: function (dispObj, mountPoint) {
        dispatcher = dispObj;
        React.render(React.createElement(RemoteControlApp, null), mountPoint);
    }
};
