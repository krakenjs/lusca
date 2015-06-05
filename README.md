lusca
=====

Lead Maintainer: [Jean-Charles Sisk](https://github.com/jasisk)  

[![Build Status](https://travis-ci.org/krakenjs/lusca.svg?branch=master)](https://travis-ci.org/krakenjs/lusca)  
[![NPM version](https://badge.fury.io/js/lusca.svg)](http://badge.fury.io/js/lusca)  

Web application security middleware.


## Usage

```js
var express = require('express'),
	app = express(),
	session = require('express-session'),
	lusca = require('lusca');

//this or other session management will be required
app.use(session({
	secret: 'abc',
	resave: true,
	saveUninitialized: true
}));

app.use(lusca({
    csrf: true,
    csp: { /* ... */},
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
    xssProtection: true
}));
```

Setting any value to `false` will disable it. Alternately, you can opt into methods one by one:

```js
app.use(lusca.csrf());
app.use(lusca.csp({ /* ... */}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.p3p('ABCDEF'));
app.use(lusca.hsts({ maxAge: 31536000 }));
app.use(lusca.xssProtection(true));
```

__Please note that you must use [express-session](https://github.com/expressjs/session), [cookie-session](https://github.com/expressjs/cookie-session), their express 3.x alternatives, or other session object management in order to use lusca.__


## API


### lusca.csrf(options)

* `key` String - Optional. The name of the CSRF token added to the model. Defaults to `_csrf`.
* `secret` String - Optional. The key to place on the session object which maps to the server side token. Defaults to `_csrfSecret`.
* `impl` Function - Optional. Custom implementation to generate a token.
* `cookie` String - Optional. If set, a cookie with the name you provide will be set with the CSRF token.
* `angular` Boolean - Optional. Shorthand setting to set `lusca` up to use the default settings for CSRF validation according to the [AngularJS docs].

[angularjs docs]: https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection

Enables [Cross Site Request Forgery](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_\(CSRF\)) (CSRF) headers.

If enabled, the CSRF token must be in the payload when modifying data or you will receive a *403 Forbidden*. To send the token you'll need to echo back the `_csrf` value you received from the previous request.


### lusca.csp(options)

* `options.policy` Object - Object definition of policy.
* `options.reportOnly` Boolean - Enable report only mode.
* `options.reportUri` String - URI where to send the report data

Enables [Content Security Policy](https://www.owasp.org/index.php/Content_Security_Policy) (CSP) headers.

#### Example Options

```js
// Everything but images can only come from own domain (excluding subdomains)
{
  policy: {
    'default-src': '\'self\'',
    'img-src': '*'
  }
}
```

See the [MDN CSP usage](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Using_Content_Security_Policy) page for more information on available policy options.

### lusca.xframe(value)

* `value` String - Required. The value for the header, e.g. DENY, SAMEORIGIN or ALLOW-FROM uri.

Enables X-FRAME-OPTIONS headers to help prevent [Clickjacking](https://www.owasp.org/index.php/Clickjacking).



### lusca.p3p(value)

* `value` String - Required. The compact privacy policy.

Enables [Platform for Privacy Preferences Project](http://support.microsoft.com/kb/290333) (P3P) headers.



### lusca.hsts(options)

* `options.maxAge` Number - Required. Number of seconds HSTS is in effect.
* `options.includeSubDomains` Boolean - Optional. Applies HSTS to all subdomains of the host
* `options.preload` Boolean - Optional. Adds preload flag

Enables [HTTP Strict Transport Security](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security) for the host domain. The preload flag is required for HSTS domain submissions to [Chrome's HSTS preload list](https://hstspreload.appspot.com).


### lusca.xssProtection(options)

* `options.enabled` Boolean - Optional. If the header is enabled or not (see header docs). Defaults to `1`.
* `options.mode` String - Optional. Mode to set on the header (see header docs). Defaults to `block`.

Enables [X-XSS-Protection](http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx) headers to help prevent cross site scripting (XSS) attacks in older IE browsers (IE8)
