'use strict';


var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    lusca = require('../..');


module.exports = function (config) {
    var app = express();

    app.use(cookieParser());
    app.use(session({ secret: 'abc' }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(lusca(config));
    app.use(errorHandler());

    return app;
};
