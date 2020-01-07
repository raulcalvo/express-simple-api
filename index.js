'use strict';

const express = require('express');
const logger = require('logger-to-memory');
const mergeJSON = require('merge-json');

module.exports = class expressimpleapi{

    constructor(config) {
        var defaultLogger = new logger(true, 20, true);
        var defaultConfig = {
            "express": {
                "apiHeader": "raulcalvo/express-simple-api description:",
                "lineSeparator": "<br>",
                "host": '0.0.0.0',
                "port": 80
            },
            "logger": defaultLogger
        };

        this._c = mergeJSON.merge(defaultConfig, config);
        this._express = new express();
        
        this._apiText = new Array();
        this._apiText[0] = this._c.express.apiHeader;
        this.addDefaultPaths();
    }
    
    addDefaultPaths(){
        this.addGetPath("/api", "Shows API", (req, res) => {
            res.send(this.getApi());
        });        
        this.addGetPath("/config", "Shows Config", (req, res) => {
            res.send(JSON.stringify(this._c));
        });
        this.addGetPath("/logs", "Shows logs", (req, res) => {
            res.send(this._c.logger.get());
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
            out += value + this._c.express.lineSeparator;
        });
        return out;
    }

    startListening(){
        this._express.listen(this._c.express.port, this._c.express.host);
        this._c.logger.log("Listening on " + this._c.express.host +":" + this._c.express.port);
    }
}
