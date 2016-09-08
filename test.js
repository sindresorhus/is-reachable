import test from 'ava';
import m from './';

test('main', async t => {
	t.true(await m('google.com'));
});

test('port', async t => {
	t.true(await m('google.com:80'));
});

test('unreachable', async t => {
	t.false(await m('343645335341233123125235623452344123.com'));
});
