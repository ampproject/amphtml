// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {smi2} from '#ads/vendors/smi2';

init(window);
register('smi2', smi2);

window.draw3p = draw3p;
