'use strict';


var express = require('express'),
    lusca = require('../..');

function createKoa(config) {
    var http = require('http'),
        koa = require('koa'),
        koaMiddlewares = require('koa-middlewares');

    config.koa = true;
    var app = koa();
    app.keys = ['key1', 'key2'];

    app.use(koaMiddlewares.session({ secret: 'abc' }));
    app.use(koaMiddlewares.bodyParser());
    app.use(lusca(config));

    var server = http.createServer();

    server.get = server.all = function (url, fn) {
        app.use(function* router() {
            var ctx = this;
            var res = {
                send: function (status, body) {
                    ctx.body = body;
                    ctx.status = status;
                },
                locals: ctx.locals,
            };

            fn(ctx.req, res);
        });

        server.on('request', app.callback());
    };

    return server;
}

module.exports = function (config) {
    if (process.env.APP_MODE === 'koa') {
        return createKoa(config);
    }

    var app = express();

    app.use(express.cookieParser());
    app.use(express.session({ secret: 'abc' }));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(lusca(config));
    app.use(express.errorHandler());

    return app;
};
