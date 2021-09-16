import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {broadbandy} from '#ads/vendors/broadbandy';

init(window);
register('broadbandy', broadbandy);

window.draw3p = draw3p;
