'use strict';


/**
 * See https://www.w3.org/TR/referrer-policy/#referrer-policies
 * @type {Array}
 */
var supportedValues = [
    '',
    'no-referrer',
    'no-referrer-when-downgrade',
    'same-origin',
    'origin',
    'strict-origin',
    'origin-when-cross-origin',
    'strict-origin-when-cross-origin',
    'unsafe-url'
];

/**
 * Default value.
 * @type {String}
 */
var defaultValue = ''; // Browser should fallback to a Referrer Policy defined via other mechanisms elsewhere

/**
 * Referrer-Policy
 * https://scotthelme.co.uk/a-new-security-header-referrer-policy/
 * Specification: https://www.w3.org/TR/referrer-policy/
 * @param {String} value The Referrer-Policy header value, e.g. no-referrer, same-origin, origin.
 */
module.exports = function (value) {
    if (supportedValues.indexOf(value) === -1 && process.env.NODE_ENV !== 'production') {
        throw Error('Referrer-Policy header doesn\'t support value: ' + value);
    }
    return function referrerpolicy(req, res, next) {
        res.header('referrer-policy', value || defaultValue);
        next();
    };
};
