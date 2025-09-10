import {promisify} from 'node:util';
import dns from 'node:dns';
import http from 'node:http';
import {test} from 'node:test';
import assert from 'node:assert';
import isReachable from './index.js';

const dnsResolveP = promisify(dns.resolve);
const dnsLookupP = promisify(dns.lookup);

test('hostname', async () => {
	assert.ok(await isReachable('google.com'));
});

test('hostname and port', async () => {
	assert.ok(await isReachable('google.com:443'));
});

test('ip', async () => {
	assert.ok(await isReachable(await dnsResolveP('google.com')));
});

test('ip and protocol', async () => {
	const dnsResult = await dnsLookupP('google.com');
	assert.ok(await isReachable(`https://${dnsResult.address}`));
});

test('multiple https urls', async () => {
	assert.ok(await isReachable(['https://google.com', 'https://baidu.com']));
});

test('http server on custom port', async () => {
	const server = http.createServer((_, response) => {
		response.writeHead(200).end();
	}).listen(8080);
	assert.ok(await isReachable('http://localhost:8080'));
	server.close();
});

test('unreachable http server on custom port', async () => {
	assert.ok(!(await isReachable('http://localhost:8081')));
});

test('imap host and port', async () => {
	assert.ok(await isReachable('imap.gmail.com:995'));
});

test('unreachable hostname', async () => {
	assert.ok(!(await isReachable('343645335341233123125235623452344123.local')));
});

test('unknown service', async () => {
	assert.ok(!(await isReachable('343645335341233123125235623452344123.local:-1')));
});

test('unreachable pathname', async () => {
	assert.ok(!(await isReachable('https://google.com/notfound.js')));
});

test('with timeout', async () => {
	assert.ok(await isReachable('https://google.com', {signal: AbortSignal.timeout(3000)}));
});

test('with impossible timeout', async () => {
	assert.ok(!(await isReachable('https://google.com', {signal: AbortSignal.timeout(1)})));
});
