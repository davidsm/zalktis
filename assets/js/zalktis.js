"use strict";

var Promise = require("es6-promise").Promise;

var server_base = window.location.protocol + "//" + window.location.host;

function camelToSnake(text) {
    var rexp = new RegExp("[A-Z]", "g");
    return text.replace(rexp, function (match) {
        return "_" + match.toLowerCase();
    });
}

function makeCall(endpoint, call, args) {
    var url = server_base + "/" + endpoint;
    args = args || {};
    var data = {
        command: call,
        args: args
    };
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(JSON.stringify(data));
    return new Promise(function (resolve, reject) {
        xhr.onload = function () {
            var response = JSON.parse(xhr.responseText);
            if (response.status === "OK") {
                resolve(response.value);
            }
            else {
                // Should reject, but...
                console.log("Error: " + response.error);
            }
        };
    });
}

function addEndpoint(obj, endpoint, call) {
    if (!obj[endpoint]) {
        Object.defineProperty(obj, endpoint, {
            enumerable: true,
            value: {}
        });
    }
    Object.defineProperty(obj[endpoint], call, {
        enumerable: true,
        value: function (args) {
            return makeCall(endpoint, camelToSnake(call), args);
        }
    });
}

var endpoints = {
    system: ["shutdown"],
    player: ["play"],
    test: ["test"],
    svtplay: ["getAllShows", "getEpisodesForShow", "getVideoUrlForEpisode"]
};

var Zalktis = function () {
    for (var endpoint in endpoints) {
        var calls = endpoints[endpoint];
        for (var i=0; i < calls.length; i++) {
            addEndpoint(this, endpoint, calls[i]);
        }
    }
};

module.exports = Zalktis;
