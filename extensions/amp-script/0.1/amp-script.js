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
import {
  DomPurifyDef,
  createPurifier,
  getAllowedTags,
  validateAttributeChange,
} from '../../../src/purifier';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {UserActivationTracker} from './user-activation-tracker';
import {calculateExtensionScriptUrl} from '../../../src/service/extension-location';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getElementServiceForDoc} from '../../../src/element-service';
import {getMode} from '../../../src/mode';
import {
  installOriginExperimentsForDoc,
  originExperimentsForDoc,
} from '../../../src/service/origin-experiments-impl';
import {isExperimentOn} from '../../../src/experiments';
import {rewriteAttributeValue} from '../../../src/url-rewrite';
import {upgrade} from '@ampproject/worker-dom/dist/unminified.index.safe.mjs.patched';

/** @const {string} */
const TAG = 'amp-script';

/**
 * Max cumulative size of author scripts from all amp-script elements on page.
 * @const {number}
 */
const MAX_TOTAL_SCRIPT_SIZE = 150000;

/**
 * Size-contained elements up to 300px are allowed to mutate freely.
 */
const MAX_FREE_MUTATION_HEIGHT = 300;

const PHASE_HYDRATING = 1;
const PHASE_MUTATING = 2;

export class AmpScript extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private {?Worker} */
    this.workerDom_ = null;

    /** @private {?UserActivationTracker} */
    this.userActivation_ = null;

    /** @private {?AmpScriptService} */
    this.service_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER || isLayoutSizeDefined(layout);
  }

  /** @return {!Promise<boolean>} */
  isExperimentOn_() {
    if (isExperimentOn(this.win, 'amp-script')) {
      return Promise.resolve(true);
    }
    installOriginExperimentsForDoc(this.getAmpDoc());
    return originExperimentsForDoc(this.element)
      .getExperiments()
      .then(trials => trials && trials.includes(TAG));
  }

  /** @override */
  buildCallback() {
    return this.isExperimentOn_().then(on => {
      if (!on) {
        // Return rejected Promise to buildCallback() to disable component.
        throw user().createError(TAG, `Experiment "${TAG}" is not enabled.`);
      }
    });
  }

  /** @override */
  layoutCallback() {
    this.userActivation_ = new UserActivationTracker(this.element);

    // Create worker and hydrate.
    const authorUrl = this.element.getAttribute('src');
    const workerUrl = this.workerThreadUrl_();
    dev().info(TAG, 'Author URL:', authorUrl, ', worker URL:', workerUrl);

    const xhr = Services.xhrFor(this.win);
    const fetchPromise = Promise.all([
      xhr.fetchText(workerUrl, {ampCors: false}).then(r => r.text()),
      xhr.fetchText(authorUrl, {ampCors: false}).then(r => r.text()),
      getElementServiceForDoc(this.element, TAG, TAG),
    ]).then(results => {
      const workerScript = results[0];
      const authorScript = results[1];
      this.service_ = results[2];

      if (this.service_.sizeLimitExceeded(authorScript.length)) {
        user().error(
          TAG,
          'Maximum total script size exceeded ' +
            `(${MAX_TOTAL_SCRIPT_SIZE}). Disabled:`,
          this.element
        );
        this.element.classList.add('i-amphtml-broken');
        return [];
      }
      return [workerScript, authorScript];
    });

    // @see src/main-thread/configuration.WorkerDOMConfiguration in worker-dom.
    const workerConfig = {
      authorURL: authorUrl,
      mutationPump: this.mutationPump_.bind(this),
      longTask: promise => {
        this.userActivation_.expandLongTask(promise);
        // TODO(dvoytenko): consider additional "progress" UI.
      },
      sanitizer: new SanitizerImpl(this.win),
      // Callbacks.
      onCreateWorker: data => {
        dev().info(TAG, 'Create worker:', data);
      },
      onSendMessage: data => {
        dev().info(TAG, 'To worker:', data);
      },
      onReceiveMessage: data => {
        dev().info(TAG, 'From worker:', data);
      },
    };

    upgrade(this.element, fetchPromise, workerConfig).then(workerDom => {
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
    const location =
      getMode().test && this.win.testLocation
        ? this.win.testLocation
        : this.win.location;
    const useLocal = getMode().localDev || getMode().test;
    return calculateExtensionScriptUrl(
      location,
      'amp-script-worker',
      '0.1',
      useLocal
    );
  }

  /**
   * @param {function()} flush
   * @param {number} phase
   * @private
   */
  mutationPump_(flush, phase) {
    if (phase == PHASE_HYDRATING) {
      this.vsync_.mutate(() =>
        this.element.classList.add('i-amphtml-hydrated')
      );
    }
    const allowMutation =
      // Hydration is always allowed.
      phase != PHASE_MUTATING ||
      // Mutation depends on the gesture state and long tasks.
      this.userActivation_.isActive() ||
      // If the element is size-contained and small enough.
      (isLayoutSizeDefined(this.getLayout()) &&
        this.getLayoutBox().height <= MAX_FREE_MUTATION_HEIGHT);

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

/**
 * Service for sharing data across <amp-script> elements.
 */
class AmpScriptService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} unusedAmpdoc
   */
  constructor(unusedAmpdoc) {
    /** @private {number} */
    this.cumulativeSize_ = 0;
  }

  /**
   * @param {number} size
   * @return {boolean}
   */
  sizeLimitExceeded(size) {
    this.cumulativeSize_ += size;
    return this.cumulativeSize_ > MAX_TOTAL_SCRIPT_SIZE;
  }
}

/**
 * A DOMPurify wrapper that implements the worker-dom.Sanitizer interface.
 * @visibleForTesting
 */
export class SanitizerImpl {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!DomPurifyDef} */
    this.purifier_ = createPurifier(win.document, dict({'IN_PLACE': true}));

    /** @private {!Object<string, boolean>} */
    this.allowedTags_ = getAllowedTags();
    // For now, only allow built-in AMP components.
    this.allowedTags_['amp-img'] = true;
    this.allowedTags_['amp-layout'] = true;
    this.allowedTags_['amp-pixel'] = true;

    /** @const @private {!Element} */
    this.wrapper_ = win.document.createElement('div');
  }

  /**
   * TODO(choumx): This is currently called by worker-dom on node creation,
   * so all invocations are on super-simple nodes like <p></p>.
   * Either it should be moved to node insertion to justify the more expensive
   * sanitize() call, or this method should be a simple string lookup.
   *
   * @param {!Node} node
   * @return {boolean}
   */
  sanitize(node) {
    // DOMPurify sanitizes unsafe nodes by detaching them from parents.
    // So, an unsafe `node` that has no parent will cause a runtime error.
    // To avoid this, wrap `node` in a <div> if it has no parent.
    const useWrapper = !node.parentNode;
    if (useWrapper) {
      this.wrapper_.appendChild(node);
    }
    const parent = node.parentNode || this.wrapper_;
    this.purifier_.sanitize(parent);
    const clean = parent.firstChild;
    if (!clean) {
      user().warn(TAG, 'Sanitized node:', node);
      return false;
    }
    // Detach `node` if we used a wrapper div.
    if (useWrapper) {
      while (this.wrapper_.firstChild) {
        this.wrapper_.removeChild(this.wrapper_.firstChild);
      }
    }
    return true;
  }

  /**
   * @param {!Node} node
   * @param {string} attribute
   * @param {string|null} value
   * @return {boolean}
   */
  mutateAttribute(node, attribute, value) {
    // TODO(choumx): Call mutatedAttributesCallback() on AMP elements e.g.
    // so an amp-img can update its child img when [src] is changed.

    const tag = node.nodeName.toLowerCase();
    // DOMPurify's attribute validation is tag-agnostic, so we need to check
    // that the tag itself is valid. E.g. a[href] is ok, but base[href] is not.
    // TODO(choumx): This is actually more strict than sanitize().
    if (this.allowedTags_[tag]) {
      const attr = attribute.toLowerCase();
      if (validateAttributeChange(this.purifier_, node, attr, value)) {
        if (value == null) {
          node.removeAttribute(attr);
        } else {
          const newValue = rewriteAttributeValue(tag, attr, value);
          node.setAttribute(attr, newValue);
        }

        // a[href] requires [target], which defaults to _top.
        if (tag === 'a') {
          if (node.hasAttribute('href') && !node.hasAttribute('target')) {
            node.setAttribute('target', '_top');
          }
        }
        return true;
      }
    }
    user().warn(TAG, 'Sanitized [%s]="%s":', attribute, value, node);
    return false;
  }

  /**
   * @param {!Node} node
   * @param {string} property
   * @param {string} value
   * @return {boolean}
   */
  mutateProperty(node, property, value) {
    const prop = property.toLowerCase();

    // worker-dom's supported properties and corresponding attribute name
    // differences are minor, e.g. acceptCharset vs. accept-charset.
    if (validateAttributeChange(this.purifier_, node, prop, value)) {
      node[property] = value;
      return true;
    }
    return false;
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(TAG, AmpScriptService);
  AMP.registerElement(TAG, AmpScript, CSS);
});
