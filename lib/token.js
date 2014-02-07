'use strict';


var crypto = require('crypto');


function createSecret() {
    return Math.random().toString(35).substr(2, 10);
}


function createToken(req) {
    var session = req.session;

    // Save the secret for validation
    session._csrfSecret = session._csrfSecret || (session._csrfSecret = createSecret());

    return saltToken(generateSalt(10), session._csrfSecret);
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


function validateToken(req, token) {
    if (typeof token !== 'string') {
        return false;

    }
    return token === saltToken(token.slice(0, 10), req.session._csrfSecret);
}




module.exports = {
    create: createToken,
    validate: validateToken
};