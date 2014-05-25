'use strict';


/**
 * P3P - Platform for Privacy Preferences Project
 * http://support.microsoft.com/kb/290333
 * @param {String} value The P3P header value.
 */
module.exports = function (value) {
    var options = value;
    if (typeof options === 'object') {
        //  { value: 'MY_P3P_VALUE' }
        value = options.value;
    }

    if (options.koa) {
        return function* p3p(next) {
            if (value) {
                this.set('P3P', value);
            }
            yield* next;
        };
    }

    return function p3p(req, res, next) {
        if (value) {
            res.header('P3P', value);
        }

        next();
    };
};
