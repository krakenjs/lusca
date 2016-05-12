/*global describe:false, it:false */
'use strict';

var utils = require('../lib/utils'),
    assert = require('assert');


describe('utils', function () {
    it('equal strings are true', function () {
        assert.ok(utils.timeSafeCompare('127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935',
                                        '127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935'),
                                        'equal strings not equal');
    });

    it('not equal strings are false', function () {
        assert.ok(!utils.timeSafeCompare('alpha',
                                         'beta'),
                                         'not equal strings are equal');
    });
});
