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

// TODO(choumx): This requires changing line 1 to "module.exports = ...".
import {MainThread} from '@ampproject/worker-dom/dist/index.safe';

// TODO(choumx): Compiled output from worker-dom's TypeScript source is lacking
// Closure type annotations. worker-dom needs tsickle integration.
export class AmpScript extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    MainThread.upgradeElement(this.element,
        '/extensions/amp-script/0.1/worker.safe.js');

    // TODO(choumx): Compile @ampproject/worker-dom/dist/worker.safe.(m)js
    // by copying it from node_modules/ to a temporary directory. Requires
    // proper type annotation output first.
    // MainThread.upgradeElement(this.element,
    //     '/dist/v0/amp-script-worker-0.1.js');
  }
}

AMP.extension('amp-script', '0.1', function(AMP) {
  AMP.registerElement('amp-script', AmpScript);
});
