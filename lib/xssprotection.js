'use strict';

/**
 * X-XSS-Protection
 * http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
 */
module.exports = function xssProtection(options) {
    options = options || {};

    // `enabled` should be either `1` or `0`
    var enabled = (options.enabled !== undefined) ? +options.enabled : 1;
    var mode = options.mode || 'block';

    var value = enabled + '; mode=' + mode;

    if (options.koa) {
        return function* xssProtection(next) {
            this.set('X-XSS-Protection', value);
            yield* next;
        };
    }

    return function xssProtection(req, res, next) {
        res.header('X-XSS-Protection', value);
        next();
    };
};
