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

const checkSinglePath = (origin, path, signal) => new Promise(resolve => {
	let done = false;
	const image = new Image();

	const finalize = result => {
		if (done) {
			return;
		}

		done = true;
		image.removeEventListener('load', onLoad);
		image.removeEventListener('error', onError);
		signal?.removeEventListener?.('abort', onAbort);

		// Stop the request if still pending
		try {
			image.src = '';
		} catch {}

		resolve(result);
	};

	const onLoad = () => finalize(true);
	const onError = () => finalize(false);
	const onAbort = () => finalize(false);

	if (signal) {
		signal.addEventListener('abort', onAbort, {once: true});
	}

	image.addEventListener('load', onLoad, {once: true});
	image.addEventListener('error', onError, {once: true});
	image.src = `${origin}${path}?${Date.now()}`;
});

const checkTarget = async (input, signal) => {
	const url = new URL(prependHttp(input));
	const {origin} = url;

	const probes = faviconPaths.map(path => checkSinglePath(origin, path, signal));

	try {
		await Promise.any(probes);
		return true;
	} catch {
		return false;
	}
};

export default async function isReachable(destinations, {signal} = {}) {
	const targets = Array.isArray(destinations) ? destinations.flat() : [destinations];

	try {
		return await Promise.any(targets.map(target => checkTarget(target, signal)));
	} catch {
		return false;
	}
}
