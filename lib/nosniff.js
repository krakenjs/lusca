'use strict';

/**
 * X-Content-Type-Options
 * https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
 */
module.exports = function nosniff() {
    return function nosniff(req, res, next) {
        res.header('x-content-type-options', 'nosniff');
        next();
    };
};
