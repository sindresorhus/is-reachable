'use strict';
const {promisify} = require('util');
const dns = require('dns');
const net = require('net');
const arrify = require('arrify');
const got = require('got');
const isPortReachable = require('is-port-reachable');
const pAny = require('p-any');
const pTimeout = require('p-timeout');
const prependHttp = require('prepend-http');
const routerIps = require('router-ips');
const URL = require('url-parse');

const dnsLookupP = promisify(dns.lookup);

const checkHttp = async (url, timeout) => {
	let response;
	try {
		response = await got(url, {
			https: {
				rejectUnauthorized: false
			},
			timeout
		});
	} catch {
		return false;
	}

	if (response.headers && response.headers.location) {
		const url = new URL(response.headers.location);
		const hostname = url.hostname.replace(/^\[/, '').replace(/]$/, ''); // Strip [] from IPv6
		return !routerIps.has(hostname);
	}

	return true;
};

const getAddress = async hostname => net.isIP(hostname) ? hostname : (await dnsLookupP(hostname)).address;

const isTargetReachable = timeout => async target => {
	const isHTTP = target.startsWith('https://') || target.startsWith('http://');
	const url = new URL(prependHttp(target));

	if (!url.port && !isHTTP) {
		url.port = 443;
	}

	let address;
	try {
		address = await getAddress(url.hostname);
	} catch {
		return false;
	}

	if (!address || routerIps.has(address)) {
		return false;
	}

	if (isHTTP) {
		return checkHttp(url.toString(), timeout);
	}

	return isPortReachable(url.port, {host: address});
};

module.exports = async (destinations, {timeout = 5000} = {}) => {
	const promise = pAny(arrify(destinations).map(isTargetReachable(timeout)));

	try {
		return await pTimeout(promise, timeout);
	} catch {
		return false;
	}
};
