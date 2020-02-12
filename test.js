'use strict';
global.__basedir = __dirname;

const requirer = require("extended-requirer");
const r = new requirer(__dirname,{"currentConfig" : "PRO"});

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
var jsonPath ={
    "path" : "/suma",
    "description" : "Suma de dos números",
    "method" : "GET",
    "params" : [
        {
            name : "n1",
            type: "string",
            maxLength: 10,
            placeholder: "First number..."
        },{
            name : "n2",
            type: "string",
            maxLength: 10,
            placeholder: "Second number..."
        }
    ],
    "result" : {
        "type" : "json"
    }
};
e.addPath(jsonPath, (req, res) => {
    var result = Number(req.query.n1) + Number(req.query.n2);
    res.send("result: " + result);
});
e.startListening();
