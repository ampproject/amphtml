// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {noddus} from '#ads/vendors/noddus';

init(window);
register('noddus', noddus);

window.draw3p = draw3p;
