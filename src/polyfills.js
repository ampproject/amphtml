/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @fileoverview */

import {install as installAbortController} from './polyfills/abort-controller';
import {install as installArrayIncludes} from './polyfills/array-includes';
import {install as installCustomElements} from './polyfills/custom-elements';
import {install as installDOMTokenList} from './polyfills/domtokenlist';
import {install as installDocContains} from './polyfills/document-contains';
import {install as installFetch} from './polyfills/fetch';
import {install as installGetBoundingClientRect} from './get-bounding-client-rect';
import {install as installIntersectionObserver} from './polyfills/intersection-observer';
import {install as installMapSet} from './polyfills/map-set';
import {install as installMathSign} from './polyfills/math-sign';
import {install as installObjectAssign} from './polyfills/object-assign';
import {install as installObjectValues} from './polyfills/object-values';
import {install as installPromise} from './polyfills/promise';
import {install as installResizeObserver} from './polyfills/resize-observer';
import {install as installSetAdd} from './polyfills/set-add';
import {install as installStringStartsWith} from './polyfills/string-starts-with';
import {install as installWeakMapSet} from './polyfills/weakmap-set';

if (!IS_ESM) {
  installFetch(self);
  installMathSign(self);
  installObjectAssign(self);
  installObjectValues(self);
  installPromise(self);
  installArrayIncludes(self);
  installMapSet(self);
  installWeakMapSet(self);
  installSetAdd(self);
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
