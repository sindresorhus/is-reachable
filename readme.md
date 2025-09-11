# is-reachable

> Check if servers are reachable

Works in Node.js and the browser *(with a bundler)*.

The Node.js version will do a TCP handshake with the target's port. For HTTP/HTTPS URLs, it uses HEAD requests first (for better performance and bandwidth efficiency), falling back to GET requests if HEAD is not supported. It attempts to detect cases where a router redirects the request to itself.

The browser version is limited by the fact that browsers cannot connect to arbitrary ports. It only supports HTTP and HTTPS and tries to load common favicon paths (`/favicon.ico`, `/favicon.png`, `/favicon.svg`, `/apple-touch-icon.png`, `/apple-touch-icon-precomposed.png`) to determine reachability. The browser version does not support the `requireHttpSuccess` option and will only return `true` if the favicon files load successfully (equivalent to `requireHttpSuccess: true`).

> [!IMPORTANT]
> By default, any HTTP response (including 404, 401, 403, 500, etc.) is considered “reachable” since it proves the server is responding. This aligns with the network-level definition of reachability. Use the `requireHttpSuccess` option if you need to check for successful responses only.

## Install

```sh
npm install is-reachable
```

## Usage

```js
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

## API

### isReachable(targets, options?)

Returns a `Promise<boolean>` which is `true` if any of the `targets` are reachable.

#### targets

Type: `string | string[]`

One or more targets to check. Can either be `hostname:port`, a URL like `https://hostname:port` or even just `hostname`. `port` must be specified if protocol is not `http:` or `https:` and defaults to `443`. Protocols other than `http:` and `https:` are not supported.

#### options

Type: `object`

##### signal

Type: `AbortSignal`

An `AbortSignal` to cancel the requests.

You can use `AbortSignal.timeout()` to create a signal that automatically aborts after a specified time:

```js
await isReachable('sindresorhus.com', {
	signal: AbortSignal.timeout(3000)
});
```

Or combine multiple signals using `AbortSignal.any()`:

```js
const controller = new AbortController();
const timeoutSignal = AbortSignal.timeout(5000);

await isReachable('example.com', {
	signal: AbortSignal.any([controller.signal, timeoutSignal])
});
```

##### requireHttpSuccess

Type: `boolean`\
Default: `false`

Only consider the server reachable if it returns a successful HTTP status code (200-299).

When `false` (default), any HTTP response (including 4xx and 5xx) is considered reachable, as it proves the server is responding. This aligns with the network-level definition of "reachability".

When `true`, only successful HTTP responses (2xx status codes) are considered reachable, which is useful for application health checks.

## Related

- [is-online](https://github.com/sindresorhus/is-online) - Check if the internet connection is up

## Maintainers

- [Sindre Sorhus](https://github.com/sindresorhus)
- [silverwind](https://github.com/silverwind)
