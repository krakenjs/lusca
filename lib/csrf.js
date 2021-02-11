'use strict';


var token = require('./token'),
    timeSafeCompare = require('tsscmp');

/**
 * CSRF
 * https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 * @param {Object} options
 *    key {String} The name of the CSRF token in the model. Default "_csrf".
 *    impl {Object} An object with create/validate methods for custom tokens. Optional.
 *    header {String} The name of the response header containing the CSRF token. Default "x-csrf-token".
 */
module.exports = function (options) {
    var impl, key, header, secret, cookie, allowlist, blocklist, allowlistIncludes,
    allowlistExact, blocklistIncludes, blocklistExact;

    options = options || {};

    if (options.angular) {
        options.header = 'X-XSRF-TOKEN';
        options.cookie = {
            name: 'XSRF-TOKEN',
            options: options.cookie && options.cookie.options
        };
    }

    allowlist = options.allowlist || options.whitelist;

    if (typeof allowlist === 'string') {
        allowlist = [ { path: allowlist, type: 'includes' } ];
    } else if (!Array.isArray(allowlist)) {
        // Don't allow non string or array allowlist
        allowlist = null;
    }

    if (allowlist) {
        allowlistIncludes = new Set();
        allowlistExact = new Set();
        populateSet(allowlist, allowlistIncludes, allowlistExact);
        //preemptively converting to array to use convinience methods in middleware
        allowlistIncludes = Array.from(allowlistIncludes);
    }

    blocklist = options.blocklist || options.blacklist;

    if (typeof blocklist === 'string') {
        blocklist = [ { path: blocklist, type: 'includes' } ];
    } else if (!Array.isArray(blocklist)) {
        // Don't allow non string or array blocklist
        blocklist = null;
    }

    if (blocklist) {
        blocklistIncludes = new Set();
        blocklistExact = new Set();
        populateSet(blocklist, blocklistIncludes, blocklistExact);
        //preemptively converting to array to use convinience methods in middleware
        blocklistIncludes = Array.from(blocklistIncludes);
    }

    key = options.key || '_csrf';
    impl = options.impl || token;
    header = options.header || 'x-csrf-token';
    secret = options.secret || '_csrfSecret';

    // Check if cookie is string or object
    if (typeof options.cookie === 'string') {
        cookie = {
            name: options.cookie,
        };
    } else {
        cookie = {
            name: options.cookie && options.cookie.name
        };
    }

    // Set cookie options
    cookie.options = options.cookie && options.cookie.options || {};

    function getCsrf(req, secret) {
        var _impl, validate, _token, _secret;

        _impl = impl.create(req, secret);
        validate = impl.validate || _impl.validate;
        _token = _impl.token || _impl;
        _secret = _impl.secret;

        return {
            validate: validate,
            token: _token,
            secret: _secret
        };
    }

    function setToken(res, token) {
        res.locals[key] = token;

        if (cookie && cookie.name) {
            res.cookie(cookie.name, token, cookie.options || {});
        }
    }

    return function checkCsrf(req, res, next) {

        var shouldBypass = false;

        if (blocklist) {
            shouldBypass = blocklistExact.has(req.path) ||
                blocklistIncludes.some(function (exclusion) {
                shouldBypass = req.path.indexOf(exclusion) === 0;
                return shouldBypass;
            });
        }

        if (allowlist) {
            shouldBypass = !allowlistExact.has(req.path) ||
                allowlistIncludes.some(function (inclusion) {
                shouldBypass = req.path.indexOf(inclusion) !== 0;
                return shouldBypass;
            });
        }

        if (shouldBypass) {
            return next();
        }

        var method, _token, errmsg;

        var csrf = getCsrf(req, secret);

        setToken(res, csrf.token);

        req.csrfToken = function csrfToken() {
            var newCsrf = getCsrf(req, secret);
            if (csrf.secret && newCsrf.secret &&
                timeSafeCompare(csrf.secret, newCsrf.secret)) {
                return csrf.token;
            }

            csrf = newCsrf;
            setToken(res, csrf.token);
            return csrf.token;
        };

        // Move along for safe verbs
        method = req.method;

        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return next();
        }

        // Validate token
        _token = (req.body && req.body[key]) || req.headers[header.toLowerCase()];

        if (csrf.validate(req, _token)) {
            next();
        } else {
            res.statusCode = 403;

            if (!_token) {
                errmsg = 'CSRF token missing';
            } else {
                errmsg = 'CSRF token mismatch';
            }

            next(new Error(errmsg));
        }
    };
};

function populateSet(list, includes, exact) {
    list.forEach(function (config) {
        if (typeof config === 'string') {
            includes.add(config);
        }
        else if (config.type === 'includes') {
            includes.add(config.path);
        }
        else {
            exact.add(config.path);
        }
    });
}
