'use strict';
var dns = require('dns');
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');
var isPublicDomain = require('is-public-domain');
var isPortReachable = require('is-port-reachable');
var ip = require('ip');

module.exports = function (hostnames, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hostnames), function (hostname, i, done) {
		dns.lookup(hostname, function (_, address) {
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

			isPortReachable(80, {host: address}, function (_, reachable) {
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
