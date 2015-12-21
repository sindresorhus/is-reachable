'use strict';
var dns = require('dns');
var arrify = require('arrify');
var eachAsync = require('each-async');
var isPortReachable = require('is-port-reachable');
var onetime = require('onetime');
var routerIps = require('router-ips');
var url = require('url');
var urlParseLax = require('url-parse-lax');

module.exports = function (dests, cb) {
	cb = onetime(cb);

	eachAsync(arrify(dests), function (dest, i, done) {
		dest = urlParseLax(dest);

		var host = dest.hostname;
		var port = dest.port || 80;

		dns.lookup(host, function (_, address) {
			// Ignore `err` as we only care about `address`.
			// Skip connecting if there is nothing to connect to.
			if (!address) {
				done();
				return;
			}

			// When the returned address is a well-known router ip, we might
			// have been redirected to a router's captive portal.
			if (routerIps.indexOf(address) !== -1) {
				done();
				return;
			}

			if (port === 80 || port === 443) {
				// Try to detect HTTP redirection by checking if the `Location`
				// header contains a well-known router ip.
				// https://github.com/sindresorhus/is-reachable/issues/3#issuecomment-138735338
				require(port === 80 ? 'http' : 'https').get({host: host}, function (res) {
					var redirectHost = url.parse(res.headers.location || '').host;
					if (routerIps.indexOf(redirectHost) === -1) {
						cb(null, true);

						// skip to end
						done(new Error());
					} else {
						done();
					}
				}).on('error', function () {
					done();
				});
			} else {
				// Just test if the port answers to a SYN
				isPortReachable(port, {host: address}, function (_, reachable) {
					if (reachable) {
						cb(null, true);

						// skip to end
						done(new Error());
					} else {
						done();
					}
				});
			}
		});
	}, function () {
		cb(null, false);
	});
};
