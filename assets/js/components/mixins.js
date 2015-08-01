"use strict";

var dispatcher;

exports.focusable = {
    retainFocus: false,

    onFocusChange: function (data) {
        this.setState({
            hasFocus: data.focusedComponent === this.displayName
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
        dispatcher.emit("focus-change", {
            focusedComponent: this.displayName
        });
    },

    handleFocus: function (dispObj) {
        dispatcher = dispObj;
        dispatcher.on("focus-change", this.onFocusChange);
        dispatcher.on("menu-toggle", this.onMenuToggle);
    }

};
