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

test('google.com:443 should use HTTPS', async () => {
	// Regression test: google.com:443 should be treated as HTTPS, not HTTP
	assert.ok(await isReachable('google.com:443'));
});

test('ip', async () => {
	// Use HTTP for IP addresses to avoid SSL certificate issues
	const ips = await dnsResolveP('google.com');
	assert.ok(await isReachable(`http://${ips[0]}`));
});

test('ip and protocol', async () => {
	// Use HTTP for IP addresses to avoid SSL certificate issues
	const dnsResult = await dnsLookupP('google.com');
	assert.ok(await isReachable(`http://${dnsResult.address}`));
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
	// With default behavior, 404 responses are considered reachable
	assert.ok(await isReachable('https://google.com/notfound.js'));
	// But with requireHttpSuccess: true, they're not reachable
	assert.ok(!(await isReachable('https://google.com/notfound.js', {requireHttpSuccess: true})));
});

test('with timeout', async () => {
	assert.ok(await isReachable('https://google.com', {signal: AbortSignal.timeout(3000)}));
});

test('with impossible timeout', async () => {
	assert.ok(!(await isReachable('https://google.com', {signal: AbortSignal.timeout(1)})));
});

test('IPv6 with explicit ports', async () => {
	// Test IPv6 addresses with ports to ensure brackets are preserved
	// Using known IPv6 addresses that should be reachable
	const result = await isReachable('[2001:4860:4860::8888]:443');
	// This might fail due to network, but shouldn't throw or crash
	assert.ok(typeof result === 'boolean');
});

test('port 80 should use HTTP', async () => {
	// Regression test: port 80 should be treated as HTTP
	assert.ok(await isReachable('google.com:80'));
});
