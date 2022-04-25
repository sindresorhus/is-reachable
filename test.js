import {promisify} from 'util';
import dns from 'dns';
import http from 'http';
import test from 'ava';
import isReachable from '.';

const dnsResolveP = promisify(dns.resolve);
const dnsLookupP = promisify(dns.lookup);

test('hostname', async t => {
	t.true(await isReachable('google.com'));
});

test('hostname and port', async t => {
	t.true(await isReachable('google.com:443'));
});

test('ip', async t => {
	t.true(await isReachable(await dnsResolveP('google.com')));
});

test('ip and protocol', async t => {
	t.true(await isReachable(`https://${(await dnsLookupP('google.com')).address}`));
});

test('multiple https urls', async t => {
	t.true(await isReachable(['https://google.com', 'https://baidu.com']));
});

test('http server on custom port', async t => {
	const server = http.createServer((_, response) => {
		response.writeHead(200).end();
	}).listen(8080);
	t.true(await isReachable('http://localhost:8080'));
	server.close();
});

test('unreachable http server on custom port', async t => {
	t.false(await isReachable('http://localhost:8081'));
});

test('imap host and port', async t => {
	t.true(await isReachable('imap.gmail.com:995'));
});

test('unreachable hostname', async t => {
	t.false(await isReachable('343645335341233123125235623452344123.local'));
});

test('unknown service', async t => {
	t.false(await isReachable('343645335341233123125235623452344123.local:-1'));
});

test('unreachable pathname', async t => {
	t.false(await isReachable('https://google.com/notfound.js'));
});

test('with timeout', async t => {
	t.true(await isReachable('https://google.com', {timeout: 3000}));
});

test('with impossible timeout', async t => {
	t.false(await isReachable('https://google.com', {timeout: 1}));
});
