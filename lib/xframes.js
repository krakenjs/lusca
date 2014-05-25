'use strict';


/**
 * Xframes
 * https://www.owasp.org/index.php/Clickjacking
 * @param {String} value The XFRAME header value, e.g. DENY, SAMEORIGIN.
 */
module.exports = function (value) {
    var options = value;
    if (typeof options === 'object') {
        value = options.value;
    }

    if (options.koa) {
        return function* xframe(next) {
            this.set('X-FRAME-OPTIONS', value);
            yield* next;
        };
    }

    return function xframe(req, res, next) {
        res.header('X-FRAME-OPTIONS', value);
        next();
    };
};
