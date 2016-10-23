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

isReachable('sindresorhus.com').then(reachable => {
	console.log(reachable);
	//=> true
});

isReachable('google.com:80').then(reachable => {
	console.log(reachable);
	//=> true
});
```


## API

### isReachable(hosts)

Returns a `Promise` for a `boolean` which is `true` if any of the `hosts` are reachable.

#### hosts

Type: `string` `Array`

One or more [hosts](https://nodejs.org/api/url.html) to check.


## Contributors

- [silverwind](https://github.com/silverwind)


## Related

- [is-online](https://github.com/sindresorhus/is-online) - Check if the internet connection is up


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
