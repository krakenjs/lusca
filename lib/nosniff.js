'use strict';

/**
 * X-Content-Type-Options
 * https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
 */
module.exports = function nosniff(options) {
    // on by default
    return function xssProtection(req, res, next) {
        res.header('X-Content-Type-Options', 'nosniff');
        next();
    };
};
