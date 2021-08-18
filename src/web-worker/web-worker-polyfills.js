/**
 * @fileoverview Directly imported into web-worker.js entry point so polyfills
 *     can be used in top-level scope in module dependencies.
 */

import {install as installArrayIncludes} from '#polyfills/array-includes';
import {install as installMathSign} from '#polyfills/math-sign';
import {install as installObjectAssign} from '#polyfills/object-assign';
import {install as installObjectValues} from '#polyfills/object-values';
import {install as installStringStartsWith} from '#polyfills/string-starts-with';

if (!IS_ESM) {
  installArrayIncludes(self);
  installObjectAssign(self);
  installObjectValues(self);
  installMathSign(self);
  installStringStartsWith(self);
}
