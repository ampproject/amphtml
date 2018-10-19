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

import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {addPurifyHooks, purifyConfig} from '../../../src/purifier';
import {
  calculateExtensionScriptUrl,
} from '../../../src/service/extension-location';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';
import {
  sanitizer,
  upgradeElement,
} from '@ampproject/worker-dom/dist/unminified.index.safe.mjs.patched';

/** @const {string} */
const TAG = 'amp-script';


export class AmpScript extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER ||
        isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    if (!isExperimentOn(this.win, 'amp-script')) {
      const error = 'Experiment "amp-script" is not enabled.';
      user().error(TAG, error);
      return Promise.reject(error);
    }
    // Configure worker-dom's sanitizer with AMP-specific config and hooks.
    const config = purifyConfig();
    sanitizer.configure(config, {
      'beforeSanitize': purify => {
        addPurifyHooks(purify, /* diffing */ false);
      },
      'afterSanitize': purify => {
        purify.removeAllHooks();
      },
      'nodeWasRemoved': node => {
        user().warn(TAG, 'Node was sanitized:', node);
      },
    });

    const url = this.workerThreadUrl_();
    dev().fine(TAG, 'Fetching amp-script-worker from:', url);
    upgradeElement(this.element, url);
    return Promise.resolve();
  }

  /**
   * @return {string}
   * @private
   */
  workerThreadUrl_() {
    // Use `testLocation` for testing with iframes. @see testing/iframe.js.
    const location = (getMode().test && this.win.testLocation)
      ? this.win.testLocation : this.win.location;
    const useLocal = getMode().localDev || getMode().test;
    return calculateExtensionScriptUrl(
        location, 'amp-script-worker', '0.1', useLocal);
  }
}

AMP.extension('amp-script', '0.1', function(AMP) {
  AMP.registerElement('amp-script', AmpScript);
});
