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

    onMenuChange: function (data) {
        if (data.open && this.state.hasFocus) {
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
        this.on("menu-change", this.onMenuChange);
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

    componentWillMount: function () {
        this._registeredEvents = [];
    },

    componentWillUnmount: function () {
        this._registeredEvents.forEach(function (e) {
            this.props.dispatcher.unregister(e.event, e.handler);
        }, this);
    }
};
