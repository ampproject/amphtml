// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {sulvo} from '#ads/vendors/sulvo';

init(window);
register('sulvo', sulvo);

window.draw3p = draw3p;
