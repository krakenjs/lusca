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

    it('header (sameorigin) on allowlist', function (done) {
        var config = { xframe: {value: 'SAMEORIGIN', allowlist: ['/']} },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe.value)
            .expect(200, done);
    });

    it('header (sameorigin) not on allowlist', function (done) {
        var config = { xframe: {value: 'SAMEORIGIN', allowlist: ['/allow']} },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        app.get('/allow', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/allow')
            .expect(200)
            .end(function (err, res) {
                var isHeaderPresent = res.header['x-frame-options'] !== undefined;
                assert(isHeaderPresent);
            });

        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                var isHeaderPresent = res.header['x-frame-options'] !== undefined;
                assert(!isHeaderPresent);
                done();
            });
    });

    it('header (sameorigin) on blocklist', function (done) {
        var config = { xframe: {value: 'SAMEORIGIN', blocklist: ['/', '/block']} },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        app.get('/block', function (req, res) {
            res.status(200).end();
        });

        app.get('/allow', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/block')
            .expect(200)
            .end(function (err, res) {
                var isHeaderPresent = res.header['x-frame-options'] !== undefined;
                assert(!isHeaderPresent);
            });

        request(app)
            .get('/allow')
            .expect(200)
            .end(function (err, res) {
                var isHeaderPresent = res.header['x-frame-options'] !== undefined;
                assert(isHeaderPresent);
            });

        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                var isHeaderPresent = res.header['x-frame-options'] !== undefined;
                assert(!isHeaderPresent);
                done();
            });
    });

    it('header (sameorigin) not on blocklist', function (done) {
        var config = { xframe: {value: 'SAMEORIGIN', blocklist: ['/block']} },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
            .expect(200, done);
    });

    it('header function', function (done) {
        var config = { xframe: {xframeFunction: function (req) {
            return 'SAMEORIGIN';
        } } },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
            .expect(200, done);
    });

});
