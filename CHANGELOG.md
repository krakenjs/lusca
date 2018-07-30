##### v1.6.1

* Fixes issue with multiple `blacklist`/`whitelist` options
* Typo in README

##### v1.6.0

* Adds in `whitelist` and `blacklist` support for `csrf`

##### v1.5.2

* Bugfix: Add style/script directive if nonce is true

##### v1.5.1

* Bugfix: style-src nonce updates properly, speed improvement on match


##### v1.5.0

* Support for nonce for either style-src, script-src, or both
* Lower case headers for improved performance
* Support for referrer-policy
* Allow CSRF cookie options to be set
* Bugfix: return to suppress promise warning


##### v1.4.1

* Bugfix: typo in `nosniff` header

##### v1.4.0

* Add `nosniff` middleware
* Add new method signatures for more flexible csp configuration

##### v1.3.0

* Add `req.csrfToken` method to (re)generate token

##### v1.2.0

* Add angular convenience wrapper around CSRF cookie configuration

##### v1.1.1

* Fix csrf header case-sensitivity

##### v1.1.0

* Add `preload` flag to HSTS options

##### v0.1.2 - 20131231

* Add support for HTTP Strict Transport (HSTS) header

##### v0.1.1 - 2013xxxx
**Bugs**
-

**Features**
-
