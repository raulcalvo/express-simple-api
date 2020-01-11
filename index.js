'use strict';

const requirer = require("../extended-requirer/index.js");
const r = new requirer(__dirname);

const logger = r.require('logger-to-memory');
const configLoader = r.require('config-loader-manager');

const express = r.require('express');
const mergeJSON = r.require('merge-json');
const path = r.require('path');

function getModuleName(){
    return __dirname.split(path.sep).slice(-1)[0];
}

module.exports = class expressimpleapi{

    constructor(config) {
        this._logger = console;
        var defaultConfig = {};
        defaultConfig[getModuleName()] = {
            "apiHeader": "raulcalvo/express-simple-api description:",
            "lineSeparator": "<br>",
            "host": '0.0.0.0',
            "port": 80
        };
        this._config = configLoader.load(__dirname, config, defaultConfig);

        this._express = new express();
        this._apiText = new Array();
        this._apiText[0] = this.getConfig("apiHeader");
        this.addDefaultPaths();
    }

    getConfig(key){
        return this._config[__dirname.split(path.sep).slice(-1)[0]][key];
    }

    setLogger(logger){
        this._logger = logger;
    }
    
    addDefaultPaths(){
        this.addGetPath("/api", "Shows API", (req, res) => {
            res.send(this.getApi());
        });        
        this.addGetPath("/config", "Shows Config", (req, res) => {
            res.send(JSON.stringify(this._config));
        });
        this.addGetPath("/logs", "Shows logs", (req, res) => {
            res.send(this._logger.get());
        });

    }    
    
    addGetPath(path, api, func) {
        this.addAPILine("<hr>" + path + " -> " + api);
        this._express.get(path, func);
    }

    addPostPath(path, api, func) {
        this.addAPILine("<hr>" + path + " -> " + api);
        this._express.post(path, func);
    }

    addAPILine(description) {
        this._apiText.push(description);
    }    

    getApi() {
        var out = "";
        this._apiText.forEach(value => {
            out += value + this.getConfig("lineSeparator");
        });
        return out;
    }

    startListening(){
        var host = this.getConfig("host");
        var port = this.getConfig("port")
        this._express.listen(this.getConfig("port"), this.getConfig("host"));
        this._logger.log("Listening on " + this.getConfig("host") +":" + this.getConfig("port"));
    }
}
