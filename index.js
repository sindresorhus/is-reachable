'use strict';
var net = require('net');
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');

var port = 80;
var timeout = 1000;

module.exports = function (hostnames, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hostnames), function (hostname, i, done) {
		isPortReachable(hostname, port, function (reachable) {
			if (reachable) {
				cb(null, true);
				done(new Error()); // skip to end
			} else {
				done();
			}
		});
	}, function () {
		cb(null, false);
	});
};


function isPortReachable(hostname, port, cb) {
	cb = onetime(cb);

	var socket = new net.Socket();
	var onError = function () {
		cb(false);
		socket.destroy();
	}

	socket.setTimeout(timeout);
	socket.on('error', onError);
	socket.on('timeout', onError);

	socket.connect(port, hostname, function () {
		cb(true);
		socket.end();
	});
}
