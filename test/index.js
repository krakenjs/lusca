/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('All', function () {

    it('method', function () {
        assert(typeof lusca === 'function');
    });


    it('headers', function (done) {
        var config = require('./mocks/config/all'),
        app = mock(config);

        app.get('/', function (req, res) {
            res.send(200);
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe)
            .expect('P3P', config.p3p)
            .expect('Strict-Transport-Security', 'max-age=' + config.hsts.maxAge)
            .expect('Content-Security-Policy-Report-Only', 'default-src *; report-uri ' + config.csp.reportUri)
            .expect('X-XSS-Protection', '1; mode=block')
            .expect(200, done);
    });

});
