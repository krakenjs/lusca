'use strict';

// Implements Brad Hill's Double HMAC pattern from
// https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/february/double-hmac-verification/.
// The approach is similar to the node's native implementation of timing safe buffer comparison that will be available on v6+.
// https://github.com/nodejs/node/issues/3043

var crypto = require('crypto');

function timeSafeCompare(a, b) {
    a = String(a);
    b = String(b);
    var key = crypto.randomBytes(32);
    var ah = crypto.createHmac('sha256', key).update(a).digest('base64');
    var bh = crypto.createHmac('sha256', key).update(b).digest('base64');

    return ah === bh && a === b;
}

module.exports.timeSafeCompare = timeSafeCompare;
