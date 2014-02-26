'use strict';


var express = require('express'),
    lusca = require('../..');


module.exports = function (config) {
    var app = express();

    app.use(express.cookieParser());
    app.use(express.session({ secret: 'abc' }));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(lusca(config));
    app.use(express.errorHandler());

    return app;
};
