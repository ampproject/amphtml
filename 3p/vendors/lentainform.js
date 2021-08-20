// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {lentainform} from '#ads/vendors/lentainform';

init(window);
register('lentainform', lentainform);

window.draw3p = draw3p;
