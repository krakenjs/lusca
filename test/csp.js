/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('CSP', function () {

    it('method', function () {
        assert(typeof lusca.csp === 'function');
    });


    it('should throw if misconfigured', function () {
        assert.throws(function () {
            lusca.csp(new Date());
        }, /invalid csp policy/);
    });


    it('header (report)', function (done) {
        var config = require('./mocks/config/cspReport'),
            app = mock({ csp: config });

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Content-Security-Policy-Report-Only', 'default-src *; report-uri ' + config.reportUri)
            .expect(200, done);
    });


    describe('header (enforce)', function () {
        it('object config', function (done) {
            var config = require('./mocks/config/cspEnforce'),
            app = mock({ csp: config });

            app.get('/', function (req, res) {
                res.status(200).end();
            });

            request(app)
                .get('/')
                .expect('Content-Security-Policy', 'default-src *')
                .expect(200, done);
        });

        it('string config', function (done) {
            var config = require('./mocks/config/cspString'),
            app = mock({ csp: config });

            app.get('/', function (req, res) {
                res.status(200).end();
            });

            request(app)
                .get('/')
                .expect('Content-Security-Policy', 'default-src *')
                .expect(200, done);
        });

        it('array config', function (done) {
            var config = require('./mocks/config/cspArray'),
            app = mock({ csp: config });

            app.get('/', function (req, res) {
                res.status(200).end();
            });

            request(app)
                .get('/')
                .expect('Content-Security-Policy', 'default-src *; img-src *')
                .expect(200, done);
        });

        it('nested config', function (done) {
            var config = require('./mocks/config/cspNested'),
            app = mock({ csp: config });

            app.get('/', function (req, res) {
                res.status(200).end();
            });

            request(app)
                .get('/')
                .expect('Content-Security-Policy', 'default-src *; img-src *')
                .expect(200, done);
        });
    });
});
