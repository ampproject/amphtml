// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {r9x} from '#ads/vendors/r9x';

init(window);
register('r9x', r9x);

window.draw3p = draw3p;
