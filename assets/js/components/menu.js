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
            var itemsAmount = this.props.items.length;
            var newIndex = ((itemsAmount + this.state.selectedIndex + change) %
                            itemsAmount);
            this.setState({
                selectedIndex: newIndex
            });
        }
    },

    _select: function () {
        if (this.state.open) {
            this.props.items[this.state.selectedIndex].onSelect();
            window.setTimeout(this._toggle.bind(this, "close"), 500);
        }
    },

    componentWillMount: function () {
        dispatcher.on("menu-toggle", function (data) {
            this._toggle(data.action);
        }.bind(this));

        dispatcher.on("navigate", function (data) {
            this._navigate(data.direction);
        }.bind(this));

        dispatcher.on("select", this._select);
    },

    render: function () {
        var classString = "menu-bar ";
        classString += this.state.open ? "open" : "";
        var items = this.props.items.map(function (itemProps, index) {
            itemProps.props.hasFocus = (index === this.state.selectedIndex);
            return React.createElement(MenuItem, itemProps.props);
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
            {
                props: {
                    imgSrc: "/static/images/svtplay.png",
                    label: "SVTPlay"
                },
                onSelect: function () {
                    dispatcher.emit("app-select", {
                        app: "svtplay"
                    });
                }
            },
            {
                props: {
                    imgSrc: "/static/images/svtplay.png",
                    label: "Dummy"
                },
                onSelect: function () {}
            }
        ];
        React.render(React.createElement(MenuBar, {items: menuItems}),
                     mountPoint);
    },

    onUnload: function () {
        /* TBD */
    }
};
