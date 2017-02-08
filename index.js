'use strict';
const dns = require('dns');
const arrify = require('arrify');
const got = require('got');
const isPortReachable = require('is-port-reachable');
const pAny = require('p-any');
const pify = require('pify');
const pn = require('port-numbers');
const prependHttp = require('prepend-http');
const routerIps = require('router-ips');
const URL = require('url-parse');

const checkRedirection = url => {
	return new Promise(resolve => {
		got(url).then(res => {
			const redirectHostname = (new URL(res.headers.location || '')).hostname;

			if (routerIps.has(redirectHostname)) {
				resolve(false);
			}

			resolve(true);
		}).catch(() => resolve(false));
	});
};

function isTargetReachable(url) {
	return new Promise(resolve => {
		const uri = new URL(prependHttp(url));
		const hostname = uri.hostname;
		let protocol = uri.protocol;
		const port = Number(uri.port) || pn.getPort(protocol.slice(0, -1)).port || 80;

		if (!/^[a-z]+:\/\//.test(url) && port !== 80 && port !== 443) {
			protocol = pn.getService(port).name + ':';
		}

		pify(dns.lookup)(hostname).then(address => {
			if (!address) {
				resolve(false);
			}

			if (routerIps.has(address)) {
				resolve(false);
			}

			if (protocol === 'http:' || protocol === 'https:') {
				checkRedirection(url).then(resolve);
			} else {
				isPortReachable(port, {host: address}).then(resolve);
			}
		}).catch(() => resolve(false));
	});
}

module.exports = (dests, opts) => {
	opts = opts || {};
	opts.timeout = typeof opts.timeout === 'number' || 5000;

	return new Promise(resolve => {
		setTimeout(() => resolve(false), opts.timeout);
		pAny(arrify(dests).map(isTargetReachable)).then(resolve);
	});
};
