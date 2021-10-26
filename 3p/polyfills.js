/**
 * @fileoverview Loads all polyfills needed by the AMP 3p integration frame.
 */

import * as mode from '#core/mode';

// This list should not get longer without a very good reason.
import {install as installMathSign} from '#polyfills/math-sign';
import {install as installObjectAssign} from '#polyfills/object-assign';
import {install as installObjectValues} from '#polyfills/object-values';
import {install as installStringStartsWith} from '#polyfills/string-starts-with';

if (!mode.isEsm()) {
  installMathSign(self);
  installObjectAssign(self);
  installObjectValues(self);
  installStringStartsWith(self);
}
