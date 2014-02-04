/***@@@ BEGIN LICENSE @@@***/
/*───────────────────────────────────────────────────────────────────────────*\
│  Copyright (C) 2014 eBay eBay Software Foundation                                │
│                                                                             │
│hh ,'""`.                                                                    │
│  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
│  |(@)(@)|  you may not use this file except in compliance with the License. │
│  )  __  (  You may obtain a copy of the License at                          │
│ /,'))((`.\                                                                  │
│(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
│ `\ `)(' /'                                                                  │
│                                                                             │
│   Unless required by applicable law or agreed to in writing, software       │
│   distributed under the License is distributed on an "AS IS" BASIS,         │
│   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
│   See the License for the specific language governing permissions and       │
│   limitations under the License.                                            │
\*───────────────────────────────────────────────────────────────────────────*/
/***@@@ END LICENSE @@@***/
'use strict';

var express = require('express');


/**
 * Outputs all security headers based on configuration
 * @param {Object} options The configuration object.
 */
var appsec = module.exports = function (options) {
    var headers = [];

    options = options || {};

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

    if (options.hsts) {
        headers.push(appsec.hsts(options.hsts));
    }

    return function appsec(req, res, next) {
        var chain = next;

        headers.forEach(function (header) {
            chain = (function (next) {
                return function (err) {
                    if (err) {
                        next(err);
                        return;
                    }
                    header(req, res, next);
                };
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
    var policyRules = options && options.policy,
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

    return function csp(req, res, next) {
        res.header(name, value);
        next();
    };
};


/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */
appsec.csrf = function csrf() {
    var csrfExpress = express.csrf();

    return function csrf(req, res, next) {
        if (req.session) {
            csrfExpress(req, res, function (err) {
                res.locals._csrf = (typeof req.csrfToken === 'function') ? req.csrfToken() : req.session._csrf;
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
    return function xframe(req, res, next) {
        res.header('X-FRAME-OPTIONS', value);
        next();
    };
};

/**
 * HSTS - Http Strict Transport Security
 * https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
 * @param {Object} options The HSTS options {maxAge: nnnn; includeSubDomains: boolean}
 *     maxAge is required. If missing, the header will not be emitted.
 *     If includeSubDomains is omitted or false, it will be omitted from the header.
 */
appsec.hsts = function hsts(options) {
    var maxAge = options && options.maxAge,
        includeSubDomains = options && options.includeSubDomains,
        value;
    
    if (maxAge || maxAge === 0) {
        value = 'max-age=' + maxAge;
        value += includeSubDomains ? '; includeSubDomains' : '';
        return function hsts(req, res, next) {
            res.header('Strict-Transport-Security', value);
            next();
        };
    }
    return function hsts(req, res, next) {
        next();
    };
};


/**
 * P3P - Platform for Privacy Preferences Project
 * http://support.microsoft.com/kb/290333
 * @param {String} value The P3P header value.
 */
appsec.p3p = function p3p(value) {
    return function p3p(req, res, next) {
        res.header('P3P', value);
        next();
    };
};


