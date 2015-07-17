'use strict';


var crypto = require('crypto');
var LENGTH = 10;



function create(req, secretKey) {

    var session = req.session;
    if (session === undefined) {
        throw new Error('lusca requires req.session to be available in order to maintain state');
    }
    var secret = session[secretKey];
    // Save the secret for validation
    if (!secret) {
        session[secretKey] = crypto.pseudoRandomBytes(LENGTH).toString('base64');
        secret = session[secretKey];
    }

    return {
        secret: secret,
        token: tokenize(salt(LENGTH), secret),
        validate: function validate(req, token) {
            if (typeof token !== 'string') {
                return false;

            }
            return token === tokenize(token.slice(0, LENGTH), req.session[secretKey]);
        }
    };
}

function tokenize(salt, secret) {
    return salt + crypto.createHash('sha1').update(salt + secret).digest('base64');
}


function salt(len) {
    var str = '',
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < len; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }

    return str;
}



module.exports = {
    create: create
};
