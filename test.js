'use strict';
var test = require('ava');
var isReachable = require('./');

test(function (t) {
	t.plan(3);

	isReachable('google.com', function (_, reachable) {
		t.true(reachable);
	});

	isReachable('google.com:80', function (_, reachable) {
		t.true(reachable);
	});

	isReachable('343645335341233123125235623452344123.com', function (_, reachable) {
		t.false(reachable);
	});
});
