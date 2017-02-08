// need to test manually in devtools
// $ browserify test-browser.js > tmp.js
'use strict';
const isReachable = require('./browser');

isReachable('google.com').then(reachable => {
	console.log('reachable', reachable);
});

isReachable('google.com:80').then(reachable => {
	console.log('reachable', reachable);
});

isReachable('//google.com').then(reachable => {
	console.log('reachable', reachable);
});

isReachable('https://google.com').then(reachable => {
	console.log('reachable', reachable);
});

isReachable('343645335341233123125235623452344123.com').then(reachable => {
	console.log('not reachable', reachable);
});

isReachable('https://google.com/notfound.js').then(reachable => {
	console.log('not reachable', reachable);
});
