'use strict';
var dns = require('dns');
var eachAsync = require('each-async');
var onetime = require('onetime');
var arrify = require('arrify');
var isPortReachable = require('is-port-reachable');
var urlParseLax = require('url-parse-lax');

module.exports = function (hosts, cb) {
	cb = onetime(cb);

	eachAsync(arrify(hosts), function (host, i, done) {
		host = urlParseLax(host);

		dns.lookup(host.hostname, function (_, address) {
			// Ignore `err` as we only care about `address`.
			// Skip connecting if there is nothing to connect to.
			if (!address) {
				done();
				return;
			}

			isPortReachable(host.port || 80, {host: address}, function (_, reachable) {
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
