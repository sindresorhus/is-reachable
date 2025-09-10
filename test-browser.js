// Need to test manually in devtools
// $ browserify test-browser.js > tmp.js
import isReachable from './browser.js';

console.log('reachable', await isReachable('google.com'));
console.log('reachable', await isReachable('google.com:80'));
console.log('reachable', await isReachable('//google.com'));
console.log('reachable', await isReachable('https://google.com'));
console.log('not reachable', await isReachable('343645335341233123125235623452344123.com'));
console.log('not reachable', await isReachable('https://google.com/notfound.js'));
