// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {my6sense} from '#ads/vendors/my6sense';

init(window);
register('my6sense', my6sense);

window.draw3p = draw3p;
