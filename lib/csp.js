'use strict';

/**
 * Parese Policy Rules
 * @param {Object} policyRules
 * @api private
 */
function parsePolicyRules(policyRules) {
    if (Array.isArray(policyRules)) {
        return policyRules.join('; ') + '; ';
    } else {
        var value = '', key;

        for (key in policyRules) {
            value += key + ' ' + policyRules[key] + '; ';
        }

        return value;
    }
}

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
        name;

    name = 'Content-Security-Policy';

    if (isReportOnly) {
        name += '-Report-Only';
    }

    if (typeof policyRules === 'object') {
        value += parsePolicyRules(policyRules);
    } else {
        value += policyRules + '; ';
    }

    if (reportUri) {
        value += 'report-uri ' + reportUri;
    }

    return function csp(req, res, next) {
        res.header(name, value);
        next();
    };
};
