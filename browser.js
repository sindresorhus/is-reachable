/* eslint-env browser */
'use strict';
const arrify = require('arrify');

module.exports = hosts => {
	return Promise.all(arrify(hosts).map(x => {
		return new Promise(resolve => {
			const img = new Image();

			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);

			img.src = `//${x}/favicon.ico?${Date.now()}`;
		});
	})).then(hosts => hosts.some(Boolean));
};
