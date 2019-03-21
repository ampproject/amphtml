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
import {UserActivationTracker} from './user-activation-tracker';
import {
  WorkerDom,
  sanitizer,
  upgrade,
} from '@ampproject/worker-dom/dist/unminified.index.safe.mjs.patched';
// TODO(choumx): Avoid bundling an extra copy of DOMPurify here.
import {addPurifyHooks, purifyConfig} from '../../../src/purifier';
import {
  calculateExtensionScriptUrl,
} from '../../../src/service/extension-location';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'amp-script';

/** @const {number} */
const MAX_SCRIPT_SIZE = 150000;

/**
 * Size-contained elements up to 300px are allowed to mutate freely.
 */
const MAX_FREE_MUTATION_HEIGHT = 300;

const PHASE_MUTATING = 2;

export class AmpScript extends AMP.BaseElement {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private {?WorkerDom} */
    this.workerDom_ = null;

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

    this.userActivation_ = new UserActivationTracker(this.element);

    // Configure worker-dom's sanitizer with AMP-specific config and hooks.
    const config = purifyConfig();
    sanitizer.configure(config, {
      'beforeSanitize': purify => {
        addPurifyHooks(purify, /* diffing */ false, this.win.document);
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
    upgrade(this.element, fetches.then(results => {
      const workerScript = results[0];
      const authorScript = results[1];
      if (authorScript.length > MAX_SCRIPT_SIZE) {
        user().error(TAG, `Max script size exceeded: ${authorScript.length} > `
            + MAX_SCRIPT_SIZE);
        return [];
      }
      return [workerScript, authorScript, authorUrl];
    }),
    // Configure callbacks.
    {
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
      onMutationPump: this.mutationPump_.bind(this),
      onLongTask: promise => {
        this.userActivation_.expandLongTask(promise);
        // TODO(dvoytenko): consider additional "progress" UI.
      },
    },
    /* debug */ true).then(workerDom => {
      this.workerDom_ = workerDom;
    });
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

  /**
   * @param {function()} flush
   * @param {number} phase
   * @private
   */
  mutationPump_(flush, phase) {
    const allowMutation = (
      // Hydration is always allowed.
      phase != PHASE_MUTATING
      // Mutation depends on the gesture state and long tasks.
      || this.userActivation_.isActive()
      // If the element is size-contained and small enough.
      || (isLayoutSizeDefined(this.getLayout())
          && this.getLayoutBox().height <= MAX_FREE_MUTATION_HEIGHT)
    );

    if (allowMutation) {
      this.vsync_.mutate(flush);
      return;
    }

    // Otherwise, terminate the worker.
    this.workerDom_.terminate();
    // TODO(dvoytenko): a better UI to indicate the broken state.
    this.element.classList.remove('i-amphtml-hydrated');
    this.element.classList.add('i-amphtml-broken');
    user().error(TAG, '"amp-script" is terminated due to unallowed mutation.');
  }
}

/** @return {!Function} */
export function getWorkerDomClassForTesting() {
  return WorkerDom;
}

AMP.extension('amp-script', '0.1', function(AMP) {
  AMP.registerElement('amp-script', AmpScript, CSS);
});
