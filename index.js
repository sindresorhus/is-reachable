'use strict';
const dns = require('dns');
const url = require('url');
const arrify = require('arrify');
const isPortReachable = require('is-port-reachable');
const routerIps = require('router-ips');
const urlParseLax = require('url-parse-lax');
const got = require('got');
const pify = require('pify');
const pAny = require('p-any');

const checkRedirection = (host, port) => {
	const protocol = port === 80 ? 'http:' : 'https:';

	return got(host, {protocol}).then(res => {
		const redirectHost = url.parse(res.headers.location || '').host;

		if (routerIps.has(redirectHost)) {
			return false;
		}

		return true;
	});
};

module.exports = dests => {
	return pAny(arrify(dests).map(x => {
		x = urlParseLax(x);

		const host = x.hostname;
		const port = x.port || 80;

		return pify(dns.lookup)(host).then(address => {
			if (!address) {
				return false;
			}

			if (routerIps.has(address)) {
				return false;
			}

			if (port === 80 || port === 443) {
				return checkRedirection(host, port);
			}

			return isPortReachable(port, {host: address});
		});
	})).catch(() => false);
};
