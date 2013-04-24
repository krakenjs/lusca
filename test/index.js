/*global describe:false, it:false */
'use strict';


var appsec = require('../index'),
	server = require('./mocks/server'),
	request = require('supertest'),
	chai = require('chai'),
	expect = chai.expect;


describe('All', function () {
	it('method', function () {
		expect(appsec).to.be.a('function');
	});

	it('headers', function (done) {
		request(server)
			.get('/all')
			.expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
			.expect('P3P', 'MY_P3P_VALUE')
			.expect('Content-Security-Policy-Report-Only', 'default-src *; reportUri http://www.example.com')
			.expect(200, done);
	});
});


describe('CSRF', function () {
    it('method', function () {
		expect(appsec.csrf).to.be.a('function');
    });

	it('GETs have a CSRF token', function (done) {
		request(server)
			.get('/csrf')
			.expect(200)
			.end(function (err, res) {
				expect(res.body.token).to.have.length.above(0);
				done();
			});
	});

	// FIXME - SuperTest does not save cookies so the session is regenerated
	// each time resulting in a new CSRF token
	// it('POST (200 OK with token)', function (done) {
	// 	request(server)
	// 		.get('/csrf')
	// 		.end(function (err, res) {
	// 			request(server)
	// 				.post('/csrf')
	// 				.field('_csrf', res.body.token)
	// 				.expect(200, done);
	// 		});
	// });

	it('POST (403 Forbidden on no token)', function (done) {
		request(server)
			.post('/csrf')
			.expect(403)
			.end(function (err, res) {
				done();
			});
	});
});


describe('CSP', function () {
    it('method', function () {
		expect(appsec.csp).to.be.a('function');
    });

    it('header (report)', function (done) {
		request(server)
			.get('/csp/report')
			.expect('Content-Security-Policy-Report-Only', 'default-src *; reportUri http://www.example.com')
			.expect(200, done);
	});

	it('header (enforce)', function (done) {
		request(server)
			.get('/csp/enforce')
			.expect('Content-Security-Policy', 'default-src *; ')
			.expect(200, done);
	});
});


describe('XFRAME', function () {
    it('method', function (done) {
		expect(appsec.xframe).to.be.a('function');
		done();
    });

	it('header (deny)', function (done) {
		request(server)
			.get('/xframe/deny')
			.expect('X-FRAME-OPTIONS', 'DENY')
			.expect(200, done);
	});

	it('header (sameorigin)', function (done) {
		request(server)
			.get('/xframe/sameorigin')
			.expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
			.expect(200, done);
	});
});


describe('P3P', function () {
    it('method', function (done) {
		expect(appsec.p3p).to.be.a('function');
		done();
    });

	it('header', function (done) {
		request(server)
			.get('/p3p')
			.expect('P3P', 'MY_P3P_VALUE')
			.expect(200, done);
	});
});
