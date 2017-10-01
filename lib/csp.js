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
        styleNonce = options && options.styleNonce,
        scriptNonce = options && options.scriptNonce,
        value, name;

    name = 'content-security-policy';

    if (isReportOnly) {
        name += '-report-only';
    }

    if (policyRules && policyRules["default-src"]) {
        if (styleNonce && !policyRules["style-src"]) {
            policyRules["style-src"] = policyRules["default-src"];
        }
        
        if (scriptNonce && !policyRules["script-src"]) {
            policyRules["script-src"] = policyRules["default-src"];
        }
    }

    value = createPolicyString(policyRules);

    if (reportUri) {
        if (value !== '') {
            value += '; ';
        }
        value += 'report-uri ' + reportUri;
    }

    return function csp(req, res, next) {
        if (styleNonce) {
            var styleMatch = value.match(/style-src 'nonce-.{48}'/);
            if (styleMatch) {
                value = value.replace(styleMatch[0], 'style-src \'nonce-' + res.locals.nonce + '\'');
            }
            else {
                value = value.replace('style-src', 'style-src \'nonce-' + res.locals.nonce + '\'');
            }
        }
        if (scriptNonce) {
            var scriptMatch = value.match(/script-src 'nonce-.{48}'/);
            if (scriptMatch) {
                value = value.replace(scriptMatch[0], 'script-src \'nonce-' + res.locals.nonce + '\'');
            }
            else {
                value = value.replace('script-src', 'script-src \'nonce-' + res.locals.nonce + '\'');
            }
        }
        res.header(name, value);
        next();
    };
};

var createPolicyString = module.exports.createPolicyString = function (policy) {
    var entries;

    if (typeof policy === 'string') {
        return policy;
    }

    if (Array.isArray(policy)) {
        return policy.map(createPolicyString).join('; ');
    }

    if (typeof policy === 'object' && policy !== null) {
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
