/*global describe:false, it:false */
'use strict';


var appsec = require('../index'),
	server = require('./mocks/server'),
	request = require('supertest'),
	chai = require('chai'),
	expect = chai.expect;


describe('webcore-appsec', function () {
    it('csp method', function () {
		expect(appsec.csp).to.be.a('function');

    });

    it('csp header (report)', function (done) {
		request(server)
			.get('/csp/report')
			.expect('Content-Security-Policy-Report-Only', 'default-src *; reportUri http://www.example.com')
			.expect(200, done);
	});

	it('csp header (enforce)', function (done) {
		request(server)
			.get('/csp/enforce')
			.expect('Content-Security-Policy', 'default-src *; reportUri http://www.example.com')
			.expect(200, done);
	});

    it('xframe method', function (done) {
		expect(appsec.xframe).to.be.a('function');
		done();
    });

	it('xframe header (deny)', function (done) {
		request(server)
			.get('/xframe/deny')
			.expect('X-FRAME-OPTIONS', 'DENY')
			.expect(200, done);
	});

	it('xframe header (sameorigin)', function (done) {
		request(server)
			.get('/xframe/sameorigin')
			.expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
			.expect(200, done);
	});

    it('p3p method', function (done) {
		expect(appsec.p3p).to.be.a('function');
		done();
    });

	it('p3p header', function (done) {
		request(server)
			.get('/p3p')
			.expect('P3P', 'MY_P3P_VALUE')
			.expect(200, done);
	});

});
