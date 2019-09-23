# is-reachable [![Build Status](https://travis-ci.org/sindresorhus/is-reachable.svg?branch=master)](https://travis-ci.org/sindresorhus/is-reachable)

> Check if servers are reachable

Works in Node.js and the browser *(with a bundler)*.

The Node.js version will do a TCP handshake with the target's port. It attempts to detect cases where a router redirects the request to itself.

The browser version is limited by the fact that browsers cannot connect to arbitrary ports. It only supports HTTP and HTTPS and the check relies on the `/favicon.ico` path being present.


## Install

```
$ npm install is-reachable
```


## Usage

```js
const isReachable = require('is-reachable');

(async () => {
	console.log(await isReachable('sindresorhus.com'));
	//=> true

	console.log(await isReachable('google.com:443'));
	//=> true
})();
```


## API

### isReachable(targets, options?)

Returns a `Promise<boolean>` which is `true` if any of the `targets` are reachable.

#### targets

Type: `string | string[]`

One or more targets to check. Can either be `hostname:port`, a URL like `https://hostname:port` or even just `hostname`. `port` must be specified if protocol is not `http:` or `https:` and defaults to `443`. Protocols other than `http:` and `https:` are not supported.

#### options

Type: `object`

##### timeout

Type: `number`<br>
Default: `5000`

Timeout in milliseconds after which a request is considered failed.


## Related

- [is-online](https://github.com/sindresorhus/is-online) - Check if the internet connection is up


## Maintainers

- [Sindre Sorhus](https://github.com/sindresorhus)
- [silverwind](https://github.com/silverwind)
