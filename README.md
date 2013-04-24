# webcore-appsec

Application security headers for Webcore.

# methods

```js
var express = require('express'),
	appsec = require('webcore-appsec'),
	server = express();

server.use(appsec.csp({ /* ... */}));
server.use(appsec.xframe('SAMEORIGIN'));
server.use(appsec.p3p('ABCDEF'));
```

Or you can opt in to all purely by config:

```js
server.use(appsec({
    csp: { /* ... */},
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF' 
}));
```

# appsec.csp(options)

* `options.policy` Object - Object definition of policy.
* `options.reportOnly` boolean - Enable report only mode.
* `options.reportUri` String - URI where to send the report data

Enables [Content Security Policy](https://www.owasp.org/index.php/Content_Security_Policy) (CSP) headers.



# appsec.xframe(value)

* `value` String - The value for the header, e.g. one of DENY, SAMEORIGIN or ALLOW-FROM uri.

Enables X-FRAME-OPTIONS headers to help prevent [Clickjacking](https://www.owasp.org/index.php/Clickjacking).



# appsec.p3p(value)

* `value` String - The compact privacy policy.

Enables [Platform for Privacy Preferences Project](http://support.microsoft.com/kb/290333) (P3P) headers.
