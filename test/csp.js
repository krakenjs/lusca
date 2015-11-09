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


    it('header (enforce)', function (done) {
        var config = require('./mocks/config/cspEnforce'),
            app = mock({ csp: config });

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Content-Security-Policy', 'default-src *; ')
            .expect(200, done);
    });

    it('array block-all-mixed-content + upgrade insecure', function (done) {
        var app = mock({
            csp: {
                policy: ['block-all-mixed-content', 'upgrade-insecure-requests']
            }
        });

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Content-Security-Policy', 'block-all-mixed-content; upgrade-insecure-requests; ')
            .expect(200, done);
    });

    it('harcoded block-all-mixed-conntent', function (done) {
        var app = mock({
            csp: {
                policy: 'block-all-mixed-content'
            }
        });

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Content-Security-Policy', 'block-all-mixed-content; ')
            .expect(200, done);
    });

    it('do not fail with null policy', function (done) {
        var app = mock({
            csp: {
                policy: null,
            }
        });

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect(200, done);
    });
});
