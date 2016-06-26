"use strict";

var SECS_PER_HOUR = 3600;
var SECS_PER_MINUTE = 60;

exports.formatTime = function (seconds) {
    var remaining = seconds;
    var timeString = [];
    if (remaining >= SECS_PER_HOUR) {
        var hours = Math.floor(remaining / SECS_PER_HOUR);
        timeString.push(hours + "h");
        remaining -= hours * SECS_PER_HOUR;
    }
    if (remaining >= SECS_PER_MINUTE) {
        var minutes = Math.floor(remaining / SECS_PER_MINUTE);
        timeString.push(minutes + "min");
    }

    return timeString.join(" ");
};
