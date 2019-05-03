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
import {CommonSignals} from '../../../src/common-signals';
import {
  DomPurifyDef, createPurifier, getAllowedTags, validateAttributeChange,
} from '../../../src/purifier';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {UserActivationTracker} from './user-activation-tracker';
import {
  calculateExtensionScriptUrl,
} from '../../../src/service/extension-location';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {installFriendlyIframeEmbed} from '../../../src/friendly-iframe-embed';
import {
  installOriginExperimentsForDoc, originExperimentsForDoc,
} from '../../../src/service/origin-experiments-impl';
import {isExperimentOn} from '../../../src/experiments';
import {rewriteAttributeValue} from '../../../src/url-rewrite';
import {setStyle, setStyles} from '../../../src/style';
import {startsWith} from '../../../src/string';
import {
  upgrade,
} from '@ampproject/worker-dom/dist/unminified.index.safe.mjs.patched';

/** @const {string} */
const TAG = 'amp-script';

/** @const {number} */
const MAX_SCRIPT_SIZE = 150000;

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

    /** @private {?ShadowRoot|?Element} */
    this.shadow_ = null;

    this.iframe_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER ||
        isLayoutSizeDefined(layout);
  }

  /**
   * @param {*} ampdoc
   * @return {!Promise<boolean>}
   */
  isExperimentOn_(ampdoc) {
    if (isExperimentOn(this.win, 'amp-script')) {
      return Promise.resolve(true);
    }
    installOriginExperimentsForDoc(ampdoc);
    return originExperimentsForDoc(this.element)
        .getExperiments()
        .then(trials => trials && trials.includes(TAG));
  }

  /** @override */
  buildCallback() {
    const ampdoc = this.getAmpDoc();
    return this.isExperimentOn_(ampdoc).then(on => {
      if (!on) {
        // Return rejected Promise to buildCallback() to disable component.
        throw user().createError(TAG, `Experiment "${TAG}" is not enabled.`);
      }
      const shadowed = isExperimentOn(this.win, 'amp-script-in-shadow');
      if (shadowed) {
        return this.createShadow_(ampdoc).then(shadow => {
          this.shadow_ = shadow;
        });
      }
    });
  }

  /**
   * @param {*} ampdoc
   * @return {!Promise}
   * @private
   */
  createShadow_(ampdoc) {
    const head = ampdoc.getHeadNode();

    if (false) { //'attachShadow' in this.element) {
      const shadow = this.element.attachShadow({mode: 'open'});
      // Copy runtime & custom styles to shadow root.
      // TODO(choumx): Include extension CSS (and avoid race condition).
      const styles = head.querySelectorAll(
          'style[amp-runtime], style[amp-custom]');
      styles.forEach(style => {
        shadow.appendChild(style.cloneNode(/* deep */ true));
      });
      // Move hydratable light DOM to shadow DOM.
      while (this.element.firstChild) {
        shadow.appendChild(this.element.firstChild);
      }
      return Promise.resolve(shadow);
    } else {
      this.iframe_ = this.win.document.createElement('iframe');
      let styleHtml = '';
      const styles = head.querySelectorAll('style[amp-custom]');
      styles.forEach(style => {
        styleHtml += style.outerHTML;
      });
      // Copy this element's children into the iframe. They'll be rendered
      // directly on top of existing children to avoid visual jank.
      const html = `
        <head>${styleHtml}</head>
        <body>${this.element.innerHTML}</body>`;
      const spec = {html};
      return installFriendlyIframeEmbed(this.iframe_, this.element, spec)
          // .then(fie => fie.signals().whenSignal(CommonSignals.INI_LOAD))
          .then(() => {
            // The iframe body is worker-dom's base element.
            return this.iframe_.contentWindow.document.body;
          });
    }
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
      // `workerUrl` is from CDN, so no need for `ampCors`.
      xhr.fetchText(workerUrl, {ampCors: false}).then(r => r.text()),
      xhr.fetchText(authorUrl).then(r => r.text()),
    ]).then(results => {
      const workerScript = results[0];
      const authorScript = results[1];
      if (authorScript.length > MAX_SCRIPT_SIZE) {
        user().error(TAG, `Max script size exceeded: ${authorScript.length} > `
            + MAX_SCRIPT_SIZE);
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

    const base = this.shadow_ || this.element;
    upgrade(base, fetchPromise, workerConfig).then(workerDom => {
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
    if (phase == PHASE_HYDRATING) {
      this.vsync_.mutate(
          () => this.element.classList.add('i-amphtml-hydrated'));
    }
    const allowMutation = (
      // Hydration is always allowed.
      phase != PHASE_MUTATING
      // Mutation depends on the gesture state and long tasks.
      || this.userActivation_.isActive()
      // If the element is size-contained and small enough.
      || (isLayoutSizeDefined(this.getLayout())
          && this.getLayoutBox().height <= MAX_FREE_MUTATION_HEIGHT)
      // HACK(choumx): Support iframe-focus in user activation.
      || this.iframe_
    );

    if (allowMutation) {
      this.vsync_.mutate(() => {
        flush();

        if (this.iframe_ && this.getLayout() === Layout.CONTAINER) {
          const {body} = this.iframe_.contentWindow.document;
          // Match iframe height and remove original children.
          setStyle(this.iframe_, 'height', body.scrollHeight + 'px');
          while (this.element.firstChild !== this.iframe_) {
            this.element.removeChild(this.element.firstChild);
          }
        }
      });
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

    /** @const @private {!Element} */
    this.wrapper_ = win.document.createElement('div');
  }

  /**
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
      dev().info(TAG, 'Sanitized node:', node);
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
    if (!this.allowedTags_[tag]) {
      return false;
    }
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

AMP.extension('amp-script', '0.1', function(AMP) {
  AMP.registerElement('amp-script', AmpScript, CSS);
});
