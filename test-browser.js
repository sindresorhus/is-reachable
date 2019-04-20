// Need to test manually in devtools
// $ browserify test-browser.js > tmp.js
'use strict';
const isReachable = require('./browser');

(async () => {
	console.log('reachable', await isReachable('google.com'));
})();

(async () => {
	console.log('reachable', await isReachable('google.com:80'));
})();

(async () => {
	console.log('reachable', await isReachable('//google.com'));
})();

(async () => {
	console.log('reachable', await isReachable('https://google.com'));
})();

(async () => {
	console.log('not reachable', await isReachable('343645335341233123125235623452344123.com'));
})();

(async () => {
	console.log('not reachable', await isReachable('https://google.com/notfound.js'));
})();
