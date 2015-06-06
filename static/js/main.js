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
        return this.state.now.getHours() + ":" + this.state.now.getMinutes();
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


React.render(React.createElement(MainPage, null), document.querySelector("#mount-point"));
