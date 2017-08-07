/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');



describe('referrerPolicy', function () {

    it('method', function () {
        assert(typeof lusca.referrerPolicy === 'function');
    });

    it('header (enabled)', function (done) {
        var config = { referrerPolicy: 'no-referrer-when-downgrade' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('referrer-policy', 'no-referrer-when-downgrade')
            .expect(200, done);
    });

    it('header invalid value', function () {
        assert.throws(function () {
            lusca.referrerPolicy('value-with-error');
        }, /Referrer-Policy header doesn't support/);
    });

    it('header invalid value in production doesn\'t throw error', function (done) {
        process.env.NODE_ENV = 'production';
        var config = { referrerPolicy: 'invalid-value' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('referrer-policy', 'invalid-value')
            .expect(200, done);
    });
});
