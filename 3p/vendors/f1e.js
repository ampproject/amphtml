// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {f1e} from '#ads/vendors/f1e';

init(window);
register('f1e', f1e);

window.draw3p = draw3p;
