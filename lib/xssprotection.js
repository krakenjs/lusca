'use strict';

/**
 * X-XSS-Protection
 * http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
 */
module.exports = function xssProtection(options) {
    options = options || {};

    // `enabled` should be either `1` or `0`
    var enabled = (options.enabled !== undefined) ? +options.enabled : 0;
    var mode = options.mode || '';

    return function xssProtection(req, res, next) {
        if (!mode) {
            res.header('x-xss-protection', enabled);
        } else {
            res.header('x-xss-protection', enabled + '; mode=' + mode);
        }
        
        next();
    };
};
