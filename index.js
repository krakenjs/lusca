
// Content Security Policy (CSP)
// https://www.owasp.org/index.php/Content_Security_Policy
module.exports.csp = function csp (options) {
	'use strict';

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
		next();
	};
};


// Clickjacking
// https://www.owasp.org/index.php/Clickjacking
module.exports.xframe = function xframe (value) {
	'use strict';

	return function (req, res, next) {
		res.header('X-FRAME-OPTIONS', value);
		next();
	};
};


// Platform for Privacy Preferences Project (P3P)
// http://support.microsoft.com/kb/290333
module.exports.p3p = function p3p (value) {
	'use strict';

	return function (req, res, next) {
		res.header('P3P', value);
		next();
	};
};

