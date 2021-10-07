// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {swoop} from '#ads/vendors/swoop';

init(window);
register('swoop', swoop);

window.draw3p = draw3p;
