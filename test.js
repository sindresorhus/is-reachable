import test from 'ava';
import m from './';

test('hostname', async t => {
	t.true(await m('google.com'));
});

test('hostname and port', async t => {
	t.true(await m('google.com:80'));
});

test('multiple https urls', async t => {
	t.true(await m(['https://google.com', 'https://baidu.com']));
});

test('ftp host and port', async t => {
	t.true(await m('speedtest.tele2.net:21'));
});

test('ftp url', async t => {
	t.true(await m('ftp://speedtest.tele2.net'));
});

test('unreachable', async t => {
	t.false(await m('343645335341233123125235623452344123.com'));
});
