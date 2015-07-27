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
var JS_MAIN_SRC = path.join(JS_DIR, "main.js");
var JS_CLIENT_SRC = path.join(JS_DIR, "client.js");
var JS_FILES = [JS_MAIN_SRC, JS_CLIENT_SRC];

var DIST = "dist";

function copy(from, to) {
    return gulp.src(from)
        .pipe(gulp.dest(to));
}

function bundle(file, watch) {
    var props = {
        entries: [file],
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
    JS_FILES.forEach(function (f) {
        bundle(f, false);
    });
});

gulp.task("watch", function () {
    gulp.watch(IMAGE_SRC, ["images"]);
    gulp.watch(CSS_SRC, ["css"]);
    gulp.watch(FONT_SRC, ["fonts"]);

    JS_FILES.forEach(function (f) {
        console.log("Rebuilding " + f);
        bundle(f, true);
    });
});

gulp.task("dist", ["bundle", "css", "images", "fonts"]);
