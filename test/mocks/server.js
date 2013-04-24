'use strict';

var express = require('express');
var appsec = require('../../index');
var server = express();
var cspPolicyReport = require('./cspPolicyReport');
var cspPolicyEnforce = require('./cspPolicyEnforce');
var allConfig = {
	csrf: true,
	xframe: 'SAMEORIGIN',
	p3p: 'MY_P3P_VALUE',
	csp: cspPolicyReport
};


// Server setup
server.use(express.cookieParser());
server.use(express.session({ secret: 'abc' }));
server.use(express.bodyParser());

// Server routes
server.get('/xframe/deny', appsec.xframe('DENY'), function (req, res, next) {
	res.send(200);
});

server.get('/xframe/sameorigin', appsec.xframe('SAMEORIGIN'), function (req, res, next) {
	res.send(200);
});

server.get('/p3p', appsec.p3p('MY_P3P_VALUE'), function (req, res, next) {
	res.send(200);
});

server.get('/csp/report', appsec.csp(cspPolicyReport), function (req, res, next) {
	res.send(200);
});

server.get('/csp/enforce', appsec.csp(cspPolicyEnforce), function (req, res, next) {
	res.send(200);
});

server.all('/csrf', appsec.csrf(), function (req, res, next) {
	res.json(200, { token: res.locals._csrf });
});

server.get('/all', appsec(allConfig), function (req, res, next) {
	res.send(200);
});



module.exports = server;