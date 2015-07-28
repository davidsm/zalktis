"use strict";

var gulp = require("gulp");
var browserify = require("browserify");
var watchify = require("watchify");
var source = require("vinyl-source-stream");

var path = require("path");

var ASSET_BASE = "assets";
var IMAGE_SRC = path.join(ASSET_BASE, "images/*.@(png|jpg)");
var CSS_SRC = path.join(ASSET_BASE, "css/*.css");
var FONT_SRC = path.join(ASSET_BASE, "fonts/*.woff");
var JS_DIR = path.join(ASSET_BASE, "js");

var DIST = "dist";

function copy(from, to) {
    return gulp.src(from)
        .pipe(gulp.dest(to));
}

function bundle(file, watch) {
    console.log("Building " + file);
    var props = {
        entries: [path.join(JS_DIR, file)],
        cache: {}, packageCache: {}, fullPaths: true
    };
    var bundler = watch ? watchify(browserify(props)) : browserify(props);
    function rebundle() {
        return bundler.bundle()
            .pipe(source(file))
            .pipe(gulp.dest(path.join(DIST, "js")));
    }

    bundler.on("update", rebundle);

    return rebundle();
}

gulp.task("images", function () {
    return copy(IMAGE_SRC, path.join(DIST, "images"));
});

gulp.task("css", function () {
    return copy(CSS_SRC, path.join(DIST, "css"));
});

gulp.task("fonts", function () {
    return copy(FONT_SRC, path.join(DIST, "fonts"));
});

gulp.task("bundle", function () {
    ["main.js", "client.js"].forEach(function (f) {
        bundle(f, false);
    });
});

gulp.task("watch", function () {
    gulp.watch(IMAGE_SRC, ["images"]);
    gulp.watch(CSS_SRC, ["css"]);
    gulp.watch(FONT_SRC, ["fonts"]);

    ["main.js", "client.js"].forEach(function (f) {
        bundle(f, true);
    });
});

gulp.task("dist", ["bundle", "css", "images", "fonts"]);
