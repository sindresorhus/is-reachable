declare namespace isReachable {
	type Options = {
		/**
		An `AbortSignal` to cancel the requests.

		You can use `AbortSignal.timeout()` to create a signal that aborts after a specified time.

		@example
		```
		import isReachable from 'is-reachable';

		// With timeout
		await isReachable('sindresorhus.com', {
			signal: AbortSignal.timeout(3000)
		});
		```

		Or combine multiple signals using `AbortSignal.any()`:

		@example
		```
		const controller = new AbortController();
		const timeoutSignal = AbortSignal.timeout(5000);

		await isReachable('example.com', {
			signal: AbortSignal.any([controller.signal, timeoutSignal])
		});
		```
		*/
		readonly signal?: AbortSignal | undefined;

		/**
		Only consider the server reachable if it returns a successful HTTP status code (200-299).

		@default false

		When `false` (default), any HTTP response (including 4xx and 5xx) is considered reachable, as it proves the server is responding. This aligns with the network-level definition of "reachability".

		When `true`, only successful HTTP responses (2xx status codes) are considered reachable, which is useful for application health checks.

		@note This option is not supported in browsers. The browser version always behaves as if this option is `true`.
		*/
		readonly requireHttpSuccess?: boolean;
	};
}

/**
Check if servers are reachable.

The Node.js version uses HTTP HEAD/GET requests for HTTP(S) URLs and TCP connections for other ports.

The browser version is limited by the fact that browsers cannot connect to arbitrary ports. It only supports HTTP and HTTPS and the check relies on favicon paths being present. The browser version does not support the `requireHttpSuccess` option.

**Note:** By default, any HTTP response (including 4xx and 5xx) is considered "reachable" since it proves the server is responding. Use `requireHttpSuccess: true` if you need to check for successful responses only.

@param targets - One or more targets to check. Can either be `hostname:port`, an IP address like `1.2.3.4` or `1.2.3.4:port`, a URL like `https://hostname:port`, or even just `hostname`. `port` must be specified if protocol is not `http:` or `https:` and defaults to `443`. Protocols other than `http:` and `https:` are not supported. Bare IP addresses default to HTTP.
@returns Whether any of the `targets` are reachable.

@example
```
import isReachable from 'is-reachable';

console.log(await isReachable('sindresorhus.com'));
//=> true

console.log(await isReachable('google.com:443'));
//=> true

// With timeout
console.log(await isReachable('sindresorhus.com', {
	signal: AbortSignal.timeout(3000)
}));
//=> true
```
*/
declare function isReachable(
	targets: string | readonly string[],
	options?: isReachable.Options
): Promise<boolean>;

export default isReachable;
