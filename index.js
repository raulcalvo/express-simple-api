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
            "host": '0.0.0.0',
            "port": 80
        };
        this._config = configLoader.load(__dirname, config, defaultConfig);

        this._express = new express();
        this._api = new Array();
        this.addDefaultPaths();
    }

    getConfig(key){
        return this._config[__dirname.split(path.sep).slice(-1)[0]][key];
    }

    setLogger(logger){
        this._logger = logger;
    }
    
    addDefaultPaths(){
        var jsonPath ={
            "path" : "/api",
            "description" : "Shows API",
            "method" : "GET",
            "params" : [],
            "result" : {
                "type" : "json"
            }
        };
        this.addPath(jsonPath, (req, res) => {
            res.send(this.getApi());
        });        
        jsonPath ={
            "path" : "/config",
            "description" : "Shows config",
            "method" : "GET",
            "params" : [],
            "result" : {
                "type" : "json"
            }
        };           
        this.addPath(jsonPath, (req, res) => {
            res.send(JSON.stringify(this._config));
        });        
        jsonPath ={
            "path" : "/logs",
            "description" : "Shows logs",
            "method" : "GET",
            "params" : [],
            "result" : {
                "type" : "text"
            }
        };           
        this.addPath(jsonPath, (req, res) => {
            res.send(this._logger.get());
        });        

    }  
    
    addPath(jsonPath, func){
        this._api.push(jsonPath);
        if (!jsonPath.hasOwnProperty("method"))
            return;
        if (jsonPath.method == "GET")
            this._express.get(jsonPath.path, func);
        if (jsonPath.method == "POST")
            this._express.post(jsonPath.path, func);
    }
    
    addGetPath(path, api, func) {
        var jsonPath ={
            "path" : path,
            "description" : api,
            "method" : "GET",
            "params" : [],
            "result" : {
                "type" : "text"
            }
        };
        this.addPath(jsonPath, func);
    }

    addPostPath(path, api, func) {
        var jsonPath ={
            "path" : path,
            "description" : api,
            "method" : "POST",
            "params" : [],
            "result" : {
                "type" : "text"
            }
        };
        this.addPath(jsonPath, func);
    }

    getApi() {
        return JSON.stringify(this._api);
    }

    startListening(){
        var host = this.getConfig("host");
        var port = this.getConfig("port")
        this._express.listen(this.getConfig("port"), this.getConfig("host"));
        this._logger.log("Listening on " + this.getConfig("host") +":" + this.getConfig("port"));
    }
}
