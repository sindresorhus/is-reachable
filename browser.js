/* eslint-env browser */
'use strict';
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');

module.exports = function (hosts, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hosts), function (host, i, next) {
		var img = new Image();

		img.onload = function () {
			cb(true);

			// skip to end
			next(new Error());
		};

		img.onerror = function () {
			next();
		};

		img.src = '//' + host + '/favicon.ico?' + Date.now();
	}, function () {
		cb(false);
	});
};
