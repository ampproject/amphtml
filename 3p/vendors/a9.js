// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {a9} from '#ads/vendors/a9';

init(window);
register('a9', a9);

window.draw3p = draw3p;
