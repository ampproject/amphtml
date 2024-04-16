// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {_24smi} from '#ads/vendors/24smi';

init(window);
register('24smi', _24smi);

window.draw3p = draw3p;
