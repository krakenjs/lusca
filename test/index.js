/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
	app = require('./mocks/server'),
	request = require('supertest'),
	chai = require('chai'),
	expect = chai.expect;


describe('All', function () {
	it('method', function () {
		expect(lusca).to.be.a('function');
	});

	it('headers', function (done) {
		request(app)
			.get('/all')
			.expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
			.expect('P3P', 'MY_P3P_VALUE')
			.expect('Strict-Transport-Security', 'max-age=31536000')
			.expect('Content-Security-Policy-Report-Only', 'default-src *; reportUri http://www.example.com')
			.expect(200, done);
	});
});


describe('CSRF', function () {
    it('method', function () {
		expect(lusca.csrf).to.be.a('function');
    });

	it('GETs have a CSRF token', function (done) {
		request(app)
			.get('/csrf')
			.expect(200)
			.end(function (err, res) {
				expect(res.body.token).to.have.length.above(0);
				done(err);
			});
	});

	// FIXME - SuperTest does not save cookies so the session is regenerated
	it.skip('POST (200 OK with token)', function (done) {
		request(app)
			.get('/csrf')
			.end(function (err, res) {
				request(app)
					.post('/csrf')
					.field('_csrf', res.body.token)
					.expect(200, done);
			});
	});

	it('POST (403 Forbidden on no token)', function (done) {
		request(app)
			.post('/csrf')
			.expect(403)
			.end(function (err, res) {
				done(err);
			});
	});

    it.skip('Should allow custom keys', function (done) {

    });

    it.skip('Should allow custom functions', function (done) {

    });
});


describe('CSP', function () {
    it('method', function () {
		expect(lusca.csp).to.be.a('function');
    });

    it('header (report)', function (done) {
		request(app)
			.get('/csp/report')
			.expect('Content-Security-Policy-Report-Only', 'default-src *; reportUri http://www.example.com')
			.expect(200, done);
	});

	it('header (enforce)', function (done) {
		request(app)
			.get('/csp/enforce')
			.expect('Content-Security-Policy', 'default-src *; ')
			.expect(200, done);
	});
});


describe('XFRAME', function () {
    it('method', function (done) {
		expect(lusca.xframe).to.be.a('function');
		done();
    });

	it('header (deny)', function (done) {
		request(app)
			.get('/xframe/deny')
			.expect('X-FRAME-OPTIONS', 'DENY')
			.expect(200, done);
	});

	it('header (sameorigin)', function (done) {
		request(app)
			.get('/xframe/sameorigin')
			.expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
			.expect(200, done);
	});
});


describe('HSTS', function () {
    it('method', function (done) {
		expect(lusca.hsts).to.be.a('function');
		done();
    });

	it('header (maxAge)', function (done) {
		request(app)
			.get('/hsts')
			.expect('Strict-Transport-Security', 'max-age=31536000')
			.expect(200, done);
	});

	it('header (maxAge 0)', function (done) {
		request(app)
			.get('/hsts0')
			.expect('Strict-Transport-Security', 'max-age=0')
			.expect(200, done);
	});

	it('header (maxAge; includeSubDomains)', function (done) {
		request(app)
			.get('/hsts/subdomains')
			.expect('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
			.expect(200, done);
	});

	it('header (missing maxAge)', function (done) {
		request(app)
			.get('/hsts/missing')
			.expect(200)
	                .end(function (err, res) {
				expect(res.headers['Strict-Transport-Security']).to.not.exist;
				done(err);
			});

	});
});

describe('P3P', function () {
    it('method', function (done) {
		expect(lusca.p3p).to.be.a('function');
		done();
    });

	it('header', function (done) {
		request(app)
			.get('/p3p')
			.expect('P3P', 'MY_P3P_VALUE')
			.expect(200, done);
	});
});
