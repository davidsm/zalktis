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
    },
    Backspace: {
        event: "return",
        data: {}
    }
};

function translateKey(event) {
    var key = event.key || event.code;
    switch (key) {
    case "KeyM":
        return "m";
    default:
        return key;
    }
}

function onKey(event) {
    var key = translateKey(event);
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
