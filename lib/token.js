'use strict';


var crypto = require('crypto');

var SECRET = '_csrfSecret';
var LENGTH = 10;



function create(req) {
    var session = req.session,
        secret = session[SECRET];

    // Save the secret for validation
    if (!secret) {
        session[SECRET] = crypto.pseudoRandomBytes(LENGTH).toString('base64');
        secret = session[SECRET];
    }

    return tokenize(salt(LENGTH), secret);
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


function validate(req, token) {
    if (typeof token !== 'string') {
        return false;

    }
    return token === tokenize(token.slice(0, LENGTH), req.session[SECRET]);
}




module.exports = {
    create: create,
    validate: validate
};