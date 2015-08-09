"use strict";

var React = require("react");

exports.Focusable = {
    retainFocus: false,

    getInitialState: function () {
        return {
            // Eeew... Think of a better way
            identifier: Date.now()
        };
    },

    onFocusChange: function (data) {
        this.setState({
            hasFocus: data.focusedComponent === this.state.identifier
        });
    },

    onMenuToggle: function (data) {
        if (data.action === "open" && this.state.hasFocus) {
            this.retainFocus = true;
            this.setState({
                hasFocus: false
            });
        }
        else {
            if (this.retainFocus) {
                this.retainFocus = false;
                this.setState({
                    hasFocus: true
                });
            }
        }
    },

    takeFocus: function () {
        this.emit("focus-change", {
            focusedComponent: this.state.identifier
        });
    },

    componentWillMount: function () {
        this.on("focus-change", this.onFocusChange);
        this.on("menu-toggle", this.onMenuToggle);
    }

};

exports.EventEmitter = {
    propTypes: {
        dispatcher: React.PropTypes.shape({
            on: React.PropTypes.func,
            emit: React.PropTypes.func,
            unregister: React.PropTypes.func
        }).isRequired
    },

    _registeredEvents: [],

    on: function (event, handler) {
        this.props.dispatcher.on(event, handler);
        this._registeredEvents.push({
            event: event,
            handler: handler
        });
    },

    emit: function (event, data) {
        this.props.dispatcher.emit(event, data);
    },

    componentWillUnmount: function () {
        this._registeredEvents.forEach(function (e) {
            this.props.dispatcher.unregister(e.event, e.handler);
        }, this);
    }
};
