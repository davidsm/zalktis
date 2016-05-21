"use strict";

var React = require("react");
var EventEmitter = require("./mixins").EventEmitter;

var MenuBar = React.createClass({
    displayName: "MenuBar",

    mixins: [EventEmitter],

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
        this.on("menu-toggle", function (data) {
            this._toggle(data.action);
        }.bind(this));

        this.on("navigate", function (data) {
            this._navigate(data.direction);
        }.bind(this));

        this.on("select", this._select);
    },

    render: function () {
        var classString = "menu-bar ";
        classString += this.state.open ? "open" : "";
        var items = this.props.items.map(function (itemProps, index) {
            itemProps.props.hasFocus = (index === this.state.selectedIndex);
            return React.createElement(MenuItem, itemProps.props);
        }, this);
        return (
            <div className={classString}>
                {items}
            </div>
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
        return (
            <div className={classString}>
                <img src={this.props.imgSrc}/>
                {this.props.label}
            </div>
        );
    }
});

module.exports = {
    init: function (dispatcher, mountPoint) {
        var menuItems = [
            {
                props: {
                    imgSrc: "/static/images/home.png",
                    label: "Home"
                },
                onSelect: function () {
                    dispatcher.emit("app-select", {
                        app: "main"
                    });
                }
            },
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
            }
        ];
        React.render(
            <MenuBar items={menuItems} dispatcher={dispatcher}/>,
            mountPoint
        );
    },

    onUnload: function () {
        /* TBD */
    }
};
