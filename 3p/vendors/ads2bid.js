// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {ads2bid} from '#ads/vendors/ads2bid';

init(window);
register('ads2bid', ads2bid);

window.draw3p = draw3p;
