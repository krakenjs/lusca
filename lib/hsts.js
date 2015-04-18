'use strict';


/**
 * HSTS - Http Strict Transport Security
 * https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
 * @param {Object} options
 *     maxAge {Number} The max age of the header. Required.
 *     includeSubDomains {Boolean}
 */
module.exports = function (options) {
    var value;

    options = options || {};

    value = (options.maxAge !== undefined) ? 'max-age=' + options.maxAge : '';
    value += (value && options.includeSubDomains) ? '; includeSubDomains' : '';
    value += (value && options.preload) ? '; preload' : '';

    return function hsts(req, res, next) {
        if (value) {
            res.header('Strict-Transport-Security', value);
        }

        next();
    };
};
