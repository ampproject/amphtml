// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {github} from '#3p/github';
import {draw3p, init} from '#3p/integration-lib';

init(window);
register('github', github);

window.draw3p = draw3p;
