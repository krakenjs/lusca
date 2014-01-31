'use strict';


var express = require('express');


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */
module.exports = function () {
    var csrfExpress = express.csrf();

    return function csrf(req, res, next) {
        if (req.session) {
            csrfExpress(req, res, function (err) {
                res.locals._csrf = (typeof req.csrfToken === 'function') ? req.csrfToken() : req.session._csrf;
                next(err);
            });
            return;
        }
        next();
    };
};