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
    it('should not require token on post to blocklist', function (done) {
        var app = mock({
            csrf: {
                blocklist: ['/blocklist1', { path: '/blocklist2', type: 'startsWith' }, { path: '/', type: 'exact' }]
            }
        });

        app.post('/blocklist1', function (req, res) {
            res.send(200);
        });

        app.post('/blocklist2', function (req, res) {
            res.send(200);
        });

        app.post('/notblocklist', function (req, res) {
            res.send(200);
        });

        app.post('/', function (req, res) {
            res.send(200);
        });

        request(app)
            .post('/blocklist1')
            .expect(200)
            .end(function (err, res) {});

        request(app)
            .post('/blocklist2')
            .expect(200)
            .end(function (err, res) {});

        request(app)
            .post('/notblocklist')
            .expect(403)
            .end(function (err, res) {});

        request(app)
            .post('/')
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });
    it('should not require token on post to blocklist (string config)', function (done) {
        var app = mock({
            csrf: {
                blocklist: '/blocklist1'
            }
        });

        app.post('/blocklist1', function (req, res) {
            res.send(200);
        });

        app.post('/notblocklist', function (req, res) {
            res.send(200);
        });

        request(app)
            .post('/blocklist1')
            .expect(200)
            .end(function (err, res) {});

        request(app)
            .post('/notblocklist')
            .expect(403)
            .end(function (err, res) {
                done(err);
            });
    });
    it('should only require token on post to allowlist', function (done) {
        var app = mock({
            csrf: {
                allowlist: ['/allowlist1', { path: '/allowlist2', type: 'startsWith' }, { path: '/', type: 'exact' }]
            }
        });

        app.post('/allowlist1', function (req, res) {
            res.send(200);
        });

        app.post('/allowlist2', function (req, res) {
            res.send(200);
        });

        app.post('/notallowlist', function (req, res) {
            res.send(200);
        });

        app.post('/', function (req, res) {
            res.send(200);
        });

        request(app)
            .post('/allowlist1')
            .expect(403)
            .end(function (err, res) {});

        request(app)
            .post('/allowlist2')
            .expect(403)
            .end(function (err, res) {});

        request(app)
            .post('/notallowlist')
            .expect(200)
            .end(function (err, res) {
                console.log(err);
            });

        request(app)
            .post('/')
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });
    it('should only require token on post to allowlist (string config)', function (done) {
        var app = mock({
            csrf: {
                allowlist: '/allowlist1'
            }
        });

        app.post('/allowlist1', function (req, res) {
            res.send(200);
        });

        app.post('/notallowlist', function (req, res) {
            res.send(200);
        });

        request(app)
            .post('/allowlist1')
            .expect(403)
            .end(function (err, res) {});

        request(app)
            .post('/notallowlist')
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });

    it('should throw error on invalid allowlist/blocklist config', function() {
        assert.throws(function() {
            mock({
                csrf: {
                    allowlist: [{ path: '/allowInvalid', type: 'regex' }]
                }
            });
        }, /Invalid csrf config. type 'regex' is not supported.*/);

        assert.throws(function() {
            mock({
                csrf: {
                    allowlist: [{ path: '', type: 'startsWith' }]
                }
            });
        }, /Invalid csrf config. path is required/);
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

        it('POST (403 Forbidden on invalid token) (session type: {value})', function (ctx, done) {
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
                    token: Math.random()
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
                        .expect(403)
                        .end(function (err, res) {
                            done(err);
                        });
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

        it('Should be case-insensitive to custom headers', function (ctx, done) {
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        header: 'X-XSRF-TOKEN',
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: {
                        header: 'X-XSRF-TOKEN'
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
                        .set('X-xsrf-token', res.body.token)
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

    it('Should not set a cookie without the cookie option', function (done) {
        var app = mock({ csrf: {}});

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return !~cookie.indexOf(res.body.token);
                }
                assert(res.headers['set-cookie'].some(findToken));
                done();
            });
    });
    it('Should not set a cookie without the cookie name option', function (done) {
        var app = mock({ csrf: {
            cookie: {}
        }});

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return !~cookie.indexOf(res.body.token);
                }
                assert(res.headers['set-cookie'].some(findToken));
                done();
            });
    });
    it('Should set a cookie with the cookie option', function (done) {
        var app = mock({ csrf: { cookie: 'CSRF' }});

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(res.body.token);
                }
                assert(res.headers['set-cookie'].some(findToken));
                done();
            });
    });
    it('Should set a cookie with the cookie name option', function (done) {
        var app = mock({ csrf: { cookie: { name : 'CSRF' }}});

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(res.body.token);
                }
                assert(res.headers['set-cookie'].some(findToken));
                done();
            });
    });
    it('Should set cookie httpOnly option correctly', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({
            csrf: {
                cookie: {
                    name: cookieKey,
                    options: {
                        httpOnly: true
                    }
                },
                header: header,
                secret: '_csrfSecret'
            }
        });

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token) &&
                        ~cookie.indexOf('HttpOnly');
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    it('Should set cookie secure option correctly', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({
            csrf: {
                cookie: {
                    name: cookieKey,
                    options: {
                        secure: true
                    }
                },
                header: header,
                secret: '_csrfSecret'
            }
        });

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token) &&
                        ~cookie.indexOf('Secure');
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    it('Should set cookie secure and httpOnly options correctly', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({
            csrf: {
                cookie: {
                    name: cookieKey,
                    options: {
                        httpOnly: true,
                        secure: true
                    }
                },
                header: header,
                secret: '_csrfSecret'
            }
        });

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token) &&
                        ~cookie.indexOf('HttpOnly') &&
                        ~cookie.indexOf('Secure');
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    it('Should set options correctly with an angular shorthand option', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({ csrf: { angular: true, secret: '_csrfSecret' }});

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token);
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    it('Should set cookie httpOnly option correctly with an angular shorthand option', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({
            csrf: {
                secret: '_csrfSecret',
                angular: true,
                cookie: {
                    options: {
                        httpOnly: true
                    }
                }
            }
        });

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token) &&
                        ~cookie.indexOf('HttpOnly');
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    it('Should set cookie secure option correctly with an angular shorthand option', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({
            csrf: {
                secret: '_csrfSecret',
                angular: true,
                cookie: {
                    options: {
                        secure: true
                    }
                }
            }
        });

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token) &&
                        ~cookie.indexOf('Secure');
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    it('Should set cookie secure and httpOnly option correctly with an angular shorthand option', function (done) {
        // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
        var cookieKey = 'XSRF-TOKEN';
        var header = 'X-XSRF-TOKEN';
        var app = mock({
            csrf: {
                secret: '_csrfSecret',
                angular: true,
                cookie: {
                    options: {
                        httpOnly: true,
                        secure: true
                    }
                }
            }
        });

        app.all('/', function (req, res) {
            res.status(200).send({
                token: res.locals._csrf
            });
        });

        request(app)
            .get('/')
            .end(function (err, res) {
                function findToken(cookie) {
                    cookie = decodeURIComponent(cookie);
                    return ~cookie.indexOf(cookieKey + '=' + res.body.token) &&
                        ~cookie.indexOf('HttpOnly') &&
                        ~cookie.indexOf('Secure');
                }
                assert(res.headers['set-cookie'].some(findToken));

                request(app)
                    .post('/')
                    .set('cookie', mapCookies(res.headers['set-cookie']))
                    .set(header, res.body.token)
                    .send({
                        cool: 'stuff'
                    })
                    .expect(200, done);
            });
    });
    dd(sessionOptions, function () {
        it('Should return the cached token for valid session on req.csrfToken', function (ctx, done) {
            var key = 'foo';
            var mockConfig = (ctx.value === 'cookie') ? {
                    csrf: {
                        key: key,
                        secret: 'csrfSecret'
                    }
                } : {
                    csrf: {key: key}
                },
                app = mock(mockConfig, ctx.value);

            function callCsrfToken(req, res, next) {
                var token = res.locals[key];
                assert(req.csrfToken() === token, 'req.csrfToken should use cached token');
                assert(res.locals[key] === token, 'req.csrfToken should not mutate token');
                next();
            }

            app.get('/', callCsrfToken, function (req, res) {
                res.status(200).send({
                    token: res.locals[key]
                });
            });

            app.post('/', function (req, res) {
                res.status(200).send({
                    token: res.locals[key]
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    var obj = {};
                    obj[key] = res.body.token;

                    request(app)
                        .post('/')
                        .set('Cookie', mapCookies(res.headers['set-cookie']))
                        .send(obj)
                        .expect(200, done);
                });
        });
        it('Should generate a new token for invalid session on req.csrfToken', function (ctx, done) {
            var key = 'foo',
                secret = 'csrfSecret',
                mockConfig = {
                    csrf: {
                        key: key,
                        secret: secret
                    }
                },
                app = mock(mockConfig, ctx.value);

            function destroy(req, res, next) {
                delete req.session[secret];
                next();
            }

            function callCsrfToken(req, res, next) {
                var token = res.locals[key];
                assert(req.csrfToken() !== token, 'req.csrfToken should not use cached token');
                assert(res.locals[key] !== token, 'req.csrfToken should mutate token');
                token = res.locals[key];
                assert(req.csrfToken() === token, 'subsequent req.csrfToken should use cached token');
                next();
            }

            app.get('/', destroy, callCsrfToken, function (req, res) {
                res.status(200).send({
                    token: res.locals[key]
                });
            });

            app.post('/', function (req, res) {
                res.status(200).send({
                    token: res.locals[key]
                });
            });

            request(app)
                .get('/')
                .end(function (err, res) {
                    var obj = {};
                    obj[key] = res.body.token;

                    request(app)
                        .post('/')
                        .set('Cookie', mapCookies(res.headers['set-cookie']))
                        .send(obj)
                        .expect(200, done);
                });
        });
    });
});