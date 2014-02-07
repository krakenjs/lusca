'use strict';


var crypto = require('crypto');


function createSecret(len) {
    return Math.random().toString(35).substr(2, len);
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
    return token === createToken(req);
}




module.exports = {
    create: createToken,
    validate: validateToken
};