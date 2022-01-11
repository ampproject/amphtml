// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {_1wo} from '#ads/vendors/1wo';

init(window);
register('1wo', _1wo);

window.draw3p = draw3p;
