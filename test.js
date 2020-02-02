'use strict';
global.__basedir = __dirname;

const requirer = require("../extended-requirer/index.js");
const r = new requirer(__dirname,{"currentConfig" : "DEV"});

const logger = r.require("logger-to-memory");

const api = require("./index.js");

var loggerConfig = {
    "logger-to-memory" :{
        "logsEnabled": true,
        "maxLogLines": 20,
        "logToConsole": true,
        "lineSeparator": "<br>"
    }
};
var log = new logger(loggerConfig);

var config = {
    "express-simple-api": {
        "apiHeader": "raulcalvo/express-simple-api description:",
        "host": '0.0.0.0',
        "port": 80
    }
};

var e = new api(config);
e.setLogger(log);
e.startListening();
