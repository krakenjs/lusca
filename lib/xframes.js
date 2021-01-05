'use strict';


/**
 * Xframes
 * https://www.owasp.org/index.php/Clickjacking
 * @param {String} value The XFRAME header value, e.g. DENY, SAMEORIGIN.
 */
module.exports = function (options) {
    return function xframe(req, res, next) {
        var allowlist, blocklist, shouldBypass, xframeFunction, headerValue;

        options = options || {};

        if (typeof options !== 'string') {
            allowlist = options.allowlist;
            headerValue = options.value;

            if (typeof allowlist === 'string') {
                allowlist = [allowlist];
            } else if (!Array.isArray(allowlist)) {
                // Don't allow non string or array allowlist
                allowlist = null;
            }

            blocklist = options.blocklist;

            if (typeof blocklist === 'string') {
                blocklist = [blocklist];
            } else if (!Array.isArray(blocklist)) {
                // Don't allow non string or array blocklist
                blocklist = null;
            }

            if (blocklist) {
                shouldBypass = (blocklist.indexOf(req.path) !== -1);
            }

            if (allowlist) {
                shouldBypass = (allowlist.indexOf(req.path) === -1);
            }

            xframeFunction = options.xframeFunction;
            if (typeof xframeFunction === 'function') {
                shouldBypass = false;
                headerValue = xframeFunction(req);
            }
        } else {
            shouldBypass = false;
            headerValue = options;
        }

        if (!shouldBypass) {
            res.header('x-frame-options', headerValue);
        }

        next();
    };
};
