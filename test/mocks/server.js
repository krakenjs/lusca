'use strict';

var express = require('express'),
	appsec = require('../../index'),
	server = express(),
	cspPolicyReport = require('./cspPolicyReport'),
	cspPolicyEnforce = require('./cspPolicyEnforce');



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



module.exports = server;