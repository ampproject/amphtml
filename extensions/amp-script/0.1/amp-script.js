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
// TODO(choumx): Avoid bundling an extra copy of DOMPurify here.
import {addPurifyHooks, purifyConfig} from '../../../src/purifier';
import {
  calculateExtensionScriptUrl,
} from '../../../src/service/extension-location';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';
import {
  sanitizer,
  upgrade,
} from '@ampproject/worker-dom/dist/unminified.index.safe.mjs.patched';
import {ACTIVATION_TIMEOUT, UserActivationTracker} from './user-activation-tracker';

/** @const {string} */
const TAG = 'amp-script';

/** @const {number} */
const MAX_SCRIPT_SIZE = 150000;

export class AmpScript extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {?WorkerDomClient} */
    this.workerDomClient_ = null;
    /** @private {?StatusImpl} */
    this.status_ = null;
    /** @private {?UserActivationTracker} */
    this.userActivation_ = null;
  }

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

    this.userActivation_ =
        new UserActivationTracker(this.element);
    this.status_ =
        new StatusImpl(
            this.element,
            this.getLayout(),
            this.userActivation_,
            this.brokenClient_.bind(this));

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

    this.workerDomClient_ = upgrade(this.element, fetches.then(results => {
      const workerScript = results[0];
      const authorScript = results[1];
      if (authorScript.length > MAX_SCRIPT_SIZE) {
        user().error(TAG, `Max script size exceeded: ${authorScript.length} > `
            + MAX_SCRIPT_SIZE);
        return [];
      }
      return [workerScript, authorScript, authorUrl];
    }),
    // Options.
    {
      status: this.status_,
      mutationCallback: this.status_.mutationCallback.bind(this.status_),
      callbacks: {
        onCreateWorker: data => {
          dev().info(TAG, 'Create worker:', data);
        },
        onHydration: () => {
          dev().info(TAG, 'Hydrated!');
          this.element.classList.add('i-amphtml-hydrated');
        },
        onSendMessage: data => {
          dev().info(TAG, 'To worker:', data);
        },
        onReceiveMessage: data => {
          dev().info(TAG, 'From worker:', data);
        },
      },
      debug: true,
    });

    return Promise.resolve();
  }

  /** @private */
  brokenClient_() {
    this.workerDomClient_.terminate();
    // TODO: display "broken" UX.
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


/** @implements {WorkerDomStatus} */
class StatusImpl {
  /**
   * @param {!Element} element
   * @parma {!Layout} layout
   * @param {!UserActivationTracker} userActivation
   * @param {!Function} brokenCallback
   */
  constructor(element, layout, userActivation, brokenCallback) {
    /** @private @const */
    this.element_ = element;
    /** @private @const */
    this.userActivation_ = userActivation;
    /** @private @const */
    this.brokenCallback_ = brokenCallback;

    /** @private {boolean} */
    this.inLongTask_ = false;
    /** @private {time} */
    this.longTaskExt_= 0;
    /** @private {boolean} */
    this.broken_ = false;

    /** @private @const {boolean} */
    this.allowFreeMutations_ =
        isLayoutSizeDefined(layout)
        // TODO: define/document the constant.
        && element.offsetHeight < 300;
  }

  /** @private */
  broken_() {
    if (!this.broken_) {
      this.broken_ = true;
      this.brokenCallback_();
    }
  }

  /** @override */
  longTask(promise, opt_message) {
    if (!this.userActivation_.isActive()) {
      this.broken_();
      return;
    }
    this.inLongTask_ = true;
    this.startLongTaskUx_(opt_message);
    promise.catch(() => {}).then(() => {
      this.inLongTask_ = false;
      this.longTaskExt_ = Date.now() + ACTIVATION_TIMEOUT;
      this.stopLongTaskUx_();
    });
  }

  /**
   * @return {boolean}
   */
  mutationCallback() {
    if (this.broken_) {
      return false;
    }
    // Free mutations allowed.
    if (this.allowFreeMutations_
        && this.userActivation_.hasBeenActive()) {
      return true;
    }
    // Currently active or within the long-task parameters?
    if (this.userActivation_.isActive()
        || this.inLongTask_
        || Date.now() <= this.longTaskExt_) {
      return true;
    }
    this.broken_();
    return false;
  }

  startLongTaskUx_(opt_message) {
    // TODO
  }

  stopLongTaskUx_() {
    // TODO
  }
}


AMP.extension('amp-script', '0.1', function(AMP) {
  AMP.registerElement('amp-script', AmpScript, CSS);
});
