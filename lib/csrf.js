'use strict';


var token = require('./token');


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 * @param {Object} options
 *    key {String} The name of the CSRF token in the model. Default "_csrf".
 *    fn {Function} A function to generate a custom CSRF token. Optional.
 */
module.exports = function (options) {
    var tokener, key;

    options = options || {};

    key = options.key || '_csrf';
    tokener = options.fn || token;

    return function csrf(req, res, next) {
        var session, method, secret, token;

        // Set the secret
        session = req.session;
        secret = session._csrfSecret || (session._csrfSecret = tokener.secret());

        // Create a new token
        res.locals[key] = tokener.create(secret);

        // Move along for safe verbs
        method = req.method;

        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return next();
        }

        //  Otherwise validate token
        token = req.body[key];

        if (tokener.validate(token, secret)) {
            next();
        } else {
            res.statusCode = 403;
            next(new Error('CSRF token mismatch'));
        }
    };
};