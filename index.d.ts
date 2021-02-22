declare namespace isReachable {
	interface Options {
		/**
		Timeout in milliseconds after which a request is considered failed.

		@default 5000

		_Node.js only_
		*/
		readonly timeout?: number;
	}
}

/**
Check if servers are reachable.

The Node.js version will do a TCP handshake with the target's port. It attempts to detect cases where a router redirects the request to itself.

The browser version is limited by the fact that browsers cannot connect to arbitrary ports. It only supports HTTP and HTTPS and the check relies on the `/favicon.ico` path being present.

@param targets - One or more targets to check. Can either be `hostname:port`, a URL like `https://hostname:port` or even just `hostname`. `port` must be specified if protocol is not `http:` or `https:` and defaults to `443`. Protocols other than `http:` and `https:` are not supported.
@returns Whether any of the `targets` are reachable.

@example
```
import isReachable = require('is-reachable');

(async () => {
	console.log(await isReachable('sindresorhus.com'));
	//=> true

	console.log(await isReachable('google.com:80'));
	//=> true
})();
```
*/
declare function isReachable(
	targets: string | readonly string[],
	options?: isReachable.Options
): Promise<boolean>;

export = isReachable;
