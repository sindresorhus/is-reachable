'use strict';
var net = require('net');
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');
var timeout = 1000;

module.exports = function (hostnames, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hostnames), function (hostname, i, done) {
		var socket = new net.Socket();
		done = onetime(done);

		socket.setTimeout(timeout);

		socket.on('timeout', function () {
			socket.destroy();
			done();
		});

		socket.on('error', function () {
			socket.destroy();
			done();
		});

		socket.connect(80, hostname, function () {
			cb(null, true);
			socket.end();

			// skip to end
			done(new Error());
		});
	}, function () {
		cb(null, false);
	});
};
