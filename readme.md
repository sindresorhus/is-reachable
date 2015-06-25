# is-reachable [![Build Status](https://travis-ci.org/sindresorhus/is-reachable.svg?branch=master)](https://travis-ci.org/sindresorhus/is-reachable)

> Check if servers are reachable

Works in Node.js and the browser *(with [browserify](http://browserify.org))*.


## Install

```
$ npm install --save is-reachable
```


## Usage

```js
var isReachable = require('is-reachable');

isReachable('sindresorhus.com', function (err, reachable) {
	console.log(reachable);
	//=> true
});
```


## Node.js API

### isReachable(hostnames, callback)

#### hostnames

Type: `string`, `array`

One or more [hostnames](https://en.wikipedia.org/wiki/Hostname) to check.

#### callback(error, reachable)

Type: `function`

`error` is there only by Node.js convention and is always `null`.

##### reachable

Type: `boolean`

Is `true` if *any* of the `hostnames` are reachable.


## Browser API

Same as above except the `callback` doesn't have an `error` parameter.


## Contributors

- [silverwind](https://github.com/silverwind)


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
