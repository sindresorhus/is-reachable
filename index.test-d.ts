import {expectType} from 'tsd';
import isReachable = require('.');

const options: isReachable.Options = {};
expectType<Promise<boolean>>(isReachable('sindresorhus.com'));
expectType<Promise<boolean>>(isReachable('google.com:80', {timeout: 10}));
