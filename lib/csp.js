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

    var values = [];
    for (key in policyRules) {

        var rule = policyRules[key];
        if (Array.isArray(rule)) {
            rule = rule.join(" ");
        }
        values.push(key + ' ' + rule + '; ');
    }
    value = values.join('');

    if (reportUri) {
        value += 'report-uri ' + reportUri;
    }

    return function csp(req, res, next) {
        res.header(name, value);
        next();
    };
};
