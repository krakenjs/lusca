'use strict';

var express = require('express');
var lusca = require('../../index');
var app = express();
var cspPolicyReport = require('./cspPolicyReport');
var cspPolicyEnforce = require('./cspPolicyEnforce');
var allConfig = {
	csrf: true,
	xframe: 'SAMEORIGIN',
	p3p: 'MY_P3P_VALUE',
	hsts: {maxAge: 31536000},
	csp: cspPolicyReport
};


// Setup
app.use(express.cookieParser());
app.use(express.session({ secret: 'abc' }));
app.use(express.bodyParser());


// Routes
app.get('/xframe/deny', lusca.xframe('DENY'), function (req, res, next) {
	res.send(200);
});

app.get('/xframe/sameorigin', lusca.xframe('SAMEORIGIN'), function (req, res, next) {
	res.send(200);
});

app.get('/hsts', lusca.hsts({maxAge: 31536000}), function (req, res, next) {
	res.send(200);
});

app.get('/hsts0', lusca.hsts({maxAge: 0}), function (req, res, next) {
	res.send(200);
});

app.get('/hsts/subdomains', lusca.hsts({maxAge: 31536000, includeSubDomains: true}), function (req, res, next) {
	res.send(200);
});

app.get('/hsts/missing', lusca.hsts({}), function (req, res, next) {
	res.send(200);
});

app.get('/p3p', lusca.p3p('MY_P3P_VALUE'), function (req, res, next) {
	res.send(200);
});

app.get('/csp/report', lusca.csp(cspPolicyReport), function (req, res, next) {
	res.send(200);
});

app.get('/csp/enforce', lusca.csp(cspPolicyEnforce), function (req, res, next) {
	res.send(200);
});

app.all('/csrf', lusca.csrf(), function (req, res, next) {
	res.json(200, { token: res.locals._csrf });
});

app.get('/all', lusca(allConfig), function (req, res, next) {
	res.send(200);
});



module.exports = app;
