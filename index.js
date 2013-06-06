'use strict';

var express = require('express');


/**
 * Outputs all security headers based on configuration
 * @param {Object} options The configuration object.
 */
var appsec = module.exports = function (options) {
	var headers = [];

	if (options.csp) {
		headers.push(appsec.csp(options.csp));
	}

	if (options.csrf) {
		headers.push(appsec.csrf());
	}

	if (options.xframe) {
		headers.push(appsec.xframe(options.xframe));
	}

	if (options.p3p) {
		headers.push(appsec.p3p(options.p3p));
	}

	return function (req, res, next) {
        var chain = next;

		headers.forEach(function (header) {
            chain = (function (next) {
                return function (err) {
                    if (err) {
                        next(err);
                        return;
                    }
                    header(req, res, next);
                }
            }(chain));
		});

		chain();
	};
};


/**
 * Content Security Policy (CSP)
 * https://www.owasp.org/index.php/Content_Security_Policy
 * @param {Object} options The CSP policy.
 */
appsec.csp = function csp(options) {
	var	policyRules = options && options.policy,
		isReportOnly = options && options.reportOnly,
		reportUri = options && options.reportUri,
		value = "",
		name, key;

    name = 'Content-Security-Policy';
	if (isReportOnly) {
		name += '-Report-Only';
	}


	for (key in policyRules) {
		value += key + " " + policyRules[key] + "; ";
	}

	if (reportUri) {
		value += "reportUri " + reportUri;
	}

	return function (req, res, next) {
		res.header(name, value);
		next();
	};
};


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */
appsec.csrf = function csrf(value) {
	var csrfExpress = express.csrf();

	return function (req, res, next) {
		if (req.session) {
			csrfExpress(req, res, function (err) {
				res.locals._csrf = req.session._csrf;
				next(err);
			});
            return;
		}
        next();
	};
};


/**
 * Xframes
 * https://www.owasp.org/index.php/Clickjacking
 * @param {String} value The XFRAME header value, e.g. DENY, SAMEORIGIN.
 */
appsec.xframe = function xframe(value) {
	return function (req, res, next) {
		res.header('X-FRAME-OPTIONS', value);
		next();
	};
};


/**
 * P3P - Platform for Privacy Preferences Project
 * http://support.microsoft.com/kb/290333
 * @param {String} value The P3P header value.
 */
appsec.p3p = function p3p(value) {
	return function (req, res, next) {
		res.header('P3P', value);
		next();
	};
};


