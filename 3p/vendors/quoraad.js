// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {quoraad} from '#ads/vendors/quoraad';

init(window);
register('quoraad', quoraad);

window.draw3p = draw3p;
