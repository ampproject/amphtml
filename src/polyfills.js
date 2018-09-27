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

import {getMode} from './mode';
import {install as installArrayIncludes} from './polyfills/array-includes';
import {install as installCustomElements} from './polyfills/custom-elements';
import {
  install as installDOMTokenListToggle,
} from './polyfills/domtokenlist-toggle';
import {install as installDocContains} from './polyfills/document-contains';
import {install as installFetch} from './polyfills/fetch';
import {install as installMathSign} from './polyfills/math-sign';
import {install as installObjectAssign} from './polyfills/object-assign';
import {install as installPromise} from './polyfills/promise';
import {installCustomElements as installRegisterElement} from
  'document-register-element/build/document-register-element.patched';
import {isExperimentOn} from './experiments';

installDOMTokenListToggle(self);
installFetch(self);
installMathSign(self);
installObjectAssign(self);
installPromise(self);
installDocContains(self);
installArrayIncludes(self);
// isExperimentOn() must be called after Object.assign polyfill is installed.
if (isExperimentOn(self, 'custom-elements-v1') || getMode().test) {
  installCustomElements(self, class {});
} else {
  installRegisterElement(self, 'auto');
}
