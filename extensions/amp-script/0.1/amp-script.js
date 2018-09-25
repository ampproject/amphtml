/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {isLayoutSizeDefined} from '../../../src/layout';

// TODO(choumx): Figure out how to import this.
// import {upgradeElement} from './index.safe';

// TODO(choumx): This requires changing line 1 to "module.exports = ...".
import * as mainThread from '@ampproject/worker-dom/dist/index.safe';

// TODO(choumx): Compiled output from worker-dom's TypeScript source is lacking
// Closure type annotations. worker-dom needs tsickle integration.
export class AmpScript extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    // TODO(choumx): Copy node_modules/@ampproject/worker-dom/dist/worker.safe.(m)js
    // to a temporary directory so it can be compiled by CC.
    mainThread.upgradeElement(this.element, '/extensions/amp-script/0.1/worker.safe.js');
  }
}

AMP.extension('amp-script', '0.1', function(AMP) {
  AMP.registerElement('amp-script', AmpScript);
});
