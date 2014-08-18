/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('CSRF', function () {

    it('method', function () {
        assert(typeof lusca.csrf === 'function');
    });


    it('GETs have a CSRF token', function (done) {
        var app = mock({ csrf: true });

        app.get('/', function (req, res) {
            res.send(200, { token: res.locals._csrf });
        });

        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                assert(res.body.token);
                done(err);
            });
    });


    it('POST (200 OK with token)', function (done) {
        var app = mock({ csrf: true });

        app.all('/', function (req, res) {
            res.send(200, { token: res.locals._csrf });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                console.log("res.headers['set-cookie']", res.headers['set-cookie']);
                request(app)
                    .post('/')
                    .set('cookie', res.headers['set-cookie'])
                    .send({
                        _csrf: res.body.token
                    })
                    .expect(200, done);
            });
    });


    it('POST (403 Forbidden on no token)', function (done) {
        var app = mock({ csrf: true });

        app.get('/', function (req, res) {
            res.send(200);
        });

        request(app)
            .post('/')
            .expect(403)
            .end(function (err, res) {
                done(err);
            });
    });


    it('Should allow custom keys', function (done) {
        var app = mock({ csrf: { key: 'foobar' } });

        app.all('/', function (req, res) {
            res.send(200, { token: res.locals.foobar });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                request(app)
                    .post('/')
                    .set('cookie', res.headers['set-cookie'])
                    .send({
                        foobar: res.body.token
                    })
                    .expect(200, done);
            });
    });

    it('Token can be sent through header instead of post body', function (done) {
        var app = mock({ csrf: true });

        app.all('/', function (req, res) {
            res.send(200, {token: res.locals._csrf });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                request(app)
                    .post('/')
                    .set('cookie', res.headers['set-cookie'])
                    .set('x-csrf-token', res.body.token)
                    .send({
                        name: 'Test'
                    })
                    .expect(200, done);
            });
    });

    it('Should allow custom headers', function (done) {
        var app = mock({ csrf: {header: 'x-xsrf-token'} });

        app.all('/', function (req, res) {
            res.send(200, {token: res.locals._csrf });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                request(app)
                    .post('/')
                    .set('cookie', res.headers['set-cookie'])
                    .set('x-xsrf-token', res.body.token)
                    .send({
                        name: 'Test'
                    })
                    .expect(200, done);
            });
    });

    it('Should allow custom secret key', function (done) {
        var app = mock({ csrf: {'secret': 'shhCsrf'} });

        app.all('/', function (req, res) {
            res.send(200, { token: res.locals._csrf });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                request(app)
                    .post('/')
                    .set('cookie', res.headers['set-cookie'])
                    .send({
                        _csrf: res.body.token
                    })
                    .expect(200, done);
            });
    });

    it('Should allow custom functions', function (done) {
        var myToken = require('./mocks/token'),
            app = mock({ csrf: { impl: myToken } });

        app.all('/', function (req, res) {
            res.send(200, { token: res.locals._csrf });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                assert(myToken.value === res.body.token);

                request(app)
                    .post('/')
                    .set('cookie', res.headers['set-cookie'])
                    .send({
                        _csrf: res.body.token
                    })
                    .expect(200, done);
            });
    });

});
