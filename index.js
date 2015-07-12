'use strict';
var dns = require('dns');
var net = require('net');
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');
var tlds = require('tlds');
var ip = require('ip');

var port = 80;
var timeout = 1000;

module.exports = function (hostnames, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hostnames), function (hostname, i, done) {
		lookup(hostname, function (err, address) {
			// Skip connecting if a dns lookup fails.
			if (err) {
				return done();
			}

			// When a public domains returns a private ip address we declare the host
			// as unreachable. This will fail when a intranet resource uses a public
			// top level domain to resolve to an private address, which is a
			// violation of RFC 1918 (https://www.ietf.org/rfc/rfc1918.txt).
			if (isPublicDomain(hostname) && ip.isPrivate(address)) {
				return done();
			}

			isPortReachable(address, port, function (reachable) {
				if (reachable) {
					cb(null, true);
					done(new Error()); // skip to end
				} else {
					done();
				}
			});
		});
	}, function () {
		cb(null, false);
	});
};

function lookup(hostname, cb) {
	if (net.isIP(hostname)) {
		cb(null, hostname);
	} else {
		dns.lookup(hostname, function (err, address) {
			if (err) {
				return cb(err);
			}
			cb(null, address);
		});
	}
}

function isPublicDomain(domain) {
	var parts = domain.split('.');
	if (parts[1] && tlds.indexOf(parts[1]) !== -1) {
		return true;
	}
	return false;
}

function isPortReachable(ip, port, cb) {
	cb = onetime(cb);

	var socket = new net.Socket();

	function onError () {
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
