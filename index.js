/***@@@ BEGIN LICENSE @@@***
Copyright (c) 2013, eBay Software Foundation All rights reserved.  Use of the accompanying software, in source and binary forms, is permitted without modification only and provided that the following conditions are met:  Use of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  Use in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  Neither the name of eBay or its subsidiaries nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  All rights not expressly granted to the recipient in this license are reserved by the copyright holder.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
***@@@ END LICENSE @@@***/
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


