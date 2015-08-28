// need to test manually in devtools
// $ browserify test-browser.js > tmp.js
'use strict';
var isReachable = require('./browser');

isReachable('google.com', function (reachable) {
	console.log('reachable', reachable);
});

isReachable('google.com:80', function (reachable) {
	console.log('reachable', reachable);
});

isReachable('343645335341233123125235623452344123.com', function (reachable) {
	console.log('not reachable', reachable);
});
