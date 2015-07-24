var RemoteControl = require("./control");

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

module.exports = {
    init: function (dispObj) {
        dispatcher = dispObj;
        setUpConnection();
    }
};
