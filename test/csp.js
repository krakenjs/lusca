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
            res.send(200);
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
            res.send(200);
        });

        request(app)
            .get('/')
            .expect('Content-Security-Policy', 'default-src *; ')
            .expect(200, done);
    });
});
