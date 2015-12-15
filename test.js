import test from 'ava';
import fn from './';

test.cb('main', t => {
	fn('google.com', (_, reachable) => {
		t.true(reachable);
		t.end();
	});
});

test.cb('port', t => {
	fn('google.com:80', (_, reachable) => {
		t.true(reachable);
		t.end();
	});
});

test.cb('unreachable', t => {
	fn('343645335341233123125235623452344123.com', (_, reachable) => {
		t.false(reachable);
		t.end();
	});
});
