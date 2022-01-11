/** @fileoverview Installs polyfills depending on build environment. */

import * as mode from '#core/mode';

import {install as installAbortController} from './abort-controller';
import {install as installArrayIncludes} from './array-includes';
import {install as installCustomElements} from './custom-elements';
import {install as installDocContains} from './document-contains';
import {install as installFetch} from './fetch';
import {install as installGetBoundingClientRect} from './get-bounding-client-rect';
import {install as installIntersectionObserver} from './intersection-observer';
import {install as installMapSet} from './map-set';
import {install as installMathSign} from './math-sign';
import {install as installObjectAssign} from './object-assign';
import {install as installObjectValues} from './object-values';
import {install as installResizeObserver} from './resize-observer';
import {install as installSet} from './set';
import {install as installStringStartsWith} from './string-starts-with';
import {install as installWeakMapSet} from './weakmap-set';

if (!mode.isEsm()) {
  installFetch(self);
  installMathSign(self);
  installObjectAssign(self);
  installObjectValues(self);
  installArrayIncludes(self);
  installMapSet(self);
  installWeakMapSet(self);
  installSet(self);
  installStringStartsWith(self);
}

// Polyfills that depend on DOM availability
if (self.document) {
  if (!mode.isEsm()) {
    installDocContains(self);
    installGetBoundingClientRect(self);
    installCustomElements(self, class {});
  }
  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  if (!IS_SXG) {
    installIntersectionObserver(self);
    installResizeObserver(self);
    installAbortController(self);
  }
}
