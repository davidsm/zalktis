"use strict";

var ClientApp = require("./components/clientpage");
var ClientController = require("./controllers/clientcontroller");
var ClientDispatcher = require("./dispatcher");

ClientController.init(ClientDispatcher);
ClientApp.init(ClientDispatcher, document.querySelector("#mount-point"));
