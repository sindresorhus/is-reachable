import net from 'node:net';
import {withTimeout} from 'fetch-extras';
import isPortReachable from 'is-port-reachable';
import prependHttp from 'prepend-http';
import routerIps from 'router-ips';

const enhancedFetch = withTimeout(fetch, 30_000);

const isRedirectStatus = code => code === 301 || code === 302 || code === 303 || code === 307 || code === 308;

const stripBrackets = host =>
	host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;

const authorityFor = url => {
	const host = net.isIPv6(url.hostname) ? `[${url.hostname}]` : url.hostname;
	return url.port ? `${host}:${url.port}` : host;
};

const normalizedTarget = input => {
	const originallyHttp = input.startsWith('http://') || input.startsWith('https://');

	// IPv6 raw input must be bracketed to be URL-parsable when we prepend http
	const needsBrackets = !originallyHttp && net.isIPv6(input);
	const inputForUrl = needsBrackets ? `[${input}]` : input;

	const url = new URL(prependHttp(inputForUrl));
	return {url, originallyHttp};
};

const effectiveHttpUrlFor = (baseUrl, originallyHttp) => {
	const port = baseUrl.port ? Number(baseUrl.port) : (baseUrl.protocol === 'https:' ? 443 : 80);

	if (originallyHttp) {
		return baseUrl.href;
	}

	if (port === 80) {
		const authority = authorityFor(baseUrl);
		const path = `${baseUrl.pathname || '/'}${baseUrl.search || ''}`;
		return `http://${authority}${path}`;
	}

	if (port === 443) {
		const authority = authorityFor(baseUrl);
		const path = `${baseUrl.pathname || '/'}${baseUrl.search || ''}`;
		return `https://${authority}${path}`;
	}

	return null; // Not HTTP(S)
};

const redirectedToRouter = (response, requestUrlString) => {
	// When redirect: 'manual', 3xx keeps Location header (may be relative)
	if (!isRedirectStatus(response.status)) {
		return false;
	}

	const location = response.headers.get('location');
	if (!location) {
		return false;
	}

	const absolute = new URL(location, requestUrlString);
	const host = stripBrackets(absolute.hostname);
	return routerIps.has(host);
};

const checkHttpReachability = async (urlString, signal, requireHttpSuccess) => {
	// Prefer HEAD for speed, without auto-follow
	let head;
	try {
		head = await enhancedFetch(urlString, {method: 'HEAD', redirect: 'manual', signal});
	} catch {
		head = null;
	}

	if (head) {
		if (redirectedToRouter(head, urlString)) {
			return false;
		}

		// If HEAD is supported (not 405/501), treat any response as reachable unless strict success is required
		if (head.status !== 405 && head.status !== 501) {
			return requireHttpSuccess ? head.ok : true;
		}
	}

	// Fallback to GET, still without auto-follow to inspect redirects
	let get;
	try {
		get = await enhancedFetch(urlString, {redirect: 'manual', signal});
	} catch {
		get = null;
	}

	if (!get) {
		return false;
	}

	if (redirectedToRouter(get, urlString)) {
		return false;
	}

	return requireHttpSuccess ? get.ok : true;
};

const checkTarget = async (input, signal, requireHttpSuccess) => {
	const {url, originallyHttp} = normalizedTarget(input);

	// If it's HTTP(S), or if it's a bare host on 80/443, do HTTP probe
	const httpUrl = effectiveHttpUrlFor(url, originallyHttp);
	if (httpUrl) {
		return checkHttpReachability(httpUrl, signal, requireHttpSuccess);
	}

	// Non-HTTP(S) port: TCP probe
	const port = Number(url.port || 443);
	return isPortReachable(port, {host: url.hostname});
};

export default async function isReachable(destinations, {signal, requireHttpSuccess = false} = {}) {
	const targets = Array.isArray(destinations) ? destinations.flat() : [destinations];

	// Early abort support
	if (signal?.aborted) {
		return false;
	}

	const controller = new AbortController();
	const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

	try {
		const result = await Promise.any(targets.map(target => checkTarget(target, combined, requireHttpSuccess)));
		// Best-effort cancel remaining HTTP fetches
		controller.abort();
		return result;
	} catch {
		controller.abort();
		return false;
	}
}
