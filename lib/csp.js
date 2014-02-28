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
        value = '',
        name, key;

    name = 'Content-Security-Policy';

    if (isReportOnly) {
        name += '-Report-Only';
    }

    for (key in policyRules) {
        value += key + ' ' + policyRules[key] + '; ';
    }

    if (reportUri) {
        value += 'report-uri ' + reportUri;
    }

    return function csp(req, res, next) {
        res.header(name, value);
        next();
    };
};