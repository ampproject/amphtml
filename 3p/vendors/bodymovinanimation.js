// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {bodymovinanimation} from '#3p/bodymovinanimation';
import {draw3p, init} from '#3p/integration-lib';

init(window);
register('bodymovinanimation', bodymovinanimation);

window.draw3p = draw3p;
