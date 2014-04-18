# lusca

[![Build Status](https://travis-ci.org/krakenjs/lusca.svg?branch=master)](https://travis-ci.org/krakenjs/lusca)
[![NPM version](https://badge.fury.io/js/lusca.svg)](http://badge.fury.io/js/lusca)

Web application security middleware.


## Usage

```js
var express = require('express'),
	app = express(),
	lusca = require('lusca');

app.use(lusca({
    csrf: true,
    csp: { /* ... */},
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    hsts: {maxAge: 31536000, includeSubDomains: true},
    xssProtection: true
}));
```

Setting any value to `false` will disable it. Alternately, you can opt into methods one by one:

```js
app.use(lusca.csrf());
app.use(lusca.csp({ /* ... */}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.p3p('ABCDEF'));
app.use(lusca.hsts({ maxAge: 31536000 });
app.use(lusca.xssProtection(true);
```



## API


### lusca.csrf(options)

* `key` String - Optional. The name of the CSRF token added to the model. Defaults to `_csrf`.
* `impl` Function - Optional. Custom implementation to generate a token.

Enables [Cross Site Request Forgery](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_\(CSRF\)) (CSRF) headers.

If enabled, the CSRF token must be in the payload when modifying data or you will receive a *403 Forbidden*. To send the token you'll need to echo back the `_csrf` value you received from the previous request.


### lusca.csp(options)

* `options.policy` Object - Object definition of policy.
* `options.reportOnly` Boolean - Enable report only mode.
* `options.reportUri` String - URI where to send the report data

Enables [Content Security Policy](https://www.owasp.org/index.php/Content_Security_Policy) (CSP) headers.



### lusca.xframe(value)

* `value` String - Required. The value for the header, e.g. DENY, SAMEORIGIN or ALLOW-FROM uri.

Enables X-FRAME-OPTIONS headers to help prevent [Clickjacking](https://www.owasp.org/index.php/Clickjacking).



### lusca.p3p(value)

* `value` String - Required. The compact privacy policy.

Enables [Platform for Privacy Preferences Project](http://support.microsoft.com/kb/290333) (P3P) headers.



### lusca.hsts(options)

* `options.maxAge` Number - Required. Number of seconds HSTS is in effect.
* `options.includeSubDomains` Boolean - Optional. Applies HSTS to all subdomains of the host

Enables [HTTP Strict Transport Security](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security) for the host domain.



### lusca.xssProtection(options)

* `options.enabled` Boolean - Optional. If the header is enabled or not (see header docs). Defaults to `1`.
* `options.mode` String - Optional. Mode to set on the header (see header docs). Defaults to `block`.

Enables [X-XSS-Protection](http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx) headers to help prevent cross site scripting (XSS) attacks in older IE browsers (IE8)
