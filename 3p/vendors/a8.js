// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {a8} from '#ads/vendors/a8';

init(window);
register('a8', a8);

window.draw3p = draw3p;
