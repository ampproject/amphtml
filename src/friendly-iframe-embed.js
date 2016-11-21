/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {dev, rethrowAsync} from './log';
import {disposeServicesForEmbed, getTopWindow} from './service';
import {escapeHtml} from './dom';
import {extensionsFor} from './extensions';
import {isDocumentReady} from './document-ready';
import {loadPromise} from './event-helper';
import {resourcesForDoc} from './resources';
import {setStyle, setStyles} from './style';


/**
 * Parameters used to create the new "friendly iframe" embed.
 * - html: The complete content of an AMP embed, which is itself an AMP
 *   document. Can include whatever is normally allowed in an AMP document,
 *   except for AMP `<script>` declarations. Those should be passed as an
 *   array of `extensionIds`.
 * - extensionsIds: An optional array of AMP extension IDs used in this embed.
 * - fonts: An optional array of fonts used in this embed.
 *
 * @typedef {{
 *   url: string,
 *   html: string,
 *   extensionIds: (?Array<string>|undefined),
 *   fonts: (?Array<string>|undefined),
 * }}
 */
export let FriendlyIframeSpec;


/**
 * @type {boolean|undefined}
 * @visiblefortesting
 */
let srcdocSupported;

/**
 * @param {boolean|undefined} val
 * @visiblefortesting
 */
export function setSrcdocSupportedForTesting(val) {
  srcdocSupported = val;
}

/**
 * Returns `true` if the Friendly Iframes are supported.
 * @return {boolean}
 */
function isSrcdocSupported() {
  if (srcdocSupported === undefined) {
    srcdocSupported = 'srcdoc' in HTMLIFrameElement.prototype;
  }
  return srcdocSupported;
}


/**
 * Creates the requested "friendly iframe" embed. Returns the promise that
 * will be resolved as soon as the embed is available. The actual
 * initialization of the embed will start as soon as the `iframe` is added
 * to the DOM.
 * @param {!HTMLIFrameElement} iframe
 * @param {!Element} container
 * @param {!FriendlyIframeSpec} spec
 * @param {function(!Window)=} opt_preinstallCallback
 * @return {!Promise<FriendlyIframeEmbed>}
 */
export function installFriendlyIframeEmbed(iframe, container, spec,
    opt_preinstallCallback) {
  /** @const {!Window} */
  const win = getTopWindow(iframe.ownerDocument.defaultView);
  /** @const {!./service/extensions-impl.Extensions} */
  const extensions = extensionsFor(win);

  setStyle(iframe, 'visibility', 'hidden');
  iframe.setAttribute('referrerpolicy', 'unsafe-url');

  // Pre-load extensions.
  if (spec.extensionIds) {
    spec.extensionIds.forEach(
        extensionId => extensions.loadExtension(extensionId));
  }

  const html = mergeHtml(spec);

  // Receive the signal when iframe is ready: it's document is formed.
  iframe.onload = () => {
    // Chrome does not reflect the iframe readystate.
    iframe.readyState = 'complete';
  };
  let loadedPromise;
  if (isSrcdocSupported()) {
    iframe.srcdoc = html;
    loadedPromise = loadPromise(iframe);
    container.appendChild(iframe);
  } else {
    iframe.src = 'about:blank';
    container.appendChild(iframe);
    const childDoc = iframe.contentWindow.document;
    childDoc.open();
    childDoc.write(html);
    // With document.write, `iframe.onload` arrives almost immediately, thus
    // we need to wait for child's `window.onload`.
    loadedPromise = loadPromise(iframe.contentWindow);
    childDoc.close();
  }

  // Wait for document ready signal.
  // This is complicated due to crbug.com/649201 on Chrome and a similar issue
  // on Safari where newly created document's `readyState` immediately equals
  // `complete`, even though the document itself is not yet available. There's
  // no other reliable signal for `readyState` in a child window and thus
  // we have to fallback to polling.
  let readyPromise;
  if (isIframeReady(iframe)) {
    readyPromise = Promise.resolve();
  } else {
    readyPromise = new Promise(resolve => {
      /** @const {number} */
      const interval = win.setInterval(() => {
        if (isIframeReady(iframe)) {
          resolve();
          win.clearInterval(interval);
        }
      }, /* milliseconds */ 5);

      // For safety, make sure we definitely stop polling when child doc is
      // loaded.
      loadedPromise.catch(error => {
        rethrowAsync(error);
      }).then(() => {
        resolve();
        win.clearInterval(interval);
      });
    });
  }

  return readyPromise.then(() => {
    const childWin = /** @type {!Window} */ (iframe.contentWindow);
    // Add extensions.
    extensions.installExtensionsInChildWindow(
        childWin, spec.extensionIds || [], opt_preinstallCallback);
    // Ready to be shown.
    setStyle(iframe, 'visibility', '');
    if (childWin.document && childWin.document.body) {
      setStyles(dev().assertElement(childWin.document.body), {
        opacity: 1,
        visibility: 'visible',
        animation: 'none',
      });
    }
    return new FriendlyIframeEmbed(iframe, spec, loadedPromise);
  });
}


/**
 * Returns `true` when iframe is ready.
 * @param {!HTMLIFrameElement} iframe
 * @return {boolean}
 */
function isIframeReady(iframe) {
  // This is complicated due to crbug.com/649201 on Chrome and a similar issue
  // on Safari where newly created document's `readyState` immediately equals
  // `complete`, even though the document itself is not yet available. There's
  // no other reliable signal for `readyState` in a child window and thus
  // the best way to check is to see the contents of the body.
  const childDoc = iframe.contentWindow && iframe.contentWindow.document;
  return !!(childDoc &&
      isDocumentReady(childDoc) &&
      childDoc.body &&
      childDoc.body.firstChild);
}


/**
 * Merges base and fonts into html document.
 * @param {!FriendlyIframeSpec} spec
 */
function mergeHtml(spec) {
  const originalHtml = spec.html;
  const originalHtmlUp = originalHtml.toUpperCase();

  // Find the insertion point.
  let ip = originalHtmlUp.indexOf('<HEAD');
  if (ip != -1) {
    ip = originalHtmlUp.indexOf('>', ip + 1) + 1;
  }
  if (ip == -1) {
    ip = originalHtmlUp.indexOf('<BODY');
  }
  if (ip == -1) {
    ip = originalHtmlUp.indexOf('<HTML');
    if (ip != -1) {
      ip = originalHtmlUp.indexOf('>', ip + 1) + 1;
    }
  }

  const result = [];

  // Preambule.
  if (ip > 0) {
    result.push(originalHtml.substring(0, ip));
  }

  // Add <BASE> tag.
  result.push(`<base href="${escapeHtml(spec.url)}">`);

  // Load fonts.
  if (spec.fonts) {
    spec.fonts.forEach(font => {
      result.push(
          `<link href="${escapeHtml(font)}" rel="stylesheet" type="text/css">`);
    });
  }

  // Postambule.
  if (ip > 0) {
    result.push(originalHtml.substring(ip));
  } else {
    result.push(originalHtml);
  }

  return result.join('');
}


/**
 * Exposes `mergeHtml` for testing purposes.
 * @param {!FriendlyIframeSpec} spec
 * @visibleForTesting
 */
export function mergeHtmlForTesting(spec) {
  return mergeHtml(spec);
}


/**
 * A "friendly iframe" embed. This is the iframe that's fully accessible to
 * the AMP runtime. It's similar to Shadow DOM in many respects, but it also
 * provides iframe/viewport measurements and enables the use of `vh`, `vw` and
 * `@media` CSS.
 *
 * The friendly iframe is managed by the top-level AMP Runtime. When it's
 * destroyed, the `destroy` method must be called to free up the shared
 * resources.
 */
export class FriendlyIframeEmbed {

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {!FriendlyIframeSpec} spec
   * @param {!Promise} loadedPromise
   */
  constructor(iframe, spec, loadedPromise) {
    /** @const {!HTMLIFrameElement} */
    this.iframe = iframe;

    /** @const {!Window} */
    this.win = /** @type{!Window} */(iframe.contentWindow);

    /** @const {!FriendlyIframeSpec} */
    this.spec = spec;

    /** @private @const {!Promise} */
    this.loadedPromise_ = loadedPromise;
  }

  /**
   * Returns promise that will resolve when the child window has fully been
   * loaded.
   * @return {!Promise}
   */
  whenLoaded() {
    return this.loadedPromise_;
  }

  /**
   * Ensures that all resources from this iframe have been released.
   */
  destroy() {
    resourcesForDoc(this.iframe).removeForChildWindow(this.win);
    disposeServicesForEmbed(this.win);
  }
}
