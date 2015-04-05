var Zalktis;

(function () {
    "use strict";

    function CrapPromise(func) {
        // Crappy temporary stand-in for a proper promise framework (or native)
        this._thens = [];
        var resolve = this.resolve.bind(this);
        var reject = function () { 
            // Non working dummy
        };

        // Defer so "thens" can be chained before
        setTimeout(function () {
            func(resolve, reject);
        }, 1);
    }

    CrapPromise.prototype.resolve = function (val) {
        if (this._thens.length) {
            var f = this._thens.shift()
            var ret = f(val);
            if (ret && ret.then && ret.then instanceof Function) {
                ret.then(this.resolve.bind(this));
            }
            else {
                this.resolve(ret);
            }
        }
    };

    CrapPromise.prototype.then = function (func) {
        this._thens.push(func);
        return this;
    };

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
                enumberable: true,
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
