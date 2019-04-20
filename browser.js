/* eslint-env browser */
'use strict';
const arrify = require('arrify');
const pAny = require('p-any');
const prependHttp = require('prepend-http');
const URL = require('url-parse');

module.exports = async hosts => {
	return pAny(arrify(hosts).map(url => {
		return new Promise(resolve => {
			let {hostname, protocol = '', port} = new URL(prependHttp(url));
			port = port ? `:${port}` : '';

			const image = new Image();
			image.addEventListener('load', () => resolve(true));
			image.addEventListener('error', () => resolve(false));
			image.src = `${protocol}//${hostname}${port}/favicon.ico?${Date.now()}`;
		});
	}));
};
