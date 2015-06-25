'use strict';
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');

module.exports = function (hostnames, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hostnames), function (hostname, i, next) {
		var img = new Image();

		img.onload = function () {
			cb(true);

			// skip to end
			next(new Error());
		};

		img.onerror = function () {
			next();
		};

		img.src = '//' + hostname + '/favicon.ico?' + Date.now();
	}, function () {
		cb(false);
	});
};
