// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {monetizer101} from '#ads/vendors/monetizer101';

init(window);
register('monetizer101', monetizer101);

window.draw3p = draw3p;
