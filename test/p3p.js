/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('P3P', function () {

    it('method', function () {
        assert(typeof lusca.p3p === 'function');
    });


    it('header', function (done) {
        var config = { p3p: 'MY_P3P_VALUE' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('P3P', config.p3p)
            .expect(200, done);
    });

});
