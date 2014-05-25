'use strict';


var token = require('./token');


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 * @param {Object} options
 *    key {String} The name of the CSRF token in the model. Default "_csrf".
 *    impl {Object} An object with create/validate methods for custom tokens. Optional.
 */
module.exports = function (options) {
    var impl, key;

    options = options || {};

    key = options.key || '_csrf';
    impl = options.impl || token;

    if (options.koa) {
        // koa style middleware
        return function* csrf(next) {
            var method, token;

            // Set the token
            if (!this.locals) {
                this.locals = {};
            }
            this.locals[key] = impl.create(this);

            // Move along for safe verbs
            method = this.method;

            if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
                return yield* next;
            }

            // Validate token
            token = this.request.body && this.request.body[key];

            if (impl.validate(this, token)) {
                yield* next;
            } else {
                this.throw(403, new Error('CSRF token mismatch'));
            }
        };
    }

    // express style middleware
    return function csrf(req, res, next) {
        var method, token;

        // Set the token
        res.locals[key] = impl.create(req);

        // Move along for safe verbs
        method = req.method;

        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return next();
        }

        // Validate token
        token = req.body[key];

        if (impl.validate(req, token)) {
            next();
        } else {
            res.statusCode = 403;
            next(new Error('CSRF token mismatch'));
        }
    };
};
