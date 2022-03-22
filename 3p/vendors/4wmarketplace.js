// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

import {_4wmarketplace} from '#ads/vendors/4wmarketplace';

init(window);
register('4wmarketplace', _4wmarketplace);

window.draw3p = draw3p;
