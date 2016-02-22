'use strict';

/**
 * X-Content-Type-Options
 * https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
 */
module.exports = function nosniff(options) {
    options = options || {};

    // `enabled` should be either `1` or `0`
    var enabled = (options.enabled !== undefined) ? +options.enabled : 1;
    
    return function xssProtection(req, res, next) {
        if (enabled) {
            res.header('X-Content-Type-Options', 'nosniff');
        }
        next();
    };
};
