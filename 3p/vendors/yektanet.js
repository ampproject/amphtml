// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {yektanet} from '#ads/vendors/yektanet';

init(window);
register('yektanet', yektanet);

window.draw3p = draw3p;
