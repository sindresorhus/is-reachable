/* eslint-env browser */
/* global Image */
import prependHttp from 'prepend-http';

const checkTarget = (target, signal) => new Promise(resolve => {
	const url = new URL(prependHttp(target));
	const {hostname, protocol = '', port} = url;
	const portSuffix = port ? `:${port}` : '';

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
	image.src = `${protocol}//${hostname}${portSuffix}/favicon.ico?${Date.now()}`;
});

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
