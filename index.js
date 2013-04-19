'use strict';


/**
 * Outputs all security headers based on configuration
 * @param {Object} options The configuration object.
 */
var appsec = module.exports = function (options) {
	var headers = [];

	if (options.csp) {
		headers.push(appsec.csp(options.csp));
	}

	if (options.xframe) {
		headers.push(appsec.xframe(options.xframe));
	}

	if (options.p3p) {
		headers.push(appsec.p3p(options.p3p));
	}

	return function (req, res, next) {
		headers.forEach(function (header) {
			header(req, res);
		});

		next();
	};
};


/**
 * Content Security Policy (CSP)
 * https://www.owasp.org/index.php/Content_Security_Policy
 * @param {Object} options The CSP policy.
 */
appsec.csp = function csp (options) {
	var	policyRules = options && options.policy,
		isReportOnly = options && options.reportOnly,
		reportUri = options && options.reportUri,
		value = "",
		name, key;

	if (isReportOnly) {
		name = 'Content-Security-Policy-Report-Only';
	} else {
		name = 'Content-Security-Policy';
	}

	for (key in policyRules) {
		value += key + " " + policyRules[key] + "; ";
	}

	if (reportUri) {
		value += "reportUri " + reportUri;
	}

	return function (req, res, next) {
		res.header(name, value);
		next && next();
	};
};


/**
 * Xframes
 * https://www.owasp.org/index.php/Clickjacking
 * @param {String} value The XFRAME header value, e.g. DENY, SAMEORIGIN.
 */
appsec.xframe = function xframe (value) {
	return function (req, res, next) {
		res.header('X-FRAME-OPTIONS', value);
		next && next();
	};
};


/**
 * P3P - Platform for Privacy Preferences Project
 * http://support.microsoft.com/kb/290333
 * @param {String} value The P3P header value.
 */
appsec.p3p = function p3p (value) {
	return function (req, res, next) {
		res.header('P3P', value);
		next && next();
	};
};


