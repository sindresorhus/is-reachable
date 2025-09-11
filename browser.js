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

const checkPath = (origin, path, signal) => new Promise(resolve => {
	let settled = false;
	const image = new Image();

	const settle = result => {
		if (settled) {
			return;
		}

		settled = true;

		image.removeEventListener('load', onLoad);
		image.removeEventListener('error', onError);
		signal?.removeEventListener('abort', onAbort);

		// Stop pending request
		try {
			image.src = '';
		} catch {}

		resolve(result);
	};

	const onLoad = () => settle(true);
	const onError = () => settle(false);
	const onAbort = () => settle(false);

	if (signal) {
		signal.addEventListener('abort', onAbort, {once: true});
	}

	image.addEventListener('load', onLoad, {once: true});
	image.addEventListener('error', onError, {once: true});
	image.src = `${origin}${path}?${Date.now()}`;
});

const checkTarget = async (input, signal) => {
	try {
		const url = new URL(prependHttp(input));
		const probes = faviconPaths.map(path => checkPath(url.origin, path, signal));

		// Use Promise.any correctly: only resolve true, reject false
		await Promise.any(probes.map(async probe => {
			const result = await probe;
			if (result) {
				return true;
			}

			throw new Error('not reachable');
		}));

		return true;
	} catch {
		return false;
	}
};

export default async function isReachable(destinations, {signal} = {}) {
	const targets = Array.isArray(destinations) ? destinations.flat() : [destinations];

	try {
		// Use Promise.any correctly: only resolve true, reject false
		await Promise.any(targets.map(async target => {
			const result = await checkTarget(target, signal);
			if (result) {
				return true;
			}

			throw new Error('not reachable');
		}));

		return true;
	} catch {
		return false;
	}
}
