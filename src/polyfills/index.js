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

/** @fileoverview Installs polyfills depending on build environment. */

import {install as installAbortController} from './abort-controller';
import {install as installArrayIncludes} from './array-includes';
import {install as installCustomElements} from './custom-elements';
import {install as installDOMTokenList} from './domtokenlist';
import {install as installDocContains} from './document-contains';
import {install as installFetch} from './fetch';
import {install as installGetBoundingClientRect} from './get-bounding-client-rect';
import {install as installIntersectionObserver} from './intersection-observer';
import {install as installMapSet} from './map-set';
import {install as installMathSign} from './math-sign';
import {install as installObjectAssign} from './object-assign';
import {install as installObjectValues} from './object-values';
import {install as installPromise} from './promise';
import {install as installResizeObserver} from './resize-observer';
import {install as installSetAdd} from './set-add';
import {install as installStringStartsWith} from './string-starts-with';
import {install as installWeakMapSet} from './weakmap-set';
import {isEsmMode, isSxgMode} from '../core/mode';

if (!isEsmMode()) {
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
  if (!isEsmMode()) {
    installDOMTokenList(self);
    installDocContains(self);
    installGetBoundingClientRect(self);
  }
  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  if (!isSxgMode()) {
    installCustomElements(self, class {});
    installIntersectionObserver(self);
    installResizeObserver(self);
    installAbortController(self);
  }
}
