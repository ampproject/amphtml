// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {rbinfox} from '#ads/vendors/rbinfox';

init(window);
register('rbinfox', rbinfox);

window.draw3p = draw3p;
