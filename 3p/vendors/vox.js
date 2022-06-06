import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {vox} from '#ads/vendors/vox';

init(window);
register('vox', vox);

window.draw3p = draw3p;
