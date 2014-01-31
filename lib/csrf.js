'use strict';


var crypto = require('crypto');


function createToken() {
    return crypto.randomBytes(24).toString('base64');
}


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */
module.exports = function (options) {
    var tokenFn, tokenKey;

    tokenKey = options && options.key || '_csrf';
    tokenFn = options && options.fn || createToken;

    return function csrf(req, res, next) {
        var body, session, old, token;

        body = req.body;
        session = req.session;
        old = session && session[tokenKey];

        // Set the token for the new request
        token = res.locals[tokenKey] = session[tokenKey] = tokenFn(req);

        // Move along if the request is not changing any data
        if ('GET' === req.method || 'HEAD' === req.method || 'OPTIONS' === req.method) { return next(); }

        //  Otherwise, compare the tokens
        if (token === body[tokenKey]) {
            next();
        } else {
            res.statusCode = 403;
            next(new Error('CSRF token mismatch'));
        }
    };
};