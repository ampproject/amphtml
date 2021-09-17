// src/polyfills.js must be the first import.
import '../polyfills';

import {draw3p, init} from '../integration-lib';
import {register} from '../3p';

import {myua} from '../../ads/vendors/myua';

init(window);
register('myua', myua);

window.draw3p = draw3p;
