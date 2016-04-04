'use strict';


/**
 * Content Security Policy (CSP)
 * https://www.owasp.org/index.php/Content_Security_Policy
 * @param {Object} options The CSP policy.
 */
module.exports = function (options) {
    var policyRules = options && options.policy,
        isReportOnly = options && options.reportOnly,
        reportUri = options && options.reportUri,
        reportUriImpl = options && options.impl,
        value = '',
        name, key;

    name = 'Content-Security-Policy';

    if (isReportOnly) {
        name += '-Report-Only';
    }

    for (key in policyRules) {
        value += key + ' ' + policyRules[key] + '; ';
    }

    return function csp(req, res, next) {

        if (reportUriImpl) {
            value += 'report-uri ' + reportUriImpl(req);
        } else if (reportUri) {
            value += 'report-uri ' + reportUri;
        }

        res.header(name, value);
        next();
    };
};