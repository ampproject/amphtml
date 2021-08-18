/**
 * @fileoverview Loads all polyfills needed by the AMP 3p integration frame.
 */

// This list should not get longer without a very good reason.
import {install as installMathSign} from '#polyfills/math-sign';
import {install as installObjectAssign} from '#polyfills/object-assign';
import {install as installObjectValues} from '#polyfills/object-values';
import {install as installPromise} from '#polyfills/promise';
import {install as installStringStartsWith} from '#polyfills/string-starts-with';

if (!IS_ESM) {
  installMathSign(self);
  installObjectAssign(self);
  installObjectValues(self);
  installPromise(self);
  installStringStartsWith(self);
}
