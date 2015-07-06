var zalktis = new Zalktis();

var Grid = React.createClass({
    displayName: "Grid",

    render: function () {
        return React.DOM.div({
            style: {
                width: screen.width,
                height: screen.height,
                position: "relative"
            }
        }, this.props.children);
    }
});

var GridArea = React.createClass({
    displayName: "GridArea",

    render: function () {
        return React.DOM.div({
            style: {
                width: this.props.width,
                height : this.props.height,
                position: "absolute",
                top: this.props.offsetLeft || 0,
                left: this.props.offsetTop || 0
            }
        }, this.props.children);
    }
});

var Clock = React.createClass({
    displayName: "Clock",

    getInitialState: function () {
        return {
            now: new Date()
        };
    },

    componentDidMount: function () {
        this.timer = setInterval(this.tick, 5000);
    },

    componentWillUnmount: function () {
        clearInterval(this.timer);
    },

    tick: function () {
        this.setState({now: new Date()});
    },

    timeString: function () {
        var hour = this.state.now.getHours();
        var minute = this.state.now.getMinutes();
        minute = minute > 9 ? minute : "0" + minute.toString();
        return hour + ":" + minute;
    },

    dateString: function () {
        return this.state.now.toDateString();
    },

    render: function () {
        return React.DOM.div(
            {className: "clock"},
            React.DOM.span(
                {className: "time"},
                null,
                this.timeString()
            ),
            React.DOM.span(
                {className: "date"},
                null,
                this.dateString()
            )
        );
    }
});


var MainPage = React.createClass({
    render: function () {
        return React.createElement(
            Grid, null,
            React.createElement(
                GridArea, {
                    width: "25%",
                    height: "25%",
                    offsetLeft: "75%",
                    offsetTop: "75%"
                }, React.createElement(Clock, null)
            )
        );
    }
});


var MenuApp = (function () {
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

    return {
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

})();


var AppDispatcher = (function () {
    var listeners = {};

    return {
        on: function (event, listener) {
            listeners[event] = listeners[event] || [];
            listeners[event].push(listener);
        },
        emit: function (event, data) {
            var handlers = listeners[event];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i](data);
                }
            }
        }
    };
})();


var AppController = (function () {
    var dispatcher;

    function setUpConnection() {
        RemoteControl.connect("screen").then(function (connection) {
            connection.on("menu-toggle", function (data) {
                dispatcher.emit("menu-toggle", data);
            });

            connection.on("navigate", function (data) {
                dispatcher.emit("navigate", data);
            });
        });
    }

    return {
        init: function (dispObj) {
            dispatcher = dispObj;
            setUpConnection();
        }
    };

})();

React.render(React.createElement(MainPage, null),
             document.querySelector("#app-mount-point"));

AppController.init(AppDispatcher);
MenuApp.init(AppDispatcher, document.querySelector("#menu-mount-point"));
