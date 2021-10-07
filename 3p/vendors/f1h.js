// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {f1h} from '#ads/vendors/f1h';

init(window);
register('f1h', f1h);

window.draw3p = draw3p;
