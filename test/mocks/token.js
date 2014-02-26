'use strict';


var tokenModule = module.exports = {

    value: 'tokenAllTheThings',

    create: function (req) {
        return tokenModule.value;
    },

    validate: function (req, token) {
        return token === tokenModule.value;
    }

};