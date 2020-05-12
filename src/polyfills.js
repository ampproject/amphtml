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

import {getMode} from './mode.js';
import {install as installArrayIncludes} from './polyfills/array-includes.js';
import {install as installCustomElements} from './polyfills/custom-elements.js';
import {install as installDOMTokenList} from './polyfills/domtokenlist.js';
import {install as installDocContains} from './polyfills/document-contains.js';
import {install as installFetch} from './polyfills/fetch.js';
import {install as installGetBoundingClientRect} from './get-bounding-client-rect.js';
import {install as installIntersectionObserver} from './polyfills/intersection-observer.js';
import {install as installMathSign} from './polyfills/math-sign.js';
import {install as installObjectAssign} from './polyfills/object-assign.js';
import {install as installObjectValues} from './polyfills/object-values.js';
import {install as installPromise} from './polyfills/promise.js';

installFetch(self);
installMathSign(self);
installObjectAssign(self);
installObjectValues(self);
installPromise(self);
installArrayIncludes(self);

// Polyfills that depend on DOM availability
if (self.document) {
  installDOMTokenList(self);
  installDocContains(self);
  installGetBoundingClientRect(self);
  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  installCustomElements(self, class {});
  // The AMP and Inabox are launched separately and so there are two
  // experiment constants.
  if (
    // eslint-disable-next-line no-undef
    INTERSECTION_OBSERVER_POLYFILL ||
    // eslint-disable-next-line no-undef
    INTERSECTION_OBSERVER_POLYFILL_INABOX ||
    getMode().localDev ||
    getMode().test
  ) {
    installIntersectionObserver(self);
  }
}

// TODO(#18268, erwinm): For whatever reason imports to modules that have no
// export currently break for singlepass runs. This is a temporary workaround
// until we figure the issue out.
export const erwinmHack = 'this export is a temporary hack for single pass';
