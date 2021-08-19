// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {beopinion} from '#3p/beopinion';
import {draw3p, init} from '#3p/integration-lib';

init(window);
register('beopinion', beopinion);

window.draw3p = draw3p;
