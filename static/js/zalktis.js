var Zalktis;

(function () {
    "use strict";

    var server_base = window.location.protocol + "//" + window.location.host;
    function makeCall (endpoint, call, args) {
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
        return new CrapPromise(function (resolve, reject) {
            xhr.onload = function () {
                var response = JSON.parse(xhr.responseText);
                if (response.status == "OK") {
                    resolve(response.value);
                }
                else {
                    // Should reject, but...
                    console.log("Error: " + response.error);
                }
            }
        });
    }

    function addEndpoint (obj, endpoint, call) {
        if (!obj[endpoint]) {
            Object.defineProperty(obj, endpoint, {
                enumerable: true,
                value: {}
            });
        }
        Object.defineProperty(obj[endpoint], call, {
            enumerable: true,
            value: function (args) {
                return makeCall(endpoint, call, args);
            }
        });
    }

    var endpoints = {
        system: ["shutdown"],
        player: ["play"],
        test: ["test"],
        svtplay: ["get_all_shows", "get_episodes_for_show", "get_video_url_for_episode"]
    };

    Zalktis = function () {
        for (var endpoint in endpoints) {
            var calls = endpoints[endpoint]
            for (var i=0; i < calls.length; i++) {
                addEndpoint(this, endpoint, calls[i]);
            }
        }
    };

})()
