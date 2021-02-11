/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('XFRAME', function () {

    it('method', function () {
        assert(typeof lusca.xframe === 'function');
    });


    it('header (deny)', function (done) {
        var config = { xframe: 'DENY' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe)
            .expect(200, done);
    });


    it('header (sameorigin)', function (done) {
        var config = { xframe: 'SAMEORIGIN' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe)
            .expect(200, done);
    });

});