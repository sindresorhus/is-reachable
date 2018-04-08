import dns from 'dns';
import pify from 'pify';
import test from 'ava';
import m from '.';

test('hostname', async t => {
	t.true(await m('google.com'));
});

test('hostname and port', async t => {
	t.true(await m('google.com:443'));
});

test('ip', async t => {
	t.true(await m(await pify(dns.resolve)('google.com')));
});

test('ip and protocol', async t => {
	t.true(await m(`https://${await pify(dns.lookup)('google.com')}`));
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

test('unreachable hostname', async t => {
	t.false(await m('343645335341233123125235623452344123.com'));
});

test('unreachable pathname', async t => {
	t.false(await m('https://google.com/notfound.js'));
});

test('with timeout', async t => {
	t.true(await m('https://google.com', {timeout: 3000}));
});

test('with impossible timeout', async t => {
	t.false(await m('https://google.com', {timeout: 1}));
});
