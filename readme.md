# is-reachable [![Build Status](https://travis-ci.org/sindresorhus/is-reachable.svg?branch=master)](https://travis-ci.org/sindresorhus/is-reachable)

> Check if servers are reachable

Works in Node.js and the browser *(with [browserify](http://browserify.org))*.


## Install

```
$ npm install --save is-reachable
```


## Usage

```js
const isReachable = require('is-reachable');

isReachable('sindresorhus.com', (err, reachable) => {
	console.log(reachable);
	//=> true
});

isReachable('google.com:80', (err, reachable) => {
	console.log(reachable);
	//=> true
});
```


## Node.js API

### isReachable(hosts, callback)

#### hosts

Type: `string`, `array`

One or more [hosts](https://nodejs.org/api/url.html) to check.

#### callback(error, reachable)

Type: `function`

`error` is there only by Node.js convention and is always `null`.

##### reachable

Type: `boolean`

Is `true` if *any* of the `hosts` are reachable.


## Browser API

Same as above except the `callback` doesn't have an `error` parameter.


## Contributors

- [silverwind](https://github.com/silverwind)


## Related

- [is-online](https://github.com/sindresorhus/is-online) - Check if the internet connection is up


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
