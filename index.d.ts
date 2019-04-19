declare namespace isReachable {
	interface Options {
		/**
		Timeout in milliseconds after which a request is considered failed.

		@default 5000
		*/
		readonly timeout?: number;
	}
}

/**
Check if servers are reachable.

The Node.js version will do a TCP handshake with the target's port. It attempts to detect cases where a router redirects the request to itself.

The browser version is limited by the fact that browsers cannot connect to arbitrary ports. It only supports HTTP and HTTPS and the check relies on the `/favicon.ico` path being present.

@param targets - One or more targets to check. Can either be a full [URL](https://nodejs.org/api/url.html) like `https://hostname`, `hostname:port` or just `hostname`. When the protocol is missing from a target `http` is assumed. [Well-known protocols](http://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml) are supported (e.g. `ftp://`, `mysql://`, `redis://` and more).
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
