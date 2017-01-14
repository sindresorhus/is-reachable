/* eslint-env browser */
'use strict';
const arrify = require('arrify');
const pAny = require('p-any');
const urlParseLax = require('url-parse-lax');

module.exports = hosts => {
	return pAny(arrify(hosts).map(x => {
		return new Promise(resolve => {
			const img = new Image();

			x = urlParseLax(x);

			const protocol = x.protocol || '';
			const host = x.hostname;
			const port = x.port ? `:${x.port}` : '';

			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);

			img.src = `${protocol}//${host}${port}/favicon.ico?${Date.now()}`;
		});
	}));
};
