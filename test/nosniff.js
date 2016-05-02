/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');



describe('nosniff', function () {

    it('method', function () {
        assert(typeof lusca.nosniff === 'function');
    });

    it('header (enabled)', function (done) {
        var config = { nosniff: true },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-Content-Type-Options', 'no sniff')
            .expect(200, done);
    });
});
