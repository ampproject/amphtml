// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {fakeDelayed} from '#ads/vendors/_fakedelayed_';

init(window);
register('fake-delayed', fakeDelayed);

window.draw3p = draw3p;
