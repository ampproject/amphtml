/** @fileoverview Installs polyfills depending on build environment. */

import {install as installAbortController} from './abort-controller';
import {install as installArrayIncludes} from './array-includes';
import {install as installCustomElements} from './custom-elements';
import {install as installDocContains} from './document-contains';
import {install as installDOMTokenList} from './domtokenlist';
import {install as installFetch} from './fetch';
import {install as installGetBoundingClientRect} from './get-bounding-client-rect';
import {install as installIntersectionObserver} from './intersection-observer';
import {install as installMapSet} from './map-set';
import {install as installMathSign} from './math-sign';
import {install as installObjectAssign} from './object-assign';
import {install as installObjectValues} from './object-values';
import {install as installPromise} from './promise';
import {install as installResizeObserver} from './resize-observer';
import {install as installSet} from './set';
import {install as installStringStartsWith} from './string-starts-with';
import {install as installWeakMapSet} from './weakmap-set';

if (!IS_ESM) {
  installFetch(self);
  installMathSign(self);
  installObjectAssign(self);
  installObjectValues(self);
  installPromise(self);
  installArrayIncludes(self);
  installMapSet(self);
  installWeakMapSet(self);
  installSet(self);
  installStringStartsWith(self);
}

// Polyfills that depend on DOM availability
if (self.document) {
  if (!IS_ESM) {
    installDOMTokenList(self);
    installDocContains(self);
    installGetBoundingClientRect(self);
  }
  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  if (!IS_SXG) {
    installCustomElements(self, class {});
    installIntersectionObserver(self);
    installResizeObserver(self);
    installAbortController(self);
  }
}
