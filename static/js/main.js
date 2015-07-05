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
    var connection;

    var MenuBar = React.createClass({

        getInitialState: function () {
            return {open: false};
        },

        componentWillMount: function () {
            connection.on("menu-toggle", function (data) {
                this.setState({
                    open: data.action === "open"
                });
            }.bind(this));
        },

        render: function () {
            var classString = "menu-bar ";
            classString += this.state.open ? "open" : "";
            return React.DOM.div({className: classString});
        }

    });

    return {
        init: function (conn, mountPoint) {
            connection = conn;
            React.render(React.createElement(MenuBar, null), mountPoint);
        }
    };

})();


React.render(React.createElement(MainPage, null),
             document.querySelector("#app-mount-point"));
RemoteControl.connect("screen").then(function (connection) {
    connection.on("join", function (data) {
        console.log(data.what + " has connected");
    });

    connection.on("navigate", function (data) {
        console.log("Navigate to " + data.direction);
    });

    MenuApp.init(connection, document.querySelector("#menu-mount-point"));
});
