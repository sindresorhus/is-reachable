/* eslint-env browser */
'use strict';
const arrify = require('arrify');
const pAny = require('p-any');

module.exports = hosts => {
	return pAny(arrify(hosts).map(x => {
		return new Promise(resolve => {
			const img = new Image();

			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);

			img.src = `//${x}/favicon.ico?${Date.now()}`;
		});
	}));
};
