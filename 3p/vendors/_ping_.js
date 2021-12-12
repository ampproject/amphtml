// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {_ping_} from '#ads/vendors/_ping_';

init(window);
register('_ping_', _ping_);

window.draw3p = draw3p;
