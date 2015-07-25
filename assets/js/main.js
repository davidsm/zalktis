"use strict";

var AppController = require("./controllers/appcontroller");
var AppDispatcher = require("./dispatcher");
var MenuApp = require("./components/menu");
var MainPage = require("./components/mainpage");


AppController.init(AppDispatcher);
MenuApp.init(AppDispatcher, document.querySelector("#menu-mount-point"));
MainPage.init(AppDispatcher, document.querySelector("#app-mount-point"));
