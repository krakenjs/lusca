'use strict';


var token = require('./token');


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 * @param {Object} options
 *    key {String} The name of the CSRF token in the model. Default "_csrf".
 *    impl {Object} An object with create/validate methods for custom tokens. Optional.
 *    header {String} The name of the response header containing the CSRF token. Default "x-csrf-token".
 */
module.exports = function (options) {
    var impl, key, header, secret, cookie;

    options = options || {};

    if (options.angular) {
        options.header = 'X-XSRF-TOKEN';
        options.cookie = 'XSRF-TOKEN';
    }

    key = options.key || '_csrf';
    impl = options.impl || token;
    header = options.header || 'x-csrf-token';
    secret = options.secret || '_csrfSecret';
    cookie = options.cookie;

    function getCsrf(req, secret) {
        var _impl, validate, _token, _secret;

        _impl = impl.create(req, secret);
        validate = impl.validate || _impl.validate;
        _token = _impl.token || _impl;
        _secret = _impl.secret;

        return {
            validate: validate,
            token: _token,
            secret: _secret
        };
    }

    function setToken(res, token) {
        res.locals[key] = token;
        if (cookie) {
            res.cookie(cookie, token);
        }
    }


    return function checkCsrf(req, res, next) {
        var method, _token, errmsg;

        var csrf = getCsrf(req, secret);
        setToken(res, csrf.token);

        req.csrfToken = function csrfToken() {
            var newCsrf = getCsrf(req, secret);
            if (csrf.secret && newCsrf.secret && csrf.secret === newCsrf.secret) {
                return csrf.token;
            }

            csrf = newCsrf;
            setToken(res, csrf.token);
            return csrf.token;
        };

        // Move along for safe verbs
        method = req.method;
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return next();
        }

        // Validate token
        _token = (req.body && req.body[key]) || req.headers[header.toLowerCase()];

        if (csrf.validate(req, _token)) {
            next();
        } else {
            res.statusCode = 403;
            if (!_token) {
                errmsg = 'CSRF token missing';
            } else {
                errmsg = 'CSRF token mismatch';
            }
            next(new Error(errmsg));
        }
    };
};
