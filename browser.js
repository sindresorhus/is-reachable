/* eslint-env browser */
/* global Image */
import prependHttp from 'prepend-http';

const faviconPaths = [
	'/favicon.ico',
	'/favicon.png',
	'/favicon.svg',
	'/apple-touch-icon.png',
	'/apple-touch-icon-precomposed.png',
];

const checkSinglePath = (baseUrl, path, signal) => new Promise(resolve => {
	const image = new Image();

	const cleanup = result => {
		resolve(result);
	};

	// Handle abort signal
	if (signal) {
		signal.addEventListener('abort', () => cleanup(false), {once: true});
	}

	image.addEventListener('load', () => cleanup(true));
	image.addEventListener('error', () => cleanup(false));
	image.src = `${baseUrl}${path}?${Date.now()}`;
});

const checkTarget = async (target, signal) => {
	const url = new URL(prependHttp(target));
	const {hostname, protocol = '', port} = url;
	const portSuffix = port ? `:${port}` : '';
	const baseUrl = `${protocol}//${hostname}${portSuffix}`;

	// Try all favicon paths concurrently, return true if any succeeds
	const pathPromises = faviconPaths.map(path => checkSinglePath(baseUrl, path, signal));

	try {
		await Promise.any(pathPromises);
		return true;
	} catch {
		// All paths failed
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
