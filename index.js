import {promisify} from 'node:util';
import dns from 'node:dns';
import net from 'node:net';
import {withTimeout} from 'fetch-extras';
import isPortReachable from 'is-port-reachable';
import prependHttp from 'prepend-http';
import routerIps from 'router-ips';

const dnsLookup = promisify(dns.lookup);

const getDefaultPort = protocol => protocol === 'http:' ? 80 : 443;

// Use reasonable default timeout (30 seconds) while still respecting user AbortSignal
const enhancedFetch = withTimeout(fetch, 30_000);

const normalizeTarget = target => {
	const isHttp = target.startsWith('https://') || target.startsWith('http://');
	// IPv6 addresses need brackets in URLs
	const normalizedTarget = !isHttp && net.isIPv6(target) ? `[${target}]` : target;
	return new URL(prependHttp(normalizedTarget));
};

const resolveAddress = async hostname => {
	if (net.isIP(hostname)) {
		return hostname;
	}

	const {address} = await dnsLookup(hostname);
	return address;
};

const checkHttpReachability = async (url, signal) => {
	try {
		// Try HEAD request first for better performance and bandwidth efficiency
		const headResponse = await enhancedFetch(url, {method: 'HEAD', signal});

		// Check for redirects to router IPs (captive portal detection)
		const location = headResponse.headers.get('location');
		if (location) {
			const {hostname} = new URL(location);
			// Strip brackets from IPv6 addresses
			const cleanHostname = hostname.replace(/^\[/, '').replace(/]$/, '');
			return !routerIps.has(cleanHostname);
		}

		// If HEAD succeeded or failed with a definitive status, use that result
		if (headResponse.ok || (headResponse.status !== 405 && headResponse.status !== 501)) {
			return headResponse.ok;
		}

		// HEAD not supported (405/501), fall back to GET request
		const getResponse = await enhancedFetch(url, {signal});

		// Check for redirects to router IPs again for GET request
		const getLocation = getResponse.headers.get('location');
		if (getLocation) {
			const {hostname} = new URL(getLocation);
			// Strip brackets from IPv6 addresses
			const cleanHostname = hostname.replace(/^\[/, '').replace(/]$/, '');
			return !routerIps.has(cleanHostname);
		}

		return getResponse.ok;
	} catch {
		return false;
	}
};

const checkTarget = async (target, signal) => {
	try {
		const url = normalizeTarget(target);
		const port = Number(url.port || getDefaultPort(url.protocol));

		const address = await resolveAddress(url.hostname);

		// Check if router IP (captive portal detection)
		if (routerIps.has(address)) {
			return false;
		}

		// HTTP/HTTPS check
		if (url.protocol === 'https:' || url.protocol === 'http:') {
			return checkHttpReachability(url.href, signal);
		}

		// TCP port check for non-HTTP protocols
		return isPortReachable(port, {host: address});
	} catch {
		return false;
	}
};

export default async function isReachable(destinations, {signal} = {}) {
	const targets = Array.isArray(destinations) ? destinations.flat() : [destinations];
	const promises = targets.map(target => checkTarget(target, signal));

	try {
		return await Promise.any(promises);
	} catch {
		// Promise.any throws AggregateError when all promises reject
		return false;
	}
}
