"use strict";

var React = require("react");

var dispatcher;

var MenuBar = React.createClass({
    displayName: "MenuBar",

    getInitialState: function () {
        return {
            open: false,
            selectedIndex: 0
        };
    },

    _toggle: function (action) {
        this.setState({
            open: action === "open"
        });
    },

    _navigate: function (direction) {
        if (this.state.open) {
            var change;
            if (direction === "left") {
                change = -1;
            }
            else if (direction === "right") {
                change = 1;
            }
            else {
                return;
            }
            var itemsAmount = React.Children.count(this.props.children);
            var newIndex = ((itemsAmount + this.state.selectedIndex + change) %
                            itemsAmount);
            this.setState({
                selectedIndex: newIndex
            });
        }
    },

    componentWillMount: function () {
        dispatcher.on("menu-toggle", function (data) {
            this._toggle(data.action);
        }.bind(this));

        dispatcher.on("navigate", function (data) {
            this._navigate(data.direction);
        }.bind(this));
    },

    render: function () {
        var classString = "menu-bar ";
        classString += this.state.open ? "open" : "";
        var items = React.Children.map(this.props.children, function (child, index) {
            if (index === this.state.selectedIndex) {
                return React.cloneElement(child, {hasFocus: true});
            }
            return child;
        }, this);
        return React.DOM.div(
            {className: classString},
            items
        );
    }

});

var MenuItem = React.createClass({
    displayName: "MenuItem",

    render: function () {
        var classString = "menu-bar-item ";
        if (this.props.hasFocus) {
            classString += "focus";
        }
        return React.DOM.div({className: classString},
                             React.DOM.img({src: this.props.imgSrc}),
                             this.props.label);
    }

});

module.exports = {
    init: function (dispObj, mountPoint) {
        dispatcher = dispObj;
        var menuItems = [
            React.createElement(MenuItem, {
                imgSrc: "/static/images/svtplay.png",
                label: "SVTPlay",
                hasFocus: false
            }),
            React.createElement(MenuItem, {
                imgSrc: "/static/images/svtplay.png",
                label: "Dummy",
                hasFocus: false
            })
        ];
        React.render(React.createElement(MenuBar, null, menuItems),
                     mountPoint);
    }
};
