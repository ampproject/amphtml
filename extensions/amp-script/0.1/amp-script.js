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

import {CSS} from '../../../build/amp-script-0.1.css';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addPurifyHooks, purifyConfig} from '../../../src/purifier';
import {
  calculateExtensionScriptUrl,
} from '../../../src/service/extension-location';
import {
  callbacks,
  sanitizer,
  upgrade,
} from '@ampproject/worker-dom/dist/unminified.index.safe.mjs.patched';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'amp-script';

/** @const {number} */
const MAX_SCRIPT_SIZE = 150000;

export class AmpScript extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER ||
        isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    if (!isExperimentOn(this.win, 'amp-script')) {
      user().error(TAG, 'Experiment "amp-script" is not enabled.');
      return Promise.reject('Experiment "amp-script" is not enabled.');
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
    // Configure callbacks.
    callbacks.onCreateWorker = data => {
      dev().info(TAG, 'Create worker:', data);
    };
    callbacks.onHydration = () => {
      dev().info(TAG, 'Hydrated!');
      this.element.classList.add('i-amphtml-hydrated');
    };
    callbacks.onSendMessage = data => {
      dev().info(TAG, 'To worker:', data);
    };
    callbacks.onReceiveMessage = data => {
      dev().info(TAG, 'From worker:', data);
    };
    // Create worker and hydrate.
    const authorUrl = this.element.getAttribute('src');
    const workerUrl = this.workerThreadUrl_();
    dev().info(TAG, 'Author URL:', authorUrl, ', worker URL:', workerUrl);

    const xhr = Services.xhrFor(this.win);
    const fetches = Promise.all([
      // `workerUrl` is from CDN, so no need for `ampCors`.
      xhr.fetchText(workerUrl, {ampCors: false}).then(r => r.text()),
      xhr.fetchText(authorUrl).then(r => r.text()),
    ]);
    upgrade(this.element, fetches.then(results => {
      const workerScript = results[0];
      const authorScript = results[1];
      if (authorScript.length > MAX_SCRIPT_SIZE) {
        user().error(TAG, `Max script size exceeded: ${authorScript.length} > `
            + MAX_SCRIPT_SIZE);
        return [];
      }
      return [workerScript, authorScript, authorUrl];
    }));
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
  AMP.registerElement('amp-script', AmpScript, CSS);
});
