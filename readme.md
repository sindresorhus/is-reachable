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

	console.log(await isReachable('google.com:80'));
	//=> true
})();
```


## API

### isReachable(targets, [options])

Returns a `Promise<boolean>` which is `true` if any of the `targets` are reachable.

#### targets

Type: `string | string[]`

One or more targets to check. Can either be a full [URL](https://nodejs.org/api/url.html) like `https://hostname`, `hostname:port` or just `hostname`. When the protocol is missing from a target `http` is assumed.

[Well-known protocols][] are supported (for example: `ftp://`, `mysql://`, `redis://` and more).

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


## License

MIT

[Well-known protocols]: https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml
