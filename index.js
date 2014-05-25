/*───────────────────────────────────────────────────────────────────────────*\
│  Copyright (C) 2014 eBay Software Foundation                                │
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
'use strict';


/**
 * Outputs all security headers based on configuration
 * @param {Object} options The configuration object.
 */
var lusca = module.exports = function (options) {
    var headers = [];
    var koa;
    if (options) {
        koa = !!options.koa;
        Object.keys(lusca).forEach(function (key) {
            var config = options[key];

            if (config) {
                if (koa) {
                    if (key === 'csrf' && config === true) {
                        // { csrf: true }
                        config = {};
                    } else if (key === 'xframe' && typeof config === 'string') {
                        // { xframe: 'DENY' }
                        config = {
                            value: config
                        };
                    }
                    config.koa = koa;
                }
                headers.push(lusca[key](config));
            }
        });
    }

    if (koa) {
        var compose = require('koa-compose');
        var mw = compose(headers);
        mw._name = 'lusca';
        return mw;
    }

    return function lusca(req, res, next) {
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


lusca.csrf = require('./lib/csrf');
lusca.csp = require('./lib/csp');
lusca.hsts = require('./lib/hsts');
lusca.p3p = require('./lib/p3p');
lusca.xframe = require('./lib/xframes');
lusca.xssProtection = require('./lib/xssprotection');
