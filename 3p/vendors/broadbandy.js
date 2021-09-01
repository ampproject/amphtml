import '#3p/polyfills';

import {draw3p, init} from '#3p/integration-lib';
import {register} from '#3p/3p';

import {broadbandy} from '#ads/vendors/broadbandy';

init(window);
register('broadbandy', broadbandy);

window.draw3p = draw3p;
