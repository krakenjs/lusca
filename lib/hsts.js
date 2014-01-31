'use strict';


/**
 * HSTS - Http Strict Transport Security
 * https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
 * @param {Object} options The HSTS options {maxAge: nnnn; includeSubDomains: boolean}
 *     maxAge is required. If missing, the header will not be emitted.
 *     If includeSubDomains is omitted or false, it will be omitted from the header.
 */
module.exports = function (options) {
    var value;

    options = options || {};

    value = (options.maxAge !== undefined) ? 'max-age=' + options.maxAge : '';
    value += (value && options.includeSubDomains) ? '; includeSubDomains' : '';

    return function hsts(req, res, next) {
        if (value) {
            res.header('Strict-Transport-Security', value);
        }
        
        next();
    };
};
