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
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getElementServiceForDoc} from '../../../src/element-service';
import {getMode} from '../../../src/mode';
import {
  installOriginExperimentsForDoc,
  originExperimentsForDoc,
} from '../../../src/service/origin-experiments-impl';
import {isExperimentOn} from '../../../src/experiments';
import {rewriteAttributeValue} from '../../../src/url-rewrite';
import {startsWith} from '../../../src/string';
import {upgrade} from '@ampproject/worker-dom/dist/amp/main.mjs';

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

/**
 * See src/transfer/Phase.ts in worker-dom.
 * @enum {number}
 */
const Phase = {
  INITIALIZING: 0,
  HYDRATING: 1,
  MUTATING: 2,
};

/**
 * See src/transfer/TransferrableStorage.ts in worker-dom.
 * @enum {number}
 */
const StorageLocation = {
  LOCAL: 0,
  SESSION: 1,
};

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

    const authorScriptPromise = this.getAuthorScript_();
    if (!authorScriptPromise) {
      const error = user().createError(
        '[%s] "src" or "script" attribute is required.',
        TAG
      );
      return Promise.reject(error);
    }

    const workerAndAuthorScripts = Promise.all([
      this.getWorkerScript_(),
      authorScriptPromise,
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

    // The displayed name of the combined script in dev tools.
    const sourceURL = this.element.hasAttribute('src')
      ? `amp-script[src="${this.element.getAttribute('src')}"].js`
      : `amp-script[script=#${this.element.getAttribute('script')}].js`;

    const sandbox = this.element.getAttribute('sandbox') || '';
    const sandboxTokens = sandbox.split(' ').map(s => s.trim());

    // @see src/main-thread/configuration.WorkerDOMConfiguration in worker-dom.
    const config = {
      authorURL: sourceURL,
      mutationPump: this.mutationPump_.bind(this),
      longTask: promise => {
        this.userActivation_.expandLongTask(promise);
        // TODO(dvoytenko): consider additional "progress" UI.
      },
      sanitizer: new SanitizerImpl(this.win, sandboxTokens),
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

    // Create worker and hydrate.
    upgrade(this.element, workerAndAuthorScripts, config).then(workerDom => {
      this.workerDom_ = workerDom;
    });
    return Promise.resolve();
  }

  /**
   * @return {!Promise<string>}
   * @private
   */
  getWorkerScript_() {
    // Use `testLocation` for testing with iframes. @see testing/iframe.js.
    const location =
      getMode().test && this.win.testLocation
        ? this.win.testLocation
        : this.win.location;
    const useLocal = getMode().localDev || getMode().test;
    const workerUrl = calculateExtensionScriptUrl(
      location,
      'amp-script-worker',
      '0.1',
      useLocal
    );
    const xhr = Services.xhrFor(this.win);
    return xhr.fetchText(workerUrl, {ampCors: false}).then(r => r.text());
  }

  /**
   * Query local or fetch remote author script. Returns promise that resolves
   * with the script contents. Returns null if script reference is missing.
   * @return {?Promise<string>}
   * @private
   */
  getAuthorScript_() {
    const authorUrl = this.element.getAttribute('src');
    if (authorUrl) {
      return Services.xhrFor(this.win)
        .fetchText(authorUrl, {ampCors: false})
        .then(r => r.text());
    } else {
      const id = this.element.getAttribute('script');
      if (id) {
        const local = this.getAmpDoc().getElementById(id);
        const target = local.getAttribute('target');
        userAssert(
          target === 'amp-script',
          '[%s] script#%s must have target="amp-script".',
          TAG,
          id
        );
        return Promise.resolve(local.textContent);
      }
    }
    return null;
  }

  /**
   * @param {function()} flush
   * @param {number} phase
   * @private
   */
  mutationPump_(flush, phase) {
    if (phase == Phase.HYDRATING) {
      this.vsync_.mutate(() =>
        this.element.classList.add('i-amphtml-hydrated')
      );
    }
    const allowMutation =
      // Hydration is always allowed.
      phase != Phase.MUTATING ||
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
 * sandbox="allow-forms" enables tags in HTMLFormElement.elements.
 * @const {!Array<string>}
 */
const FORM_ELEMENTS = [
  'form',
  'button',
  'fieldset',
  'input',
  'object',
  'output',
  'select',
  'textarea',
];

/**
 * A DOMPurify wrapper that implements the worker-dom.Sanitizer interface.
 * @visibleForTesting
 */
export class SanitizerImpl {
  /**
   * @param {!Window} win
   * @param {!Array<string>} sandboxTokens
   */
  constructor(win, sandboxTokens) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!DomPurifyDef} */
    this.purifier_ = createPurifier(win.document, dict({'IN_PLACE': true}));

    /** @private @const {!Object<string, boolean>} */
    this.allowedTags_ = getAllowedTags();

    // TODO(choumx): Support opt-in for variable substitutions.
    // For now, only allow built-in AMP components except amp-pixel.
    this.allowedTags_['amp-img'] = true;
    this.allowedTags_['amp-layout'] = true;
    this.allowedTags_['amp-pixel'] = false;

    /** @private @const {boolean} */
    this.allowForms_ = sandboxTokens.includes('allow-forms');
    FORM_ELEMENTS.forEach(fe => {
      this.allowedTags_[fe] = this.allowForms_;
    });
  }

  /**
   * This is called by worker-dom on node creation, so all invocations are on
   * super-simple nodes like <p></p>.
   *
   * @param {!Node} node
   * @return {boolean}
   */
  sanitize(node) {
    // TODO(choumx): allowedTags_[] is more strict than purifier.sanitize()
    // because the latter has attribute-specific allowances.
    const tag = node.nodeName.toLowerCase();
    const clean = this.allowedTags_[tag];
    if (!clean) {
      if (!this.warnIfFormsAreDisallowed_(tag)) {
        user().warn(TAG, 'Sanitized node:', node);
      }
    }
    return clean;
  }

  /**
   * @param {!Node} node
   * @param {string} attribute
   * @param {string|null} value
   * @return {boolean}
   */
  changeAttribute(node, attribute, value) {
    // TODO(choumx): Call mutatedAttributesCallback() on AMP elements e.g.
    // so an amp-img can update its child img when [src] is changed.

    const tag = node.nodeName.toLowerCase();
    // DOMPurify's attribute validation is tag-agnostic, so we need to check
    // that the tag itself is valid. E.g. a[href] is ok, but base[href] is not.
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
    if (!this.warnIfFormsAreDisallowed_(tag)) {
      user().warn(TAG, 'Sanitized [%s]="%s":', attribute, value, node);
    }
    return false;
  }

  /**
   * @param {string} tag
   * @return {boolean}
   */
  warnIfFormsAreDisallowed_(tag) {
    if (!this.allowForms_ && FORM_ELEMENTS.includes(tag)) {
      user().warn(
        TAG,
        'Form elements (%s) are not allowed without sandbox="allow-forms".',
        tag
      );
      return true;
    }
    return false;
  }

  /**
   * @param {!Node} node
   * @param {string} property
   * @param {string} value
   * @return {boolean}
   */
  changeProperty(node, property, value) {
    const prop = property.toLowerCase();

    // worker-dom's supported properties and corresponding attribute name
    // differences are minor, e.g. acceptCharset vs. accept-charset.
    if (validateAttributeChange(this.purifier_, node, prop, value)) {
      node[property] = value;
      return true;
    }
    return false;
  }

  /**
   * @param {!StorageLocation} location
   * @return {?Object}
   */
  getStorage(location) {
    // Note that filtering out amp-* keys will affect the predictability of
    // Storage.key(). We could preserve indices by adding empty entries but
    // that might be even more confusing.
    const storage = this.storageFor_(location);
    const output = {};
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && !startsWith(key, 'amp-')) {
        output[key] = storage.getItem(key);
      }
    }
    return output;
  }

  /**
   * @param {!StorageLocation} location
   * @param {?string} key
   * @param {?string} value
   */
  changeStorage(location, key, value) {
    const storage = this.storageFor_(location);
    if (key === null) {
      if (value === null) {
        user().error(TAG, 'Storage.clear() is not supported in amp-script.');
      }
    } else {
      if (startsWith(key, 'amp-')) {
        user().error(TAG, 'Invalid "amp-" prefix for storage key: %s', key);
      } else {
        if (value === null) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, value);
        }
      }
    }
  }

  /**
   * @param {!StorageLocation} location
   * @return {?Storage}
   * @private
   */
  storageFor_(location) {
    if (location === StorageLocation.LOCAL) {
      return this.win_.localStorage;
    } else if (location === StorageLocation.SESSION) {
      return this.win_.sessionStorage;
    }
    return null;
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(TAG, AmpScriptService);
  AMP.registerElement(TAG, AmpScript, CSS);
});
