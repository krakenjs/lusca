'use strict';


var crypto = require('crypto');


function createSecret(len) {
    return Math.random().toString(35).substr(2, len);
}


function createToken(secret) {
    return saltToken(generateSalt(10), secret);
}


function saltToken(salt, secret) {
    return salt + crypto.createHash('sha1').update(salt + secret).digest('base64');
}


function generateSalt(length) {
    var SALTCHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    var i, r = [];
    for (i = 0; i < length; ++i) {
        r.push(SALTCHARS[Math.floor(Math.random() * SALTCHARS.length)]);
    }
    return r.join('');
}


function validateToken(token, secret) {
    if ('string' !== typeof token) {
        return false;
    }

    return token === createToken(token.slice(0, 10), secret);
}




module.exports = {
    create: createToken,
    secret: createSecret,
    validate: validateToken
};