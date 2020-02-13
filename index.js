'use strict';

const requirer = require("extended-requirer");
const r = new requirer(__dirname);

const logger = r.require('logger-to-memory');
const configLoader = r.require('config-loader-manager');

const express = r.require('express');
const mergeJSON = r.require('merge-json');
const path = r.require('path');
const fs = r.require('fs');

const htmlCreator = require('html-creator');


function getModuleName() {
    return __dirname.split(path.sep).slice(-1)[0];
}

module.exports = class expressimpleapi {

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

    getConfig(key) {
        return this._config[__dirname.split(path.sep).slice(-1)[0]][key];
    }

    setLogger(logger) {
        this._logger = logger;
    }

    addDefaultPaths() {
        var jsonPath = {
            "path": "/api",
            "description": "Shows API",
            "method": "GET",
            "params": [],
            "result": {
                "type": "json"
            }
        };
        this.addPath(jsonPath, (req, res) => {
            res.send(this.getApi());
        });
        jsonPath = {
            "path": "/config",
            "description": "Shows config",
            "method": "GET",
            "params": [],
            "result": {
                "type": "json"
            }
        };
        this.addPath(jsonPath, (req, res) => {
            res.send(JSON.stringify(this._config));
        });
        jsonPath = {
            "path": "/logs",
            "description": "Shows logs",
            "method": "GET",
            "params": [],
            "result": {
                "type": "text"
            }
        };
        this.addPath(jsonPath, (req, res) => {
            res.send(this._logger.get());
        });

    }

    addPath(jsonPath, func) {
        this._api.push(jsonPath);
        if (!jsonPath.hasOwnProperty("method"))
            return;
        if (jsonPath.method == "GET")
            this._express.get(jsonPath.path, func);
        if (jsonPath.method == "POST")
            this._express.post(jsonPath.path, func);
    }

    addGetPath(path, api, func) {
        var jsonPath = {
            "path": path,
            "description": api,
            "method": "GET",
            "params": [],
            "result": {
                "type": "text"
            }
        };
        this.addPath(jsonPath, func);
    }

    addPostPath(path, api, func) {
        var jsonPath = {
            "path": path,
            "description": api,
            "method": "POST",
            "params": [],
            "result": {
                "type": "text"
            }
        };
        this.addPath(jsonPath, func);
    }



    getRow(left, right) {
        var r =
        {
            type: 'div',
            attributes: { class: 'row' },
            content: [
                {
                    type: 'div',
                    attributes: { class: 'col-25' },
                    content: [{
                        type: 'label',
                        attributes: { 'for': 'fname' },
                        content: left
                    }]
                },
                {
                    type: 'div',
                    attributes: { class: 'col-75' },
                    content: [{
                        type: 'label',
                        attributes: { 'for': 'fname' },
                        content: right
                    }]
                }
            ]
        };
        return r;
    };

    getParam(p) {
        var r =
        {
            type: 'div',
            attributes: { class: 'row' },
            content: [
                {
                    type: 'div',
                    attributes: { class: 'col-25' },
                    content: [{
                        type: 'label',
                        attributes: { 'for': 'fname' },
                        content: p.name
                    }]
                },
                {
                    type: 'div',
                    attributes: { class: 'col-75' },
                    content: [{
                        type: 'input',
                        attributes: { type: 'text', id: p.name, name: p.name, placeholder: p.placeholder },
                        content: []
                    }]
                }
            ]
        };
        return r;
    };

    getParams(p) {
        var r = [];
        var _this = this;
        if (p.hasOwnProperty("params")) {
            p.params.forEach(function (param) {
                r.push(_this.getParam(param));
            });
        }
        return r;
    }

    getPathContent(p) {
        var pc = [
            this.getRow("Description", p.description),
            this.getRow("Method", p.method)
        ];
        var spc = JSON.stringify(pc);
        var submit = [
            {
                type: 'div',
                attributes: { class: 'row' },
                content: [
                    {
                        type: "input",
                        attributes: { type: "submit", value: p.path }
                    }
                ]
            }
        ];
        return pc.concat(this.getParams(p)).concat(submit);
    }

    addTab(p) {
        this._html.document.addElementToId('tabsdiv', {
            type: 'button',
            attributes: { class: 'tablinks', onclick: "openTab(event,'" + p.path + "')" },
            content: p.path
        });
        this._html.document.addElementToType('body', {
            type: 'div',
            attributes: { id: p.path, class: 'tabcontent' },
            content: [
                {
                    type: "form",
                    attributes: { action: p.path, target: "_blank" },
                    content: this.getPathContent(p)
                }
            ]
        });
    }

    getApi() {
        var t = fs.readFileSync(path.join(path.dirname(__filename), "template.html"), "utf8");
        this._html = new htmlCreator([
            {
                type: 'body',
                content: [],
            },
        ]);
        this._html.document.addElementToType('body', {
            type: 'div',
            attributes: { class: 'tab', id: 'tabsdiv' },
            content: ''
        });
        var _this = this;
        this._api.forEach(function (p) {
            _this.addTab(p);
        });

        // this.addTab("Paris", "Paris", "Capital de francia");
        // this.addTab("Madrid", "Madrid", "Capital de ESPAIN");
        t = t.replace("##BODY##", this._html.renderHTML());
        t = t.replace("<body><!DOCTYPE html><html><body>", "<body>");
        t = t.replace("</html><!--", "<!--");
        return t;
    }

    startListening() {
        var host = this.getConfig("host");
        var port = this.getConfig("port")
        this._express.listen(this.getConfig("port"), this.getConfig("host"));
        this._logger.log("Listening on " + this.getConfig("host") + ":" + this.getConfig("port"));
    }
}
