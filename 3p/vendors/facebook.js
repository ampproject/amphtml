// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {facebook} from '#3p/facebook';
import {draw3p, init} from '#3p/integration-lib';

init(window);
register('facebook', facebook);

window.draw3p = draw3p;
