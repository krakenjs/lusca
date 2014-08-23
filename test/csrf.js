/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app'),
    dd = require('data-driven'),
    sessionOptions = [{
        value: 'session'
    }, {
        value: 'cookie'
    }],
    mapCookies = function (cookies) {
        return cookies.map(function (r) {
            return r.replace("; path=/; httponly", "");
        }).join("; ");
    };


describe('CSRF', function () {
    it('method', function () {
        assert(typeof lusca.csrf === 'function');
    });
    it('expects a thrown error if no session object', function (done) {
        var app = mock({
            csrf: true
        }, "none");

        app.get('/', function (req, res) {
            res.send(200, {
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .expect(500)
            .end(function (err, res) {
                assert(res.text.match("lusca requires req.session to be available"));
                done(err);
            });
    });
    dd(sessionOptions, function () {
        it('GETs have a CSRF token (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: true
                },
                app = mock(mockConfig, ctx.value);

            app.get('/', function (req, res) {
                res.status(200).send({
                    token: res.locals._csrf
                });
            });

            request(app)
                .get('/')
                .expect(200)
                .end(function (err, res) {
                    assert(res.body.token);
                    done(err);
                });
        });


        it('POST (200 OK with token) (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: true
                },
                app = mock(mockConfig, ctx.value);

            app.all('/', function (req, res) {
                res.status(200).send({
                    token: res.locals._csrf
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    request(app)
                        .post('/')
                        .set('Cookie', mapCookies(res.headers['set-cookie']))
                        .send({
                            _csrf: res.body.token
                        })
                        .expect(200, done);
                });
        });


        it('POST (403 Forbidden on no token) (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: true
                },
                app = mock(mockConfig, ctx.value);

            app.get('/', function (req, res) {
                res.status(200).end();
            });

            request(app)
                .post('/')
                .expect(403)
                .end(function (err, res) {
                    done(err);
                });
        });


        it('Should allow custom keys (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        key: 'foobar',
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: {
                        key: 'foobar'
                    }
                },
                app = mock(mockConfig, ctx.value);

            app.all('/', function (req, res) {
                res.status(200).send({
                    token: res.locals.foobar
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    request(app)
                        .post('/')
                        .set('cookie', mapCookies(res.headers['set-cookie']))
                        .send({
                            foobar: res.body.token
                        })
                        .expect(200, done);
                });
        });

        it('Token can be sent through header instead of post body (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: true
                },
                app = mock(mockConfig, ctx.value);
            app.all('/', function (req, res) {
                res.status(200).send({
                    token: res.locals._csrf
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    request(app)
                        .post('/')
                        .set('cookie', mapCookies(res.headers['set-cookie']))
                        .set('x-csrf-token', res.body.token)
                        .send({
                            name: 'Test'
                        })
                        .expect(200, done);
                });
        });

        it('Should allow custom headers (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        header: 'x-xsrf-token',
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: {
                        header: 'x-xsrf-token'
                    }
                },
                app = mock(mockConfig, ctx.value);

            app.all('/', function (req, res) {
                res.status(200).send({
                    token: res.locals._csrf
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    request(app)
                        .post('/')
                        .set('cookie', mapCookies(res.headers['set-cookie']))
                        .set('x-xsrf-token', res.body.token)
                        .send({
                            name: 'Test'
                        })
                        .expect(200, done);
                });
        });

        it('Should allow custom secret key (session type: {value})', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: {
                        secret: '_csrfSecret'
                    }
                },
                app = mock(mockConfig, ctx.value);

            app.all('/', function (req, res) {
                res.status(200).send({
                    token: res.locals._csrf
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    request(app)
                        .post('/')
                        .set('cookie', mapCookies(res.headers['set-cookie']))
                        .send({
                            _csrf: res.body.token
                        })
                        .expect(200, done);
                });
        });

        it('Should allow custom functions (session type: {value})', function (ctx, done) {
            var myToken = require('./mocks/token'),
                mockConfig = {
                    csrf: {
                        impl: myToken
                    }
                },
                app = mock(mockConfig, ctx.value);

            app.all('/', function (req, res) {
                res.status(200).send({
                    token: res.locals._csrf
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    assert(myToken.value === res.body.token);

                    request(app)
                        .post('/')
                    //.set('cookie', mapCookies(res.headers['set-cookie']))
                    .send({
                        _csrf: res.body.token
                    })
                        .expect(200, done);
                });
        });
    });
});