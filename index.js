'use strict';
const {promisify} = require('util');
const dns = require('dns');
const net = require('net');
const arrify = require('arrify');
const got = require('got');
const isPortReachable = require('is-port-reachable');
const pAny = require('p-any');
const portNumbers = require('port-numbers');
const pTimeout = require('p-timeout');
const prependHttp = require('prepend-http');
const routerIps = require('router-ips');
const URL = require('url-parse');

const dnsLookupP = promisify(dns.lookup);

const checkRedirection = async target => {
	let response;
	try {
		response = await got(target, {rejectUnauthorized: false});
	} catch (_) {
		return false;
	}

	const url = new URL(response.headers.location || 'x://x');
	return !routerIps.has(url.hostname);
};

const getAddress = async hostname => net.isIP(hostname) ? hostname : (await dnsLookupP(hostname)).address;

const isTargetReachable = async target => {
	const url = new URL(prependHttp(target));
	url.port = Number(url.port) || portNumbers.getPort(url.protocol.slice(0, -1)).port || 80;

	if (!/^[a-z]+:\/\//.test(target)) {
		const service = portNumbers.getService(url.port);
		url.protocol = ((service && service.name) ? service.name : 'unknown') + ':';
	}

	let address;
	try {
		address = await getAddress(url.hostname);
	} catch (_) {
		return false;
	}

	if (!address || routerIps.has(address)) {
		return false;
	}

	if (url.protocol === 'http:' || url.protocol === 'https:') {
		return checkRedirection(url.toString());
	}

	return isPortReachable(url.port, {host: address});
};

module.exports = async (destinations, options) => {
	options = {...options};
	options.timeout = typeof options.timeout === 'number' ? options.timeout : 5000;

	const promise = pAny(arrify(destinations).map(isTargetReachable));
	return pTimeout(promise, options.timeout).catch(() => false);
};
