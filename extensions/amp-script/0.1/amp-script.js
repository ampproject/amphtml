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

import * as WorkerDOM from '@ampproject/worker-dom/dist/amp/main.mjs';
import {CSS} from '../../../build/amp-script-0.1.css';
import {Deferred} from '../../../src/utils/promise';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Purifier} from '../../../src/purifier/purifier';
import {Services} from '../../../src/services';
import {UserActivationTracker} from './user-activation-tracker';
import {calculateExtensionScriptUrl} from '../../../src/service/extension-location';
import {cancellation} from '../../../src/error';
import {dev, user, userAssert} from '../../../src/log';
import {dict, map} from '../../../src/utils/object';
import {getElementServiceForDoc} from '../../../src/element-service';
import {getMode} from '../../../src/mode';
import {getService, registerServiceBuilder} from '../../../src/service';
import {rewriteAttributeValue} from '../../../src/url-rewrite';
import {startsWith} from '../../../src/string';
import {tryParseJson} from '../../../src/json';
import {utf8Encode} from '../../../src/utils/bytes';

/** @const {string} */
const TAG = 'amp-script';

/**
 * @typedef {{
 *   terminate: function():void,
 *   callFunction: function(string, ...*):Promise<*>,
 *   onerror: ?function(!ErrorEvent):void
 * }}
 */
let WorkerDOMWorkerDef;

/**
 * Max cumulative size of author scripts from all amp-script elements on page.
 * @const {number}
 */
const MAX_TOTAL_SCRIPT_SIZE = 150000;

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
 * @visibleForTesting
 */
export const StorageLocation = {
  LOCAL: 0,
  SESSION: 1,
  AMP_STATE: 2,
};

export class AmpScript extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private {?WorkerDOMWorkerDef} */
    this.workerDom_ = null;

    /** @private {?UserActivationTracker} */
    this.userActivation_ = null;

    /** @private {?AmpScriptService} */
    this.service_ = null;

    /** @private {string} */
    this.debugId_ = 'amp-script[unknown].js';

    /** @private {boolean} */
    this.layoutCompleted_ = false;

    /** @private {Deferred} */
    this.initialize_ = new Deferred();

    /**
     * If true, most production constraints are disabled including script size,
     * script hash sum for local scripts, etc. Default is false.
     *
     * Enabled by the "data-ampdevmode" attribute which is intentionally invalid.
     *
     * @private {boolean}
     */
    this.development_ = false;

    /**
     * If true, signals that the `nodom` variant of worker-dom should be used.
     * The worker js will have a much smaller bundle size, but no access to dom
     * functions.
     *
     * @private {boolean}
     */
    this.nodom_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER || isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.nodom_ = this.element.hasAttribute('nodom');
    this.development_ =
      this.element.hasAttribute('data-ampdevmode') ||
      this.element.ownerDocument.documentElement.hasAttribute(
        'data-ampdevmode'
      );

    if (this.development_) {
      user().warn(
        TAG,
        'JavaScript size and script hash requirements are disabled in development mode.',
        this.element
      );
    }

    if (
      this.nodom_ &&
      (this.element.hasAttribute('width') ||
        this.element.hasAttribute('height'))
    ) {
      user().warn(
        TAG,
        'Cannot set width or height of a nodom <amp-script>',
        this.element
      );
    }

    return getElementServiceForDoc(this.element, TAG, TAG).then((service) => {
      this.setService(/** @type {!AmpScriptService} */ (service));
    });
  }

  /**
   * @override
   */
  onMeasureChanged() {
    if (this.layoutCompleted_) {
      return;
    }

    const {width, height} = this.getLayoutBox();
    if (width === 0 && height === 0) {
      user().warn(
        TAG,
        'Skipped initializing amp-script due to zero width and height.',
        this.element
      );
    }
  }

  /**
   * @param {!AmpScriptService} service
   * @visibleForTesting
   */
  setService(service) {
    this.service_ = service;
  }

  /**
   * @return {?UserActivationTracker}
   * @visibleForTesting
   */
  getUserActivation() {
    return this.userActivation_;
  }

  /**
   * Calls the specified function on this amp-script's worker-dom instance.
   *
   * @param {string} functionIdentifier
   * @return {!Promise<*>}
   */
  callFunction(functionIdentifier) {
    return this.initialize_.promise.then(() => {
      return this.workerDom_.callFunction(functionIdentifier);
    });
  }

  /** @override */
  layoutCallback() {
    this.layoutCompleted_ = true;

    // Layouts that use sizers (responsive, fluid) require the worker-dom
    // subtree to be wrapped in a "fill content" container. This is because
    // these layouts do _not_ constrain the size of the amp-script element
    // via inline styles (they use sizerElement). However, this breaks
    // "container" layout so only do it selectively.
    let container;
    if (this.element.sizerElement) {
      container = this.win.document.createElement('div');
      this.applyFillContent(container, true);
      // Reparent all real children to the container.
      const realChildren = this.getRealChildren();
      for (let i = 0; i < realChildren.length; i++) {
        container.appendChild(realChildren[i]);
      }
      this.element.appendChild(container);
    }

    this.userActivation_ = new UserActivationTracker(this.element);

    // The displayed name of the combined script in dev tools.
    this.debugId_ = this.element.hasAttribute('src')
      ? `amp-script[src="${this.element.getAttribute('src')}"].js`
      : `amp-script[script="${this.element.getAttribute('script')}"].js`;

    const authorScriptPromise = this.getAuthorScript_(this.debugId_);
    if (!authorScriptPromise) {
      user().error(TAG, '"src" or "script" attribute is required.');
      return Promise.reject(cancellation());
    }

    const workerAndAuthorScripts = Promise.all([
      this.getWorkerScript_(),
      authorScriptPromise,
    ]).then((results) => {
      const workerScript = results[0];
      const authorScript = results[1];

      if (
        !this.development_ &&
        this.service_.sizeLimitExceeded(authorScript.length)
      ) {
        user().error(
          TAG,
          'Maximum total script size exceeded (%s). %s is disabled. ' +
            'See https://amp.dev/documentation/components/amp-script/#size-of-javascript-code.',
          MAX_TOTAL_SCRIPT_SIZE,
          this.debugId_
        );
        this.element.classList.add('i-amphtml-broken');
        return [];
      }
      return [workerScript, authorScript];
    });

    const sandbox = this.element.getAttribute('sandbox') || '';
    const sandboxTokens = sandbox.split(' ').map((s) => s.trim());

    // @see src/main-thread/configuration.WorkerDOMConfiguration in worker-dom.
    const config = {
      authorURL: this.debugId_,
      mutationPump: this.mutationPump_.bind(this),
      longTask: (promise) => {
        this.userActivation_.expandLongTask(promise);
        // TODO(dvoytenko): consider additional "progress" UI.
      },
      sanitizer: new SanitizerImpl(this, sandboxTokens),
      // Callbacks.
      onCreateWorker: (data) => {
        dev().info(TAG, 'Create worker:', data);
      },
      onSendMessage: (data) => {
        dev().info(TAG, 'To worker:', data);
      },
      onReceiveMessage: (data) => {
        dev().info(TAG, 'From worker:', data);
      },
    };

    // Create worker and hydrate.
    WorkerDOM.upgrade(
      container || this.element,
      workerAndAuthorScripts,
      config
    ).then((workerDom) => {
      this.workerDom_ = workerDom;
      this.initialize_.resolve();
      // workerDom will be null if it failed to init.
      if (this.workerDom_) {
        this.workerDom_.onerror = (errorEvent) => {
          errorEvent.preventDefault();
          user().error(
            TAG,
            `${errorEvent.message}\n    at (${errorEvent.filename}:${errorEvent.lineno})`
          );
        };
      }
    });
    return workerAndAuthorScripts;
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
      this.nodom_ ? 'amp-script-worker-nodom' : 'amp-script-worker',
      '0.1',
      useLocal
    );
    const xhr = Services.xhrFor(this.win);
    return xhr.fetchText(workerUrl, {ampCors: false}).then((r) => r.text());
  }

  /**
   * Query local or fetch remote author script.
   *
   * Returns promise that resolves with the script contents or rejected if the
   * fetch fails or if the script fails CORS checks.
   *
   * Returns null if script reference is missing.
   *
   * @param {string} debugId An element identifier for error messages.
   * @return {?Promise<string>}
   * @private
   */
  getAuthorScript_(debugId) {
    const authorUrl = this.element.getAttribute('src');
    if (authorUrl) {
      return this.fetchAuthorScript_(authorUrl, debugId);
    } else {
      const id = this.element.getAttribute('script');
      if (id) {
        const local = this.getAmpDoc().getElementById(id);
        userAssert(
          local,
          '[%s] %s could not find element with #%s.',
          TAG,
          debugId,
          id
        );
        const target = local.getAttribute('target');
        userAssert(
          target === 'amp-script',
          '[%s] script#%s must have target="amp-script".',
          TAG,
          id
        );
        const text = local.textContent;
        if (this.development_) {
          return Promise.resolve(text);
        } else {
          return this.service_.checkSha384(text, debugId).then(() => text);
        }
      }
    }
    // No [src] or [script].
    return null;
  }

  /**
   * @param {string} authorUrl
   * @param {string} debugId An element identifier for error messages.
   * @return {!Promise<string>}
   */
  fetchAuthorScript_(authorUrl, debugId) {
    return Services.xhrFor(this.win)
      .fetchText(authorUrl, {ampCors: false})
      .then((response) => {
        if (response.url && this.sameOrigin_(response.url)) {
          // Disallow non-JS content type for same-origin scripts.
          const contentType = response.headers.get('Content-Type');
          if (
            !contentType ||
            !(
              startsWith(contentType, 'application/javascript') ||
              startsWith(contentType, 'text/javascript')
            )
          ) {
            // TODO(#24266): Refactor to %s interpolation when error string
            // extraction is ready.
            throw user().createError(
              TAG,
              'Same-origin "src" requires "Content-Type: text/javascript" or "Content-Type: application/javascript". ' +
                `Fetched source for ${debugId} has "Content-Type: ${contentType}". ` +
                'See https://amp.dev/documentation/components/amp-script/#security-features.'
            );
          }
          return response.text();
        } else {
          // For cross-origin, verify hash of script itself (skip in
          // development mode).
          if (this.development_) {
            return response.text();
          } else {
            return response.text().then((text) => {
              return this.service_.checkSha384(text, debugId).then(() => text);
            });
          }
        }
      });
  }

  /**
   * Returns true iff `url` has the same origin as the AMP document.
   * @param {string} url
   * @return {boolean}
   */
  sameOrigin_(url) {
    const urlService = Services.urlForDoc(this.element);
    const docOrigin = urlService.getSourceOrigin(this.getAmpDoc().getUrl());
    const scriptOrigin = urlService.parse(url).origin;
    return docOrigin === scriptOrigin;
  }

  /**
   * Returns true if mutations should be allowed based on container attributes.
   * @return {boolean}
   */
  isMutationAllowedByFixedSize() {
    return isLayoutSizeDefined(this.getLayout());
  }

  /**
   * Returns true if mutations should be allowed based on recent user gesture.
   * @return {boolean}
   */
  isMutationAllowedByUserGesture() {
    return this.userActivation_.isActive();
  }

  /**
   * @param {function(boolean)} flush If `flush(false)` is invoked, mutations
   *   that cause user-visible changes (e.g. DOM changes) will be dropped
   *   (changes like event listener registration will be kept).
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
      this.isMutationAllowedByFixedSize() ||
      this.isMutationAllowedByUserGesture();

    this.vsync_.mutate(() => {
      const disallowedTypes = flush(allowMutation);
      // Count the number of mutations dropped by type.
      const errors = map();
      /** @type {!Array} */ (disallowedTypes).forEach((type) => {
        errors[type] = errors[type] + 1 || 1;
      });
      // Emit an error message for each mutation type, including count.
      Object.keys(errors).forEach((type) => {
        const count = errors[type];
        user().error(TAG, this.mutationTypeToErrorMessage_(type, count));
      });

      if (disallowedTypes.length > 0 && phase === Phase.MUTATING) {
        this.workerDom_.terminate();

        this.element.classList.remove('i-amphtml-hydrated');
        this.element.classList.add('i-amphtml-broken');

        user().error(
          TAG,
          '%s was terminated due to illegal mutation.',
          this.debugId_
        );
      }
    });
  }

  /**
   * @param {string} type
   * @param {number} count
   * @return {string}
   */
  mutationTypeToErrorMessage_(type, count) {
    let target;

    // Matches TransferrableMutationType in worker-dom#src/transfer/TransferrableMutation.ts.
    switch (type) {
      // Attributes and Properties
      case '0':
      case '3':
        target = 'DOM element attributes or styles';
        break;
      // Character data
      case '1':
        target = 'textContent or the like';
        break;
      // Child list
      case '2':
        target = 'DOM element children, innerHTML, or the like';
        break;
      // Other
      default:
        target = 'the DOM';
        break;
    }

    return (
      `Blocked ${count} attempts to modify ${target}.` +
      ' For variable-sized <amp-script> containers, a user action has to happen first.'
    );
  }
}

/**
 * Service for sharing data across <amp-script> elements.
 *
 * @visibleForTesting
 */
export class AmpScriptService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {number} */
    this.cumulativeSize_ = 0;

    /** @private {!Array<string>} */
    this.sources_ = [];

    // Query the meta tag once per document.
    const allowedHashes = ampdoc.getMetaByName('amp-script-src');
    if (allowedHashes) {
      this.sources_ = allowedHashes
        .split(' ')
        .map((s) => s.trim())
        .filter((s) => s.length);
    }

    /** @private @const {!../../../src/service/crypto-impl.Crypto} */
    this.crypto_ = Services.cryptoFor(ampdoc.win);
  }

  /**
   * Checks if `sha384(script)` exists in `meta[name="amp-script-src"]` element
   * in document head.
   *
   * @param {string} script The script contents.
   * @param {string} debugId An element identifier for error messages.
   * @return {!Promise}
   */
  checkSha384(script, debugId) {
    const bytes = utf8Encode(script);
    return this.crypto_.sha384Base64(bytes).then((hash) => {
      if (!hash || !this.sources_.includes('sha384-' + hash)) {
        // TODO(#24266): Refactor to %s interpolation when error string
        // extraction is ready.
        throw user().createError(
          TAG,
          `Script hash not found. ${debugId} must have "sha384-${hash}" in meta[name="amp-script-src"].` +
            ' See https://amp.dev/documentation/components/amp-script/#security-features.'
        );
      }
    });
  }

  /**
   * Adds `size` to current total. Returns true iff new total is <= size cap.
   *
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
   * @param {!AmpScript} ampScript
   * @param {!Array<string>} sandboxTokens
   */
  constructor(ampScript, sandboxTokens) {
    /** @private @const {!Window} */
    this.win_ = ampScript.win;

    /** @private @const {!Element} */
    this.element_ = ampScript.element;

    registerServiceBuilder(this.win_, 'purifier-inplace', function () {
      return new Purifier(
        ampScript.win.document,
        dict({'IN_PLACE': true}),
        rewriteAttributeValue
      );
    });

    /** @private @const {!Purifier} */
    this.purifier_ = getService(this.win_, 'purifier-inplace');

    /** @private @const {!Object<string, boolean>} */
    this.allowedTags_ = this.purifier_.getAllowedTags();

    /**
     * @private
     * @return {boolean}
     */
    this.allowFullEval_ = () => ampScript.isMutationAllowedByUserGesture();

    /**
     * @private
     * @return {boolean}
     */
    this.shouldConstrainEval_ = () =>
      !this.allowFullEval_() && ampScript.isMutationAllowedByFixedSize();

    // TODO(choumx): Support opt-in for variable substitutions.
    // For now, only allow built-in AMP components except amp-pixel.
    this.allowedTags_['amp-img'] = true;
    this.allowedTags_['amp-layout'] = true;
    this.allowedTags_['amp-pixel'] = false;

    /** @private @const {boolean} */
    this.allowForms_ = sandboxTokens.includes('allow-forms');
    FORM_ELEMENTS.forEach((fe) => {
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
  setAttribute(node, attribute, value) {
    // TODO(choumx): Call mutatedAttributesCallback() on AMP elements e.g.
    // so an amp-img can update its child img when [src] is changed.

    const tag = node.nodeName.toLowerCase();
    // DOMPurify's attribute validation is tag-agnostic, so we need to check
    // that the tag itself is valid. E.g. a[href] is ok, but base[href] is not.
    if (this.allowedTags_[tag]) {
      const attr = attribute.toLowerCase();
      if (this.purifier_.validateAttributeChange(node, attr, value)) {
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
        'Form elements (%s) cannot be mutated unless your <amp-script> includes the attribute sandbox="allow-forms".',
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
  setProperty(node, property, value) {
    const prop = property.toLowerCase();

    // worker-dom's supported properties and corresponding attribute name
    // differences are minor, e.g. acceptCharset vs. accept-charset.
    if (this.purifier_.validateAttributeChange(node, prop, value)) {
      node[property] = value;
      return true;
    }
    return false;
  }

  /**
   * TODO(choumx): Make this method always return a Promise.
   * @param {!StorageLocation} location
   * @param {string} opt_key
   * @return {!Promise<Object>|?Object}
   */
  getStorage(location, opt_key) {
    if (location === StorageLocation.AMP_STATE) {
      return Services.bindForDocOrNull(this.element_).then((bind) => {
        if (bind) {
          return bind.getStateValue(opt_key || '.');
        }
      });
    }
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
   * @return {!Promise}
   */
  setStorage(location, key, value) {
    if (location === StorageLocation.AMP_STATE) {
      return Services.bindForDocOrNull(this.element_).then((bind) => {
        if (bind) {
          const state = tryParseJson(value, () => {
            dev().error(TAG, 'Invalid AMP.setState() argument: %s', value);
          });
          if (state) {
            // Only evaluate updates in case of recent user interaction or a small fixed layout.
            const fullEval = this.allowFullEval_();
            const constrain = this.shouldConstrainEval_()
              ? [this.element_]
              : undefined;

            if (!fullEval && !constrain) {
              user().warn(
                TAG,
                'AMP.setState only updated page state and did not reevaluate bindings due to lack of recent user interaction.'
              );
            }
            bind.setState(state, {
              skipEval: !fullEval && !constrain,
              skipAmpState: false,
              constrain,
            });
          }
        }
      });
    }
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
    return Promise.resolve();
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

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc(TAG, AmpScriptService);
  AMP.registerElement(TAG, AmpScript, CSS);
});
