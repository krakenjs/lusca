'use strict';

var thing = require('core-util-is');


/**
 * Content Security Policy (CSP)
 * https://www.owasp.org/index.php/Content_Security_Policy
 * @param {Object} options The CSP policy.
 */
module.exports = function (options) {
    var policyRules = options && options.policy,
        isReportOnly = options && options.reportOnly,
        reportUri = options && options.reportUri,
        value, name;

    name = 'Content-Security-Policy';

    if (isReportOnly) {
        name += '-Report-Only';
    }

    value = createPolicyString(policyRules);

    if (reportUri) {
        if (value !== '') {
            value += '; ';
        }
        value += 'report-uri ' + reportUri;
    }

    return function csp(req, res, next) {
        res.header(name, value);
        next();
    };
};

var createPolicyString = module.exports.createPolicyString = function (policy) {
    var entries;

    if (thing.isString(policy)) {
        return policy;
    }

    if (thing.isArray(policy)) {
        return policy.map(createPolicyString).join('; ');
    }

    if (thing.isObject(policy)) {
        entries = Object.keys(policy).map(function (directive) {
            if (policy[directive] === 0 || policy[directive]) {
                directive += ' ' + policy[directive];
            }
            return directive;
        });

        return createPolicyString(entries);
    }

    throw Error('invalid csp policy - must be array, string, or plain object');
};
