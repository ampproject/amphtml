// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {embedly} from '#3p/embedly';
import {draw3p, init} from '#3p/integration-lib';

init(window);
register('embedly', embedly);

window.draw3p = draw3p;
