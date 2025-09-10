import {expectType} from 'tsd';
import isReachable from './index.js';

const options: isReachable.Options = {};

expectType<Promise<boolean>>(isReachable('sindresorhus.com'));
expectType<Promise<boolean>>(isReachable('google.com:80'));
expectType<Promise<boolean>>(isReachable(['google.com', 'sindresorhus.com']));

// With AbortSignal.timeout()
expectType<Promise<boolean>>(isReachable('sindresorhus.com', {
	signal: AbortSignal.timeout(3000),
}));

// With AbortController
expectType<Promise<boolean>>(isReachable('sindresorhus.com', {
	signal: new AbortController().signal,
}));
