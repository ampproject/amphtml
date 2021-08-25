// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {onead} from '#ads/vendors/onead';

init(window);
register('onead', onead);

window.draw3p = draw3p;
