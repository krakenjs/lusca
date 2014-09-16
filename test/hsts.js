/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('HSTS', function () {

    it('method', function () {
        assert(typeof lusca.hsts === 'function');
    });


    it('header (maxAge)', function (done) {
        var config = { hsts: { maxAge: 31536000 } },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Strict-Transport-Security', 'max-age=' + config.hsts.maxAge)
            .expect(200, done);
    });


    it('header (maxAge 0)', function (done) {
        var config = { hsts: { maxAge: 0 } },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Strict-Transport-Security', 'max-age=' + config.hsts.maxAge)
            .expect(200, done);
    });


    it('header (maxAge; includeSubDomains)', function (done) {
        var config = { hsts: { maxAge: 31536000, includeSubDomains: true } },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('Strict-Transport-Security', 'max-age=' + config.hsts.maxAge + '; includeSubDomains')
            .expect(200, done);
    });


    it('header (missing maxAge)', function (done) {
        var config = { hsts: {} },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                assert(res.headers['Strict-Transport-Security'] === undefined);
                done(err);
            });

    });

});
