/* eslint-env browser */
'use strict';
const arrify = require('arrify');
const pAny = require('p-any');
const prependHttp = require('prepend-http');
const URL = require('url-parse');

module.exports = hosts => {
	return pAny(arrify(hosts).map(url => {
		return new Promise(resolve => {
			let {hostname, protocol, port} = new URL(prependHttp(url));
			protocol = protocol || '';
			port = port ? `:${port}` : '';

			const img = new Image();
			img.addEventListener('load', () => resolve(true));
			img.addEventListener('error', () => resolve(false));
			img.src = `${protocol}//${hostname}${port}/favicon.ico?${Date.now()}`;
		});
	}));
};
