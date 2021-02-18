'use strict';


/**
 * Xframes
 * https://www.owasp.org/index.php/Clickjacking
 * @param {String} value The XFRAME header value, e.g. DENY, SAMEORIGIN.
 */
module.exports = function (value) {
    return function xframe(req, res, next) {
        res.header('x-frame-options', value);
        next();
    };
};