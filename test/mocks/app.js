'use strict';


var express = require('express'),
	cookieParser = require('cookie-parser'),
	cookieSession = require('cookie-session'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler'),
	lusca = require('../..');


module.exports = function (config, sessionType) {
	var app = express();

	app.use(cookieParser());
	if (sessionType === undefined || sessionType === 'session') {
		app.use(session({
			secret: 'abc',
			resave: true,
			saveUninitialized: true
		}));
	} else if (sessionType === "cookie") {
		app.use(cookieSession({
			secret: 'abc'
		}));
	}

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	(config !== undefined) ? app.use(lusca(config)) : console.log('no lusca');
	app.use(errorHandler());

	return app;
};