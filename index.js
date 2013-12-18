/***@@@ BEGIN LICENSE @@@***/
/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2013 eBay Software Foundation                                │
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

    //Maintains backwards compatibility with original boolean value for options.csrf
    if (options.csrf === true || (typeof options.csrf === 'object' && options.csrf !== null)) {
        headers.push(appsec.csrf(options.csrf));
    }

    if (options.xframe) {
        headers.push(appsec.xframe(options.xframe));
    }

    if (options.p3p) {
        headers.push(appsec.p3p(options.p3p));
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
appsec.csrf = function csrf(options) {


    var csrfExpress = express.csrf(),
        ignorePaths = [];

    if (typeof options === 'object' && options !== null && options.ignore) {
        if (options.ignore instanceof Array) {
            for (var i in options.ignore) {
                //This substitution allows for matching express paths with parameters.
                //If I want to ignore "/a/path/:with/parameters"
                //This will create a RegExp: "^/a/path/[^/]+/parameters" to test against.
                ignorePaths.push(new RegExp('^' + options.ignore[i].replace(/:[^\/]+/g, '[^/]+')));
            }
        }
        else {
            console.warn('Error in CSRF configuration: Expected an Array for ignored paths. CSRF will be used on all paths.');
        }
    }

    return function csrf(req, res, next) {
        if (req.session) {

            // console.log('route', req.route);
            //Skip any paths set to be ignored
            for (var i in ignorePaths) {
                if (ignorePaths[i].test(req.path)) {
                    next();
                    return;
                }
            }

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


