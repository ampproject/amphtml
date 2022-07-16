import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {dex} from '#ads/vendors/dex';

init(window);
register('dex', dex);

window.draw3p = draw3p;
