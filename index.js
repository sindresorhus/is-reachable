import net from 'node:net';
import {withTimeout} from 'fetch-extras';
import isPortReachable from 'is-port-reachable';
import prependHttp from 'prepend-http';

const enhancedFetch = withTimeout(fetch, 30_000);

const parseTarget = input => {
	const isExplicitHttp = input.startsWith('http://') || input.startsWith('https://');

	// Handle IPv6 addresses that need brackets for URL parsing
	const normalizedInput = !isExplicitHttp && net.isIPv6(input) ? `[${input}]` : input;

	// Bare IP addresses without a protocol should default to HTTP since IPs rarely have valid SSL certificates
	const isBareIp = !isExplicitHttp && (net.isIPv6(input) || net.isIPv4(input.split(':')[0]));
	const withProtocol = isBareIp
		? `http://${normalizedInput}`
		: prependHttp(normalizedInput);
	const url = new URL(withProtocol);

	return {url, isExplicitHttp};
};

const buildHttpUrl = (url, isExplicitHttp) => {
	if (isExplicitHttp) {
		return url.href;
	}

	const port = url.port ? Number(url.port) : (url.protocol === 'https:' ? 443 : 80);

	// Only treat standard ports as HTTP(S)
	if (port === 80 || port === 443) {
		const protocol = port === 443 ? 'https:' : 'http:';
		const host = net.isIPv6(url.hostname) ? `[${url.hostname}]` : url.hostname;
		return `${protocol}//${host}${url.pathname}${url.search}`;
	}

	return null; // Not an HTTP(S) target
};

const checkHttp = async (url, signal, requireHttpSuccess) => {
	// Don't follow redirects — any HTTP response (including 3xx) means the server is reachable.
	const fetchOptions = {redirect: 'manual', signal};

	// Try HEAD first for better performance
	try {
		const response = await enhancedFetch(url, {method: 'HEAD', ...fetchOptions});

		// HEAD is supported, use this response
		if (response.status !== 405 && response.status !== 501) {
			return requireHttpSuccess ? response.ok : true;
		}
	} catch {
		// HEAD request failed, will try GET below
	}

	// Fallback to GET
	try {
		const response = await enhancedFetch(url, fetchOptions);
		return requireHttpSuccess ? response.ok : true;
	} catch {
		return false;
	}
};

const checkTarget = async (input, signal, requireHttpSuccess) => {
	try {
		const {url, isExplicitHttp} = parseTarget(input);

		// Check if this should be treated as HTTP(S)
		const httpUrl = buildHttpUrl(url, isExplicitHttp);
		if (httpUrl) {
			return checkHttp(httpUrl, signal, requireHttpSuccess);
		}

		// Non-HTTP port: use TCP probe
		const port = Number(url.port || 443);
		return isPortReachable(port, {host: url.hostname});
	} catch {
		return false;
	}
};

export default async function isReachable(destinations, {signal, requireHttpSuccess = false} = {}) {
	const targets = Array.isArray(destinations) ? destinations.flat() : [destinations];

	if (signal?.aborted) {
		return false;
	}

	const controller = new AbortController();
	const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

	try {
		// Use Promise.any correctly: only resolve true, reject false
		await Promise.any(targets.map(async target => {
			const isReachable = await checkTarget(target, combinedSignal, requireHttpSuccess);
			if (isReachable) {
				return true;
			}

			throw new Error('not reachable');
		}));

		controller.abort();
		return true;
	} catch {
		controller.abort();
		return false;
	}
}
