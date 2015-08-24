'use strict';
var dns = require('dns');
var net = require('net');
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');
var isPublicDomain = require('is-public-domain');
var ip = require('ip');

var port = 80;
var timeout = 1000;

module.exports = function (hostnames, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hostnames), function (hostname, i, done) {
		dns.lookup(hostname, function (err, address) {
			// Ignore `err` as we only care about `address`.
			// Skip connecting if there is nothing to connect to.
			if (!address) {
				done();
				return;
			}

			// When a public domain returns a private IP address we declare the host
			// as unreachable. This will fail intentionally when a intranet resource
			// uses a public top level domain with a private IP address, which itself
			// is a violation of RFC 1918 (https://www.ietf.org/rfc/rfc1918.txt).
			if (isPublicDomain(hostname) && ip.isPrivate(address)) {
				done();
				return;
			}

			isPortReachable(address, port, function (reachable) {
				if (reachable) {
					cb(null, true);

					// skip to end
					done(new Error());
				} else {
					done();
				}
			});
		});
	}, function () {
		cb(null, false);
	});
};

function isPortReachable(ip, port, cb) {
	cb = onetime(cb);

	var socket = new net.Socket();

	function onError() {
		cb(false);
		socket.destroy();
	}

	socket.setTimeout(timeout);
	socket.on('error', onError);
	socket.on('timeout', onError);

	socket.connect(port, ip, function () {
		cb(true);
		socket.end();
	});
}
