'use strict';


module.exports = {
	reportOnly: true,
	impl: function (req) {
		return 'http://www.example.com?token=sometoken';
	},
	policy: {
		"default-src": "*"
	}
};
