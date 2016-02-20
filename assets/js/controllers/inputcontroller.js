"use strict";

var dispatcher;

function menuToggler() {
    var status = "close";
    return function () {
        status = status === "open" ? "close" : "open";
        return {
            action: status
        };
    };
}

var keyEventMap = {
    Enter: {
        event: "select",
        data: {}
    },
    m: {
        event: "menu-toggle",
        data: menuToggler()
    },
    ArrowUp: {
        event: "navigate",
        data: {
            direction: "up"
        }
    },
    ArrowLeft: {
        event: "navigate",
        data: {
            direction: "left"
        }
    },
    ArrowRight: {
        event: "navigate",
        data: {
            direction: "right"
        }
    },
    ArrowDown: {
        event: "navigate",
        data: {
            direction: "down"
        }
    }
};

function onKey(event) {
    var key = event.key;
    var keyEventHandler = keyEventMap[key];
    if (keyEventHandler) {
        var data = keyEventHandler.data;
        if (typeof(data) === "function") {
            data = data();
        }
        dispatcher.emit(keyEventHandler.event, data);
    }
}

function setUpListeners() {
    document.addEventListener("keydown", onKey);
}

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpListeners();
    }
};
