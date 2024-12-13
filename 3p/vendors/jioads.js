import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {jioads} from '#ads/vendors/jioads';

init(window);
register('jioads', jioads);

window.draw3p = draw3p;
