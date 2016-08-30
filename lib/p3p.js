'use strict';


/**
 * P3P - Platform for Privacy Preferences Project
 * http://support.microsoft.com/kb/290333
 * @param {String} value The P3P header value.
 */
module.exports = function (value) {
    return function p3p(req, res, next) {
        if (value) {
            res.header('p3p', value);
        }

        next();
    };
};
